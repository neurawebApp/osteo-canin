import { useState, useEffect } from 'react';
import { authManager, User } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authManager.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authManager.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    // Initial load
    setLoading(false);

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authManager.login(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const user = await authManager.register(data);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authManager.logout();
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: authManager.isAuthenticated(),
    isAdmin: authManager.isAdmin(),
  };
}