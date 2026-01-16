import { Response } from 'express'
import Container from '../models/Container'
import StatusEvent from '../models/StatusEvent'
import AuditLog from '../models/AuditLog'
import { AuthRequest } from '../middleware/auth.middleware'
import redisClient from '../config/redis'

// Get containers by center
export const getContainersByCenter = async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params
    const { state } = req.query

    let query: any = { centerId, active: true }

    if (state && ['empty', 'full', 'maintenance'].includes(state as string)) {
      query.state = state
    }

    const containers = await Container.find(query)
      .populate('typeId', 'label icon color')
      .sort({ label: 1 })

    return res.status(200).json({
      containers,
      count: containers.length,
    })
  } catch (error) {
    console.error('Get containers by center error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération des conteneurs',
    })
  }
}

// Get container by ID
export const getContainerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const container = await Container.findById(id)
      .populate('typeId', 'label icon color')
      .populate('centerId', 'name address')

    if (!container) {
      return res.status(404).json({
        message: 'Conteneur non trouvé',
      })
    }

    return res.status(200).json({ container })
  } catch (error) {
    console.error('Get container by ID error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération du conteneur',
    })
  }
}

// Create new container (manager/superadmin only)
export const createContainer = async (req: AuthRequest, res: Response) => {
  try {
    const { centerId, typeId, label, capacityLiters, locationHint } = req.body

    if (!centerId || !typeId || !label) {
      return res.status(400).json({
        message: 'Centre, type et libellé requis',
      })
    }

    const container = new Container({
      centerId,
      typeId,
      label,
      capacityLiters,
      locationHint,
      state: 'empty',
      active: true,
    })

    await container.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CONTAINER_CREATED',
      entityType: 'container',
      entityId: container._id,
      metadata: { label: container.label },
    })

    return res.status(201).json({
      message: 'Conteneur créé avec succès',
      container,
    })
  } catch (error) {
    console.error('Create container error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la création du conteneur',
    })
  }
}

// Update container metadata (manager/superadmin only)
export const updateContainer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { label, capacityLiters, locationHint } = req.body

    const container = await Container.findById(id)

    if (!container) {
      return res.status(404).json({
        message: 'Conteneur non trouvé',
      })
    }

    if (label !== undefined) container.label = label
    if (capacityLiters !== undefined) container.capacityLiters = capacityLiters
    if (locationHint !== undefined) container.locationHint = locationHint

    await container.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CONTAINER_UPDATED',
      entityType: 'container',
      entityId: container._id,
      metadata: { label: container.label },
    })

    return res.status(200).json({
      message: 'Conteneur mis à jour avec succès',
      container,
    })
  } catch (error) {
    console.error('Update container error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du conteneur',
    })
  }
}

// Declare container status with anti-spam throttling
export const declareStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { newState, comment } = req.body

    if (!newState || !['empty', 'full'].includes(newState)) {
      return res.status(400).json({
        message: 'État invalide. Doit être "empty" ou "full"',
      })
    }

    const container = await Container.findById(id)

    if (!container) {
      return res.status(404).json({
        message: 'Conteneur non trouvé',
      })
    }

    if (!container.active) {
      return res.status(422).json({
        message: 'Ce conteneur est désactivé',
      })
    }

    // Check maintenance mode
    if (container.state === 'maintenance' && req.user?.role !== 'manager' && req.user?.role !== 'superadmin') {
      return res.status(422).json({
        message: 'Ce conteneur est en maintenance. Seuls les gestionnaires peuvent déclarer son état.',
      })
    }

    // Anti-spam throttling with Redis (60 seconds)
    const throttleKey = `throttle:${req.user?.userId}:${id}`
    
    try {
      const exists = await redisClient.get(throttleKey)
      if (exists) {
        const ttl = await redisClient.ttl(throttleKey)
        return res.status(409).json({
          message: `Vous avez déjà déclaré ce conteneur récemment. Veuillez attendre ${ttl} secondes.`,
          retryAfter: ttl,
        })
      }
    } catch (redisError) {
      console.error('Redis error (anti-spam disabled):', redisError)
      // Continue without throttling if Redis is not available
    }

    // Create status event
    const statusEvent = new StatusEvent({
      containerId: id,
      newState,
      authorId: req.user?.userId,
      source: req.user?.role === 'agent' ? 'agent' : req.user?.role === 'manager' ? 'manager' : 'user',
      comment: comment || undefined,
      confidence: 1.0,
    })

    await statusEvent.save()

    // Update container state
    container.state = newState
    container.updatedAt = new Date()
    await container.save()

    // Set throttle key (60 seconds)
    try {
      await redisClient.setex(throttleKey, 60, '1')
    } catch (redisError) {
      console.error('Redis setex error:', redisError)
    }

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: newState === 'full' ? 'CONTAINER_SET_FULL' : 'CONTAINER_SET_EMPTY',
      entityType: 'container',
      entityId: container._id,
      metadata: { 
        label: container.label,
        previousState: container.state,
        newState,
      },
    })

    // Emit Socket.IO event for real-time updates
    try {
      const io = (req.app as any).get('io')
      if (io) {
        io.to(`center:${container.centerId}`).emit('container.status.updated', {
          containerId: container._id,
          containerLabel: container.label,
          state: container.state,
          updatedAt: container.updatedAt,
        })
        console.log(`📡 Socket.IO: Emitted status update for container ${container._id}`)
      }
    } catch (socketError) {
      console.error('Socket.IO emit error:', socketError)
      // Continue even if Socket.IO fails
    }

    return res.status(200).json({
      message: 'État du conteneur mis à jour avec succès',
      container: {
        id: container._id,
        state: container.state,
        updatedAt: container.updatedAt,
      },
    })
  } catch (error) {
    console.error('Declare status error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la déclaration de l\'état',
    })
  }
}

// Get status history for a container
export const getStatusHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { limit = '100', from, to } = req.query

    let query: any = { containerId: id }

    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from as string)
      if (to) query.createdAt.$lte = new Date(to as string)
    }

    const events = await StatusEvent.find(query)
      .populate('authorId', 'email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))

    return res.status(200).json({
      events,
      count: events.length,
    })
  } catch (error) {
    console.error('Get status history error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération de l\'historique',
    })
  }
}

// Set maintenance mode (manager/superadmin only)
export const setMaintenanceMode = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { maintenance } = req.body

    const container = await Container.findById(id)

    if (!container) {
      return res.status(404).json({
        message: 'Conteneur non trouvé',
      })
    }

    const previousState = container.state
    container.state = maintenance ? 'maintenance' : 'empty'
    container.updatedAt = new Date()
    await container.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: maintenance ? 'CONTAINER_MAINTENANCE_ON' : 'CONTAINER_MAINTENANCE_OFF',
      entityType: 'container',
      entityId: container._id,
      metadata: { label: container.label, previousState },
    })

    return res.status(200).json({
      message: maintenance ? 'Mode maintenance activé' : 'Mode maintenance désactivé',
      container,
    })
  } catch (error) {
    console.error('Set maintenance error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la modification du mode maintenance',
    })
  }
}

// Deactivate container (soft delete)
export const deactivateContainer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const container = await Container.findById(id)

    if (!container) {
      return res.status(404).json({
        message: 'Conteneur non trouvé',
      })
    }

    container.active = false
    await container.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CONTAINER_DEACTIVATED',
      entityType: 'container',
      entityId: container._id,
      metadata: { label: container.label },
    })

    return res.status(200).json({
      message: 'Conteneur désactivé avec succès',
    })
  } catch (error) {
    console.error('Deactivate container error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la désactivation du conteneur',
    })
  }
}
