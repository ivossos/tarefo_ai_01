import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

const SMSTesterPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sentCode, setSentCode] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Função para enviar uma mensagem SMS
  const sendSMS = async () => {
    if (!phoneNumber) {
      setResult({
        success: false,
        message: "Por favor, informe um número de telefone"
      });
      return;
    }

    if (!message) {
      setResult({
        success: false,
        message: "Por favor, digite uma mensagem"
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const response = await apiRequest('POST', '/api/sms/send', {
        phoneNumber: formattedPhone,
        message
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      setResult({
        success: false,
        message: "Erro ao enviar mensagem SMS. Verifique o console para mais detalhes."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar código de verificação
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setResult({
        success: false,
        message: "Por favor, informe um número de telefone"
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setSentCode(false);

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const response = await apiRequest('POST', '/api/verify/sms', {
        phone: formattedPhone
      });

      const data = await response.json();
      setResult(data);
      if (data.success) {
        setSentCode(true);
      }
    } catch (error) {
      console.error('Erro ao enviar código de verificação:', error);
      setResult({
        success: false,
        message: "Erro ao enviar código de verificação. Verifique o console para mais detalhes."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar o código
  const verifyCode = async () => {
    if (!phoneNumber || !code) {
      setVerificationResult({
        success: false,
        message: "Por favor, informe o número de telefone e o código"
      });
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const response = await apiRequest('POST', '/api/verify/check-code', {
        phone: formattedPhone,
        code
      });

      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setVerificationResult({
        success: false,
        message: "Erro ao verificar código. Verifique o console para mais detalhes."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Testador de SMS via Twilio</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sms">Enviar SMS</TabsTrigger>
            <TabsTrigger value="verification">Verificação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem SMS</CardTitle>
                <CardDescription>
                  Envie uma mensagem SMS para qualquer número utilizando a API Twilio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Telefone (formato E.164)</Label>
                    <Input
                      id="phone"
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
                      Inclua o código do país. Ex: +55 para Brasil
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
                        onClick={() => setMessage("Olá! Este é um teste do sistema TarefoAI.")}
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
                  A mensagem será enviada pelo número configurado no Twilio
                </p>
                <Button onClick={sendSMS} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar SMS
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
                <CardTitle>Verificação de Número</CardTitle>
                <CardDescription>
                  Teste o fluxo de verificação de número por SMS
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
              Informações sobre a integração com Twilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Requisitos</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Conta Twilio com número de telefone configurado</li>
                <li>Variáveis de ambiente configuradas:</li>
                <ul className="list-circle pl-5 space-y-1">
                  <li>TWILIO_ACCOUNT_SID</li>
                  <li>TWILIO_AUTH_TOKEN</li>
                  <li>TWILIO_PHONE_NUMBER</li>
                </ul>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Formato de Número E.164</h3>
              <p className="mt-2">
                O formato E.164 é o padrão internacional para números de telefone:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Começa com + seguido pelo código do país</li>
                <li>Brasil: +55</li>
                <li>Estados Unidos: +1</li>
                <li>Exemplo completo: +5511987654321</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Rotas da API</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><code className="bg-gray-100 p-1 rounded">/api/sms/send</code> - Enviar SMS</li>
                <li><code className="bg-gray-100 p-1 rounded">/api/verify/sms</code> - Enviar código de verificação</li>
                <li><code className="bg-gray-100 p-1 rounded">/api/verify/check-code</code> - Verificar código</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMSTesterPage;