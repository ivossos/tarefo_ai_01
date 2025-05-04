import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Trash, RefreshCw, Send } from "lucide-react";

export default function WhatsAppTesterPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carregar mensagens para o número especificado
  const fetchMessages = async () => {
    if (!phoneNumber) {
      setError("Por favor, informe um número de telefone válido");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/whatsapp/messages/${phoneNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        if (data.messages.length === 0) {
          setSuccess("Nenhuma mensagem encontrada para este número");
        } else {
          setSuccess(`${data.messages.length} mensagens encontradas`);
        }
      } else {
        setError(data.message || "Erro ao buscar mensagens");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem simulada
  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      setError("Por favor, informe o número de telefone e a mensagem");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Mensagem enviada com sucesso");
        setMessage(""); // Limpa o campo de mensagem
        
        // Aguarda um momento para dar tempo ao servidor processar a mensagem
        setTimeout(() => {
          fetchMessages(); // Atualiza a lista de mensagens
        }, 1000);
      } else {
        setError(data.message || "Erro ao enviar mensagem");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Limpar mensagens
  const clearMessages = async () => {
    if (!phoneNumber) {
      setError("Por favor, informe um número de telefone válido");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/whatsapp/messages/${phoneNumber}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages([]);
        setSuccess("Mensagens removidas com sucesso");
      } else {
        setError(data.message || "Erro ao limpar mensagens");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar mensagens quando o número de telefone mudar
  useEffect(() => {
    if (phoneNumber) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [phoneNumber]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Simulador de WhatsApp</h1>
      <p className="text-gray-500 mb-6">
        Esta ferramenta permite simular o envio de mensagens do WhatsApp para o sistema,
        útil para testar a integração WhatsApp sem precisar de um número real.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Painel de entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensagem</CardTitle>
            <CardDescription>
              Simule o envio de uma mensagem para o TarefoAI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Número de Telefone
              </label>
              <Input
                placeholder="Ex: 5511987654321"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Formato internacional, sem espaços ou traços
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Mensagem
              </label>
              <Textarea
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={clearMessages}
              disabled={loading || !phoneNumber}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash className="h-4 w-4 mr-2" />}
              Limpar Mensagens
            </Button>
            <Button 
              onClick={sendMessage}
              disabled={loading || !phoneNumber || !message}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar
            </Button>
          </CardFooter>
        </Card>

        {/* Painel de visualização */}
        <Card>
          <CardHeader>
            <CardTitle>Respostas do Sistema</CardTitle>
            <CardDescription className="flex justify-between">
              <span>Mensagens do TarefoAI para este número</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchMessages} 
                disabled={loading || !phoneNumber}
                className="h-8 px-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="border rounded-md p-4 min-h-[300px] bg-gray-50 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  {loading ? 
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Carregando mensagens...</p>
                    </div>
                    : 
                    <p>Nenhuma mensagem encontrada</p>
                  }
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{msg}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Como usar:</h2>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Insira um número de telefone no formato internacional (ex: 5511987654321)</li>
          <li>Digite uma mensagem que você gostaria de enviar</li>
          <li>Clique em "Enviar" para simular uma mensagem recebida do WhatsApp</li>
          <li>Após alguns instantes, a resposta do TarefoAI aparecerá no painel direito</li>
          <li>Use "Limpar Mensagens" para remover todas as mensagens associadas a este número</li>
        </ol>
      </div>
    </div>
  );
}