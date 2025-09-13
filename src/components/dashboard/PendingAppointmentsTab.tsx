// src/components/dashboard/PendingAppointmentsTab.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClockIcon, CheckCircleIcon, XMarkIcon, CalendarIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../lib/api';
import type { Appointment } from '../../types/dashboard';

interface PendingAppointmentsTabProps {
  pendingAppointments: Appointment[];
}

const PendingAppointmentsTab: React.FC<PendingAppointmentsTabProps> = ({ pendingAppointments }) => {
  const [confirmingAppointment, setConfirmingAppointment] = useState<string | null>(null);
  const [refusingAppointment, setRefusingAppointment] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const confirmAppointmentMutation = useMutation({
    mutationFn: (id: string) => apiClient.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const refuseAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      apiClient.refuseAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
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

  const handleRefuseAppointment = async (appointmentId: string, reason?: string) => {
    setRefusingAppointment(appointmentId);
    try {
      await refuseAppointmentMutation.mutateAsync({ 
        id: appointmentId, 
        reason: reason || 'Refused by admin' 
      });
    } catch (error) {
      console.error('Error refusing appointment:', error);
    } finally {
      setRefusingAppointment(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Pending Appointments
          <Badge variant="outline" className="ml-3">
            {pendingAppointments.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.startTime);
            
            return (
              <div 
                key={appointment.id} 
                className="border dark:border-gray-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {appointment.animal.name} - {appointment.service.title}
                      </h3>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending Approval
                      </Badge>
                    </div>
                    
                    {/* Appointment Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{date} at {time}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{appointment.client.firstName} {appointment.client.lastName}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <HeartIcon className="h-4 w-4 mr-2" />
                        <span>{appointment.animal.name} ({appointment.animal.breed})</span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="font-medium">Email:</span> {appointment.client.email}</p>
                        {appointment.client.phone && (
                          <p><span className="font-medium">Phone:</span> {appointment.client.phone}</p>
                        )}
                        <p><span className="font-medium">Service:</span> {appointment.service.title}</p>
                        <p><span className="font-medium">Price:</span> €{appointment.service.price}</p>
                      </div>
                    </div>
                    
                    {/* Pet Details */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Pet Details:</span> {appointment.animal.name}, {appointment.animal.breed}, {appointment.animal.age} years old
                        {appointment.animal.weight && `, ${appointment.animal.weight} kg`}
                      </p>
                      {appointment.animal.notes && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Pet Notes:</span> {appointment.animal.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Appointment Notes */}
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Appointment Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      disabled={
                        confirmingAppointment === appointment.id || 
                        confirmAppointmentMutation.isPending
                      }
                    >
                      {confirmingAppointment === appointment.id ? (
                        'Confirming...'
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Confirm
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      onClick={() => handleRefuseAppointment(appointment.id)}
                      disabled={
                        refusingAppointment === appointment.id || 
                        refuseAppointmentMutation.isPending
                      }
                    >
                      {refusingAppointment === appointment.id ? (
                        'Refusing...'
                      ) : (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Refuse
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {pendingAppointments.length === 0 && (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No pending appointments to review at the moment.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingAppointmentsTab;