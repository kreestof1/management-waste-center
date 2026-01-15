import { Request, Response } from 'express'
import Waste from '../models/Waste'

// Get all wastes
export const getAllWastes = async (req: Request, res: Response) => {
  try {
    const { status, type, startDate, endDate } = req.query

    const filter: any = {}
    if (status) filter.status = status
    if (type) filter.type = type
    if (startDate || endDate) {
      filter.collectionDate = {}
      if (startDate) filter.collectionDate.$gte = new Date(startDate as string)
      if (endDate) filter.collectionDate.$lte = new Date(endDate as string)
    }

    const wastes = await Waste.find(filter).sort({ collectionDate: -1 })
    res.json(wastes)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des déchets', error })
  }
}

// Get waste by ID
export const getWasteById = async (req: Request, res: Response) => {
  try {
    const waste = await Waste.findById(req.params.id)
    if (!waste) {
      return res.status(404).json({ message: 'Déchet non trouvé' })
    }
    res.json(waste)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du déchet', error })
  }
}

// Create new waste
export const createWaste = async (req: Request, res: Response) => {
  try {
    const waste = new Waste(req.body)
    await waste.save()
    res.status(201).json(waste)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du déchet', error })
  }
}

// Update waste
export const updateWaste = async (req: Request, res: Response) => {
  try {
    const waste = await Waste.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!waste) {
      return res.status(404).json({ message: 'Déchet non trouvé' })
    }
    res.json(waste)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du déchet', error })
  }
}

// Delete waste
export const deleteWaste = async (req: Request, res: Response) => {
  try {
    const waste = await Waste.findByIdAndDelete(req.params.id)
    if (!waste) {
      return res.status(404).json({ message: 'Déchet non trouvé' })
    }
    res.json({ message: 'Déchet supprimé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du déchet', error })
  }
}

// Get waste statistics
export const getWasteStats = async (req: Request, res: Response) => {
  try {
    const totalWastes = await Waste.countDocuments()
    const totalWeight = await Waste.aggregate([
      { $group: { _id: null, total: { $sum: '$weight' } } },
    ])

    const wastesByType = await Waste.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalWeight: { $sum: '$weight' } } },
    ])

    const wastesByStatus = await Waste.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    res.json({
      totalWastes,
      totalWeight: totalWeight[0]?.total || 0,
      wastesByType,
      wastesByStatus,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error })
  }
}
