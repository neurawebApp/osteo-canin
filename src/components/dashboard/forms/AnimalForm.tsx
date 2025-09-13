// src/components/dashboard/forms/AnimalForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { apiClient } from '../../../lib/api';
import type { Animal } from '../../../types/dashboard';

interface AnimalFormData {
  name: string;
  breed: string;
  age: number;
  weight?: number;
  gender: 'male' | 'female';
  notes?: string;
}

interface AnimalFormProps {
  animal?: Animal; // Optional: if provided, form is in edit mode
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void; // Optional delete handler for edit mode
}

const AnimalForm: React.FC<AnimalFormProps> = ({ animal, onSuccess, onCancel, onDelete }) => {
  const isEditMode = !!animal;
  
  const [formData, setFormData] = useState<AnimalFormData>({
    name: animal?.name || '',
    breed: animal?.breed || '',
    age: animal?.age || 1,
    weight: animal?.weight || undefined,
    gender: animal?.gender || 'male',
    notes: animal?.notes || ''
  });

  const createAnimalMutation = useMutation({
    mutationFn: (data: AnimalFormData) => apiClient.createAnimal(data),
    onSuccess: () => {
      onSuccess();
      if (!isEditMode) {
        setFormData({
          name: '',
          breed: '',
          age: 1,
          weight: undefined,
          gender: 'male',
          notes: ''
        });
      }
    },
    onError: (error) => {
      console.error('Error creating animal:', error);
      alert('Failed to create pet. Please try again.');
    }
  });

  const updateAnimalMutation = useMutation({
    mutationFn: (data: AnimalFormData) => apiClient.updateAnimal(animal!.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Error updating animal:', error);
      alert('Failed to update pet. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.breed.trim()) return;
    
    // Clean the data before submitting
    const submitData = {
      name: formData.name.trim(),
      breed: formData.breed.trim(),
      age: formData.age,
      weight: formData.weight || undefined,
      gender: formData.gender,
      notes: formData.notes?.trim() || undefined
    };
    
    if (isEditMode) {
      updateAnimalMutation.mutate(submitData);
    } else {
      createAnimalMutation.mutate(submitData);
    }
  };

  const updateFormData = (field: keyof AnimalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    if (animal && onDelete) {
      if (window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
        onDelete(animal.id);
      }
    }
  };

  const isLoading = createAnimalMutation.isPending || updateAnimalMutation.isPending;

  return (
    <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {isEditMode ? `Edit ${animal.name}` : 'Add New Pet'}
        </h3>
        {isEditMode && onDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            type="button"
          >
            Delete Pet
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${isEditMode ? 'edit' : ''}animalName`}>Name *</Label>
            <Input
              id={`${isEditMode ? 'edit' : ''}animalName`}
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter pet's name"
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEditMode ? 'edit' : ''}breed`}>Breed *</Label>
            <Input
              id={`${isEditMode ? 'edit' : ''}breed`}
              value={formData.breed}
              onChange={(e) => updateFormData('breed', e.target.value)}
              placeholder="e.g., Golden Retriever"
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEditMode ? 'edit' : ''}age`}>Age (years) *</Label>
            <Input
              id={`${isEditMode ? 'edit' : ''}age`}
              type="number"
              min="0"
              max="50"
              value={formData.age}
              onChange={(e) => updateFormData('age', parseInt(e.target.value) || 1)}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEditMode ? 'edit' : ''}weight`}>Weight (kg)</Label>
            <Input
              id={`${isEditMode ? 'edit' : ''}weight`}
              type="number"
              min="0"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || undefined)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor={`${isEditMode ? 'edit' : ''}gender`}>Gender *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value: string) => updateFormData('gender', value as 'male' | 'female')}
            >

              <SelectTrigger type="button">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor={`${isEditMode ? 'edit' : ''}notes`}>Notes</Label>
            <Textarea
              id={`${isEditMode ? 'edit' : ''}notes`}
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Any additional information about your pet (health conditions, allergies, behavior notes, etc.)"
              rows={3}
            />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button 
            type="submit"
            disabled={
              !formData.name.trim() || 
              !formData.breed.trim() || 
              isLoading
            }
          >
            {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Pet' : 'Add Pet')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AnimalForm;