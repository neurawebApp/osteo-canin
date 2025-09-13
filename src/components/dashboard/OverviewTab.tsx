import React from 'react';
import { CalendarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import MetricsCards from './MetricsCards';
import { getBadgeVariant } from '../../utils/colorUtils';
import type { DashboardMetrics, Appointment, Animal, User } from '../../types/dashboard';

interface OverviewTabProps {
  user: User;
  metrics: DashboardMetrics;
  appointments: Appointment[];
  animals: Animal[];
  onTabChange: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  metrics,
  appointments,
  animals,
  onTabChange
}) => {
  const isAdmin = user.role === 'ADMIN' || user.role === 'PRACTITIONER';

  return (
    <div className="space-y-6">
      {/* Metrics Cards (Admin Only) */}
      {isAdmin && <MetricsCards metrics={metrics} />}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.client.firstName} {appointment.client.lastName} - {appointment.animal.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {appointment.service.title} • {new Date(appointment.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No appointments found
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange('appointments')}
            >
              View All Appointments
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Pets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HeartIcon className="h-5 w-5 mr-2" />
              {isAdmin ? 'Recent Pets' : 'My Pets'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {animals.slice(0, 5).map((animal) => (
                <div 
                  key={animal.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{animal.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {animal.breed} • {animal.age} years old
                    </p>
                  </div>
                  <Badge variant="outline">{animal.gender}</Badge>
                </div>
              ))}
              {animals.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No pets registered yet
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange('animals')}
            >
              View All Pets
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;