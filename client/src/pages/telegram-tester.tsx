import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle, CheckCircle2, Loader2, Send, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ResultType = {
  success: boolean;
  message: string;
};

const TelegramTesterPage = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState<string>("+5511932613103");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [sentCode, setSentCode] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<ResultType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("send");

  const sendTelegramMessage = async () => {
    if (!chatId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o ID do chat do Telegram",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/telegram/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message,
        }),
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Mensagem enviada com sucesso!" : "Falha ao enviar mensagem"),
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao conectar com o servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim() || !phoneNumber.startsWith("+")) {
      toast({
        title: "Erro",
        description: "Por favor, informe um número de telefone válido no formato E.164 (ex: +5511987654321)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/verify/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Código de verificação enviado para o Telegram" : "Falha ao enviar código"),
      });
      
      if (response.ok) {
        setSentCode(true);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao conectar com o servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o código de verificação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/verify/check-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
          type: "telegram",
        }),
      });

      const data = await response.json();
      
      setVerificationResult({
        success: response.ok,
        message: data.message || (response.ok ? "Número verificado com sucesso!" : "Código inválido ou expirado"),
      });
      
      if (response.ok) {
        // Se a verificação for bem-sucedida, podemos obter o chatId
        if (data.chatId) {
          setChatId(data.chatId);
          setActiveTab("send");
          toast({
            title: "Sucesso",
            description: "Número verificado e chat ID obtido!",
          });
        }
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: "Erro ao conectar com o servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Teste de Integração com Telegram | TarefoAI</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teste de Integração com Telegram</h1>
          <p className="text-gray-500 mt-2">
            Teste o envio de mensagens e a verificação pelo Telegram
          </p>
        </div>
        
        <Tabs defaultValue="verification" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="verification">Verificação</TabsTrigger>
            <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem pelo Telegram</CardTitle>
                <CardDescription>
                  Envie uma mensagem diretamente pelo bot do Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chatId">ID do Chat do Telegram</Label>
                    <Input
                      id="chatId"
                      placeholder="123456789"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      ID numérico do chat do Telegram
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Digite sua mensagem aqui..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("Olá! Este é um teste do sistema TarefoAI via Telegram.")}
                      >
                        Mensagem de teste
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("Seu lembrete: Reunião às 15h hoje.")}
                      >
                        Lembrete
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("Bem-vindo ao TarefoAI! Seu assistente de produtividade pessoal.")}
                      >
                        Boas-vindas
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500">
                  A mensagem será enviada pelo bot @TarefoAI_bot
                </p>
                <Button onClick={sendTelegramMessage} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {result && (
              <Alert className={`mt-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{result.success ? 'Sucesso!' : 'Erro!'}</AlertTitle>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verificação de Número no Telegram</CardTitle>
                <CardDescription>
                  Teste o fluxo de verificação de número pelo Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verifyPhone">Número de Telefone (formato E.164)</Label>
                    <Input
                      id="verifyPhone"
                      placeholder="+5511932613103"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2 text-xs" 
                      onClick={() => setPhoneNumber("+5511932613103")}
                    >
                      Usar número padrão (+5511932613103)
                    </Button>
                    <p className="text-sm text-gray-500">
                      Este número deve estar associado a uma conta do Telegram
                    </p>
                  </div>
                  
                  <Button 
                    onClick={sendVerificationCode} 
                    disabled={loading || sentCode}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Código de Verificação'
                    )}
                  </Button>
                  
                  {sentCode && (
                    <>
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">Código de Verificação</Label>
                        <Input
                          id="verificationCode"
                          placeholder="123456"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Digite o código recebido no Telegram
                        </p>
                      </div>
                      
                      <Button 
                        onClick={verifyCode} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          'Verificar Código'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {result && !sentCode && (
              <Alert className={`mt-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{result.success ? 'Sucesso!' : 'Erro!'}</AlertTitle>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
            
            {verificationResult && (
              <Alert className={`mt-4 ${verificationResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {verificationResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{verificationResult.success ? 'Sucesso!' : 'Erro!'}</AlertTitle>
                <AlertDescription>
                  {verificationResult.message}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
            <CardDescription>
              Informações sobre a integração com Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Requisitos</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Bot do Telegram criado através do @BotFather</li>
                <li>Token do bot configurado na variável de ambiente TELEGRAM_BOT_TOKEN</li>
                <li>Usuário deve iniciar conversa com o bot antes de receber mensagens</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Como Usar o Bot</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Busque por @TarefoAI_bot no Telegram</li>
                <li>Inicie uma conversa enviando /start</li>
                <li>O bot responderá e estará pronto para interagir</li>
                <li>Para verificar seu número, use o processo de verificação nesta página</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Rotas da API</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><code className="bg-gray-100 p-1 rounded">/api/telegram/send</code> - Enviar mensagem pelo Telegram</li>
                <li><code className="bg-gray-100 p-1 rounded">/api/verify/telegram</code> - Iniciar verificação via Telegram</li>
                <li><code className="bg-gray-100 p-1 rounded">/api/verify/check-code</code> - Verificar código recebido</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramTesterPage;