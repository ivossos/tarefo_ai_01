import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCw, Send, Check, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BotTester() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [testResult, setTestResult] = useState<null | boolean>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const appendLog = (message: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setTestResult(null);
    setStatusMessage("Processando mensagem...");
    appendLog(`Enviando mensagem: "${message}"`);

    try {
      const response = await apiRequest("POST", "/api/test/message", { message });
      const data = await response.json();

      setResult(data.response || "Sem resposta");
      setTestResult(true);
      setStatusMessage("Mensagem processada com sucesso!");
      appendLog(`Resposta recebida: "${data.response}"`);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setResult("Erro ao processar mensagem. Verifique os logs.");
      setTestResult(false);
      setStatusMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
      appendLog(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testTelegramConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setStatusMessage("Testando conexão com Telegram...");
    appendLog("Iniciando teste de conexão com Telegram");

    try {
      const response = await apiRequest("POST", "/api/verify/messenger", {
        platform: "telegram",
        test: true,
        phone: "teste",
        userId: 999
      });

      const data = await response.json();
      const success = data.success || false;

      setTestResult(success);
      setStatusMessage(success ? "Conexão com Telegram funcionando!" : "Falha na conexão com Telegram");
      appendLog(`Resultado do teste: ${success ? "Sucesso" : "Falha"}`);
      
      if (data.message) {
        appendLog(`Mensagem: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      setTestResult(false);
      setStatusMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
      appendLog(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testAgents = async () => {
    setLoading(true);
    setTestResult(null);
    setStatusMessage("Inicializando agentes do TarefoAI...");
    appendLog("Testando inicialização dos agentes CrewAI");

    try {
      const response = await apiRequest("POST", "/api/test/agents", {});
      const data = await response.json();
      const success = data.success || false;

      setTestResult(success);
      
      if (success) {
        setStatusMessage(`Agentes inicializados: ${data.agentCount}, Tarefas: ${data.taskCount}`);
        appendLog(`Agentes inicializados com sucesso: ${data.agentCount} agentes, ${data.taskCount} tarefas`);
      } else {
        setStatusMessage("Falha ao inicializar agentes");
        appendLog("Falha ao inicializar agentes: " + (data.message || "Erro desconhecido"));
      }
      
      if (data.message) {
        appendLog(`Mensagem: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao inicializar agentes:", error);
      setTestResult(false);
      setStatusMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
      appendLog(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Teste dos Agentes TarefoAI</h1>
      
      <Tabs defaultValue="message">
        <TabsList className="mb-4">
          <TabsTrigger value="message">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="agents">Inicializar Agentes</TabsTrigger>
          <TabsTrigger value="connection">Teste de Conexão</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Processamento de Mensagem</CardTitle>
              <CardDescription>
                Envie uma mensagem para testar o processamento pelos agentes CrewAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Digite uma mensagem para testar..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                {result && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resposta</label>
                    <div className="p-4 rounded-md bg-muted">
                      <p className="whitespace-pre-wrap">{result}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center space-x-2">
                {testResult !== null && (
                  <>
                    {testResult ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>{statusMessage}</span>
                  </>
                )}
              </div>
              <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
                {loading ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Processando
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Inicialização dos Agentes</CardTitle>
              <CardDescription>
                Verifica se os agentes do TarefoAI podem ser inicializados corretamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Este teste verifica se os agentes CrewAI podem ser inicializados com sucesso.
                  Isso validará a configuração do ambiente Python e a disponibilidade dos modelos.
                </p>
                
                {testResult !== null && (
                  <div className="flex items-center space-x-2 p-4 rounded-md bg-muted">
                    {testResult ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testAgents} disabled={loading}>
                {loading ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Testar Agentes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão com Telegram</CardTitle>
              <CardDescription>
                Verifica se a conexão com a API do Telegram está funcionando corretamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Este teste verifica se o bot do Telegram está configurado corretamente e pode 
                  receber e enviar mensagens.
                </p>
                
                {testResult !== null && (
                  <div className="flex items-center space-x-2 p-4 rounded-md bg-muted">
                    {testResult ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testTelegramConnection} disabled={loading}>
                {loading ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Testando
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Testar Conexão
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Teste</CardTitle>
              <CardDescription>
                Registros das operações de teste realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-4 rounded-md bg-muted h-[400px] overflow-y-auto font-mono text-sm">
                  {logMessages.length > 0 ? (
                    logMessages.map((log, index) => (
                      <div key={index} className="pb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhum log registrado ainda.</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setLogMessages([])}>
                Limpar Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}