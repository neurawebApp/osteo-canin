import { prisma } from '../index';
import { Prisma } from '@prisma/client';

export class BlogService {
  static async getAllPosts(published?: boolean) {
    return prisma.blogPost.findMany({
      where: published !== undefined ? { published } : undefined,
      include: {
        author: {
          select: { firstName: true, lastName: true }
        },
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { firstName: true, lastName: true }
        },
        tags: true
      }
    });
  }

  static async createPost(data: Prisma.BlogPostCreateInput) {
    return prisma.blogPost.create({
      data,
      include: {
        author: {
          select: { firstName: true, lastName: true }
        },
        tags: true
      }
    });
  }

  static async updatePost(id: string, data: Prisma.BlogPostUpdateInput) {
    return prisma.blogPost.update({
      where: { id },
      data,
      include: {
        author: {
          select: { firstName: true, lastName: true }
        },
        tags: true
      }
    });
  }

  static async deletePost(id: string) {
    return prisma.blogPost.delete({
      where: { id }
    });
  }
}