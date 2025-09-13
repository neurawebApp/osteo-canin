// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/dashboard/useDashboardData';
import { useTheme } from '../contexts/ThemeContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import OverviewTab from '../components/dashboard/OverviewTab';
import AppointmentsTab from '../components/dashboard/AppointmentsTab';
import TodosTab from '../components/dashboard/TodosTab';
import RemindersTab from '../components/dashboard/RemindersTab';
import AnimalsTab from '../components/dashboard/AnimalsTab';
import PendingAppointmentsTab from '../components/dashboard/PendingAppointmentsTab'
import BlogTab from '../components/dashboard/BlogTab'
import ClientsTab from '../components/dashboard/ClientsTab'
import type { TabId } from '../types/dashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  const {
    user,
    isAuthenticated,
    authLoading,
    isAdmin,
    metrics,
    todos,
    reminders,
    appointments,
    pendingAppointments,
    blogPosts,
    clients,
    animals,
    refetchTodos,
    refetchReminders,
    refetchAppointments,
    refetchBlogPosts,
    refetchClients,
  } = useDashboardData();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated (fallback)
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Navigation Tabs */}
        <DashboardTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
        />

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              metrics={metrics}
              appointments={appointments}
              animals={animals}
              onTabChange={handleTabChange}
            />
          )}

          {/* All Appointments Tab */}
          {activeTab === 'appointments' && (
            <AppointmentsTab
              user={user}
              appointments={appointments}
              refetchAppointments={refetchAppointments}
            />
          )}

          {/* Pending Appointments Tab (Admin Only) */}
          {activeTab === 'pending' && isAdmin && (
            <PendingAppointmentsTab
              pendingAppointments={pendingAppointments}
            />
          )}

          {/* Tasks Tab (Admin Only) */}
          {activeTab === 'todos' && isAdmin && (
            <TodosTab
              todos={todos}
              refetchTodos={refetchTodos}
            />
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <RemindersTab
              reminders={reminders}
              refetchReminders={refetchReminders}
            />
          )}

          {/* Blog Tab (Admin Only) */}
          {activeTab === 'blog' && isAdmin && (
            <BlogTab
              blogPosts={blogPosts}
              refetchBlogPosts={refetchBlogPosts}
            />
          )}

          {/* Clients Tab (Admin Only) */}
          {activeTab === 'clients' && isAdmin && (
            <ClientsTab
              clients={clients}
              refetchClients={refetchClients}
            />
          )}

          {/* Animals Tab */}
          {activeTab === 'animals' && (
            <AnimalsTab
              animals={animals}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;