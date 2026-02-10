import api from "./api-service";

const quotationComparisonService = {
  // Create a new quotation comparison from a requisition
  createComparison: async (requisitionId) => {
    try {
      const response = await api.post(`quotation-comparison`, {
        requisitionId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific quotation comparison
  getComparison: async (id) => {
    try {
      const response = await api.get(`quotation-comparison/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add vendor to comparison
  addVendor: async (comparisonId, vendorId) => {
    try {
      const response = await api.post(
        `quotation-comparison/${comparisonId}/vendors`,
        {
          vendorId,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update rate for a specific item and vendor
  updateRate: async (comparisonId, itemId, vendorId, rate, remarks = null) => {
    try {
      const response = await api.put(
        `quotation-comparison/${comparisonId}/items/${itemId}/rates`,
        {
          vendorId,
          rate,
          remarks,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Select vendor for an item
  selectVendorForItem: async (comparisonId, itemId, vendorId) => {
    try {
      const response = await api.put(
        `quotation-comparison/${comparisonId}/items/${itemId}/vendor`,
        {
          vendorId,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Select vendor for all items in comparison
  selectVendorForAllItems: async (comparisonId, vendorId) => {
    try {
      const response = await api.post(
        `quotation-comparison/${comparisonId}/select-vendor-for-all`,
        {
          vendorId,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk select vendors for multiple items
  bulkSelectVendors: async (comparisonId, selections) => {
    try {
      const response = await api.put(
        `quotation-comparison/${comparisonId}/bulk-select`,
        {
          selections,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit comparison for approval
  submitComparison: async (id, remarks = null) => {
    try {
      const response = await api.put(`quotation-comparison/${id}/submit`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve comparison
  approveComparison: async (id, remarks = null) => {
    try {
      const response = await api.put(`quotation-comparison/${id}/approve`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lock comparison after final approval
  lockComparison: async (id, remarks = null) => {
    try {
      const response = await api.put(`quotation-comparison/${id}/lock`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all comparisons for a requisition
  getComparisonsForRequisition: async (requisitionId) => {
    try {
      const response = await api.get(
        `quotation-comparison/requisition/${requisitionId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all comparisons
  getAllComparisons: async () => {
    try {
      const response = await api.get(`quotation-comparison`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove vendor from comparison
  removeVendor: async (comparisonId, vendorId) => {
    try {
      const response = await api.delete(
        `quotation-comparison/${comparisonId}/vendors/${vendorId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from comparison
  removeItem: async (comparisonId, itemId) => {
    try {
      const response = await api.delete(
        `quotation-comparison/${comparisonId}/items/${itemId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update rates and quantities
  bulkUpdate: async (comparisonId, data) => {
    try {
      const response = await api.put(
        `quotation-comparison/${comparisonId}/bulk-update`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete quotation comparison
  deleteComparison: async (id) => {
    try {
      const response = await api.delete(`quotation-comparison/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload vendor attachment
  uploadVendorAttachment: async (comparisonId, vendorId, file) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await api.post(
      `/quotation-comparison/${comparisonId}/vendors/${vendorId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get vendor attachments
  getVendorAttachments: async (comparisonId, vendorId) => {
    const response = await api.get(
      `/quotation-comparison/${comparisonId}/vendors/${vendorId}/attachments`
    );
    return response.data;
  },

  // Delete vendor attachment
  deleteVendorAttachment: async (comparisonId, vendorId) => {
    const response = await api.delete(
      `/quotation-comparison/${comparisonId}/vendors/${vendorId}/attachments`
    );
    return response.data;
  },

  // Download vendor attachment
  downloadVendorAttachment: async (comparisonId, vendorId) => {
    const response = await api.get(
      `/quotation-comparison/${comparisonId}/vendors/${vendorId}/attachments/download`,
      { responseType: "blob" }
    );
    return response.data;
  },

  // Generate procurements from approved comparison
  generateProcurements: async (comparisonId, selections = null, vendorId = null) => {
    try {
      const response = await api.post(`procurements/create-from-comparison`, {
        comparisonId,
        selections,
        vendorId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default quotationComparisonService;
