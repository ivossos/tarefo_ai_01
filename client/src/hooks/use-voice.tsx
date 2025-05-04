import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Tipos de mensagens que podem ser recebidas pelo WebSocket
type MessageType = 
  | 'connection' 
  | 'transcription' 
  | 'ai_response' 
  | 'status' 
  | 'error' 
  | 'call_status';

// Estrutura da resposta da transcrição
interface TranscriptionResponse {
  type: 'transcription';
  text: string;
  isFinal: boolean;
}

// Estrutura da resposta de AI
interface AIResponse {
  type: 'ai_response';
  text: string;
}

// Estrutura da resposta de conexão
interface ConnectionResponse {
  type: 'connection';
  connected: boolean;
  message: string;
}

// Estrutura da resposta de status genérico
interface StatusResponse {
  type: 'status';
  message: string;
}

// Estrutura da resposta de erro
interface ErrorResponse {
  type: 'error';
  message: string;
}

// Estrutura da resposta de status de chamada
interface CallStatusResponse {
  type: 'call_status';
  success: boolean;
  message: string;
  callSid: string | null;
}

// União de todos os tipos de resposta
type WebSocketResponse = 
  | TranscriptionResponse 
  | AIResponse 
  | ConnectionResponse 
  | StatusResponse 
  | ErrorResponse 
  | CallStatusResponse;

// Estados da conexão WebSocket
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Estados do reconhecimento de voz
type RecognitionState = 'inactive' | 'listening' | 'processing' | 'error';

interface UseVoiceOptions {
  autoConnect?: boolean;
  userId?: number;
}

// Configurações para MediaRecorder
const recorderOptions = {
  mimeType: 'audio/webm',
  audioBitsPerSecond: 16000
};

export function useVoice({ autoConnect = false, userId }: UseVoiceOptions = {}) {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('inactive');
  
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa elemento de áudio para reproduzir respostas
  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, []);

  // Conecta ao WebSocket
  const connect = useCallback(() => {
    if (!userId) {
      setError('ID de usuário não fornecido');
      return;
    }
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Já está conectado
      return;
    }
    
    setConnectionState('connecting');
    
    // Cria uma nova conexão WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/voice`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      // Envia o ID do usuário como primeira mensagem
      socket.send(JSON.stringify({ userId }));
    };
    
    socket.onmessage = (event) => {
      try {
        // Verifica se a mensagem é binária (áudio)
        if (event.data instanceof Blob) {
          // Cria URL a partir do Blob e reproduz o áudio
          const audioUrl = URL.createObjectURL(event.data);
          if (audioElementRef.current) {
            audioElementRef.current.src = audioUrl;
            audioElementRef.current.play().catch(error => {
              console.error('Erro ao reproduzir áudio:', error);
            });
          }
          return;
        }
        
        // Processa mensagens de texto (JSON)
        const response = JSON.parse(event.data) as WebSocketResponse;
        
        switch (response.type) {
          case 'connection':
            setConnectionState(response.connected ? 'connected' : 'error');
            if (response.connected) {
              toast({
                title: 'Conexão estabelecida',
                description: 'Conectado ao serviço de voz'
              });
            } else {
              setError(response.message);
            }
            break;
            
          case 'transcription':
            setTranscript(response.text);
            if (response.isFinal) {
              setRecognitionState('processing');
            }
            break;
            
          case 'ai_response':
            setAiResponse(response.text);
            setRecognitionState('inactive');
            break;
            
          case 'status':
            // Apenas exibe mensagens de status no console
            console.log('Status:', response.message);
            break;
            
          case 'error':
            setError(response.message);
            toast({
              title: 'Erro no serviço de voz',
              description: response.message,
              variant: 'destructive'
            });
            break;
            
          case 'call_status':
            if (response.success) {
              toast({
                title: 'Chamada iniciada',
                description: response.message
              });
            } else {
              toast({
                title: 'Erro na chamada',
                description: response.message,
                variant: 'destructive'
              });
            }
            break;
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error);
      setConnectionState('error');
      setError('Falha na conexão com o serviço de voz');
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao serviço de voz',
        variant: 'destructive'
      });
    };
    
    socket.onclose = () => {
      setConnectionState('disconnected');
      console.log('Conexão WebSocket fechada');
    };
    
    socketRef.current = socket;
  }, [userId, toast]);

  // Desconecta do WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setConnectionState('disconnected');
  }, []);

  // Inicia o reconhecimento de voz
  const startListening = useCallback(async () => {
    if (connectionState !== 'connected') {
      toast({
        title: 'Não conectado',
        description: 'Conecte-se primeiro ao serviço de voz',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Solicita permissão para acessar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Cria e configura o MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      
      // Limpa estados anteriores
      setTranscript('');
      setAiResponse('');
      setError(null);
      audioChunksRef.current = [];
      
      // Configura handlers para eventos do MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
        
        // Envia os dados para o servidor quando tivermos chunks suficientes
        if (audioChunksRef.current.length >= 1 && socketRef.current?.readyState === WebSocket.OPEN) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioBlob.arrayBuffer().then(buffer => {
            socketRef.current?.send(buffer);
          });
        }
      };
      
      // Inicia a gravação
      mediaRecorder.start(1000); // Captura em intervalos de 1 segundo
      setRecognitionState('listening');
      
      toast({
        title: 'Escutando',
        description: 'Fale algo para o TarefoAI'
      });
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento de voz:', error);
      setError('Erro ao acessar microfone');
      setRecognitionState('error');
      
      toast({
        title: 'Erro no microfone',
        description: 'Não foi possível acessar o microfone',
        variant: 'destructive'
      });
    }
  }, [connectionState, toast]);

  // Para o reconhecimento de voz
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Limpa referências
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    
    // Se não estiver processando, volta para inativo
    if (recognitionState !== 'processing') {
      setRecognitionState('inactive');
    }
  }, [recognitionState]);

  // Faz uma chamada telefônica
  const makeCall = useCallback((phoneNumber: string) => {
    if (connectionState !== 'connected' || !socketRef.current) {
      toast({
        title: 'Não conectado',
        description: 'Conecte-se primeiro ao serviço de voz',
        variant: 'destructive'
      });
      return;
    }
    
    socketRef.current.send(JSON.stringify({
      type: 'make_call',
      phoneNumber
    }));
    
    toast({
      title: 'Iniciando chamada',
      description: `Ligando para ${phoneNumber}...`
    });
  }, [connectionState, toast]);

  // Auto-conecta ao inicializar se autoConnect for true
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, userId, connect, disconnect]);

  return {
    // Estados
    connectionState,
    recognitionState,
    transcript,
    aiResponse,
    error,
    
    // Ações
    connect,
    disconnect,
    startListening,
    stopListening,
    makeCall,
    
    // Utilitários
    isConnected: connectionState === 'connected',
    isListening: recognitionState === 'listening',
    isProcessing: recognitionState === 'processing'
  };
}