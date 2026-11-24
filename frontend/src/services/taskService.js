import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
