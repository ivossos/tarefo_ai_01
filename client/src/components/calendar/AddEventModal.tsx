import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateEvent } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultHour?: number | null;
  userId: number;
};

const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
  endTime: z.string().optional(),
  reminderMinutes: z.string(),
  notificationChannels: z.object({
    chat: z.boolean().default(true),
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  eventType: z.enum(["meeting", "appointment", "bill", "task"]).default("task"),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  defaultDate = new Date(), 
  defaultHour = null,
  userId
}: AddEventModalProps) {
  const { toast } = useToast();
  const { mutate: createEvent, isPending } = useCreateEvent();
  
  // Format default date and time
  const formatDateValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formatTimeValue = (date: Date, hour: number | null) => {
    if (hour !== null) {
      date = new Date(date);
      date.setHours(hour, 0, 0, 0);
    }
    return date.toTimeString().substring(0, 5);
  };
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: formatDateValue(defaultDate),
      time: formatTimeValue(defaultDate, defaultHour),
      endTime: "",
      reminderMinutes: "15",
      notificationChannels: {
        chat: true,
        email: true,
        sms: false,
      },
      eventType: "task",
    },
  });
  
  const onSubmit = (data: EventFormValues) => {
    // Create start time Date object
    const startTime = new Date(`${data.date}T${data.time}`);
    
    // Create end time Date object if provided
    let endTime = undefined;
    if (data.endTime) {
      endTime = new Date(`${data.date}T${data.endTime}`);
      
      // Validate that end time is after start time
      if (endTime <= startTime) {
        toast({
          title: "Intervalo de tempo inválido",
          description: "O horário de término deve ser posterior ao horário de início",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Create reminder time based on minutes before
    const reminderMinutes = parseInt(data.reminderMinutes);
    const reminderTime = new Date(startTime.getTime() - reminderMinutes * 60 * 1000);
    
    createEvent({
      userId,
      title: data.title,
      description: data.description || undefined,
      location: data.location || undefined,
      startTime,
      endTime,
      reminderTime,
      notificationChannels: data.notificationChannels,
      eventType: data.eventType,
      status: "active",
      isAllDay: false,
    }, {
      onSuccess: () => {
        toast({
          title: "Evento criado",
          description: "Seu evento foi adicionado ao calendário",
        });
        reset();
        onClose();
      },
      onError: () => {
        toast({
          title: "Falha ao criar evento",
          description: "Ocorreu um erro ao criar seu evento. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-neutral-800/50" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-neutral-800">Adicionar Novo Evento</h3>
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-700">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Título do Evento</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Data</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Hora de Início</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  {...register("time")}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Hora de Término (opcional)</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                {...register("endTime")}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Local (opcional)</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                {...register("location")}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição (opcional)</label>
              <textarea 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                rows={3}
                {...register("description")}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo de Evento</label>
              <select 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                {...register("eventType")}
              >
                <option value="task">Tarefa</option>
                <option value="meeting">Reunião</option>
                <option value="appointment">Compromisso</option>
                <option value="bill">Pagamento</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Lembrete</label>
              <select 
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                {...register("reminderMinutes")}
              >
                <option value="15">15 minutos antes</option>
                <option value="30">30 minutos antes</option>
                <option value="60">1 hora antes</option>
                <option value="1440">1 dia antes</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Canais de Notificação</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    {...register("notificationChannels.chat")}
                  />
                  <span className="ml-2 text-sm text-neutral-700">Chat</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    {...register("notificationChannels.email")}
                  />
                  <span className="ml-2 text-sm text-neutral-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    {...register("notificationChannels.sms")}
                  />
                  <span className="ml-2 text-sm text-neutral-700">SMS</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg mr-2 hover:bg-neutral-300"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Salvar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
