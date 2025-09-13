import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'ADMIN' | 'PRACTITIONER';
}

class AuthManager {
  private user: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  private async initializeAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await apiClient.getCurrentUser();
        this.user = response.data;
        this.notifyListeners();
      } catch (error) {
        // Token is invalid, clear it
        this.logout();
      }
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.login(email, password);
      this.user = response.data.user;
      this.notifyListeners();
      return this.user;
    } catch (error) {
      throw error;
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    try {
      const response = await apiClient.register(data);
      this.user = response.data.user;
      this.notifyListeners();
      return this.user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    this.user = null;
    this.notifyListeners();
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'PRACTITIONER';
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }
}

export const authManager = new AuthManager();