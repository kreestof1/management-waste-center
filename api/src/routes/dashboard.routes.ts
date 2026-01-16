import express from 'express';
import { getCenterStats, getAlerts, getRotationMetrics } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/centers/{centerId}/stats:
 *   get:
 *     summary: Get statistics for a recycling center
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recycling center ID
 *     responses:
 *       200:
 *         description: Center statistics
 *       403:
 *         description: Access denied
 *       404:
 *         description: Center not found
 */
router.get('/centers/:centerId/stats', authenticate, authorize('manager', 'superadmin'), getCenterStats);

/**
 * @swagger
 * /api/dashboard/centers/{centerId}/alerts:
 *   get:
 *     summary: Get alerts for full containers exceeding threshold
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recycling center ID
 *       - in: query
 *         name: alertThresholdHours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours before alerting on full container
 *     responses:
 *       200:
 *         description: List of alerts
 *       403:
 *         description: Access denied
 *       404:
 *         description: Center not found
 */
router.get('/centers/:centerId/alerts', authenticate, authorize('manager', 'superadmin'), getAlerts);

/**
 * @swagger
 * /api/dashboard/centers/{centerId}/rotation-metrics:
 *   get:
 *     summary: Get rotation metrics for containers (time between state changes)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recycling center ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Rotation metrics
 *       403:
 *         description: Access denied
 *       404:
 *         description: Center not found
 */
router.get('/centers/:centerId/rotation-metrics', authenticate, authorize('manager', 'superadmin'), getRotationMetrics);

export default router;
