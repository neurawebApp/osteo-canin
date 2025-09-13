// backend/src/routes/dashboard.ts
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';

const router = Router();

// Get pending appointments for admin approval
router.get('/pending-appointments', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Fetching pending appointments');
      const pendingAppointments = await prisma.appointment.findMany({
        where: {
          status: 'SCHEDULED'
        },
        include: {
          client: {
            select: { firstName: true, lastName: true, email: true, phone: true }
          },
          animal: true,
          service: true
        },
        orderBy: { startTime: 'asc' }
      });

      console.log('Found pending appointments:', pendingAppointments.length);
      res.json({
        data: pendingAppointments
      });
    } catch (error: any) {
      console.error('Error fetching pending appointments:', error);
      res.status(500).json({
        error: 'Failed to fetch pending appointments'
      });
    }
  }
);

// Admin dashboard metrics
router.get('/metrics', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Fetching dashboard metrics');
      const [
        totalClients,
        totalAnimals,
        totalAppointments,
        upcomingAppointments,
        pendingAppointments,
        monthlyRevenue,
        contactSubmissions
      ] = await Promise.all([
        prisma.user.count({ where: { role: UserRole.CLIENT } }),
        prisma.animal.count(),
        prisma.appointment.count(),
        prisma.appointment.count({
          where: {
            startTime: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            }
          }
        }),
        prisma.appointment.count({
          where: {
            status: 'SCHEDULED'
          }
        }),
        prisma.appointment.aggregate({
          where: {
            startTime: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            },
            status: 'COMPLETED'
          },
          _count: true
        }),
        prisma.contactSubmission.count({
          where: { responded: false }
        })
      ]);

      // Calculate monthly revenue manually
      const completedAppointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          status: 'COMPLETED'
        },
        include: {
          service: {
            select: { price: true }
          }
        }
      });

      const monthlyRevenueTotal = completedAppointments.reduce((sum, apt) => sum + apt.service.price, 0);

      console.log('Dashboard metrics calculated');
      res.json({
        data: {
          totalClients,
          totalAnimals,
          totalAppointments,
          upcomingAppointments,
          pendingAppointments,
          monthlyRevenue: monthlyRevenueTotal,
          pendingContacts: contactSubmissions
        }
      });
    } catch (error: any) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard metrics'
      });
    }
  }
);

// Today's schedule
router.get('/schedule', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Fetching today\'s schedule');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          client: {
            select: { firstName: true, lastName: true, email: true, phone: true }
          },
          animal: true,
          service: true
        },
        orderBy: { startTime: 'asc' }
      });

      console.log('Found today\'s appointments:', appointments.length);
      res.json({
        data: appointments
      });
    } catch (error: any) {
      console.error('Error fetching today\'s schedule:', error);
      res.status(500).json({
        error: 'Failed to fetch today\'s schedule'
      });
    }
  }
);

export default router;