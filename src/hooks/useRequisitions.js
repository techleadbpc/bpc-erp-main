// hooks/useRequisitions.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api/api-service";

const requisitionKeys = {
  all: ["requisitions"],
  lists: () => [...requisitionKeys.all, "list"],
  details: () => [...requisitionKeys.all, "detail"],
  detail: (id) => [...requisitionKeys.details(), id],
};

export const useRequisitions = () => {
  return useQuery({
    queryKey: requisitionKeys.lists(),
    queryFn: async () => {
      const response = await api.get("/requisitions");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    placeholderData: [], // Important for TanStack Table
  });
};

export const useRequisition = (id) => {
  return useQuery({
    queryKey: requisitionKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/requisitions/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
