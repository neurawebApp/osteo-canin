import React from 'react';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ClockIcon, 
  HeartIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../ui/Card';
import type { DashboardMetrics } from '../../types/dashboard';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, iconColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const metricsData = [
    {
      title: 'Total Clients',
      value: metrics.totalClients || 0,
      icon: UserGroupIcon,
      iconColor: 'text-blue-600'
    },
    {
      title: 'This Month',
      value: metrics.totalAppointments || 0,
      icon: CalendarIcon,
      iconColor: 'text-green-600'
    },
    {
      title: 'Pending',
      value: metrics.pendingAppointments || 0,
      icon: ClockIcon,
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Total Pets',
      value: metrics.totalAnimals || 0,
      icon: HeartIcon,
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  );
};

export default MetricsCards;