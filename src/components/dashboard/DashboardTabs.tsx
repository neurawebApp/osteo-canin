import React from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  HeartIcon,
  BellIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import type { TabId, TabConfig, User } from '../../types/dashboard';

interface DashboardTabsProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  user: User;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  setActiveTab,
  user 
}) => {
  const isAdmin = user.role === 'ADMIN' || user.role === 'PRACTITIONER';

  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    ...(isAdmin ? [
      { id: 'pending' as TabId, label: 'Pending', icon: ClockIcon, adminOnly: true },
      { id: 'todos' as TabId, label: 'Tasks', icon: DocumentTextIcon, adminOnly: true },
      { id: 'reminders' as TabId, label: 'Reminders', icon: BellIcon, adminOnly: true },
      { id: 'blog' as TabId, label: 'Blog', icon: PencilIcon, adminOnly: true },
      { id: 'clients' as TabId, label: 'Clients', icon: UserGroupIcon, adminOnly: true },
    ] : []),
    { id: 'animals', label: 'My Pets', icon: HeartIcon },
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            // Skip admin-only tabs for non-admin users
            if (tab.adminOnly && !isAdmin) return null;

            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardTabs;