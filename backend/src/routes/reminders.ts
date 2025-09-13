// backend/src/routes/reminders.ts - Version corrigée avec les bons types
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole, ReminderType } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const createReminderSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.string().default('MANUAL'),
  dueDate: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  appointmentId: z.string().optional(),
});

// Interface pour les reminders avec les champs personnalisés
interface ReminderResponse {
  id: string;
  message: string;
  type: string;
  dueDate: string;
  completed: boolean;
  priority: string;
  appointmentId?: string;
  createdAt: string;
}

// Stockage temporaire pour les reminders manuels (en production, utilisez Redis ou une vraie DB)
const manualReminders = new Map<string, ReminderResponse>();

// Fonction pour mapper les types de string vers ReminderType
function mapStringToReminderType(typeString: string): ReminderType {
  switch (typeString) {
    case 'APPOINTMENT_REMINDER':
      return ReminderType.APPOINTMENT_REMINDER;
    case 'FOLLOW_UP':
      return ReminderType.FOLLOW_UP;
    case 'APPOINTMENT_CONFIRMATION':
      return ReminderType.APPOINTMENT_CONFIRMATION;
    case 'BIRTHDAY':
      return ReminderType.BIRTHDAY;
    // Ces types n'existent pas dans Prisma, donc on utilise FOLLOW_UP comme fallback
    case 'MEDICATION':
    case 'CHECKUP':
    case 'MANUAL':
    default:
      return ReminderType.FOLLOW_UP; // Utiliser comme type générique
  }
}

// Get user's reminders
router.get('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Fetching reminders for user:', req.user!.id);
      
      // Récupérer les reminders de la base de données
      const dbReminders = await prisma.reminder.findMany({
        where: {
          appointment: {
            OR: [
              { clientId: req.user!.id },
              // Pour les admins/praticiens, montrer tous les reminders
              ...(req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.PRACTITIONER 
                ? [{}] 
                : []
              )
            ]
          }
        },
        include: {
          appointment: {
            include: {
              client: true,
              animal: true,
              service: true
            }
          }
        },
        orderBy: { remindAt: 'asc' }
      });

      // Transformer les reminders de la DB
      const transformedDbReminders: ReminderResponse[] = dbReminders.map(reminder => ({
        id: reminder.id,
        message: reminder.message,
        type: reminder.type,
        dueDate: reminder.remindAt.toISOString(),
        completed: reminder.sent,
        priority: 'MEDIUM', // Valeur par défaut
        appointmentId: reminder.appointmentId,
        createdAt: reminder.createdAt.toISOString()
      }));

      // Combiner avec les reminders manuels
      const allReminders = [
        ...transformedDbReminders,
        ...Array.from(manualReminders.values()).filter(r => !r.completed)
      ];

      // Trier par date de rappel
      allReminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      console.log(`Found ${allReminders.length} reminders`);
      res.json({ data: allReminders });
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  }
);

// Create new reminder
router.post('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Creating reminder with data:', req.body);
      const validatedData = createReminderSchema.parse(req.body);
      
      // Si c'est lié à un rendez-vous existant
      if (validatedData.appointmentId) {
        try {
          // Vérifier que le rendez-vous existe
          const appointment = await prisma.appointment.findUnique({
            where: { id: validatedData.appointmentId }
          });

          if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
          }

          // Mapper le type pour Prisma
          const reminderType = mapStringToReminderType(validatedData.type);

          const reminder = await prisma.reminder.create({
            data: {
              message: validatedData.message,
              messageFr: validatedData.message,
              type: reminderType,
              remindAt: new Date(validatedData.dueDate),
              sent: false,
              appointmentId: validatedData.appointmentId
            }
          });

          const response: ReminderResponse = {
            id: reminder.id,
            message: reminder.message,
            type: validatedData.type, // Garder le type original pour le frontend
            dueDate: reminder.remindAt.toISOString(),
            completed: reminder.sent,
            priority: validatedData.priority,
            appointmentId: reminder.appointmentId,
            createdAt: reminder.createdAt.toISOString()
          };

          return res.status(201).json({
            data: response,
            message: 'Reminder created successfully'
          });
        } catch (dbError) {
          console.error('Database error creating reminder:', dbError);
          return res.status(500).json({ error: 'Failed to create reminder in database' });
        }
      } else {
        // Pour les reminders manuels (sans rendez-vous)
        const id = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const manualReminder: ReminderResponse = {
          id,
          message: validatedData.message,
          type: validatedData.type,
          dueDate: validatedData.dueDate,
          completed: false,
          priority: validatedData.priority,
          createdAt: new Date().toISOString()
        };
        
        // Stocker en mémoire
        manualReminders.set(id, manualReminder);
        
        console.log('Created manual reminder:', manualReminder);
        return res.status(201).json({
          data: manualReminder,
          message: 'Manual reminder created successfully'
        });
      }
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      res.status(400).json({
        error: error.message || 'Failed to create reminder'
      });
    }
  }
);

