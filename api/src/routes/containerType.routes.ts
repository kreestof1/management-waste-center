import express from 'express'
import * as containerTypeController from '../controllers/containerType.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = express.Router()

router.get('/', authenticate, containerTypeController.getAllTypes)
router.post('/', authenticate, authorize('manager', 'superadmin'), containerTypeController.createType)
router.put('/:id', authenticate, authorize('manager', 'superadmin'), containerTypeController.updateType)
router.delete('/:id', authenticate, authorize('manager', 'superadmin'), containerTypeController.deleteType)

export default router
