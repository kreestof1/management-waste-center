import { Response } from 'express'
import RecyclingCenter from '../models/RecyclingCenter'
import AuditLog from '../models/AuditLog'
import { AuthRequest } from '../middleware/auth.middleware'
import mongoose from 'mongoose'

// Get all recycling centers
export const getAllCenters = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user
    const { includeInactive } = req.query

    let query: any = {}

    // For superadmins with includeInactive flag, show all centers
    // Otherwise, only show active centers
    if (!(user?.role === 'superadmin' && includeInactive === 'true')) {
      query.active = true
    }

    // Filter by visibility based on user role
    if (user?.role === 'visitor' || user?.role === 'user') {
      query.publicVisibility = true
    }

    // If user has assigned centers, filter to those
    if (user?.role === 'manager' && req.query.mycenters === 'true') {
      const userDoc = await mongoose.model('User').findById(user.userId)
      if (userDoc && (userDoc as any).centerIds?.length > 0) {
        query._id = { $in: (userDoc as any).centerIds }
      }
    }

    const centers = await RecyclingCenter.find(query).sort({ name: 1 })

    return res.status(200).json({
      centers,
      count: centers.length,
    })
  } catch (error) {
    console.error('Get all centers error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération des centres',
    })
  }
}

// Get center by ID
export const getCenterById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const center = await RecyclingCenter.findById(id)

    if (!center) {
      return res.status(404).json({
        message: 'Centre non trouvé',
      })
    }

    // Check access permissions
    if (center.publicVisibility === false && req.user?.role !== 'manager' && req.user?.role !== 'superadmin') {
      return res.status(403).json({
        message: 'Accès refusé à ce centre',
      })
    }

    return res.status(200).json({ center })
  } catch (error) {
    console.error('Get center by ID error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération du centre',
    })
  }
}

// Create new recycling center (manager/superadmin only)
export const createCenter = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, geo, publicVisibility, openingHours } = req.body

    // Validate required fields
    if (!name || !address || !geo || !geo.lat || !geo.lng) {
      return res.status(400).json({
        message: 'Nom, adresse et coordonnées géographiques requis',
      })
    }

    const center = new RecyclingCenter({
      name,
      address,
      geo,
      publicVisibility: publicVisibility !== undefined ? publicVisibility : true,
      openingHours: openingHours || [],
      active: true,
    })

    await center.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CENTER_CREATED',
      entityType: 'center',
      entityId: center._id,
      metadata: { name: center.name },
    })

    return res.status(201).json({
      message: 'Centre créé avec succès',
      center,
    })
  } catch (error) {
    console.error('Create center error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la création du centre',
    })
  }
}

// Update recycling center (manager/superadmin only)
export const updateCenter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, address, geo, publicVisibility, openingHours, active } = req.body

    const center = await RecyclingCenter.findById(id)

    if (!center) {
      return res.status(404).json({
        message: 'Centre non trouvé',
      })
    }

    // Update fields
    if (name !== undefined) center.name = name
    if (address !== undefined) center.address = address
    if (geo !== undefined) center.geo = geo
    if (publicVisibility !== undefined) center.publicVisibility = publicVisibility
    if (openingHours !== undefined) center.openingHours = openingHours
    if (active !== undefined) center.active = active

    await center.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CENTER_UPDATED',
      entityType: 'center',
      entityId: center._id,
      metadata: { name: center.name },
    })

    return res.status(200).json({
      message: 'Centre mis à jour avec succès',
      center,
    })
  } catch (error) {
    console.error('Update center error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du centre',
    })
  }
}

// Delete (soft delete) recycling center (superadmin only)
export const deleteCenter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const center = await RecyclingCenter.findById(id)

    if (!center) {
      return res.status(404).json({
        message: 'Centre non trouvé',
      })
    }

    // Soft delete
    center.active = false
    await center.save()

    // Create audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: 'CENTER_DELETED',
      entityType: 'center',
      entityId: center._id,
      metadata: { name: center.name },
    })

    return res.status(200).json({
      message: 'Centre supprimé avec succès',
    })
  } catch (error) {
    console.error('Delete center error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la suppression du centre',
    })
  }
}