// Update reminder
router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log('Updating reminder:', id, updateData);
      
      // Handle manual reminders
      if (id.startsWith('manual-')) {
        const existingReminder = manualReminders.get(id);
        if (!existingReminder) {
          return res.status(404).json({ error: 'Manual reminder not found' });
        }
        
        const updatedReminder: ReminderResponse = {
          ...existingReminder,
          ...updateData,
          priority: updateData.priority ? updateData.priority.toUpperCase() : existingReminder.priority
        };
        
        manualReminders.set(id, updatedReminder);
        
        return res.json({
          data: updatedReminder,
          message: 'Manual reminder updated successfully'
        });
      }

      // Handle database reminders
      try {
        const updateFields: any = {
          ...(updateData.message && { message: updateData.message, messageFr: updateData.message }),
          ...(updateData.dueDate && { remindAt: new Date(updateData.dueDate) }),
          ...(updateData.completed !== undefined && { sent: updateData.completed })
        };

        if (updateData.type) {
          const reminderType = mapStringToReminderType(updateData.type);
          updateFields.type = reminderType;
        }

        const reminder = await prisma.reminder.update({
          where: { id },
          data: updateFields
        });

        const response: ReminderResponse = {
          id: reminder.id,
          message: reminder.message,
          type: updateData.type || reminder.type,
          dueDate: reminder.remindAt.toISOString(),
          completed: reminder.sent,
          priority: updateData.priority || 'MEDIUM',
          appointmentId: reminder.appointmentId,
          createdAt: reminder.createdAt.toISOString()
        };

        res.json({
          data: response,
          message: 'Reminder updated successfully'
        });
      } catch (dbError) {
        console.error('Database error updating reminder:', dbError);
        res.status(500).json({ error: 'Failed to update reminder in database' });
      }
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      res.status(400).json({
        error: 'Failed to update reminder'
      });
    }
  }
);

// Mark reminder as done
router.put('/:id/complete', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Marking reminder as done:', id);
      
      // Handle manual reminders
      if (id.startsWith('manual-')) {
        const existingReminder = manualReminders.get(id);
        if (!existingReminder) {
          return res.status(404).json({ error: 'Manual reminder not found' });
        }
        
        const completedReminder = { ...existingReminder, completed: true };
        manualReminders.set(id, completedReminder);
        
        return res.json({
          data: {
            id: id,
            completed: true
          },
          message: 'Manual reminder marked as completed'
        });
      }

      // Handle database reminders
      try {
        const reminder = await prisma.reminder.update({
          where: { id },
          data: { sent: true }
        });

        res.json({
          data: {
            id: reminder.id,
            completed: reminder.sent
          },
          message: 'Reminder marked as completed'
        });
      } catch (dbError) {
        console.error('Database error marking reminder done:', dbError);
        res.status(404).json({ error: 'Reminder not found' });
      }
    } catch (error: any) {
      console.error('Error marking reminder done:', error);
      res.status(400).json({
        error: 'Failed to complete reminder'
      });
    }
  }
);

// Delete reminder
router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting reminder:', id);
      
      // Handle manual reminders
      if (id.startsWith('manual-')) {
        const existed = manualReminders.has(id);
        manualReminders.delete(id);
        
        if (!existed) {
          return res.status(404).json({ error: 'Manual reminder not found' });
        }
        
        return res.json({
          message: 'Manual reminder deleted successfully'
        });
      }

      // Handle database reminders
      try {
        await prisma.reminder.delete({
          where: { id }
        });

        res.json({
          message: 'Reminder deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting reminder:', dbError);
        res.status(404).json({ error: 'Reminder not found' });
      }
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      res.status(400).json({
        error: 'Failed to delete reminder'
      });
    }
  }
);

