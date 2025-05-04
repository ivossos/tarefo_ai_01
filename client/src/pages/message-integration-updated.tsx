import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, QrCode, Smartphone, Check, X, RotateCw, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MessageIntegrationUpdatedPage() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [platform, setPlatform] = useState<string>("telegram");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [integrationStatus, setIntegrationStatus] = useState<{
    telegramIntegration?: string;
    telegramBot?: string;
    instruções?: string;
  }>({});
  
  // Gera um novo código de verificação
  const generateVerificationCode = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/verify/messenger", {
        platform,
        phone: phoneNumber
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVerificationCode(data.code || "******");
        setIntegrationStatus({
          telegramIntegration: data.telegramIntegration,
          telegramBot: data.telegramBot,
          instruções: data.instruções
        });
        
        toast({
          title: "Código gerado com sucesso",
          description: `Um código de verificação foi gerado para ${platform === "telegram" ? "Telegram" : "WhatsApp"}.`,
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Ocorreu um erro ao gerar o código de verificação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código de verificação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Mostra uma imagem de QR Code (simulação/ilustração)
  const QRCodeImage = () => {
    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-md">
        <div className="relative w-full max-w-[200px] h-[200px] bg-white p-4 flex items-center justify-center">
          <RefreshCw className="animate-spin h-12 w-12 text-gray-400" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <QrCode size={160} />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Escaneie este QR Code no seu WhatsApp para conectar
        </p>
        <div className="mt-2">
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCw className="h-3 w-3 mr-1" /> 
            Atualizar QR Code
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Integração de Mensagens</h1>
      
      <Tabs defaultValue="mensageria" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mensageria">
            <MessageSquare className="h-4 w-4 mr-2" />
            Serviços de Mensagem
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <Smartphone className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>
        
        {/* Tab de Mensageria - Telegram e WhatsApp */}
        <TabsContent value="mensageria" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Plataforma de Mensagens</CardTitle>
              <CardDescription>
                Vincule sua conta do Tarefo AI a plataformas de mensagens para receber notificações e interagir com a assistente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Selecione a plataforma
                  </label>
                  <Select 
                    value={platform} 
                    onValueChange={setPlatform}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Plataformas disponíveis</SelectLabel>
                        <SelectItem value="telegram">
                          Telegram
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          WhatsApp
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Seu número de telefone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Ex: 5511987654321"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Badge variant="outline" className="text-xs">
                        {platform === "telegram" ? "Telegram" : "WhatsApp"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Digite seu número no formato internacional, sem espaços ou caracteres especiais.
                  </p>
                </div>
                
                {verificationCode && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Seu código de verificação:</p>
                      <div className="bg-white p-2 rounded-md border border-input">
                        <span className="text-xl font-mono font-bold">{verificationCode}</span>
                      </div>
                      
                      {platform === "telegram" && integrationStatus.telegramBot && (
                        <div className="mt-4 text-sm text-left">
                          <p className="font-semibold">Instruções:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Abra o aplicativo do Telegram</li>
                            <li>Busque por <span className="font-mono font-semibold">{integrationStatus.telegramBot}</span></li>
                            <li>Inicie uma conversa com o bot</li>
                            <li>Envie o código acima para o bot</li>
                          </ol>
                          
                          <div className="mt-3 flex items-center">
                            <Badge variant={integrationStatus.telegramIntegration === "ativo" ? "success" : "destructive"} className="mr-2">
                              {integrationStatus.telegramIntegration === "ativo" ? 
                                <Check className="h-3 w-3 mr-1" /> : 
                                <X className="h-3 w-3 mr-1" />
                              }
                              {integrationStatus.telegramIntegration === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {integrationStatus.telegramIntegration === "ativo" 
                                ? "Bot do Telegram está online e pronto" 
                                : "Bot do Telegram não está disponível no momento"}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {platform === "whatsapp" && (
                        <div className="mt-4 text-sm text-left">
                          <p className="font-semibold">Instruções:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Abra o aplicativo do WhatsApp</li>
                            <li>Envie o código acima para o número do Tarefo AI</li>
                            <li>Aguarde a confirmação da vinculação</li>
                          </ol>
                          
                          <Alert className="mt-3">
                            <AlertTitle>Atenção</AlertTitle>
                            <AlertDescription>
                              Para usar o WhatsApp com o Tarefo AI, é necessário que o administrador do sistema configure adequadamente o serviço. Consulte as opções na aba "WhatsApp".
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
              <Button 
                onClick={generateVerificationCode} 
                disabled={loading || !phoneNumber || phoneNumber.length < 10}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : verificationCode ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Gerar novo código
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Gerar código
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab de WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  WhatsApp Web
                </div>
              </CardTitle>
              <CardDescription>
                Configure a integração direta com WhatsApp para permitir que o Tarefo AI envie e receba mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <AlertTitle>Nota importante</AlertTitle>
                  <AlertDescription>
                    Para associar seu WhatsApp ao Tarefo AI, escaneie o QR Code abaixo com seu aplicativo WhatsApp. 
                    Esta conexão será usada apenas para comunicação com o serviço, respeitando sua privacidade.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 flex flex-col items-center">
                  <QRCodeImage />
                </div>
                
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Informações adicionais:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Suas conversas são protegidas e criptografadas</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>O Tarefo AI utiliza esta conexão apenas para suas mensagens</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Você pode desconectar a qualquer momento</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
                <Button variant="outline" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Desconectar WhatsApp
                </Button>
                <Button className="w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar QR Code
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}