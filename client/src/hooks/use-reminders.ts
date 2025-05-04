import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Reminder, InsertReminder } from "@shared/schema";

export function useReminders(userId: number) {
  return useQuery({
    queryKey: ['/api/reminders', userId],
    queryFn: () => fetch(`/api/reminders?userId=${userId}`).then(res => res.json()),
    enabled: !!userId
  });
}

export function useUpcomingReminders(userId: number, limit: number = 5) {
  return useQuery({
    queryKey: ['/api/reminders/upcoming', userId, limit],
    queryFn: () => fetch(`/api/reminders/upcoming?userId=${userId}&limit=${limit}`).then(res => res.json()),
    enabled: !!userId
  });
}

export function useReminder(id: number) {
  return useQuery({
    queryKey: [`/api/reminders/${id}`],
    queryFn: () => fetch(`/api/reminders/${id}`).then(res => res.json()),
    enabled: !!id
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reminder: InsertReminder) => {
      return apiRequest('POST', '/api/reminders', reminder);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/upcoming', variables.userId] });
    }
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertReminder> }) => {
      return apiRequest('PUT', `/api/reminders/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/reminders/${variables.id}`] });
      if (variables.data.userId) {
        queryClient.invalidateQueries({ queryKey: ['/api/reminders', variables.data.userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/reminders/upcoming', variables.data.userId] });
      }
    }
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: number, userId: number }) => {
      return apiRequest('DELETE', `/api/reminders/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/upcoming', variables.userId] });
    }
  });
}
