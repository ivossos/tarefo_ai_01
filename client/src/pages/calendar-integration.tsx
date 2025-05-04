import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useSearch } from "wouter";
import { Loader2, RefreshCw, Unlink, Calendar, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CalendarProvider = 'google' | 'apple' | 'none';
type CalendarStatus = {
  google: boolean;
  apple: boolean;
  preferredCalendar: CalendarProvider;
};

export default function CalendarIntegrationPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  
  // Verifica se há parâmetros de sucesso ou erro no URL (do callback OAuth)
  const success = search.includes('success=true');
  const error = search.includes('error=true');
  const provider = search.includes('provider=google') 
    ? 'google' 
    : search.includes('provider=apple') 
      ? 'apple' 
      : null;
      
  // Buscar status de integração dos calendários
  const { 
    data: calendarStatus, 
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus
  } = useQuery<CalendarStatus>({
    queryKey: ['/api/calendar/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/calendar/status');
      return response.json();
    }
  });
  
  // Obter URLs de autorização
  const getGoogleAuthUrlMutation = useMutation({
    mutationFn: async () => {
      console.log('Fazendo requisição para /api/calendar/google/auth-url');
      try {
        const response = await apiRequest('GET', '/api/calendar/google/auth-url');
        console.log('Resposta recebida:', response.status);
        const data = await response.json();
        console.log('URL de autenticação recebida:', data);
        return data;
      } catch (error) {
        console.error('Erro ao obter URL de autenticação:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Sucesso ao obter URL de autenticação:', data);
      if (data && data.url) {
        console.log('Redirecionando para:', data.url);
        // Redireciona o usuário para a URL de autorização do Google
        window.location.href = data.url;
      } else {
        console.error('URL de autenticação não encontrada na resposta:', data);
        toast({
          title: "Erro na integração",
          description: "Resposta inválida do servidor: URL de autenticação não encontrada.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao processar URL de autenticação:', error);
      toast({
        title: "Erro na integração",
        description: "Não foi possível iniciar a autenticação com Google Calendar.",
        variant: "destructive"
      });
    }
  });
  
  const getAppleAuthUrlMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/calendar/apple/auth-url');
      return response.json();
    },
    onSuccess: (data) => {
      // Redireciona o usuário para a URL de autorização da Apple
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Erro na integração",
        description: "Não foi possível iniciar a autenticação com Apple Calendar.",
        variant: "destructive"
      });
    }
  });
  
  // Sincronizar calendários
  const syncGoogleCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calendar/google/sync');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sincronização concluída",
        description: "Seu Google Calendar foi sincronizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar seu Google Calendar.",
        variant: "destructive"
      });
    }
  });
  
  const syncAppleCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calendar/apple/sync');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sincronização concluída",
        description: "Seu Apple Calendar foi sincronizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar seu Apple Calendar.",
        variant: "destructive"
      });
    }
  });
  
  // Desconectar calendários
  const disconnectGoogleCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calendar/google/disconnect');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Desconectado",
        description: "Google Calendar desconectado com sucesso.",
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar seu Google Calendar.",
        variant: "destructive"
      });
    }
  });
  
  const disconnectAppleCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calendar/apple/disconnect');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Desconectado",
        description: "Apple Calendar desconectado com sucesso.",
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar seu Apple Calendar.",
        variant: "destructive"
      });
    }
  });
  
  // Definir calendário preferido
  const setPreferredCalendarMutation = useMutation({
    mutationFn: async (provider: CalendarProvider) => {
      const response = await apiRequest('POST', '/api/calendar/preferred', { provider });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferência atualizada",
        description: "Seu calendário preferido foi atualizado.",
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar preferência",
        description: "Não foi possível atualizar seu calendário preferido.",
        variant: "destructive"
      });
    }
  });
  
  // Iniciar conexão com calendário
  const connectCalendar = (provider: 'google' | 'apple') => {
    console.log(`Tentando conectar com ${provider} Calendar`);
    try {
      if (provider === 'google') {
        console.log('Chamando getGoogleAuthUrlMutation.mutate()');
        getGoogleAuthUrlMutation.mutate();
      } else {
        console.log('Chamando getAppleAuthUrlMutation.mutate()');
        getAppleAuthUrlMutation.mutate();
      }
    } catch (error) {
      console.error(`Erro ao tentar conectar com ${provider} Calendar:`, error);
      toast({
        title: `Erro ao conectar com ${provider} Calendar`,
        description: `Ocorreu um erro ao tentar iniciar a conexão: ${error}`,
        variant: "destructive"
      });
    }
  };
  
  // Exibir feedback em caso de sucesso ou erro do OAuth
  useEffect(() => {
    if (success && provider) {
      toast({
        title: "Integração realizada",
        description: `Conexão com ${provider === 'google' ? 'Google' : 'Apple'} Calendar realizada com sucesso.`,
      });
      
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Atualizar status
      refetchStatus();
    } else if (error && provider) {
      toast({
        title: "Erro na integração",
        description: `Não foi possível conectar com ${provider === 'google' ? 'Google' : 'Apple'} Calendar.`,
        variant: "destructive"
      });
      
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [success, error, provider, toast, refetchStatus]);
  
  // Verificar se há algum calendário conectado
  const isAnyCalendarConnected = calendarStatus?.google || calendarStatus?.apple;
  
  // Verifica se há calendário preferido definido
  const hasPreferredCalendar = calendarStatus?.preferredCalendar && 
    calendarStatus?.preferredCalendar !== 'none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Integração de Calendários
          </CardTitle>
          <CardDescription className="text-center">
            Conecte e sincronize seus calendários com o TarefoAI
          </CardDescription>
          <div className="w-full flex justify-center mt-2">
            <Button 
              variant="link" 
              onClick={() => setLocation('/preferences')}
              className="text-sm"
            >
              Voltar para Preferências
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isStatusLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isStatusError ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar status das integrações.
              </p>
              <Button 
                variant="outline" 
                onClick={() => refetchStatus()} 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status das integrações</h3>
                
                {/* Google Calendar */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="ri-google-fill text-xl"></i>
                      <span className="text-sm font-medium">Google Calendar</span>
                    </div>
                    
                    <div className="flex items-center">
                      {calendarStatus?.google ? (
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Conectado
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Não conectado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    {calendarStatus?.google ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-1/2"
                          onClick={() => syncGoogleCalendarMutation.mutate()}
                          disabled={syncGoogleCalendarMutation.isPending}
                        >
                          {syncGoogleCalendarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sincronizar
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-1/2"
                          onClick={() => disconnectGoogleCalendarMutation.mutate()}
                          disabled={disconnectGoogleCalendarMutation.isPending}
                        >
                          {disconnectGoogleCalendarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Unlink className="h-4 w-4 mr-2" />
                          )}
                          Desconectar
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => connectCalendar('google')}
                        disabled={getGoogleAuthUrlMutation.isPending}
                      >
                        {getGoogleAuthUrlMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Calendar className="h-4 w-4 mr-2" />
                        )}
                        Conectar Google Calendar
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Apple Calendar */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="ri-apple-fill text-xl"></i>
                      <span className="text-sm font-medium">Apple Calendar</span>
                    </div>
                    
                    <div className="flex items-center">
                      {calendarStatus?.apple ? (
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Conectado
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Não conectado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    {calendarStatus?.apple ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-1/2"
                          onClick={() => syncAppleCalendarMutation.mutate()}
                          disabled={syncAppleCalendarMutation.isPending}
                        >
                          {syncAppleCalendarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sincronizar
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-1/2"
                          onClick={() => disconnectAppleCalendarMutation.mutate()}
                          disabled={disconnectAppleCalendarMutation.isPending}
                        >
                          {disconnectAppleCalendarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Unlink className="h-4 w-4 mr-2" />
                          )}
                          Desconectar
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => connectCalendar('apple')}
                        disabled={getAppleAuthUrlMutation.isPending}
                      >
                        {getAppleAuthUrlMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Calendar className="h-4 w-4 mr-2" />
                        )}
                        Conectar Apple Calendar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Preferência de calendário */}
              {isAnyCalendarConnected && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Calendário Preferido</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione qual calendário será usado por padrão para criar novos eventos.
                  </p>
                  
                  <RadioGroup 
                    defaultValue={calendarStatus?.preferredCalendar} 
                    className="flex flex-col space-y-2"
                    onValueChange={(value: CalendarProvider) => {
                      setPreferredCalendarMutation.mutate(value);
                    }}
                  >
                    {calendarStatus?.google && (
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="google" id="google" disabled={setPreferredCalendarMutation.isPending} />
                        <Label htmlFor="google" className="flex flex-1 items-center gap-2 cursor-pointer">
                          <i className="ri-google-fill text-lg"></i>
                          Google Calendar
                        </Label>
                      </div>
                    )}
                    
                    {calendarStatus?.apple && (
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="apple" id="apple" disabled={setPreferredCalendarMutation.isPending} />
                        <Label htmlFor="apple" className="flex flex-1 items-center gap-2 cursor-pointer">
                          <i className="ri-apple-fill text-lg"></i>
                          Apple Calendar
                        </Label>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="none" id="none" disabled={setPreferredCalendarMutation.isPending} />
                      <Label htmlFor="none" className="flex flex-1 items-center gap-2 cursor-pointer">
                        <i className="ri-calendar-line text-lg"></i>
                        Apenas TarefoAI (sem sincronização)
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {setPreferredCalendarMutation.isPending && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Atualizando preferência...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setLocation('/calendar')}
          >
            Voltar para Calendário
          </Button>
          
          {isAnyCalendarConnected && hasPreferredCalendar && (
            <Button 
              className="gap-2"
              onClick={() => setLocation('/calendar')}
            >
              <Calendar className="h-4 w-4" />
              Usar Calendário
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}