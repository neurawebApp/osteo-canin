// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema } from '../types/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      
      res.status(201).json({
        data: result,
        message: 'User registered successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Registration failed'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      
      res.json({
        data: result,
        message: 'Login successful'
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message || 'Login failed'
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message || 'Token refresh failed'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    // In a production app, you might want to blacklist the token
    res.json({
      message: 'Logout successful'
    });
  }
}