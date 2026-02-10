import { useQueries } from "@tanstack/react-query";
import api from "@/services/api/api-service";

// Helper to build params string from filters (supports shallow and nested)
const buildParamsString = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.siteId) params.append("siteId", filters.siteId);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.months) params.append("months", filters.months);
  if (filters.days) params.append("days", filters.days);
  if (filters.limit) params.append("limit", filters.limit);
  // Add other filters as needed
  return params.toString();
};

const fetchSiteDashboardData = async (endpoint, params) => {
  const response = await api.get(`/dashboard/site/${endpoint}?${params}`);
  return response.data;
};

export const useSiteDashboardData = (filters = {}) => {
  const paramsString = buildParamsString(filters);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["siteDashboard", "overview", filters],
        queryFn: () => fetchSiteDashboardData("overview", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "requisitions", filters],
        queryFn: () => fetchSiteDashboardData("requisitions", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "material-issues", filters],
        queryFn: () => fetchSiteDashboardData("material-issues", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "transfers", filters],
        queryFn: () => fetchSiteDashboardData("transfers", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "inventory-alerts", filters],
        queryFn: () => fetchSiteDashboardData("inventory/alerts", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "machine-alerts", filters],
        queryFn: () => fetchSiteDashboardData("machine/alerts", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "machine-status", filters],
        queryFn: () => fetchSiteDashboardData("machines/status", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "inventory-status", filters],
        queryFn: () => fetchSiteDashboardData("inventory/status", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "maintenance-due", filters],
        queryFn: () => fetchSiteDashboardData("maintenance/due", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["siteDashboard", "expenses", filters],
        queryFn: () => fetchSiteDashboardData("expenses", paramsString),
        staleTime: 5 * 60 * 1000,
      },
      // siteInfo usually has no filter, but we keep it consistent
      {
        queryKey: ["siteDashboard", "info", filters],
        queryFn: () => fetchSiteDashboardData("info", paramsString),
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  // Loading and error states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries.filter((query) => query.isError).map((q) => q.error);

  // Pluck data
  const [
    overview,
    requisitions,
    materialIssues,
    transfers,
    inventoryAlerts,
    machineAlerts,
    machineStatus,
    inventoryStatus,
    maintenanceDue,
    expenses,
    siteInfo,
  ] = queries.map((q) => q.data);

  return {
    data: {
      overview,
      requisitions,
      materialIssues,
      transfers,
      inventoryAlerts,
      machineAlerts,
      machineStatus,
      inventoryStatus,
      maintenanceDue,
      expenses,
      siteInfo,
    },
    isLoading,
    isError,
    errors,
    refetchAll: () => queries.forEach((q) => q.refetch()),
  };
};
