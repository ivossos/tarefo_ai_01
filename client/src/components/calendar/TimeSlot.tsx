import { useState } from "react";
import { Event } from "@shared/schema";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

type TimeSlotProps = {
  time: string;
  hour: number;
  events: Event[];
  onAddEvent?: (hour: number) => void;
};

type EventTypeStyles = {
  [key: string]: {
    bg: string;
    border: string;
    tag: string;
  };
};

const eventTypeStyles: EventTypeStyles = {
  meeting: {
    bg: "bg-primary/10",
    border: "border-primary",
    tag: "bg-primary-light/30 text-primary-dark"
  },
  appointment: {
    bg: "bg-rose-50",
    border: "border-rose-500",
    tag: "bg-rose-100 text-rose-700"
  },
  bill: {
    bg: "bg-amber-50",
    border: "border-amber-500",
    tag: "bg-amber-100 text-amber-700"
  },
  task: {
    bg: "bg-secondary/10", 
    border: "border-secondary",
    tag: "bg-secondary-light/30 text-secondary-dark"
  }
};

export default function TimeSlot({ time, hour, events, onAddEvent }: TimeSlotProps) {
  const timeSlotEvents = Array.isArray(events) ? events.filter(event => {
    try {
      if (!event || !event.startTime) return false;
      // Converte para objeto Date se for string
      const startTime = typeof event.startTime === 'string' ? new Date(event.startTime) : event.startTime;
      const eventHour = startTime.getHours();
      return eventHour === hour;
    } catch (error) {
      console.error('Erro ao processar hora do evento:', error);
      return false;
    }
  }) : [];

  return (
    <div className="flex border-b border-neutral-100 last:border-b-0">
      <div className="w-20 p-3 text-neutral-500 text-sm flex-shrink-0 border-r border-neutral-100">
        {time}
      </div>
      <div className="flex-1 p-3 min-h-[80px]">
        {timeSlotEvents.map(event => {
          const startTime = formatTime(event.startTime);
          const endTime = event.endTime ? formatTime(event.endTime) : undefined;
          const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;
          
          const style = eventTypeStyles[event.eventType] || eventTypeStyles.task;
          
          return (
            <div 
              key={event.id} 
              className={cn(
                style.bg,
                `border-l-4 ${style.border} p-2 rounded-r-lg mb-2 last:mb-0`
              )}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-neutral-800">{event.title}</h4>
                <span className={cn(
                  style.tag,
                  "text-xs font-medium px-2 py-0.5 rounded"
                )}>
                  {timeRange}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
              )}
            </div>
          );
        })}
        
        {timeSlotEvents.length === 0 && onAddEvent && (
          <button 
            onClick={() => onAddEvent(hour)}
            className="w-full h-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <i className="ri-add-line text-lg mr-1"></i>
            <span className="text-sm">Adicionar evento</span>
          </button>
        )}
      </div>
    </div>
  );
}
