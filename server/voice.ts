/**
 * Módulo de Serviço de Voz - TarefoAI
 * 
 * Este serviço gerencia a comunicação por WebSockets para funcionalidades
 * relacionadas à voz, incluindo:
 * 
 * 1. Transcrição de áudio enviado pelo cliente
 * 2. Processamento de comandos de voz pelo LLM
 * 3. Síntese de fala para respostas
 * 4. Realização de chamadas telefônicas via Twilio
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Request, Response, Router } from 'express';
import twilio from 'twilio';
import { processText } from './llm-adapter';
import { storage } from './storage';

// Verifica se a configuração necessária para o serviço de voz está disponível
export function hasValidVoiceConfig(): boolean {
  return !!process.env.OPENAI_API_KEY; // Requisito mínimo é OpenAI para transcrição/síntese
}

// Configuração Twilio para chamadas telefônicas
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Map para armazenar conexões por usuário
const userConnections = new Map<number, WebSocket>();

// Rotas Express para status e configuração do serviço de voz
export const voiceRouter = Router();

// Verifica o status do serviço de voz
voiceRouter.get('/status', (req: Request, res: Response) => {
  const twilioAvailable = !!twilioClient;
  const openaiAvailable = !!process.env.OPENAI_API_KEY;
  
  // Verifica a disponibilidade do serviço
  const available = openaiAvailable; // Requisito mínimo é OpenAI para transcrição/síntese
  
  let reason: string | undefined;
  if (!available) {
    if (!openaiAvailable) {
      reason = 'API OpenAI não configurada. Para usar o assistente de voz, configure uma chave de API.';
    }
  }
  
  res.json({
    available,
    reason,
    features: {
      transcription: openaiAvailable,
      textToSpeech: openaiAvailable,
      phoneCalls: twilioAvailable
    }
  });
});

// Inicializa o servidor WebSocket para comunicação de voz
export function setupVoiceServer(server: HttpServer) {
  // Configuração do WebSocket Server
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/voice'
  });
  
  console.log('Servidor WebSocket para serviço de voz inicializado');
  
  wss.on('connection', async (ws: WebSocket) => {
    let userId: number | null = null;
    
    ws.on('message', async (message: any) => {
      try {
        // Primeira mensagem deve ser o ID do usuário
        if (!userId) {
          try {
            const data = JSON.parse(message.toString());
            userId = data.userId;
            
            if (!userId) {
              sendError(ws, 'ID de usuário não fornecido');
              return;
            }
            
            // Verifica se o usuário existe
            const user = await storage.getUser(userId);
            if (!user) {
              sendError(ws, 'Usuário não encontrado');
              return;
            }
            
            // Armazena a conexão associada ao usuário
            userConnections.set(userId, ws);
            
            // Notifica o cliente sobre a conexão bem-sucedida
            ws.send(JSON.stringify({
              type: 'connection',
              connected: true,
              message: 'Conectado ao serviço de voz'
            }));

            console.log(`👤 Usuário ${userId} conectado ao serviço de voz`);
            return;
          } catch (error) {
            sendError(ws, 'Mensagem inicial inválida, por favor forneça um ID de usuário');
            return;
          }
        }
        
        // Manipula comandos específicos
        if (message instanceof Buffer) {
          // Processa áudio recebido
          await handleAudioMessage(userId, message, ws);
        } else {
          // Processa mensagens JSON
          const messageStr = message.toString();
          
          try {
            const data = JSON.parse(messageStr);
            
            // Processamento de comandos especiais
            if (data.type === 'make_call') {
              await handleMakeCall(userId, data.phoneNumber, ws);
            }
          } catch (error) {
            console.error('Erro ao processar mensagem JSON:', error);
            sendError(ws, 'Formato de mensagem inválido');
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error);
        sendError(ws, 'Erro interno do servidor');
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        userConnections.delete(userId);
        console.log(`👤 Usuário ${userId} desconectado do serviço de voz`);
      }
    });
  });
  
  console.log('🎤 Serviço de voz AI inicializado com sucesso');
  
  return wss;
}

// Processa mensagens de áudio
async function handleAudioMessage(userId: number, audioData: Buffer, ws: WebSocket) {
  try {
    // Simula transcrição - em uma implementação real, enviaria para OpenAI Whisper
    // A transcrição parcial é fictícia enquanto processa, e depois enviamos um resultado final
    
    sendStatus(ws, 'Processando áudio...');
    
    // Simula uma transcrição parcial (não final)
    ws.send(JSON.stringify({
      type: 'transcription',
      text: 'Processando sua fala...',
      isFinal: false
    }));
    
    // Em uma implementação real, enviaria o áudio para a API Whisper
    // Aqui, usamos um atraso para simular o processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // A implementação abaixo simula a transcrição e serve como estrutura para
    // quando a API real estiver conectada
    
    // Texto de exemplo de transcrição
    const transcribedText = "Quais são minhas tarefas para hoje?";
    
    // Envia a transcrição final
    ws.send(JSON.stringify({
      type: 'transcription',
      text: transcribedText,
      isFinal: true
    }));
    
    // Processa a transcrição com o LLM para obter resposta
    const aiResponse = await processText(userId, transcribedText);
    
    // Envia a resposta ao cliente
    ws.send(JSON.stringify({
      type: 'ai_response',
      text: aiResponse
    }));
    
    // Armazena a conversa no histórico
    await storage.createChatMessage({
      userId,
      role: 'user',
      content: transcribedText,
      timestamp: new Date()
    });
    
    await storage.createChatMessage({
      userId,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
    
    // Em uma implementação real, enviaria o texto para a API de síntese de fala
    // e retornaria o áudio para o cliente
    
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    sendError(ws, 'Erro ao processar áudio');
  }
}

// Faz uma chamada telefônica via Twilio
async function handleMakeCall(userId: number, phoneNumber: string, ws: WebSocket) {
  if (!twilioClient) {
    sendCallStatus(ws, false, 'Serviço de chamadas não configurado', null);
    return;
  }
  
  try {
    // Formata o número de telefone (adiciona +55 para Brasil se necessário)
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('0')) {
        // Remove o 0 inicial e adiciona +55
        phoneNumber = '+55' + phoneNumber.substring(1);
      } else {
        // Adiciona código do país Brasil
        phoneNumber = '+55' + phoneNumber;
      }
    }
    
    // Remove caracteres não numéricos (exceto o sinal de +)
    phoneNumber = '+' + phoneNumber.replace(/[^\d+]/g, '').substring(1);
    
    // Url da TwiML que deve responder quando a chamada for atendida
    const twimlUrl = `${process.env.PUBLIC_URL || 'http://localhost:5000'}/api/voice/twiml`;
    
    // Faz a chamada
    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER || '',
      url: twimlUrl,
    });
    
    // Notifica o cliente sobre o status da chamada
    sendCallStatus(ws, true, 'Chamada iniciada com sucesso', call.sid);
    
  } catch (error) {
    console.error('Erro ao fazer chamada:', error);
    sendCallStatus(ws, false, 'Erro ao fazer chamada: ' + (error instanceof Error ? error.message : 'Erro desconhecido'), null);
  }
}

// Funções auxiliares para enviar mensagens padronizadas ao cliente
function sendError(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({
    type: 'error',
    message
  }));
}

function sendStatus(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({
    type: 'status',
    message
  }));
}

function sendCallStatus(ws: WebSocket, success: boolean, message: string, callSid: string | null) {
  ws.send(JSON.stringify({
    type: 'call_status',
    success,
    message,
    callSid
  }));
}

// Rota para gerar resposta TwiML quando uma chamada é atendida
voiceRouter.post('/twiml', (req: Request, res: Response) => {
  // Gera um documento TwiML básico que diz uma mensagem quando a chamada for atendida
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say language="pt-BR">
        Olá, esta é uma chamada de teste do TarefoAI. Obrigado por atender.
      </Say>
      <Pause length="1"/>
      <Say language="pt-BR">
        Esta chamada foi feita automaticamente através da integração com Twilio.
        Tenha um ótimo dia!
      </Say>
    </Response>
  `;
  
  res.type('text/xml');
  res.send(twiml);
});