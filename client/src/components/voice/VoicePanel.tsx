import { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoice } from '@/hooks/use-voice';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface VoicePanelProps {
  userId: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function VoicePanel({ userId, collapsed = false, onToggleCollapse }: VoicePanelProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallFormVisible, setIsCallFormVisible] = useState(false);
  const { toast } = useToast();
  
  const {
    connectionState,
    recognitionState,
    transcript,
    aiResponse,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    makeCall,
    isConnected,
    isListening,
    isProcessing
  } = useVoice({ userId });
  
  // Conecta ao servidor de voz quando o componente é montado
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);
  
  // Se o painel estiver colapsado, mostra apenas o botão de expansão
  if (collapsed) {
    return (
      <div className="fixed bottom-20 right-5 z-40">
        <Button
          onClick={onToggleCollapse}
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    );
  }
  
  // Exibe mensagem de erro se houver
  const displayError = error && (
    <div className="bg-destructive/20 text-destructive p-2 rounded text-sm mb-2">
      {error}
    </div>
  );
  
  // Formata o telefone enquanto o usuário digita
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX para Brasil
    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
      }
    }
    
    setPhoneNumber(value);
  };
  
  // Inicia uma chamada telefônica
  const handleMakeCall = () => {
    if (!phoneNumber) {
      toast({
        title: 'Número inválido',
        description: 'Por favor, informe um número de telefone válido',
        variant: 'destructive',
      });
      return;
    }
    
    makeCall(phoneNumber);
    setIsCallFormVisible(false);
  };
  
  return (
    <Card className="w-full max-w-md fixed bottom-5 right-5 z-40 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <span>Assistente de Voz</span>
            {connectionState === 'connected' && (
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                Conectado
              </Badge>
            )}
            {connectionState === 'connecting' && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                Conectando...
              </Badge>
            )}
          </CardTitle>
          
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Fechar</span>
            </Button>
          )}
        </div>
        
        <CardDescription>
          Use sua voz para interagir com o TarefoAI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayError}
        
        {/* Exibe a transcrição do que foi falado */}
        {transcript && (
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-sm font-medium mb-1">Você disse:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}
        
        {/* Exibe a resposta do assistente */}
        {aiResponse && (
          <div className="border rounded-lg p-3 bg-primary/10">
            <p className="text-sm font-medium mb-1">TarefoAI:</p>
            <p className="text-sm">{aiResponse}</p>
          </div>
        )}
        
        {/* Formulário para fazer chamada telefônica */}
        {isCallFormVisible && (
          <div className="border rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Fazer chamada telefônica:</p>
            <div className="flex gap-2">
              <Input 
                type="text" 
                placeholder="(XX) XXXXX-XXXX"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={15}
              />
              <Button onClick={handleMakeCall} size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Ligar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4 flex justify-between">
        {!isConnected ? (
          <Button onClick={connect} disabled={connectionState === 'connecting'}>
            {connectionState === 'connecting' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Conectar
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              variant={isListening ? "destructive" : "default"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Parar
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Falar
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsCallFormVisible(!isCallFormVisible)}
            >
              <Phone className="h-4 w-4 mr-2" />
              {isCallFormVisible ? 'Cancelar' : 'Ligar'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}