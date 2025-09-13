import { prisma } from '../index';
import { Prisma } from '@prisma/client';

export class ServiceService {
  static async getAllServices(activeOnly = false) {
    return prisma.service.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getServiceById(id: string) {
    return prisma.service.findUnique({
      where: { id }
    });
  }

  static async createService(data: Prisma.ServiceCreateInput) {
    return prisma.service.create({
      data
    });
  }

  static async updateService(id: string, data: Prisma.ServiceUpdateInput) {
    return prisma.service.update({
      where: { id },
      data
    });
  }

  static async deleteService(id: string) {
    return prisma.service.delete({
      where: { id }
    });
  }
}