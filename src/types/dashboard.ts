// src/types/dashboard.ts

export type TabId = 'overview' | 'appointments' | 'pending' | 'todos' | 'reminders' | 'blog' | 'clients' | 'animals';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PRACTITIONER' | 'CLIENT';
  phone?: string;
  createdAt?: string;
  validated: boolean;
}

export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  description?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  message: string;
  type: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  appointmentId?: string;
  createdAt: string;
}

export interface Animal {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight?: number;
  gender: 'male' | 'female';
  notes?: string;
  createdAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  animal: {
    id: string;
    name: string;
    breed: string;
    age: number;
    weight?: number;
    gender: string;
    notes?: string;
  };
  service: {
    id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
  };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleFr?: string;
  excerpt?: string;
  excerptFr?: string;
  content: string;
  contentFr?: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  seoTitle?: string;
  seoTitleFr?: string;
  seoDesc?: string;
  seoDescFr?: string;
  author?: {
    firstName: string;
    lastName: string;
  };
}

export interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  validated: boolean;
  createdAt: string;
  animals: Array<{
    id: string;
    name: string;
    breed: string;
  }>;
  appointments: Array<{
    id: string;
    startTime: string;
    status: string;
  }>;
}

export interface DashboardMetrics {
  totalClients: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalAnimals: number;
}