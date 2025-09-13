// backend/src/routes/auth.ts
import { Router } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Register new client
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'First name, last name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address'
      });
    }

    const result = await AuthService.register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      password
    });

    console.log('Registration completed:', result.user.email);
    
    res.status(201).json({
      data: result,
      message: result.message
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message || 'Registration failed'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const result = await AuthService.login({
      email: email.trim(),
      password
    });

    console.log('Login successful:', result.user.email);
    
    res.json({
      data: result,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Login failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
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
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: error.message || 'Token refresh failed'
    });
  }
});

// Logout (client-side mostly, but can be used for token blacklisting)
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Log the logout action
    console.log('User logged out:', req.user?.id);
    
    // In production, you might want to blacklist the token here
    // For now, we'll just respond with success
    res.json({
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

// Get pending client registrations (Admin/Practitioner only)
router.get('/pending-clients', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const pendingClients = await AuthService.getPendingClients();
      
      res.json({
        data: pendingClients,
        total: pendingClients.length,
        message: `Found ${pendingClients.length} pending client registrations`
      });
    } catch (error: any) {
      console.error('Error fetching pending clients:', error);
      res.status(500).json({
        error: 'Failed to fetch pending clients'
      });
    }
  }
);

// Validate a client account (Admin/Practitioner only)
router.put('/validate-client/:clientId', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required' });
      }

      const validatedClient = await AuthService.validateClient(clientId, req.user!.id);
      
      console.log(`Client validated by ${req.user!.id}: ${validatedClient.email}`);
      
      res.json({
        data: validatedClient,
        message: `Client ${validatedClient.firstName} ${validatedClient.lastName} has been validated successfully`
      });
    } catch (error: any) {
      console.error('Client validation error:', error);
      res.status(400).json({
        error: error.message || 'Failed to validate client'
      });
    }
  }
);

export default router;