// backend/src/routes/users.ts
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';

const router = Router();

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        validated: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      data: user
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile'
    });
  }
});

// Get all clients (admin only)
router.get('/clients', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const clients = await prisma.user.findMany({
        where: { role: UserRole.CLIENT },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          validated: true,
          createdAt: true,
          animals: {
            select: {
              id: true,
              name: true,
              breed: true,
              age: true,
              gender: true
            },
            orderBy: { name: 'asc' }
          },
          appointments: {
            select: {
              id: true,
              startTime: true,
              status: true,
              service: {
                select: {
                  title: true
                }
              }
            },
            orderBy: { startTime: 'desc' },
            take: 10
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ 
        data: clients,
        total: clients.length,
        validated: clients.filter(c => c.validated).length,
        pending: clients.filter(c => !c.validated).length
      });
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      res.status(500).json({
        error: 'Failed to fetch clients'
      });
    }
  }
);

// Get single client details (admin/practitioner only)
router.get('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const client = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          validated: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          animals: {
            select: {
              id: true,
              name: true,
              breed: true,
              age: true,
              gender: true,
              weight: true,
              notes: true,
              createdAt: true
            },
            orderBy: { name: 'asc' }
          },
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: true,
              notes: true,
              service: {
                select: {
                  title: true,
                  duration: true,
                  price: true
                }
              },
              animal: {
                select: {
                  name: true,
                  breed: true
                }
              }
            },
            orderBy: { startTime: 'desc' }
          },
          _count: {
            select: {
              animals: true,
              appointments: true
            }
          }
        }
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json({ data: client });
    } catch (error: any) {
      console.error('Error fetching client details:', error);
      res.status(500).json({
        error: 'Failed to fetch client details'
      });
    }
  }
);

// Validate/approve client account
router.put('/:id/validate', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Validating client:', id);
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          validated: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== UserRole.CLIENT) {
        return res.status(400).json({ error: 'Only client accounts can be validated' });
      }

      if (user.validated) {
        return res.status(400).json({ error: 'Client account is already validated' });
      }

      // Update validation status
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { validated: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          validated: true
        }
      });

      // Log the validation action
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'VALIDATE_CLIENT',
          meta: {
            validatedClientId: id,
            validatedClientEmail: user.email,
            validatedClientName: `${user.firstName} ${user.lastName}`
          }
        }
      });

      console.log('Client validated successfully:', user.email);
      res.json({
        data: updatedUser,
        message: `Client ${user.firstName} ${user.lastName} has been validated successfully`
      });
    } catch (error: any) {
      console.error('Error validating client:', error);
      res.status(500).json({
        error: 'Failed to validate client account'
      });
    }
  }
);

// Delete client account
router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting client:', id);
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: { 
          id: true,
          role: true, 
          email: true,
          firstName: true,
          lastName: true,
          _count: {
            select: {
              animals: true,
              appointments: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== UserRole.CLIENT) {
        return res.status(400).json({ error: 'Only client accounts can be deleted' });
      }

      // Log the deletion action before deleting
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'DELETE_CLIENT',
          meta: {
            deletedClientId: id,
            deletedClientEmail: user.email,
            deletedClientName: `${user.firstName} ${user.lastName}`,
            deletedAnimalsCount: user._count.animals,
            deletedAppointmentsCount: user._count.appointments
          }
        }
      });

      // Delete the user (cascade will handle related records)
      await prisma.user.delete({
        where: { id }
      });

      console.log('Client deleted successfully:', user.email);
      res.json({
        message: `Client ${user.firstName} ${user.lastName} and all related data have been deleted successfully`
      });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        error: 'Failed to delete client account'
      });
    }
  }
);

// Update client profile (admin/practitioner only)
router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, email } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== UserRole.CLIENT) {
        return res.status(400).json({ error: 'Only client accounts can be updated' });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { 
            email,
            NOT: { id }
          }
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Email is already taken' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(email && { email })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          validated: true,
          createdAt: true
        }
      });

      res.json({
        data: updatedUser,
        message: 'Client profile updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating client:', error);
      res.status(500).json({
        error: 'Failed to update client profile'
      });
    }
  }
);

// Search clients
router.get('/search', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const searchTerm = q.toLowerCase();
      
      const clients = await prisma.user.findMany({
        where: {
          role: UserRole.CLIENT,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } }
          ]
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          validated: true,
          createdAt: true,
          animals: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        },
        orderBy: { firstName: 'asc' },
        take: 50
      });

      res.json({ 
        data: clients,
        total: clients.length,
        query: q
      });
    } catch (error: any) {
      console.error('Error searching clients:', error);
      res.status(500).json({
        error: 'Failed to search clients'
      });
    }
  }
);

// Bulk validate clients
router.put('/bulk/validate', 
  authenticateToken, 
  requireRole([UserRole.ADMIN]), 
  async (req: AuthRequest, res) => {
    try {
      const { clientIds } = req.body;
      
      if (!Array.isArray(clientIds) || clientIds.length === 0) {
        return res.status(400).json({ error: 'Client IDs array is required' });
      }

      const updatedClients = await prisma.user.updateMany({
        where: {
          id: { in: clientIds },
          role: UserRole.CLIENT,
          validated: false
        },
        data: { validated: true }
      });

      // Log bulk validation
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'BULK_VALIDATE_CLIENTS',
          meta: {
            validatedClientIds: clientIds,
            validatedCount: updatedClients.count
          }
        }
      });

      res.json({
        message: `${updatedClients.count} clients validated successfully`,
        validatedCount: updatedClients.count
      });
    } catch (error: any) {
      console.error('Error bulk validating clients:', error);
      res.status(500).json({
        error: 'Failed to validate clients'
      });
    }
  }
);

export default router;