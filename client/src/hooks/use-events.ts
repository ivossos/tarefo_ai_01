import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Event, InsertEvent } from "@shared/schema";

export function useEvents(userId: number) {
  return useQuery({
    queryKey: ['/api/events', userId],
    queryFn: () => fetch(`/api/events?userId=${userId}`).then(res => res.json()),
    enabled: !!userId
  });
}

export function useEventsByDate(userId: number, date: Date) {
  return useQuery({
    queryKey: ['/api/events/date', userId, date?.toISOString()?.split('T')[0] || ''],
    queryFn: async () => {
      if (!userId || !date) return [];
      try {
        const dateStr = date.toISOString().split('T')[0];
        const res = await fetch(`/api/events/date?userId=${userId}&date=${dateStr}`);
        if (!res.ok) {
          if (res.status === 403) {
            console.warn('Acesso negado ao buscar eventos. Verificando autenticação.');
            return [];
          }
          throw new Error(`Erro ao buscar eventos: ${res.status}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erro ao buscar eventos por data:', error);
        return [];
      }
    },
    enabled: !!userId
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [`/api/events/${id}`],
    queryFn: () => fetch(`/api/events/${id}`).then(res => res.json()),
    enabled: !!id
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: InsertEvent) => {
      // Converte os objetos Date para string ISO antes de enviar
      const processedEvent = {
        ...event,
        startTime: event.startTime instanceof Date ? event.startTime.toISOString() : event.startTime,
        endTime: event.endTime instanceof Date ? event.endTime.toISOString() : event.endTime,
        reminderTime: event.reminderTime instanceof Date ? event.reminderTime.toISOString() : event.reminderTime,
      };
      return apiRequest('POST', '/api/events', processedEvent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/date', variables.userId] });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertEvent> }) => {
      return apiRequest('PUT', `/api/events/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${variables.id}`] });
      if (variables.data.userId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events', variables.data.userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/events/date', variables.data.userId] });
      }
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: number, userId: number }) => {
      return apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/date', variables.userId] });
    }
  });
}
