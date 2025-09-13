// src/components/dashboard/forms/ReminderForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { apiClient } from '../../../lib/api';

interface ReminderFormData {
  message: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

interface ReminderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ReminderFormData>({
    message: '',
    type: 'APPOINTMENT_REMINDER',
    priority: 'medium',
    dueDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createReminderMutation = useMutation({
    mutationFn: (data: ReminderFormData) => {
      console.log('Submitting reminder data:', data);
      return apiClient.createReminder(data);
    },
    onSuccess: (response) => {
      console.log('Reminder created successfully:', response);
      onSuccess();
      // Reset form
      setFormData({
        message: '',
        type: 'APPOINTMENT_REMINDER',
        priority: 'medium',
        dueDate: ''
      });
      setErrors({});
    },
    onError: (error: any) => {
      console.error('Error creating reminder:', error);
      
      // Handle validation errors
      if (error.message && error.message.includes('validation')) {
        setErrors({ form: 'Please check all required fields' });
      } else {
        setErrors({ form: error.message || 'Failed to create reminder' });
      }
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      // Check if date is in the past
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate < now) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    createReminderMutation.mutate(formData);
  };

  const updateFormData = (field: keyof ReminderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Set minimum datetime to current time
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Create New Reminder</h3>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reminderMessage">
              Message *
            </Label>
            <Input
              id="reminderMessage"
              value={formData.message}
              onChange={(e) => updateFormData('message', e.target.value)}
              placeholder="Enter reminder message (e.g., Call client about follow-up)"
              className={errors.message ? 'border-red-500' : ''}
              maxLength={500}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reminderType">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => updateFormData('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select reminder type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPOINTMENT_REMINDER">Appointment Reminder</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="APPOINTMENT_CONFIRMATION">Confirmation</SelectItem>
                  <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                  <SelectItem value="MEDICATION">Medication</SelectItem>
                  <SelectItem value="CHECKUP">Checkup</SelectItem>
                  <SelectItem value="MANUAL">Manual/Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="reminderPriority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => updateFormData('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reminderDueDate">
              Due Date & Time *
            </Label>
            <Input
              id="reminderDueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
              min={getMinDateTime()}
              className={errors.dueDate ? 'border-red-500' : ''}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Select when you want to be reminded
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-6">
          <Button 
            type="submit"
            disabled={createReminderMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createReminderMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Reminder'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createReminderMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;