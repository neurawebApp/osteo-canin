import { Router } from 'express';
import { BlogController } from '../controllers/blogController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const createBlogPostSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().min(1),
  excerpt: z.string().optional(),
  excerptFr: z.string().optional(),
  content: z.string().min(1),
  contentFr: z.string().min(1),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoTitleFr: z.string().optional(),
  seoDesc: z.string().optional(),
  seoDescFr: z.string().optional(),
});

// Public routes
router.get('/', BlogController.getAllPosts);
router.get('/:slug', BlogController.getPostBySlug);

// Get all posts for admin (including unpublished)
router.get('/admin/all', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req, res) => {
    try {
      const posts = await prisma.blogPost.findMany({
        include: {
          author: {
            select: { firstName: true, lastName: true }
          },
          tags: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ data: posts });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  }
);

// Protected routes
router.post('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req, res) => {
    try {
      const validatedData = createBlogPostSchema.parse(req.body);
      
      // Generate slug from title
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const post = await prisma.blogPost.create({
        data: {
          ...validatedData,
          slug,
          authorId: (req as any).user.id
        },
        include: {
          author: {
            select: { firstName: true, lastName: true }
          },
          tags: true
        }
      });
      
      res.status(201).json({
        data: post,
        message: 'Blog post created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to create blog post'
      });
    }
  }
);

router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  BlogController.updatePost
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  BlogController.deletePost
);

export default router;