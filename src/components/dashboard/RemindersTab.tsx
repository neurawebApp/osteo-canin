// src/components/dashboard/RemindersTab.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon, BellIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import ReminderForm from './forms/ReminderForm';
import { getPriorityColor } from '../../utils/colorUtils';
import { apiClient } from '../../lib/api';
import type { Reminder } from '../../types/dashboard';

interface RemindersTabProps {
  reminders: Reminder[];
  refetchReminders: () => void;
}

const RemindersTab: React.FC<RemindersTabProps> = ({ reminders, refetchReminders }) => {
  const [showNewReminderForm, setShowNewReminderForm] = useState(false);
  const [completingReminder, setCompletingReminder] = useState<string | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<string | null>(null);
  const [snoozingReminder, setSnoozingReminder] = useState<string | null>(null);

  const markReminderDoneMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Marking reminder as done:', id);
      return apiClient.markReminderDone(id);
    },
    onSuccess: (response, id) => {
      console.log('Reminder marked as done successfully:', response);
      refetchReminders();
    },
    onError: (error, id) => {
      console.error('Error marking reminder done:', error);
      alert('Failed to mark reminder as done. Please try again.');
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Deleting reminder:', id);
      return apiClient.deleteReminder(id);
    },
    onSuccess: (response, id) => {
      console.log('Reminder deleted successfully:', response);
      refetchReminders();
    },
    onError: (error, id) => {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder. Please try again.');
    }
  });

  const snoozeReminderMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => {
      console.log('Snoozing reminder:', id, 'for', minutes, 'minutes');
      return apiClient.snoozeReminder(id, minutes);
    },
    onSuccess: (response, { id }) => {
      console.log('Reminder snoozed successfully:', response);
      refetchReminders();
    },
    onError: (error, { id }) => {
      console.error('Error snoozing reminder:', error);
      alert('Failed to snooze reminder. Please try again.');
    }
  });

  const handleMarkReminderDone = async (reminderId: string) => {
    setCompletingReminder(reminderId);
    try {
      await markReminderDoneMutation.mutateAsync(reminderId);
    } finally {
      setCompletingReminder(null);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      setDeletingReminder(reminderId);
      try {
        await deleteReminderMutation.mutateAsync(reminderId);
      } finally {
        setDeletingReminder(null);
      }
    }
  };

  const handleSnoozeReminder = async (reminderId: string, minutes: number) => {
    setSnoozingReminder(reminderId);
    try {
      await snoozeReminderMutation.mutateAsync({ id: reminderId, minutes });
    } finally {
      setSnoozingReminder(null);
    }
  };

  const handleFormSuccess = () => {
    console.log('Form submitted successfully, refreshing reminders');
    refetchReminders();
    setShowNewReminderForm(false);
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return { text: 'Overdue', className: 'text-red-600 font-semibold' };
    } else if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return { 
        text: diffMinutes <= 0 ? 'Due now' : `Due in ${diffMinutes}m`, 
        className: 'text-red-600 font-semibold' 
      };
    } else if (diffHours < 24) {
      return { text: `Due in ${diffHours}h`, className: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600' };
    } else if (diffDays < 7) {
      return { text: `Due in ${diffDays} days`, className: 'text-blue-600' };
    } else {
      return { 
        text: date.toLocaleDateString(), 
        className: 'text-gray-600' 
      };
    }
  };

  // Séparer les reminders complétés et non complétés
  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  // Trier par date d'échéance
  const sortedActiveReminders = activeReminders.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {activeReminders.length} active reminders
          </p>
        </div>
        <Button 
          onClick={() => setShowNewReminderForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Reminder
        </Button>
      </div>

      {/* Create Reminder Form */}
      {showNewReminderForm && (
        <ReminderForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowNewReminderForm(false)}
        />
      )}

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellIcon className="h-5 w-5 mr-2" />
            Active Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {sortedActiveReminders.map((reminder) => {
              const dueDateInfo = formatDueDate(reminder.dueDate);
              const isOverdue = dueDateInfo.text === 'Overdue' || dueDateInfo.text === 'Due now';
              
              return (
                <div 
                  key={reminder.id} 
                  className={`
                    flex items-center justify-between p-4 rounded-lg border
                    ${isOverdue 
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }
                  `}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reminder.message}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <p className={`text-sm font-medium ${dueDateInfo.className}`}>
                        {dueDateInfo.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {reminder.type.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(reminder.dueDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(reminder.priority)}>
                      {reminder.priority.toLowerCase()}
                    </Badge>
                    
                    {/* Snooze Options */}
                    {!isOverdue && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSnoozeReminder(reminder.id, 30)}
                          disabled={snoozingReminder === reminder.id}
                          title="Snooze 30 minutes"
                        >
                          30m
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSnoozeReminder(reminder.id, 60)}
                          disabled={snoozingReminder === reminder.id}
                          title="Snooze 1 hour"
                        >
                          1h
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleMarkReminderDone(reminder.id)}
                      disabled={
                        completingReminder === reminder.id || 
                        markReminderDoneMutation.isPending
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {completingReminder === reminder.id ? 'Marking...' : 'Done'}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      disabled={
                        deletingReminder === reminder.id || 
                        deleteReminderMutation.isPending
                      }
                    >
                      {deletingReminder === reminder.id ? (
                        'Deleting...'
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {sortedActiveReminders.length === 0 && (
              <div className="text-center py-12">
                <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No active reminders</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Create your first reminder to get started
                </p>
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setShowNewReminderForm(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Reminder
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600 dark:text-gray-400">
              Completed Reminders ({completedReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {completedReminders.slice(0, 5).map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 opacity-75"
                >
                  <div className="flex-1">
                    <p className="text-sm line-through text-gray-500 dark:text-gray-400">
                      {reminder.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Completed: {new Date(reminder.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    disabled={
                      deletingReminder === reminder.id || 
                      deleteReminderMutation.isPending
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {completedReminders.length > 5 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                  And {completedReminders.length - 5} more completed reminders...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RemindersTab;