import express from 'express'
import * as containerController from '../controllers/container.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = express.Router()

// Get containers by center
router.get('/center/:centerId', authenticate, containerController.getContainersByCenter)

// Get container by ID
router.get('/:id', authenticate, containerController.getContainerById)

// Create new container
router.post('/', authenticate, authorize('manager', 'superadmin'), containerController.createContainer)

// Update container metadata
router.put('/:id', authenticate, authorize('manager', 'superadmin'), containerController.updateContainer)

// Declare container status (all authenticated users)
router.post('/:id/status', authenticate, containerController.declareStatus)

// Get status history
router.get('/:id/events', authenticate, containerController.getStatusHistory)

// Set maintenance mode
router.post('/:id/maintenance', authenticate, authorize('manager', 'superadmin'), containerController.setMaintenanceMode)

// Deactivate container
router.delete('/:id', authenticate, authorize('manager', 'superadmin'), containerController.deactivateContainer)

export default router
