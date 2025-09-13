import { Request, Response } from 'express';
import { ServiceService } from '../services/serviceService';
import { z } from 'zod';

const createServiceSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().min(1),
  description: z.string().min(1),
  descriptionFr: z.string().min(1),
  duration: z.number().min(15),
  price: z.number().min(0),
  active: z.boolean().default(true),
});

export class ServiceController {
  static async getAllServices(req: Request, res: Response) {
    try {
      const activeOnly = req.query.active === 'true';
      const services = await ServiceService.getAllServices(activeOnly);
      
      res.json({
        data: services
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch services'
      });
    }
  }

  static async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceById(id);
      
      if (!service) {
        return res.status(404).json({
          error: 'Service not found'
        });
      }

      res.json({
        data: service
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch service'
      });
    }
  }

  static async createService(req: Request, res: Response) {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const service = await ServiceService.createService(validatedData);
      
      res.status(201).json({
        data: service,
        message: 'Service created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to create service'
      });
    }
  }

  static async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = createServiceSchema.partial().parse(req.body);
      const service = await ServiceService.updateService(id, validatedData);
      
      res.json({
        data: service,
        message: 'Service updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to update service'
      });
    }
  }

  static async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ServiceService.deleteService(id);
      
      res.json({
        message: 'Service deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to delete service'
      });
    }
  }
}