export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'medium': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low': 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'scheduled': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'confirmed': 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'completed': 
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'cancelled': 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const getBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return 'default';
    case 'scheduled':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};