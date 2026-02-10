import api from './api-service';

export const maintenanceIntervalsService = {
  // Get all service intervals for a specific machine
  getMachineServiceIntervals: async (machineId) => {
    const response = await api.get(`/maintanance/intervals/machine/${machineId}`);
    return response.data;
  },

  // Get service intervals that are due
  getDueServiceIntervals: async () => {
    const response = await api.get(`/maintanance/intervals/due`);
    return response.data;
  },

  // Calculate next service for a machine
  calculateNextServiceForMachine: async (machineId) => {
    const response = await api.get(`/maintanance/intervals/next/${machineId}`);
    return response.data;
  },

  // Create a new service interval
  createServiceInterval: async (data) => {
    const response = await api.post('/maintanance/intervals', data);
    return response.data;
  },

  // Update an existing service interval
  updateServiceInterval: async (id, data) => {
    const response = await api.put(`/maintanance/intervals/${id}`, data);
    return response.data;
  },

  // Delete a service interval
  deleteServiceInterval: async (id) => {
    const response = await api.delete(`/maintanance/intervals/${id}`);
    return response.data;
  },

  // Get a specific service interval by ID
  getServiceIntervalById: async (id) => {
    const response = await api.get(`/maintanance/intervals/${id}`);
    return response.data;
  }
};
