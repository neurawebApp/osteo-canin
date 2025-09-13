// src/components/dashboard/AnimalsTab.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, HeartIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import AnimalForm from './forms/AnimalForm';
import { apiClient } from '../../lib/api';
import type { Animal, User } from '../../types/dashboard';

interface AnimalsTabProps {
  animals: Animal[];
  user: User;
}

const AnimalsTab: React.FC<AnimalsTabProps> = ({ animals, user }) => {
  const [showNewAnimalForm, setShowNewAnimalForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [showAnimalDetails, setShowAnimalDetails] = useState(false);
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PRACTITIONER';

  // Mutation pour supprimer un animal
  const deleteAnimalMutation = useMutation({
    mutationFn: (animalId: string) => apiClient.deleteAnimal(animalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      setEditingAnimal(null);
      // Fermer les détails si l'animal affiché est celui supprimé
      if (selectedAnimal && selectedAnimal.id === editingAnimal?.id) {
        handleCloseDetails();
      }
    },
    onError: (error: any) => {
      console.error('Error deleting animal:', error);
      alert(error.message || 'Failed to delete pet. Please try again.');
    }
  });

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['animals'] });
    setShowNewAnimalForm(false);
    setEditingAnimal(null);
  };

  const handleViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowAnimalDetails(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
  };

  const handleCloseDetails = () => {
    setShowAnimalDetails(false);
    setSelectedAnimal(null);
  };

  const handleCancelEdit = () => {
    setEditingAnimal(null);
  };

  const handleDeleteAnimal = (animalId: string) => {
    deleteAnimalMutation.mutate(animalId);
  };

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center dark:text-white">
            <HeartIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            {isAdmin ? 'All Pets' : 'My Pets'}
          </CardTitle>
          {!isAdmin && (
            <Button 
              onClick={() => setShowNewAnimalForm(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Animal Form */}
        {showNewAnimalForm && !isAdmin && (
          <div className="mb-6 p-4 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
            <AnimalForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowNewAnimalForm(false)}
            />
          </div>
        )}

        {/* Edit Animal Form */}
        {editingAnimal && !isAdmin && (
          <div className="mb-6 p-4 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit {editingAnimal.name}</h3>
            <AnimalForm
              animal={editingAnimal}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
              onDelete={handleDeleteAnimal}
            />
          </div>
        )}

        {/* Animal Details Modal/Panel */}
        {showAnimalDetails && selectedAnimal && (
          <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {selectedAnimal.name} - Detailed View
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCloseDetails}
                className="dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30"
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="dark:text-blue-100"><strong>Breed:</strong> {selectedAnimal.breed}</p>
                <p className="dark:text-blue-100"><strong>Age:</strong> {selectedAnimal.age} years old</p>
                <p className="dark:text-blue-100"><strong>Gender:</strong> {selectedAnimal.gender}</p>
                {selectedAnimal.weight && (
                  <p className="dark:text-blue-100"><strong>Weight:</strong> {selectedAnimal.weight} kg</p>
                )}
                <p className="dark:text-blue-100"><strong>Registered:</strong> {new Date(selectedAnimal.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                {isAdmin && selectedAnimal.owner && (
                  <div className="mb-3">
                    <p className="dark:text-blue-100"><strong>Owner:</strong> {selectedAnimal.owner.firstName} {selectedAnimal.owner.lastName}</p>
                    <p className="dark:text-blue-100"><strong>Email:</strong> {selectedAnimal.owner.email}</p>
                  </div>
                )}
                {selectedAnimal.notes && (
                  <div>
                    <p className="dark:text-blue-100"><strong>Notes:</strong></p>
                    <p className="text-sm text-gray-600 dark:text-blue-200 mt-1">
                      {selectedAnimal.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <div 
              key={animal.id} 
              className="border dark:border-slate-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow bg-white dark:bg-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {animal.name}
                </h3>
                <Badge 
                  variant="outline"
                  className="dark:border-slate-500 dark:text-slate-300"
                >
                  {animal.gender}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Breed:</strong> {animal.breed}</p>
                <p><strong>Age:</strong> {animal.age} years old</p>
                {animal.weight && (
                  <p><strong>Weight:</strong> {animal.weight} kg</p>
                )}
                {isAdmin && animal.owner && (
                  <p>
                    <strong>Owner:</strong> {animal.owner.firstName} {animal.owner.lastName}
                  </p>
                )}
              </div>
              
              {animal.notes && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-slate-600 rounded text-sm">
                  <p className="dark:text-gray-200"><strong>Notes:</strong> {animal.notes}</p>
                </div>
              )}
              
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => handleViewAnimal(animal)}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </Button>
                {!isAdmin && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-600"
                      onClick={() => handleEditAnimal(animal)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="dark:bg-red-600 dark:hover:bg-red-700"
                      onClick={() => handleDeleteAnimal(animal.id)}
                      disabled={deleteAnimalMutation.isPending}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {animals.length === 0 && (
          <div className="text-center py-8">
            <HeartIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pets registered yet</p>
            {!isAdmin && (
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={() => setShowNewAnimalForm(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Pet
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalsTab;