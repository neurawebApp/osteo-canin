// src/components/dashboard/ClientsTab.tsx
import React, { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  UserGroupIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TrashIcon, 
  CalendarIcon, 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { apiClient } from '../../lib/api';
import type { Client } from '../../types/dashboard';

interface ClientsTabProps {
  clients: Client[];
  refetchClients: () => void;
}

interface ClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

// Modal pour voir les détails du client
const ClientModal: React.FC<ClientModalProps> = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Client Details
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-lg">{client.firstName} {client.lastName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p>{client.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p>{client.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Member Since</Label>
              <p>{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={client.validated ? "success" : "warning"}>
                {client.validated ? "Validated" : "Pending Validation"}
              </Badge>
            </div>
          </div>

          {/* Animaux */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Pets ({client.animals?.length || 0})</Label>
            {client.animals && client.animals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {client.animals.map((animal) => (
                  <div key={animal.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium">{animal.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{animal.breed}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pets registered</p>
            )}
          </div>

          {/* Rendez-vous récents */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Recent Appointments ({client.appointments?.length || 0})</Label>
            {client.appointments && client.appointments.length > 0 ? (
              <div className="space-y-2">
                {client.appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center">
                    <div>
                      <p className="text-sm">{new Date(appointment.startTime).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(appointment.startTime).toLocaleTimeString()}</p>
                    </div>
                    <Badge variant="outline" size="sm">
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No appointments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientsTab: React.FC<ClientsTabProps> = ({ clients, refetchClients }) => {
  const [validatingClient, setValidatingClient] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateClientMutation = useMutation({
    mutationFn: (id: string) => apiClient.validateClient(id),
    onSuccess: () => {
      refetchClients();
      // Optionally show success toast
    },
    onError: (error) => {
      console.error('Error validating client:', error);
      // Optionally show error toast
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteClient(id),
    onSuccess: () => {
      refetchClients();
      // Optionally show success toast
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      // Optionally show error toast
    }
  });

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleValidateClient = async (clientId: string) => {
    if (validatingClient) return;
    
    setValidatingClient(clientId);
    try {
      await validateClientMutation.mutateAsync(clientId);
    } finally {
      setValidatingClient(null);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const confirmMessage = `Are you sure you want to delete ${client?.firstName} ${client?.lastName}? This will permanently delete:\n- Their account\n- All their pets (${client?.animals?.length || 0})\n- All their appointments (${client?.appointments?.length || 0})\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setDeletingClient(clientId);
      try {
        await deleteClientMutation.mutateAsync(clientId);
      } finally {
        setDeletingClient(null);
      }
    }
  };

  // Filtrage et recherche optimisés avec useMemo
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const email = client.email.toLowerCase();
        const phone = (client.phone || '').toLowerCase();
        
        return fullName.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchLower) ||
               client.firstName.toLowerCase().includes(searchLower) ||
               client.lastName.toLowerCase().includes(searchLower);
      });
    }

    // Filtre par statut de validation
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => {
        if (filterStatus === 'validated') return client.validated;
        if (filterStatus === 'pending') return !client.validated;
        return true;
      });
    }

    // Tri par date de création (plus récent d'abord)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [clients, searchTerm, filterStatus]);

  // Statistiques calculées
  const stats = useMemo(() => ({
    total: clients.length,
    validated: clients.filter(c => c.validated).length,
    pending: clients.filter(c => !c.validated).length,
    totalPets: clients.reduce((sum, client) => sum + (client.animals?.length || 0), 0),
    totalAppointments: clients.reduce((sum, client) => sum + (client.appointments?.length || 0), 0),
  }), [clients]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Client Management ({filteredClients.length})
            </CardTitle>
            
            {/* Contrôles de recherche et filtrage */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="validated">Validated</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.validated}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Validated</p>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-center">
                <XCircleIcon className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pending}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Pending</p>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-center">
                <HeartIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalPets}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Pets</p>
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <div className="text-center">
                <CalendarIcon className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalAppointments}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">Appointments</p>
              </div>
            </div>
          </div>

          {/* Liste des clients */}
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id} 
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    {/* Info client */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900 dark:text-white text-lg">
                          {client.firstName} {client.lastName}
                        </p>
                        <Badge 
                          variant={client.validated ? "default" : "secondary"} 
                          className={`text-xs ${client.validated ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                        >
                          {client.validated ? "✓ Validated" : "⏳ Pending"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex items-center">
                          <span className="w-4">📧</span> {client.email}
                        </p>
                        {client.phone && (
                          <p className="flex items-center">
                            <span className="w-4">📱</span> {client.phone}
                          </p>
                        )}
                        <p className="flex items-center text-gray-500 dark:text-gray-500">
                          <span className="w-4">📅</span> Joined {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats rapides */}
                    <div className="flex gap-3 mt-2 sm:mt-0">
                      <Badge variant="outline" className="text-xs">
                        <HeartIcon className="h-3 w-3 mr-1" />
                        {client.animals?.length || 0} pets
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {client.appointments?.length || 0} appointments
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Aperçu des animaux */}
                  {client.animals && client.animals.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Pets:</p>
                      <div className="flex flex-wrap gap-2">
                        {client.animals.slice(0, 3).map((animal) => (
                          <span 
                            key={animal.id}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {animal.name} ({animal.breed})
                          </span>
                        ))}
                        {client.animals.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{client.animals.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewClient(client)}
                    className="flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {!client.validated && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleValidateClient(client.id)}
                      disabled={validatingClient === client.id}
                      className="text-green-600 hover:text-green-700 hover:border-green-300"
                    >
                      {validatingClient === client.id ? (
                        <>⏳ Validating...</>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Validate
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={deletingClient === client.id}
                  >
                    {deletingClient === client.id ? (
                      <>⏳ Deleting...</>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            
            {/* État vide */}
            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No clients found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No clients have registered yet'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setFilterStatus('all')}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <ClientModal 
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </>
  );
};

export default ClientsTab;