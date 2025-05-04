import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, InsertChatMessage } from "@shared/schema";

export function useChatMessages(userId: number, limit: number = 20) {
  return useQuery<ChatMessage[]>({
    queryKey: ['/api/chat', userId, limit],
    queryFn: () => fetch(`/api/chat?userId=${userId}&limit=${limit}`).then(res => res.json()),
    enabled: !!userId,
    refetchInterval: 3000 // Poll for new messages every 3 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (message: InsertChatMessage) => {
      return apiRequest('POST', '/api/chat', message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', variables.userId] });
    }
  });
}
