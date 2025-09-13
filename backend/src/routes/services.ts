import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);

// Protected routes
router.post('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  ServiceController.createService
);

router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  ServiceController.updateService
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  ServiceController.deleteService
);

export default router;