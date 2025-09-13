import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const createTreatmentNoteSchema = z.object({
  appointmentId: z.string(),
  animalId: z.string(),
  content: z.string().min(1, 'Content is required'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUp: z.string().optional(),
});

const updateTreatmentNoteSchema = z.object({
  content: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUp: z.string().optional(),
});

// Get treatment notes
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { animalId } = req.query;
    
    let whereClause: any = {};
    
    // If user is a client, only show their animals' notes
    if (req.user!.role === UserRole.CLIENT) {
      const userAnimals = await prisma.animal.findMany({
        where: { ownerId: req.user!.id },
        select: { id: true }
      });
      
      whereClause.animalId = {
        in: userAnimals.map(animal => animal.id)
      };
    }
    
    // If animalId is specified, filter by it
    if (animalId) {
      whereClause.animalId = animalId as string;
    }

    const treatmentNotes = await prisma.treatmentNote.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            service: true,
            client: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        animal: {
          select: { name: true, breed: true }
        },
        practitioner: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: treatmentNotes });
  } catch (error: any) {
    console.error('Error fetching treatment notes:', error);
    res.status(500).json({ error: 'Failed to fetch treatment notes' });
  }
});

// Create treatment note
router.post('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const validatedData = createTreatmentNoteSchema.parse(req.body);
      
      const treatmentNote = await prisma.treatmentNote.create({
        data: {
          ...validatedData,
          practitionerId: req.user!.id
        },
        include: {
          appointment: {
            include: {
              service: true,
              client: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          animal: {
            select: { name: true, breed: true }
          },
          practitioner: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      res.status(201).json({
        data: treatmentNote,
        message: 'Treatment note created successfully'
      });
    } catch (error: any) {
      console.error('Error creating treatment note:', error);
      res.status(400).json({
        error: error.message || 'Failed to create treatment note'
      });
    }
  }
);

// Update treatment note
router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateTreatmentNoteSchema.parse(req.body);
      
      const treatmentNote = await prisma.treatmentNote.update({
        where: { 
          id,
          practitionerId: req.user!.id // Only allow updating own notes
        },
        data: validatedData,
        include: {
          appointment: {
            include: {
              service: true,
              client: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          animal: {
            select: { name: true, breed: true }
          },
          practitioner: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      res.json({
        data: treatmentNote,
        message: 'Treatment note updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating treatment note:', error);
      res.status(400).json({
        error: error.message || 'Failed to update treatment note'
      });
    }
  }
);

// Delete treatment note
router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      await prisma.treatmentNote.delete({
        where: { 
          id,
          practitionerId: req.user!.id // Only allow deleting own notes
        }
      });

      res.json({
        message: 'Treatment note deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting treatment note:', error);
      res.status(400).json({
        error: 'Failed to delete treatment note'
      });
    }
  }
);

export default router;