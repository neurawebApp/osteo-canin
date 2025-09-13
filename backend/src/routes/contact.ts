import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

router.post('/', async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    
    const submission = await prisma.contactSubmission.create({
      data: validatedData
    });

    res.status(201).json({
      data: submission,
      message: 'Contact form submitted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message || 'Failed to submit contact form'
    });
  }
});

export default router;