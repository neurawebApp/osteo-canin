// backend/src/routes/animals.ts
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole, AnimalGender } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const createAnimalSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  age: z.number().min(0),
  weight: z.number().min(0).optional(),
  gender: z.nativeEnum(AnimalGender),
  notes: z.string().optional(),
});

const updateAnimalSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  age: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  gender: z.nativeEnum(AnimalGender).optional(),
  notes: z.string().optional(),
});

// Get user's animals (or all animals for admin)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'PRACTITIONER';
    
    const animals = await prisma.animal.findMany({
      where: isAdmin ? {} : { ownerId: req.user!.id },
      include: {
        owner: isAdmin ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        } : false,
        appointments: {
          include: {
            service: true
          },
          orderBy: { startTime: 'desc' }
        },
        treatmentNotes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      data: animals
    });
  } catch (error: any) {
    console.error('Get animals error:', error);
    res.status(500).json({
      error: 'Failed to fetch animals'
    });
  }
});

// Get specific animal by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'PRACTITIONER';
    
    const animal = await prisma.animal.findFirst({
      where: isAdmin ? { id: id } : { id: id, ownerId: req.user!.id },
      include: {
        owner: isAdmin ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        } : false,
        appointments: {
          include: {
            service: true
          },
          orderBy: { startTime: 'desc' }
        },
        treatmentNotes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({
        error: 'Animal not found'
      });
    }

    res.json({
      data: animal
    });
  } catch (error: any) {
    console.error('Get animal error:', error);
    res.status(500).json({
      error: 'Failed to fetch animal'
    });
  }
});

// Create new animal
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = createAnimalSchema.parse(req.body);
    
    const animal = await prisma.animal.create({
      data: {
        ...validatedData,
        ownerId: req.user!.id
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      data: animal,
      message: 'Animal created successfully'
    });
  } catch (error: any) {
    console.error('Create animal error:', error);
    res.status(400).json({
      error: error.message || 'Failed to create animal'
    });
  }
});

// Update animal
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateAnimalSchema.parse(req.body);
    
    // Check if animal exists and belongs to user (or user is admin)
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'PRACTITIONER';
    const existingAnimal = await prisma.animal.findFirst({
      where: isAdmin ? { id: id } : { id: id, ownerId: req.user!.id }
    });

    if (!existingAnimal) {
      return res.status(404).json({
        error: 'Animal not found or you do not have permission to update it'
      });
    }
    
    const updatedAnimal = await prisma.animal.update({
      where: { id: id },
      data: validatedData,
      include: {
        owner: isAdmin ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        } : false
      }
    });

    res.json({
      data: updatedAnimal,
      message: 'Animal updated successfully'
    });
  } catch (error: any) {
    console.error('Update animal error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update animal'
    });
  }
});

// Delete animal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if animal exists and belongs to user (or user is admin)
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'PRACTITIONER';
    const existingAnimal = await prisma.animal.findFirst({
      where: isAdmin ? { id: id } : { id: id, ownerId: req.user!.id }
    });

    if (!existingAnimal) {
      return res.status(404).json({
        error: 'Animal not found or you do not have permission to delete it'
      });
    }
    
    // Check if animal has appointments or treatment notes
    const hasAppointments = await prisma.appointment.findFirst({
      where: { animalId: id }
    });
    
    const hasTreatmentNotes = await prisma.treatmentNote.findFirst({
      where: { animalId: id }
    });

    if (hasAppointments || hasTreatmentNotes) {
      return res.status(400).json({
        error: 'Cannot delete animal with existing appointments or treatment notes. Please contact an administrator.'
      });
    }
    
    await prisma.animal.delete({
      where: { id: id }
    });

    res.json({
      message: 'Animal deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete animal error:', error);
    res.status(400).json({
      error: error.message || 'Failed to delete animal'
    });
  }
});

export default router;