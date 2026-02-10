// hooks/useMaterialIssues.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api/api-service";

const materialIssueKeys = {
  all: ["material-issues"],
  lists: () => [...materialIssueKeys.all, "list"],
  details: () => [...materialIssueKeys.all, "detail"],
  detail: (id) => [...materialIssueKeys.details(), id],
};

export const useMaterialIssues = () => {
  return useQuery({
    queryKey: materialIssueKeys.lists(),
    queryFn: async () => {
      const response = await api.get("/material-issues");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    placeholderData: [], // Important for TanStack Table
  });
};

export const useMaterialIssue = (id) => {
  return useQuery({
    queryKey: materialIssueKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/material-issues/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
