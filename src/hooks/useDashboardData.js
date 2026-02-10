import { useQuery } from "@tanstack/react-query";
import api from "@/services/api/api-service";

const fetchDashboardData = async (endpoint, params) => {
  const response = await api.get(`/dashboard/${endpoint}?${params}`);
  return response.data;
};

const getParamsString = (filters) => {
  const params = new URLSearchParams();
  if (filters.siteId) params.append("siteId", filters.siteId);
  if (filters.startDate) params.append("dateRange[startDate]", filters.startDate);
  if (filters.endDate) params.append("dateRange[endDate]", filters.endDate);
  // Add other filters if needed
  return params.toString();
};

export const useOverviewData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "overview", filters],
    queryFn: () => fetchDashboardData("overview", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAlertsData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "alerts", filters],
    queryFn: () => fetchDashboardData("alerts", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentActivitiesData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "activities", filters],
    queryFn: () => fetchDashboardData("recent-activities", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMachineStatusData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "machine-status", filters],
    queryFn: () => fetchDashboardData("machines/status", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSitesSummaryData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "sites-summary", filters],
    queryFn: () => fetchDashboardData("sites/summary", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryAlertsData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "inventory-alerts", filters],
    queryFn: () => fetchDashboardData("inventory/alerts", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMaintenanceDueData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "maintenance-due", filters],
    queryFn: () => fetchDashboardData("maintenance/due", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingProcurementsData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "procurements-pending", filters],
    queryFn: () => fetchDashboardData("procurement/pending", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOutstandingPaymentsData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "payments-outstanding", filters],
    queryFn: () => fetchDashboardData("payments/outstanding", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMonthlyExpensesData = (filters) => {
  return useQuery({
    queryKey: ["dashboard", "expenses-monthly", filters],
    queryFn: () => fetchDashboardData("expenses/monthly", getParamsString(filters)),
    staleTime: 5 * 60 * 1000,
  });
};
