import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime, formatTime } from "@/lib/utils/date";
import { useUpcomingReminders } from "@/hooks/use-reminders";
import { Notification, Reminder } from "@shared/schema";

type NotificationsPanelProps = {
  userId: number;
};

export default function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['/api/notifications', userId],
    queryFn: () => fetch(`/api/notifications?userId=${userId}`).then(res => res.json()),
    enabled: !!userId
  });
  
  const { data: upcomingReminders = [] as Reminder[], isLoading: isLoadingReminders } = useUpcomingReminders(userId);
  
  const { mutate: markAsRead } = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('PUT', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
    }
  });
  
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => {
      return apiRequest('PUT', `/api/notifications/read-all?userId=${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
    }
  });
  
  const handleSnooze = (notification: Notification) => {
    // In a real app, this would update the notification to show later
    console.log("Snoozing notification:", notification.id);
  };
  
  const handleView = (notification: Notification) => {
    // Mark as read when clicked
    markAsRead(notification.id);
    
    // In a real app, this would navigate to the relevant item
    if (notification.relatedEntityType && notification.relatedEntityId) {
      console.log(`Viewing ${notification.relatedEntityType} with id ${notification.relatedEntityId}`);
    }
  };

  return (
    <div className="w-80 border-l border-neutral-200 bg-white hidden md:block overflow-y-auto">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-bold text-neutral-800">Notificações</h2>
        {notifications.length > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      
      <div className="p-4">
        {isLoadingNotifications ? (
          <div className="text-center py-4">Carregando notificações...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">Sem novas notificações</div>
        ) : (
          notifications.map((notification: Notification) => (
            <div 
              key={notification.id}
              className="bg-neutral-50 p-3 rounded-lg mb-3 border border-neutral-200"
            >
              <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'reminder' 
                    ? 'bg-primary-light/30 text-primary-dark'
                    : notification.type === 'message' 
                      ? 'bg-secondary-light/30 text-secondary-dark'
                      : 'bg-amber-100 text-amber-600'
                }`}>
                  <i className={`
                    ${notification.type === 'reminder' ? 'ri-notification-3-line' : ''}
                    ${notification.type === 'message' ? 'ri-message-3-line' : ''}
                    ${notification.type === 'event' ? 'ri-calendar-check-line' : ''}
                  `}></i>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{notification.content}</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleSnooze(notification)}
                      className="px-3 py-1 text-xs bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
                    >
                      Adiar
                    </button>
                    <button 
                      onClick={() => handleView(notification)}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-neutral-500 mb-3">Lembretes Próximos</h3>
        
        {isLoadingReminders ? (
          <div className="text-center py-4">Carregando lembretes...</div>
        ) : upcomingReminders.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">Nenhum lembrete próximo</div>
        ) : (
          upcomingReminders.map((reminder: Reminder) => {
            // Determine tag based on priority
            let tagColor = "bg-neutral-100 text-neutral-600";
            if (reminder.priority === "high") {
              tagColor = "bg-rose-100 text-rose-700";
            } else if (reminder.priority === "low") {
              tagColor = "bg-blue-100 text-blue-700";
            }
            
            return (
              <div 
                key={reminder.id}
                className="bg-white border border-neutral-200 rounded-lg mb-2 p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-neutral-500">{formatRelativeTime(reminder.dueDate)}, {formatTime(reminder.dueDate)}</p>
                  </div>
                  <span className={`text-xs ${tagColor} px-2 py-0.5 rounded`}>
                    {reminder.priority === "high" ? "Importante" : reminder.priority === "low" ? "Opcional" : "Normal"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
