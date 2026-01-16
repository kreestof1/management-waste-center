import { Response } from 'express'
import ContainerType from '../models/ContainerType'
import Container from '../models/Container'
import AuditLog from '../models/AuditLog'
import { AuthRequest } from '../middleware/auth.middleware'

// Get all container types
export const getAllTypes = async (req: AuthRequest, res: Response) => {
    try {
        const types = await ContainerType.find().sort({ label: 1 })

        return res.status(200).json({
            types,
            count: types.length,
        })
    } catch (error) {
        console.error('Get all types error:', error)
        return res.status(500).json({
            message: 'Erreur lors de la récupération des types de conteneurs',
        })
    }
}

// Get container count by type
export const getContainerCountByType = async (req: AuthRequest, res: Response) => {
    try {
        const { typeId } = req.params

        const count = await Container.countDocuments({ typeId })

        return res.status(200).json({
            count,
        })
    } catch (error) {
        console.error('Get container count by type error:', error)
        return res.status(500).json({
            message: 'Erreur lors de la récupération du nombre de conteneurs',
        })
    }
}

// Create new container type (manager/superadmin only)
export const createType = async (req: AuthRequest, res: Response) => {
    try {
        const { label, icon, color } = req.body

        if (!label) {
            return res.status(400).json({
                message: 'Le libellé est requis',
            })
        }

        // Check if type already exists
        const existingType = await ContainerType.findOne({ label })
        if (existingType) {
            return res.status(409).json({
                message: 'Un type avec ce libellé existe déjà',
            })
        }

        const type = new ContainerType({
            label,
            icon: icon || '',
            color: color || '#666666',
        })

        await type.save()

        // Create audit log
        await AuditLog.create({
            actorId: req.user?.userId,
            action: 'CONTAINER_TYPE_CREATED',
            entityType: 'type',
            entityId: type._id,
            metadata: { label: type.label },
        })

        return res.status(201).json({
            message: 'Type de conteneur créé avec succès',
            type,
        })
    } catch (error) {
        console.error('Create type error:', error)
        return res.status(500).json({
            message: 'Erreur lors de la création du type',
        })
    }
}

// Update container type (manager/superadmin only)
export const updateType = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const { label, icon, color } = req.body

        const type = await ContainerType.findById(id)

        if (!type) {
            return res.status(404).json({
                message: 'Type non trouvé',
            })
        }

        if (label !== undefined) type.label = label
        if (icon !== undefined) type.icon = icon
        if (color !== undefined) type.color = color

        await type.save()

        // Create audit log
        await AuditLog.create({
            actorId: req.user?.userId,
            action: 'CONTAINER_TYPE_UPDATED',
            entityType: 'type',
            entityId: type._id,
            metadata: { label: type.label },
        })

        return res.status(200).json({
            message: 'Type mis à jour avec succès',
            type,
        })
    } catch (error) {
        console.error('Update type error:', error)
        return res.status(500).json({
            message: 'Erreur lors de la mise à jour du type',
        })
    }
}

// Delete container type (manager/superadmin only)
export const deleteType = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const type = await ContainerType.findById(id)

        if (!type) {
            return res.status(404).json({
                message: 'Type non trouvé',
            })
        }

        // Check if type is used by any containers
        const containersUsingType = await Container.countDocuments({ typeId: id })
        if (containersUsingType > 0) {
            return res.status(409).json({
                message: `Impossible de supprimer ce type. ${containersUsingType} conteneur(s) l'utilisent encore.`,
            })
        }

        await type.deleteOne()

        // Create audit log
        await AuditLog.create({
            actorId: req.user?.userId,
            action: 'CONTAINER_TYPE_DELETED',
            entityType: 'type',
            entityId: type._id,
            metadata: { label: type.label },
        })

        return res.status(200).json({
            message: 'Type supprimé avec succès',
        })
    } catch (error) {
        console.error('Delete type error:', error)
        return res.status(500).json({
            message: 'Erreur lors de la suppression du type',
        })
    }
}
