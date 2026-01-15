import { Router } from 'express'
import {
  getAllWastes,
  getWasteById,
  createWaste,
  updateWaste,
  deleteWaste,
  getWasteStats,
} from '../controllers/waste.controller'

const router = Router()

/**
 * @swagger
 * /api/wastes:
 *   get:
 *     summary: Get all wastes
 *     tags: [Wastes]
 *     description: Récupère la liste de tous les déchets avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [collected, processing, processed, recycled]
 *         description: Filtrer par statut
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [plastic, glass, paper, metal, organic, electronic, hazardous, other]
 *         description: Filtrer par type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Liste des déchets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Waste'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllWastes)

/**
 * @swagger
 * /api/wastes/stats:
 *   get:
 *     summary: Get waste statistics
 *     tags: [Wastes]
 *     description: Récupère les statistiques des déchets (totaux, par type, par statut)
 *     responses:
 *       200:
 *         description: Statistiques des déchets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WasteStats'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getWasteStats)

/**
 * @swagger
 * /api/wastes/{id}:
 *   get:
 *     summary: Get waste by ID
 *     tags: [Wastes]
 *     description: Récupère un déchet spécifique par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     responses:
 *       200:
 *         description: Détails du déchet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Waste'
 *       404:
 *         description: Déchet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getWasteById)

/**
 * @swagger
 * /api/wastes:
 *   post:
 *     summary: Create a new waste
 *     tags: [Wastes]
 *     description: Crée un nouveau déchet dans le système
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WasteInput'
 *     responses:
 *       201:
 *         description: Déchet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Waste'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createWaste)

/**
 * @swagger
 * /api/wastes/{id}:
 *   put:
 *     summary: Update a waste
 *     tags: [Wastes]
 *     description: Met à jour un déchet existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WasteInput'
 *     responses:
 *       200:
 *         description: Déchet mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Waste'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Déchet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateWaste)

/**
 * @swagger
 * /api/wastes/{id}:
 *   delete:
 *     summary: Delete a waste
 *     tags: [Wastes]
 *     description: Supprime un déchet du système
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     responses:
 *       200:
 *         description: Déchet supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déchet supprimé avec succès
 *       404:
 *         description: Déchet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteWaste)

export default router
