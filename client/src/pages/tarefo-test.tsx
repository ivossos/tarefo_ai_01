import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TarefoTestPage() {
  // Estados para os diferentes testes
  const [messageTest, setMessageTest] = useState({
    loading: false,
    input: "",
    response: "",
    success: false,
    error: "",
    userId: 999
  });

  const [ocrTest, setOcrTest] = useState({
    loading: false,
    imagePath: "",
    extractType: "full",
    response: "",
    success: false,
    error: ""
  });

  const [calendarTest, setCalendarTest] = useState({
    loading: false,
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventDuration: 60,
    response: "",
    success: false,
    error: ""
  });

  const [reminderTest, setReminderTest] = useState({
    loading: false,
    reminderText: "",
    reminderDate: "",
    reminderTime: "",
    reminderPriority: "normal",
    response: "",
    success: false,
    error: ""
  });

  const [complianceTest, setComplianceTest] = useState({
    loading: false,
    operation: "save_user_data",
    data: JSON.stringify({
      user_id: 999,
      personal_info: {
        name: "João Silva",
        email: "joao@example.com",
        phone: "+5511999998888"
      }
    }, null, 2),
    response: "",
    success: false,
    error: ""
  });

  // Funções para os testes
  const testMessage = async () => {
    setMessageTest({ ...messageTest, loading: true, success: false, error: "", response: "" });
    
    try {
      const response = await fetch("/api/test/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageTest.input, user_id: messageTest.userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessageTest({
          ...messageTest,
          loading: false,
          response: data.response,
          success: true
        });
      } else {
        setMessageTest({
          ...messageTest,
          loading: false,
          error: data.message || "Erro ao processar mensagem",
          success: false
        });
      }
    } catch (error) {
      setMessageTest({
        ...messageTest,
        loading: false,
        error: String(error),
        success: false
      });
    }
  };

  const testOcr = async () => {
    setOcrTest({ ...ocrTest, loading: true, success: false, error: "", response: "" });
    
    try {
      const response = await fetch("/api/test/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image_path: ocrTest.imagePath,
          extract_type: ocrTest.extractType, 
          user_id: messageTest.userId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOcrTest({
          ...ocrTest,
          loading: false,
          response: JSON.stringify(data.result, null, 2),
          success: true
        });
      } else {
        setOcrTest({
          ...ocrTest,
          loading: false,
          error: data.message || "Erro ao processar imagem",
          success: false
        });
      }
    } catch (error) {
      setOcrTest({
        ...ocrTest,
        loading: false,
        error: String(error),
        success: false
      });
    }
  };

  const testCalendar = async () => {
    setCalendarTest({ ...calendarTest, loading: true, success: false, error: "", response: "" });
    
    try {
      const response = await fetch("/api/test/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: calendarTest.eventTitle,
          date: calendarTest.eventDate,
          time: calendarTest.eventTime,
          duration: calendarTest.eventDuration,
          user_id: messageTest.userId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCalendarTest({
          ...calendarTest,
          loading: false,
          response: JSON.stringify(data.result, null, 2),
          success: true
        });
      } else {
        setCalendarTest({
          ...calendarTest,
          loading: false,
          error: data.message || "Erro ao criar evento",
          success: false
        });
      }
    } catch (error) {
      setCalendarTest({
        ...calendarTest,
        loading: false,
        error: String(error),
        success: false
      });
    }
  };

  const testReminder = async () => {
    setReminderTest({ ...reminderTest, loading: true, success: false, error: "", response: "" });
    
    try {
      const response = await fetch("/api/test/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: reminderTest.reminderText,
          date: reminderTest.reminderDate,
          time: reminderTest.reminderTime,
          priority: reminderTest.reminderPriority,
          user_id: messageTest.userId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReminderTest({
          ...reminderTest,
          loading: false,
          response: JSON.stringify(data.result, null, 2),
          success: true
        });
      } else {
        setReminderTest({
          ...reminderTest,
          loading: false,
          error: data.message || "Erro ao criar lembrete",
          success: false
        });
      }
    } catch (error) {
      setReminderTest({
        ...reminderTest,
        loading: false,
        error: String(error),
        success: false
      });
    }
  };

  const testCompliance = async () => {
    setComplianceTest({ ...complianceTest, loading: true, success: false, error: "", response: "" });
    
    try {
      const response = await fetch("/api/test/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          operation: complianceTest.operation,
          data: JSON.parse(complianceTest.data),
          user_id: messageTest.userId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComplianceTest({
          ...complianceTest,
          loading: false,
          response: JSON.stringify(data.result, null, 2),
          success: true
        });
      } else {
        setComplianceTest({
          ...complianceTest,
          loading: false,
          error: data.message || "Erro ao verificar conformidade",
          success: false
        });
      }
    } catch (error) {
      setComplianceTest({
        ...complianceTest,
        loading: false,
        error: String(error),
        success: false
      });
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">TarefoAI - Teste de Fluxo Completo</h1>
        <p className="text-muted-foreground mt-2">
          Use esta página para testar os diferentes aspectos do TarefoAI com fluxos reais.
        </p>
      </div>

      <Tabs defaultValue="message">
        <TabsList className="mb-4">
          <TabsTrigger value="message">Mensagem</TabsTrigger>
          <TabsTrigger value="ocr">OCR</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="reminder">Lembretes</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>

        {/* Teste de Mensagem */}
        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Processamento de Mensagem</CardTitle>
              <CardDescription>
                Envie uma mensagem para testar o processamento pelo agente de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ID do Usuário de Teste</label>
                  <Input 
                    type="number"
                    value={messageTest.userId}
                    onChange={(e) => setMessageTest({...messageTest, userId: parseInt(e.target.value) || 999})}
                    placeholder="ID do usuário para teste" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Mensagem</label>
                  <Textarea 
                    value={messageTest.input}
                    onChange={(e) => setMessageTest({...messageTest, input: e.target.value})}
                    placeholder="Digite sua mensagem aqui" 
                    rows={3}
                  />
                </div>
                {messageTest.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{messageTest.error}</AlertDescription>
                  </Alert>
                )}
                {messageTest.success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>Mensagem processada com sucesso</AlertDescription>
                  </Alert>
                )}
                {messageTest.response && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Resposta:</label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{messageTest.response}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testMessage} 
                disabled={!messageTest.input || messageTest.loading}
              >
                {messageTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Mensagem
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Teste de OCR */}
        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Processamento OCR</CardTitle>
              <CardDescription>
                Extraia informações de imagens usando o agente OCR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Caminho da Imagem</label>
                  <Input 
                    value={ocrTest.imagePath}
                    onChange={(e) => setOcrTest({...ocrTest, imagePath: e.target.value})}
                    placeholder="/path/to/image.jpg" 
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Informe o caminho completo para uma imagem existente no servidor
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo de Extração</label>
                  <Select 
                    value={ocrTest.extractType}
                    onValueChange={(value) => setOcrTest({...ocrTest, extractType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Texto Completo</SelectItem>
                      <SelectItem value="receipt">Recibo</SelectItem>
                      <SelectItem value="invoice">Fatura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ocrTest.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{ocrTest.error}</AlertDescription>
                  </Alert>
                )}
                {ocrTest.success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>Imagem processada com sucesso</AlertDescription>
                  </Alert>
                )}
                {ocrTest.response && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Dados Extraídos:</label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{ocrTest.response}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testOcr} 
                disabled={!ocrTest.imagePath || ocrTest.loading}
              >
                {ocrTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Processar Imagem
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Teste de Calendário */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Criação de Evento</CardTitle>
              <CardDescription>
                Crie um evento de calendário usando o agente de calendário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Título do Evento</label>
                  <Input 
                    value={calendarTest.eventTitle}
                    onChange={(e) => setCalendarTest({...calendarTest, eventTitle: e.target.value})}
                    placeholder="Reunião de equipe" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data</label>
                    <Input 
                      type="date"
                      value={calendarTest.eventDate}
                      onChange={(e) => setCalendarTest({...calendarTest, eventDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Hora</label>
                    <Input 
                      type="time"
                      value={calendarTest.eventTime}
                      onChange={(e) => setCalendarTest({...calendarTest, eventTime: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Duração (minutos)</label>
                  <Input 
                    type="number"
                    value={calendarTest.eventDuration}
                    onChange={(e) => setCalendarTest({...calendarTest, eventDuration: parseInt(e.target.value) || 60})}
                    min={15}
                    step={15}
                  />
                </div>
                {calendarTest.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{calendarTest.error}</AlertDescription>
                  </Alert>
                )}
                {calendarTest.success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>Evento criado com sucesso</AlertDescription>
                  </Alert>
                )}
                {calendarTest.response && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Detalhes do Evento:</label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{calendarTest.response}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testCalendar} 
                disabled={!calendarTest.eventTitle || !calendarTest.eventDate || !calendarTest.eventTime || calendarTest.loading}
              >
                {calendarTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Evento
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Teste de Lembretes */}
        <TabsContent value="reminder">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Criação de Lembrete</CardTitle>
              <CardDescription>
                Crie um lembrete usando o agente de lembretes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Texto do Lembrete</label>
                  <Textarea 
                    value={reminderTest.reminderText}
                    onChange={(e) => setReminderTest({...reminderTest, reminderText: e.target.value})}
                    placeholder="Comprar leite no supermercado" 
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data</label>
                    <Input 
                      type="date"
                      value={reminderTest.reminderDate}
                      onChange={(e) => setReminderTest({...reminderTest, reminderDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Hora</label>
                    <Input 
                      type="time"
                      value={reminderTest.reminderTime}
                      onChange={(e) => setReminderTest({...reminderTest, reminderTime: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prioridade</label>
                  <Select 
                    value={reminderTest.reminderPriority}
                    onValueChange={(value) => setReminderTest({...reminderTest, reminderPriority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {reminderTest.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{reminderTest.error}</AlertDescription>
                  </Alert>
                )}
                {reminderTest.success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>Lembrete criado com sucesso</AlertDescription>
                  </Alert>
                )}
                {reminderTest.response && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Detalhes do Lembrete:</label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{reminderTest.response}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testReminder} 
                disabled={!reminderTest.reminderText || !reminderTest.reminderDate || !reminderTest.reminderTime || reminderTest.loading}
              >
                {reminderTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Lembrete
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Teste de Conformidade */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Verificação de Conformidade</CardTitle>
              <CardDescription>
                Verifique a conformidade com LGPD/GDPR usando o agente de conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Operação</label>
                  <Select 
                    value={complianceTest.operation}
                    onValueChange={(value) => setComplianceTest({...complianceTest, operation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a operação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="save_user_data">Salvar Dados do Usuário</SelectItem>
                      <SelectItem value="delete_user_data">Excluir Dados do Usuário</SelectItem>
                      <SelectItem value="share_user_data">Compartilhar Dados do Usuário</SelectItem>
                      <SelectItem value="process_sensitive_data">Processar Dados Sensíveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Dados (JSON)</label>
                  <Textarea 
                    value={complianceTest.data}
                    onChange={(e) => setComplianceTest({...complianceTest, data: e.target.value})}
                    placeholder="{ 'user_id': 123, ... }" 
                    rows={6}
                    className="font-mono"
                  />
                </div>
                {complianceTest.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{complianceTest.error}</AlertDescription>
                  </Alert>
                )}
                {complianceTest.success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>Verificação de conformidade concluída</AlertDescription>
                  </Alert>
                )}
                {complianceTest.response && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Resultado da Verificação:</label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{complianceTest.response}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testCompliance} 
                disabled={!complianceTest.data || complianceTest.loading}
              >
                {complianceTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar Conformidade
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}