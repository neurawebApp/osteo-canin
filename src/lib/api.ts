// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API Request:', options.method || 'GET', url);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      console.log('Request body:', options.body);
    }
    const response = await fetch(url, config);
    
    console.log('API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/users/me');
  }

  // Services endpoints
  async getServices(activeOnly = true) {
    return this.request(`/services?active=${activeOnly}`);
  }

  async getServiceById(id: string) {
    return this.request(`/services/${id}`);
  }

  // Blog endpoints
  async getBlogPosts(publishedOnly = true) {
    return this.request(`/blog?published=${publishedOnly}`);
  }

  async getBlogPostBySlug(slug: string) {
    return this.request(`/blog/${slug}`);
  }

  async getAdminBlogPosts() {
    return this.request('/blog/admin/all');
  }

  async createBlogPost(data: any) {
    return this.request('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(id: string) {
    return this.request(`/blog/${id}`, {
      method: 'DELETE',
    });
  }

  // Animals endpoints
  async getAnimals() {
    return this.request('/animals');
  }

async createAnimal(data: {
  name: string;
  breed: string;
  age: number;
  weight?: number;
  gender: 'MALE' | 'FEMALE' | 'male' | 'female'; // Accepter les deux formats
  notes?: string;
}) {
  // Convertir le genre en majuscules pour le backend
  const backendData = {
    ...data,
    gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE'
  };
  
  return this.request('/animals', {
    method: 'POST',
    body: JSON.stringify(backendData),
  });
}

async updateAnimal(id: string, data: Partial<{
  name: string;
  breed: string;
  age: number;
  weight?: number;
  gender: 'MALE' | 'FEMALE' | 'male' | 'female'; // Accepter les deux formats
  notes?: string;
}>) {
  // Convertir le genre en majuscules si présent
  const backendData = {
    ...data,
    ...(data.gender && { gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE' })
  };
  
  return this.request(`/animals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(backendData),
  });
}

  async deleteAnimal(id: string) {
    return this.request(`/animals/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments endpoints
  async getAppointments() {
    return this.request('/appointments');
  }

  async createAppointment(data: {
    serviceId: string;
    animalId: string;
    startTime: string;
    notes?: string;
  }) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelAppointment(id: string) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async confirmAppointment(id: string) {
    return this.request(`/appointments/${id}/confirm`, {
      method: 'PUT',
    });
  }

  async refuseAppointment(id: string, reason?: string) {
    return this.request(`/appointments/${id}/refuse`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async rescheduleAppointment(id: string, newStartTime: string) {
    return this.request(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ startTime: newStartTime }),
    });
  }

  async getAvailability(serviceId: string, date: string) {
    return this.request(`/appointments/availability?serviceId=${serviceId}&date=${date}`);
  }

  async getPendingAppointments() {
    return this.request('/dashboard/pending-appointments');
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
  }

  async getTodaySchedule() {
    return this.request('/dashboard/schedule');
  }

  async getWeekSchedule() {
    return this.request('/dashboard/schedule/week');
  }

  // Todo endpoints
  async getTodos() {
    return this.request('/todos');
  }

  async createTodo(data: {
    task: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    description?: string;
  }) {
    // Convert priority to uppercase for backend
    const backendData = {
      ...data,
      priority: data.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW'
    };
    
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateTodo(id: string, data: Partial<{
    task: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    description?: string;
    completed: boolean;
  }>) {
    // Convert priority to uppercase for backend if present
    const backendData = {
      ...data,
      ...(data.priority && { priority: data.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW' })
    };
    
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  }

  async toggleTodo(id: string) {
    return this.request(`/todos/${id}/toggle`, {
      method: 'PUT',
    });
  }

  async deleteTodo(id: string) {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // Reminders endpoints
  async getReminders() {
    return this.request('/reminders');
  }

  async createReminder(data: {
    message: string;
    type: string;
    dueDate: string;
    priority?: 'high' | 'medium' | 'low';
    appointmentId?: string;
  }) {
    // Convertir la priorité en majuscules pour le backend
    const backendData = {
      ...data,
      priority: data.priority ? data.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW' : 'MEDIUM'
    };
    
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateReminder(id: string, data: Partial<{
    message: string;
    type: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
  }>) {
    // Convertir la priorité en majuscules si présente
    const backendData = {
      ...data,
      ...(data.priority && { priority: data.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW' })
    };
    
    return this.request(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  }

  async markReminderDone(id: string) {
    return this.request(`/reminders/${id}/complete`, {
      method: 'PUT',
    });
  }

  async deleteReminder(id: string) {
    return this.request(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  async snoozeReminder(id: string, minutes: number) {
    return this.request(`/reminders/${id}/snooze`, {
      method: 'PUT',
      body: JSON.stringify({ minutes }),
    });
  }

  // Treatment Notes endpoints
  async createTreatmentNote(data: {
    appointmentId: string;
    animalId: string;
    content: string;
    diagnosis?: string;
    treatment?: string;
    followUp?: string;
  }) {
    return this.request('/treatment-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTreatmentNotes(animalId?: string) {
    return this.request(`/treatment-notes${animalId ? `?animalId=${animalId}` : ''}`);
  }

  async updateTreatmentNote(id: string, data: Partial<{
    content: string;
    diagnosis?: string;
    treatment?: string;
    followUp?: string;
  }>) {
    return this.request(`/treatment-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async getAnalytics(period: 'week' | 'month' | 'quarter' | 'year') {
    return this.request(`/analytics?period=${period}`);
  }

  async getClientStats() {
    return this.request('/analytics/clients');
  }

  async getServiceStats() {
    return this.request('/analytics/services');
  }

  async getRevenueStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/analytics/revenue?${params.toString()}`);
  }

  // Contact endpoints
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContactSubmissions() {
    return this.request('/contact');
  }

  async markContactResponded(id: string) {
    return this.request(`/contact/${id}/respond`, {
      method: 'PUT',
    });
  }

  // Files endpoints
  async uploadFile(file: File, type: 'animal' | 'treatment' | 'user', referenceId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('referenceId', referenceId);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });
  }

  async getFiles(type?: string, referenceId?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (referenceId) params.append('referenceId', referenceId);
    return this.request(`/files?${params.toString()}`);
  }

  async deleteFile(id: string) {
    return this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: {
    businessName?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessAddress?: string;
    workingHours?: any;
    appointmentDuration?: number;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  }) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Client-specific endpoints
  async getClientProfile() {
    return this.request('/profile');
  }

  async getClients() {
    return this.request('/users/clients');
  }

  async validateClient(id: string) {
    return this.request(`/users/${id}/validate`, {
      method: 'PUT',
    });
  }

  async deleteClient(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateClientProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    preferences?: any;
  }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Search endpoints
  async searchClients(query: string) {
    return this.request(`/search/clients?q=${encodeURIComponent(query)}`);
  }

  async searchAnimals(query: string) {
    return this.request(`/search/animals?q=${encodeURIComponent(query)}`);
  }

  async searchAppointments(query: string) {
    return this.request(`/search/appointments?q=${encodeURIComponent(query)}`);
  }

  // Automated reminders for bookings
  async createBookingReminders(appointmentId: string) {
    return this.request('/reminders/booking', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    });
  }

  // Bulk operations
  async bulkUpdateAppointments(appointmentIds: string[], updates: any) {
    return this.request('/appointments/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ appointmentIds, updates }),
    });
  }

  async bulkDeleteTodos(todoIds: string[]) {
    return this.request('/todos/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ todoIds }),
    });
  }

  // Reports endpoints
  async generateReport(type: 'appointments' | 'revenue' | 'clients', params: any) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    });
  }

  async getReportHistory() {
    return this.request('/reports/history');
  }

  // Calendar integration
  async syncWithGoogleCalendar() {
    return this.request('/calendar/google/sync', {
      method: 'POST',
    });
  }

  async getCalendarEvents(startDate: string, endDate: string) {
    return this.request(`/calendar/events?start=${startDate}&end=${endDate}`);
  }

  // Email endpoints
  async sendAppointmentConfirmation(appointmentId: string) {
    return this.request(`/emails/appointment-confirmation/${appointmentId}`, {
      method: 'POST',
    });
  }

  async sendAppointmentReminder(appointmentId: string) {
    return this.request(`/emails/appointment-reminder/${appointmentId}`, {
      method: 'POST',
    });
  }

  async sendCustomEmail(data: {
    to: string;
    subject: string;
    message: string;
    template?: string;
  }) {
    return this.request('/emails/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Stats for admin dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getClientRetentionStats() {
    return this.request('/analytics/retention');
  }

  async getPopularServices() {
    return this.request('/analytics/popular-services');
  }

  // Backup and export
  async exportData(type: 'appointments' | 'clients' | 'animals' | 'all') {
    return this.request(`/export/${type}`, {
      method: 'POST',
    });
  }

  async importData(type: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/import', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);