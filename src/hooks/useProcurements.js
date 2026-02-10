// hooks/useProcurements.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api/api-service";

const procurementKeys = {
  all: ["procurements"],
  lists: () => [...procurementKeys.all, "list"],
  details: () => [...procurementKeys.all, "detail"],
  detail: (id) => [...procurementKeys.details(), id],
};

export const useProcurements = () => {
  return useQuery({
    queryKey: procurementKeys.lists(),
    queryFn: async () => {
      const response = await api.get("/procurements");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    placeholderData: [], // Important for TanStack Table
  });
};

export const useProcurement = (id) => {
  return useQuery({
    queryKey: procurementKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/procurements/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
