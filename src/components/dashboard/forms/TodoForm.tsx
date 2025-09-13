// src/components/dashboard/forms/TodoForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { apiClient } from '../../../lib/api';

interface TodoFormData {
  task: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  description: string;
}

interface TodoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<TodoFormData>({
    task: '',
    priority: 'medium',
    dueDate: '',
    description: ''
  });

  const createTodoMutation = useMutation({
    mutationFn: (data: TodoFormData) => apiClient.createTodo(data),
    onSuccess: () => {
      onSuccess();
      setFormData({
        task: '',
        priority: 'medium',
        dueDate: '',
        description: ''
      });
    },
    onError: (error) => {
      console.error('Error creating todo:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task.trim()) return;
    createTodoMutation.mutate(formData);
  };

  const updateFormData = (field: keyof TodoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-4">Add New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="task">Task *</Label>
            <Input
              id="task"
              value={formData.task}
              onChange={(e) => updateFormData('task', e.target.value)}
              placeholder="Enter task description"
              required
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'high' | 'medium' | 'low') => updateFormData('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button 
            type="submit"
            disabled={!formData.task.trim() || createTodoMutation.isPending}
          >
            {createTodoMutation.isPending ? 'Creating...' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;