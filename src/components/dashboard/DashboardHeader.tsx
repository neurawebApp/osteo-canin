import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/dashboard';

interface DashboardHeaderProps {
  user: User;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const isAdmin = user.role === 'ADMIN' || user.role === 'PRACTITIONER';

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? 'Manage your practice and appointments' : 'View your appointments and pets'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/booking">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;