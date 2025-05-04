import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, ArrowLeft, Loader2 } from "lucide-react";

// Esquema para validação do formulário de evento/tarefa
const eventSchema = z.object({
  userId: z.number(),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date({
    required_error: "Por favor, selecione a data de início",
  }),
  endTime: z.date().optional(),
  reminderTime: z.date().optional(),
  eventType: z.string().default("task"),
  status: z.string().default("active"),
  isAllDay: z.boolean().default(false),
  notificationChannels: z.object({
    email: z.boolean().default(false),
    push: z.boolean().default(false),
    sms: z.boolean().default(false),
  }).default({}),
  googleEventId: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function TaskFormPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtém ID do usuário atual (normalmente viria de um hook de autenticação)
  const [userId, setUserId] = useState<number>(1); // Valor padrão, deve ser substituído pelo ID real do usuário

  // Preenche valores padrão para o formulário
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      userId: userId,
      title: "",
      description: "",
      location: "",
      startTime: new Date(),
      eventType: "task",
      status: "active",
      isAllDay: false,
      notificationChannels: {
        email: false,
        push: true,
        sms: false
      },
    },
  });

  // Atualiza o userId no formulário quando ele mudar
  useState(() => {
    form.setValue('userId', userId);
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    try {
      // Garante que estamos enviando o ID do usuário correto
      data.userId = userId;
      
      // Se for evento de dia inteiro, ajusta os horários
      if (data.isAllDay) {
        const startDate = new Date(data.startTime);
        startDate.setHours(0, 0, 0, 0);
        data.startTime = startDate;
        
        if (data.endTime) {
          const endDate = new Date(data.endTime);
          endDate.setHours(23, 59, 59, 999);
          data.endTime = endDate;
        }
      }
      
      // Converte o objeto notificationChannels para formato JSON
      const notificationChannels = {
        email: data.notificationChannels.email || false,
        push: data.notificationChannels.push || false,
        sms: data.notificationChannels.sms || false
      };
      
      // Prepara os dados para envio
      const eventData = {
        ...data,
        notificationChannels
      };
      
      // Envia para a API
      const response = await apiRequest("POST", "/api/events", eventData);
      const newEvent = await response.json();
      
      // Mostra mensagem de sucesso
      toast({
        title: "Tarefa criada com sucesso",
        description: "Sua nova tarefa foi adicionada ao calendário.",
      });
      
      // Invalida o cache para atualizar a lista de eventos
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/date'] });
      
      // Redireciona para o calendário
      setLocation("/calendar");
    } catch (error: any) {
      // Exibe mensagem de erro
      toast({
        title: "Erro ao criar tarefa",
        description: error.message || "Ocorreu um erro ao criar a tarefa. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao criar evento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para formatar data
  const formatDate = (date: Date) => {
    return format(date, "PPP", { locale: ptBR });
  };

  // Helper para formatar hora
  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: ptBR });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4 p-2" 
          onClick={() => setLocation("/calendar")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nova Tarefa</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Tarefa</CardTitle>
          <CardDescription>
            Preencha os detalhes para adicionar uma nova tarefa ao seu calendário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo oculto para userId */}
              <input type="hidden" {...form.register('userId', { valueAsNumber: true })} />
              
              {/* Título da tarefa */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título*</FormLabel>
                    <FormControl>
                      <Input placeholder="Reunião de equipe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes sobre a tarefa" 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Local */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sala de reuniões ou endereço" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tipo de Evento */}
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="task">Tarefa</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                        <SelectItem value="appointment">Compromisso</SelectItem>
                        <SelectItem value="bill">Conta a Pagar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Dia inteiro */}
              <FormField
                control={form.control}
                name="isAllDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Dia inteiro</FormLabel>
                      <FormDescription>
                        Marque se este evento ocorre durante todo o dia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Data e Hora de Início */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch("isAllDay") && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Início</FormLabel>
                        <div className="flex items-center">
                          <Input
                            type="time"
                            className="w-full"
                            value={format(field.value || new Date(), "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":");
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                              field.onChange(newDate);
                            }}
                          />
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Data e Hora de Término (opcional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término (opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch("isAllDay") && field.value && (
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Término</FormLabel>
                        <div className="flex items-center">
                          <Input
                            type="time"
                            className="w-full"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              if (!field.value) return;
                              const [hours, minutes] = e.target.value.split(":");
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                              field.onChange(newDate);
                            }}
                          />
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Notificações */}
              <FormField
                control={form.control}
                name="notificationChannels.push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificação no Aplicativo</FormLabel>
                      <FormDescription>
                        Receba notificações no aplicativo para este evento
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notificationChannels.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificação por Email</FormLabel>
                      <FormDescription>
                        Receba notificações por email para este evento
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notificationChannels.sms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificação por SMS</FormLabel>
                      <FormDescription>
                        Receba notificações por SMS para este evento
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/calendar")}>
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Tarefa"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}