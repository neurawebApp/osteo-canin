// backend/src/services/appointmentService.ts
import { prisma } from '../index';
import { AppointmentStatus, UserRole } from '@prisma/client';

export class AppointmentService {
  static async getAppointmentsByUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let whereClause: any = {};

    if (user.role === UserRole.CLIENT) {
      whereClause = { clientId: userId };
    }
    // For ADMIN and PRACTITIONER, return all appointments

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        animal: {
          select: {
            id: true,
            name: true,
            breed: true,
            age: true,
            weight: true,
            gender: true,
            notes: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            price: true
          }
        },
        treatmentNotes: {
          include: {
            practitioner: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reminders: {
          where: {
            sent: false
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    return appointments;
  }

  static async createAppointment(data: any) {
    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        status: AppointmentStatus.SCHEDULED
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        animal: {
          select: {
            id: true,
            name: true,
            breed: true,
            age: true,
            weight: true,
            gender: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            price: true
          }
        }
      }
    });

    // Log the appointment creation
    await prisma.auditLog.create({
      data: {
        userId: data.client?.connect?.id,
        action: 'APPOINTMENT_CREATED',
        meta: {
          appointmentId: appointment.id,
          serviceId: appointment.serviceId,
          animalId: appointment.animalId,
          startTime: appointment.startTime,
          endTime: appointment.endTime
        }
      }
    });

    return appointment;
  }

  static async checkAvailability(serviceId: string, startTime: Date, endTime: Date) {
    // Check for overlapping appointments
    const conflictingAppointments = await prisma.appointment.count({
      where: {
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } }
                ]
              }
            ]
          },
          {
            status: {
              not: AppointmentStatus.CANCELLED
            }
          }
        ]
      }
    });

    return conflictingAppointments === 0;
  }

  static async getAvailableSlots(serviceId: string, date: Date) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Get business hours (this should come from settings)
    const businessHours = {
      start: 9, // 9 AM
      end: 17,  // 5 PM
      interval: 30 // 30 minutes intervals
    };

    const startOfDay = new Date(date);
    startOfDay.setHours(businessHours.start, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(businessHours.end, 0, 0, 0);

    // Get existing appointments for the day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          not: AppointmentStatus.CANCELLED
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate available time slots
    const availableSlots = [];
    const currentTime = new Date();
    
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += businessHours.interval) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

        // Don't show past time slots for today
        if (slotStart <= currentTime && date.toDateString() === currentTime.toDateString()) {
          continue;
        }

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          return (slotStart < appointment.endTime && slotEnd > appointment.startTime);
        });

        if (!hasConflict && slotEnd <= endOfDay) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: true
          });
        }
      }
    }

    return availableSlots;
  }

  static async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, userId?: string) {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        client: true,
        animal: true,
        service: true
      }
    });

    // Log the status change
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'APPOINTMENT_STATUS_UPDATED',
        meta: {
          appointmentId,
          oldStatus: appointment.status,
          newStatus: status,
          timestamp: new Date()
        }
      }
    });

    return appointment;
  }

  static async cancelAppointment(appointmentId: string, userId: string, reason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        animal: true,
        service: true
      }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check business rules for cancellation
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Only allow cancellation if appointment is more than 2 hours away (for clients)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === UserRole.CLIENT && hoursDifference < 2) {
      throw new Error('Cannot cancel appointments less than 2 hours before the scheduled time');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new Error('Cannot cancel completed appointments');
    }

    // Cancel the appointment
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: AppointmentStatus.CANCELLED,
        notes: reason ? `${appointment.notes || ''}\n\nCancellation reason: ${reason}` : appointment.notes
      },
      include: {
        client: true,
        animal: true,
        service: true
      }
    });

    // Cancel related reminders
    await prisma.reminder.updateMany({
      where: { 
        appointmentId,
        sent: false
      },
      data: { sent: true }
    });

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'APPOINTMENT_CANCELLED',
        meta: {
          appointmentId,
          reason,
          cancelledBy: userId,
          originalStartTime: appointment.startTime,
          clientId: appointment.clientId,
          animalId: appointment.animalId
        }
      }
    });

    return cancelledAppointment;
  }

  static async rescheduleAppointment(appointmentId: string, newStartTime: Date, userId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Calculate new end time
    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + appointment.service.duration);

    // Check availability for new slot
    const isAvailable = await this.checkAvailability(
      appointment.serviceId,
      newStartTime,
      newEndTime
    );

    if (!isAvailable) {
      throw new Error('New time slot is not available');
    }

    // Update appointment
    const rescheduledAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        status: AppointmentStatus.SCHEDULED
      },
      include: {
        client: true,
        animal: true,
        service: true
      }
    });

    // Update existing reminders with new times
    const reminders = await prisma.reminder.findMany({
      where: { appointmentId }
    });

    for (const reminder of reminders) {
      let newRemindAt: Date;
      
      switch (reminder.type) {
        case 'APPOINTMENT_CONFIRMATION':
          newRemindAt = new Date(newStartTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
          break;
        case 'APPOINTMENT_REMINDER':
          newRemindAt = new Date(newStartTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
          break;
        case 'FOLLOW_UP':
          newRemindAt = new Date(newStartTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after
          break;
        default:
          continue;
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          remindAt: newRemindAt,
          sent: false // Reset to unsent
        }
      });
    }

    // Log the reschedule
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'APPOINTMENT_RESCHEDULED',
        meta: {
          appointmentId,
          oldStartTime: appointment.startTime,
          newStartTime: newStartTime,
          rescheduledBy: userId
        }
      }
    });

    return rescheduledAppointment;
  }

  static async getAppointmentStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate
      };
    }

    const [
      total,
      completed,
      cancelled,
      scheduled
    ] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.COMPLETED }
      }),
      prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.CANCELLED }
      }),
      prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.SCHEDULED }
      })
    ]);

    // Calculate revenue by getting completed appointments with their service prices
    const completedAppointments = await prisma.appointment.findMany({
      where: { 
        ...where, 
        status: AppointmentStatus.COMPLETED 
      },
      include: {
        service: {
          select: {
            price: true
          }
        }
      }
    });

    const revenue = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.service.price || 0);
    }, 0);

    return {
      total,
      completed,
      cancelled,
      scheduled,
      noShow: total - completed - cancelled - scheduled,
      revenue,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0
    };
  }

  static async getUpcomingAppointments(days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        animal: {
          select: {
            name: true,
            breed: true
          }
        },
        service: {
          select: {
            title: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  static async getClientAppointmentHistory(clientId: string, limit: number = 10) {
    return await prisma.appointment.findMany({
      where: {
        clientId,
        status: AppointmentStatus.COMPLETED
      },
      include: {
        animal: {
          select: {
            name: true,
            breed: true
          }
        },
        service: {
          select: {
            title: true,
            price: true
          }
        },
        treatmentNotes: {
          select: {
            content: true,
            diagnosis: true,
            treatment: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: limit
    });
  }
}