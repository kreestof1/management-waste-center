import express from 'express'
import * as centerController from '../controllers/center.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = express.Router()

/**
 * @swagger
 * /api/centers:
 *   get:
 *     summary: Get all recycling centers
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mycenters
 *         schema:
 *           type: boolean
 *         description: Filter to user's assigned centers (managers only)
 *     responses:
 *       200:
 *         description: List of centers
 */
router.get('/', authenticate, centerController.getAllCenters)

/**
 * @swagger
 * /api/centers/{id}:
 *   get:
 *     summary: Get center by ID
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Center details
 *       404:
 *         description: Center not found
 */
router.get('/:id', authenticate, centerController.getCenterById)

/**
 * @swagger
 * /api/centers:
 *   post:
 *     summary: Create new recycling center
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - geo
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               geo:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               publicVisibility:
 *                 type: boolean
 *               openingHours:
 *                 type: array
 *     responses:
 *       201:
 *         description: Center created
 */
router.post('/', authenticate, authorize('manager', 'superadmin'), centerController.createCenter)

/**
 * @swagger
 * /api/centers/{id}:
 *   put:
 *     summary: Update recycling center
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Center updated
 */
router.put('/:id', authenticate, authorize('manager', 'superadmin'), centerController.updateCenter)

/**
 * @swagger
 * /api/centers/{id}:
 *   delete:
 *     summary: Delete recycling center
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Center deleted
 */
router.delete('/:id', authenticate, authorize('superadmin'), centerController.deleteCenter)

export default router
