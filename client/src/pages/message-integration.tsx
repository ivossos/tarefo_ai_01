import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import NavBar from "@/components/layout/NavBar";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

// Esquema de validação para o número de telefone
const phoneSchema = z.object({
  phone: z.string().min(10, {
    message: "O número de telefone deve ter pelo menos 10 dígitos",
  }),
  userId: z.number()
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function MessageIntegrationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [botStatus, setBotStatus] = useState<{
    telegramIntegration?: string;
    telegramBot?: string;
    instruções?: string;
  }>({});
  const { toast } = useToast();
  
  // Formulário do Telegram
  const telegramForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
      userId: 1, // Valor temporário, deve ser obtido do contexto de autenticação
    },
  });
  
  // Formulário do WhatsApp
  const whatsappForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
      userId: 1, // Valor temporário, deve ser obtido do contexto de autenticação
    },
  });
  
  // Mutação unificada
  const messengerMutation = useMutation({
    mutationFn: async (data: { phone: string; userId: number; platform: 'telegram' | 'whatsapp' }) => {
      const res = await apiRequest("POST", "/api/verify/messenger", data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      const platform = variables.platform === 'telegram' ? 'Telegram' : 'WhatsApp';
      setCodeSubmitted(true);
      
      // Armazena informações do status do bot do Telegram
      if (variables.platform === 'telegram' && data.telegramIntegration) {
        setBotStatus({
          telegramIntegration: data.telegramIntegration,
          telegramBot: data.telegramBot,
          instruções: data.instruções
        });
      }
      
      toast({
        title: `Verificação de ${platform} iniciada`,
        description: `Verifique suas notificações para obter o código de verificação do ${platform}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao iniciar verificação",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onTelegramSubmit = (data: PhoneFormValues) => {
    messengerMutation.mutate({ ...data, platform: 'telegram' });
  };
  
  const onWhatsAppSubmit = (data: PhoneFormValues) => {
    messengerMutation.mutate({ ...data, platform: 'whatsapp' });
  };
  
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavBar 
          title="Integração de Mensagens" 
          subtitle="Conecte suas contas do Telegram e WhatsApp"
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <Tabs defaultValue="telegram" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <Link href="/calendar">
                  <Button variant="outline" className="flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao painel
                  </Button>
                </Link>
              </div>
              
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="telegram">Telegram</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              </TabsList>
              
              <TabsContent value="telegram">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrar com Telegram</CardTitle>
                    <CardDescription>
                      Conecte sua conta do Telegram para receber notificações e interagir com o TarefoAI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...telegramForm}>
                      <form onSubmit={telegramForm.handleSubmit(onTelegramSubmit)} className="space-y-4">
                        <FormField
                          control={telegramForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="+5511999999999" {...field} />
                              </FormControl>
                              <FormDescription>
                                Digite o número de telefone associado à sua conta do Telegram.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex flex-col space-y-2">
                          {!codeSubmitted ? (
                            <Button type="submit" disabled={messengerMutation.isPending}>
                              {messengerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Verificar Telegram
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                                <p className="font-medium">Código enviado com sucesso!</p>
                                <p className="text-sm mt-1">Verifique suas notificações para ver o código de verificação.</p>
                              </div>
                              <div className="flex flex-row space-x-2">
                                <Link href="/dashboard">
                                  <Button variant="default">
                                    Ir para o painel
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCodeSubmitted(false);
                                    telegramForm.reset();
                                  }}
                                >
                                  Reiniciar processo
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-neutral-500 mt-4">
                            <p className="font-medium mb-1">Instruções:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Digite seu número de telefone associado ao Telegram (formato: +5511999999999)</li>
                              <li>Clique em "Verificar Telegram"</li>
                              <li>Após verificar seu número, acesse suas notificações na plataforma</li>
                              <li>Você encontrará um código de 6 dígitos na seção de notificações</li>
                              <li>Esse código confirma sua integração com o Telegram</li>
                              <li>No ambiente de produção, você usaria esse código no aplicativo do Telegram</li>
                              <li>Quando a integração for completada, você receberá notificações no Telegram</li>
                            </ol>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="whatsapp">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrar com WhatsApp</CardTitle>
                    <CardDescription>
                      Conecte sua conta do WhatsApp para receber notificações e interagir com o TarefoAI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...whatsappForm}>
                      <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-4">
                        <FormField
                          control={whatsappForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="+5511999999999" {...field} />
                              </FormControl>
                              <FormDescription>
                                Digite o número de telefone associado à sua conta do WhatsApp.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex flex-col space-y-2">
                          {!codeSubmitted ? (
                            <Button type="submit" disabled={messengerMutation.isPending}>
                              {messengerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Verificar WhatsApp
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                                <p className="font-medium">Código enviado com sucesso!</p>
                                <p className="text-sm mt-1">Verifique suas notificações para ver o código de verificação.</p>
                              </div>
                              <div className="flex flex-row space-x-2">
                                <Link href="/dashboard">
                                  <Button variant="default">
                                    Ir para o painel
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCodeSubmitted(false);
                                    whatsappForm.reset();
                                  }}
                                >
                                  Reiniciar processo
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-neutral-500 mt-4">
                            <p className="font-medium mb-1">Instruções:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Digite seu número de telefone associado ao WhatsApp (formato: +5511999999999)</li>
                              <li>Clique em "Verificar WhatsApp"</li>
                              <li>Adicione o número do TarefoAI aos seus contatos</li>
                              <li>Abra o WhatsApp e inicie uma conversa com o número do TarefoAI</li>
                              <li>Você receberá um código de 6 dígitos nas suas notificações</li>
                              <li>Envie esse código para o TarefoAI no WhatsApp</li>
                              <li>Após verificação, você poderá usar o WhatsApp para gerenciar suas tarefas</li>
                            </ol>
                            <p className="mt-2 text-xs text-blue-600">Nota: Para integrar com o Telegram, adicione o bot @TarefoAI_bot e envie o código de verificação.</p>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}