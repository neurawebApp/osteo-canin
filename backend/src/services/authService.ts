// backend/src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { RegisterInput, LoginInput, AuthResponse } from '../types/auth';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async register(data: RegisterInput): Promise<{ message: string; user: any }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create new client user (not validated by default)
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.CLIENT,
        validated: false // New clients need admin validation
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        validated: true,
        createdAt: true
      }
    });

    // Log the registration for admin awareness
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        meta: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          validated: user.validated
        }
      }
    });

    console.log(`New client registration: ${user.email} (${user.firstName} ${user.lastName}) - Pending validation`);

    // Don't generate tokens for unvalidated users
    return {
      message: 'Registration successful! Your account is pending validation by an administrator.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        validated: user.validated
      }
    };
  }

  static async login(data: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if client account is validated (only for clients)
    if (user.role === UserRole.CLIENT && !user.validated) {
      throw new Error('Your account is pending validation by an administrator. Please wait for approval before logging in.');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        meta: {
          email: user.email,
          role: user.role
        }
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        validated: user.validated
      },
      ...tokens
    };
  }

  static generateTokens(userId: string) {
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { token, refreshToken };
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Check if client account is still validated
      if (user.role === UserRole.CLIENT && !user.validated) {
        throw new Error('Account validation has been revoked. Please contact an administrator.');
      }

      const tokens = this.generateTokens(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          validated: user.validated
        },
        ...tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async validateClient(clientId: string, adminUserId: string): Promise<any> {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        validated: true
      }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    if (client.role !== UserRole.CLIENT) {
      throw new Error('Only client accounts can be validated');
    }

    if (client.validated) {
      throw new Error('Client is already validated');
    }

    // Update validation status
    const updatedClient = await prisma.user.update({
      where: { id: clientId },
      data: { validated: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        validated: true
      }
    });

    // Log the validation
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CLIENT_VALIDATED',
        meta: {
          validatedClientId: clientId,
          validatedClientEmail: client.email,
          validatedClientName: `${client.firstName} ${client.lastName}`
        }
      }
    });

    return updatedClient;
  }

  static async getPendingClients(): Promise<any[]> {
    return prisma.user.findMany({
      where: {
        role: UserRole.CLIENT,
        validated: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}