// Snooze reminder
router.put('/:id/snooze', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { minutes } = req.body;
      
      if (!minutes || minutes <= 0) {
        return res.status(400).json({ error: 'Invalid snooze duration' });
      }
      
      console.log(`Snoozing reminder ${id} for ${minutes} minutes`);
      
      // Handle manual reminders
      if (id.startsWith('manual-')) {
        const existingReminder = manualReminders.get(id);
        if (!existingReminder) {
          return res.status(404).json({ error: 'Manual reminder not found' });
        }
        
        const newDueDate = new Date(Date.now() + minutes * 60 * 1000);
        const snoozedReminder = {
          ...existingReminder,
          dueDate: newDueDate.toISOString()
        };
        
        manualReminders.set(id, snoozedReminder);
        
        return res.json({
          data: snoozedReminder,
          message: `Manual reminder snoozed for ${minutes} minutes`
        });
      }

      // Handle database reminders
      try {
        const newRemindAt = new Date(Date.now() + minutes * 60 * 1000);
        const reminder = await prisma.reminder.update({
          where: { id },
          data: { remindAt: newRemindAt }
        });

        const response: ReminderResponse = {
          id: reminder.id,
          message: reminder.message,
          type: reminder.type,
          dueDate: reminder.remindAt.toISOString(),
          completed: reminder.sent,
          priority: 'MEDIUM',
          appointmentId: reminder.appointmentId,
          createdAt: reminder.createdAt.toISOString()
        };

        res.json({
          data: response,
          message: `Reminder snoozed for ${minutes} minutes`
        });
      } catch (dbError) {
        console.error('Database error snoozing reminder:', dbError);
        res.status(404).json({ error: 'Reminder not found' });
      }
    } catch (error: any) {
      console.error('Error snoozing reminder:', error);
      res.status(400).json({
        error: 'Failed to snooze reminder'
      });
    }
  }
);

// Create booking reminders automatically
router.post('/booking', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return res.status(400).json({ error: 'Appointment ID is required' });
      }
      
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          client: true,
          animal: true,
          service: true
        }
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Create multiple reminders for the appointment
      const reminderData = [
        {
          type: ReminderType.APPOINTMENT_CONFIRMATION,
          message: `Confirm appointment for ${appointment.animal.name} on ${appointment.startTime.toDateString()}`,
          messageFr: `Confirmer le rendez-vous pour ${appointment.animal.name} le ${appointment.startTime.toDateString()}`,
          remindAt: new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
          appointmentId: appointment.id
        },
        {
          type: ReminderType.APPOINTMENT_REMINDER,
          message: `Reminder: ${appointment.animal.name}'s appointment tomorrow`,
          messageFr: `Rappel: rendez-vous de ${appointment.animal.name} demain`,
          remindAt: new Date(appointment.startTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
          appointmentId: appointment.id
        },
        {
          type: ReminderType.FOLLOW_UP,
          message: `Follow up on ${appointment.animal.name}'s ${appointment.service.title} treatment`,
          messageFr: `Suivi du traitement ${appointment.service.title} de ${appointment.animal.name}`,
          remindAt: new Date(appointment.startTime.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after
          appointmentId: appointment.id
        }
      ];

      const createdReminders = await Promise.all(
        reminderData.map(reminder => 
          prisma.reminder.create({
            data: {
              ...reminder,
              sent: false
            }
          })
        )
      );

      const responseData: ReminderResponse[] = createdReminders.map(r => ({
        id: r.id,
        message: r.message,
        type: r.type,
        dueDate: r.remindAt.toISOString(),
        completed: r.sent,
        priority: 'MEDIUM',
        appointmentId: r.appointmentId,
        createdAt: r.createdAt.toISOString()
      }));

      res.status(201).json({
        data: responseData,
        message: 'Booking reminders created successfully'
      });
    } catch (error: any) {
      console.error('Error creating booking reminders:', error);
      res.status(400).json({
        error: 'Failed to create booking reminders'
      });
    }
  }
);

export default router;