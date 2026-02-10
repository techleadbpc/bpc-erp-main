// Centralized maintenance service types configuration
export const MAINTENANCE_SERVICE_TYPES = [
  // { value: "repair", label: "Repair" },
  // { value: "inspection", label: "Inspection" },
 { value: "engine_service", label: "Engine Service" },
  { value: "hydraulic_service", label: "Hydraulic Service" },
  // { value: "oil_change", label: "Oil Change" },
  // { value: "filter_change", label: "Filter Change" },
  // { value: "grease_lubrication", label: "Grease & Lubrication" },
  // { value: "belt_replacement", label: "Belt Replacement" },
  // { value: "parts_replacement", label: "Parts Replacement" },
  // { value: "servicing_500kms", label: "Servicing - 500kms" },
  // { value: "servicing_1000kms", label: "Servicing - 1000kms" },
  // { value: "servicing_2000kms", label: "Servicing - 2000kms" },
  // { value: "servicing_4000kms", label: "Servicing - 4000kms" },
  { value: "servicing", label: "Servicing" },

  // { value: "preventive", label: "Preventive" },
  { value: "custom", label: "Custom Service" },
];

// Helper function to get service type label by value
export const getServiceTypeLabel = (value) => {
  const serviceType = MAINTENANCE_SERVICE_TYPES.find(type => type.value === value);
  return serviceType ? serviceType.label : value;
};

// Helper function to get all service type values
export const getServiceTypeValues = () => {
  return MAINTENANCE_SERVICE_TYPES.map(type => type.value);
};

// Helper function to get all service type labels
export const getServiceTypeLabels = () => {
  return MAINTENANCE_SERVICE_TYPES.map(type => type.label);
};
