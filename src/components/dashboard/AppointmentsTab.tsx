import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getBadgeVariant } from '../../utils/colorUtils';
import { apiClient } from '../../lib/api';
import type { Appointment, User } from '../../types/dashboard';

interface AppointmentsTabProps {
  user: User;
  appointments: Appointment[];
  refetchAppointments: () => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  user,
  appointments,
  refetchAppointments
}) => {
  const queryClient = useQueryClient();
  const [confirmingAppointment, setConfirmingAppointment] = useState<string | null>(null);
  const [refusingAppointment, setRefusingAppointment] = useState<string | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);

  const confirmAppointmentMutation = useMutation({
    mutationFn: (id: string) => apiClient.confirmAppointment(id),
    onSuccess: () => {
      refetchAppointments();
      queryClient.invalidateQueries({ queryKey: ['pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const refuseAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      apiClient.refuseAppointment(id, reason),
    onSuccess: () => {
      refetchAppointments();
      queryClient.invalidateQueries({ queryKey: ['pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: string) => apiClient.cancelAppointment(id),
    onSuccess: () => {
      refetchAppointments();
      queryClient.invalidateQueries({ queryKey: ['pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const handleConfirmAppointment = async (appointmentId: string) => {
    setConfirmingAppointment(appointmentId);
    try {
      await confirmAppointmentMutation.mutateAsync(appointmentId);
    } catch (error) {
      console.error('Error confirming appointment:', error);
    } finally {
      setConfirmingAppointment(null);
    }
  };

  const handleRefuseAppointment = async (appointmentId: string) => {
    setRefusingAppointment(appointmentId);
    try {
      await refuseAppointmentMutation.mutateAsync({ 
        id: appointmentId, 
        reason: 'Refused by admin' 
      });
    } catch (error) {
      console.error('Error refusing appointment:', error);
    } finally {
      setRefusingAppointment(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingAppointment(appointmentId);
    try {
      await cancelAppointmentMutation.mutateAsync(appointmentId);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancellingAppointment(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Appointments</h2>
        <Button 
          onClick={() => refetchAppointments()}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.client.firstName} {appointment.client.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {appointment.animal.name} ({appointment.animal.breed})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {appointment.service.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(appointment.startTime).toLocaleDateString()} at {new Date(appointment.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getBadgeVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  {user?.role !== 'CLIENT' && appointment.status === 'SCHEDULED' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        disabled={confirmingAppointment === appointment.id}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        {confirmingAppointment === appointment.id ? 'Confirming...' : 'Confirm'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRefuseAppointment(appointment.id)}
                        disabled={refusingAppointment === appointment.id}
                        className="dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        {refusingAppointment === appointment.id ? 'Refusing...' : 'Refuse'}
                      </Button>
                    </div>
                  )}
                  {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelAppointment(appointment.id)}
                      disabled={cancellingAppointment === appointment.id}
                      className="dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      {cancellingAppointment === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsTab;