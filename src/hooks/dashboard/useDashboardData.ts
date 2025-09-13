import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { apiClient } from '../../lib/api';
import type { 
  Todo, 
  Reminder, 
  Appointment, 
  BlogPost, 
  Client, 
  Animal, 
  DashboardMetrics 
} from '../../types/dashboard';

export const useDashboardData = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PRACTITIONER';

  // Dashboard metrics
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiClient.getDashboardMetrics(),
    enabled: isAuthenticated && isAdmin
  });

  // Todos
  const { data: todosData, refetch: refetchTodos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => apiClient.getTodos(),
    enabled: isAuthenticated && isAdmin
  });

  // Reminders
  const { data: remindersData, refetch: refetchReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => apiClient.getReminders(),
    enabled: isAuthenticated && isAdmin
  });

  // Appointments
  const { data: appointmentsData, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => apiClient.getAppointments(),
    enabled: isAuthenticated
  });

  // Pending appointments
  const { data: pendingAppointmentsData } = useQuery({
    queryKey: ['pending-appointments'],
    queryFn: () => apiClient.getPendingAppointments(),
    enabled: isAuthenticated && isAdmin
  });

  // Blog posts
  const { data: blogPostsData, refetch: refetchBlogPosts } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => apiClient.getAdminBlogPosts(),
    enabled: isAuthenticated && isAdmin
  });

  // Clients
  const { data: clientsData, refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
    enabled: isAuthenticated && isAdmin
  });

  // Animals
  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => apiClient.getAnimals(),
    enabled: isAuthenticated
  });

  return {
    user,
    isAuthenticated,
    authLoading,
    isAdmin,
    queryClient,
    // Data
    metrics: (dashboardMetrics?.data || {}) as DashboardMetrics,
    todos: (todosData?.data || []) as Todo[],
    reminders: (remindersData?.data || []) as Reminder[],
    appointments: (appointmentsData?.data || []) as Appointment[],
    pendingAppointments: (pendingAppointmentsData?.data || []) as Appointment[],
    blogPosts: (blogPostsData?.data || []) as BlogPost[],
    clients: (clientsData?.data || []) as Client[],
    animals: (animalsData?.data || []) as Animal[],
    // Refetch functions
    refetchTodos,
    refetchReminders,
    refetchAppointments,
    refetchBlogPosts,
    refetchClients,
  };
};