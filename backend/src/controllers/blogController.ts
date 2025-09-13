import { Request, Response } from 'express';
import { BlogService } from '../services/blogService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

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

export class BlogController {
  static async getAllPosts(req: Request, res: Response) {
    try {
      const published = req.query.published === 'true' ? true : undefined;
      const posts = await BlogService.getAllPosts(published);
      
      res.json({
        data: posts
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch blog posts'
      });
    }
  }

  static async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const post = await BlogService.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({
          error: 'Blog post not found'
        });
      }

      res.json({
        data: post
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch blog post'
      });
    }
  }

  static async createPost(req: AuthRequest, res: Response) {
    try {
      const validatedData = createBlogPostSchema.parse(req.body);
      
      // Generate slug from title
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const post = await BlogService.createPost({
        ...validatedData,
        slug,
        author: {
          connect: { id: req.user!.id }
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

  static async updatePost(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = createBlogPostSchema.partial().parse(req.body);
      
      const post = await BlogService.updatePost(id, validatedData);
      
      res.json({
        data: post,
        message: 'Blog post updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to update blog post'
      });
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await BlogService.deletePost(id);
      
      res.json({
        message: 'Blog post deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to delete blog post'
      });
    }
  }
}