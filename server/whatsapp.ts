/**
 * WhatsApp Client Simulator - Implementação simplificada para ambientes de desenvolvimento
 * 
 * Este módulo fornece uma implementação simulada do cliente WhatsApp baseada em webhooks
 * para ambientes onde não é possível executar o navegador headless.
 */

import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

// Mapeamento de números de WhatsApp para IDs de usuários no sistema
export const phoneToUserId = new Map<string, number>();

// Mapeia números de telefone para códigos de verificação
export const verificationCodes = new Map<string, string>();

// Status simulado do cliente
let isClientReady = false;

// Enfileira mensagens para serem enviadas posteriormente
// Em um ambiente real, estas seriam enviadas via API do WhatsApp
const messageQueue = new Map<string, string[]>();

// Classe de mensagem simulada
class MessageSimulator {
  public from: string;
  public body: string;
  public id: string;
  
  constructor(from: string, body: string) {
    this.from = from;
    this.body = body;
    this.id = Math.random().toString(36).substring(7);
  }
}

// Métodos simulados para envio de mensagens
const sendMessageToPhone = async (to: string, content: string): Promise<boolean> => {
  try {
    // Normaliza o número de telefone para garantir consistência
    const normalizedTo = normalizePhoneNumber(to);
    
    console.log(`📤 [WhatsApp Simulado] Enviando mensagem para ${normalizedTo}: ${content.substring(0, 30)}...`);
    
    // Adiciona a mensagem à fila de mensagens para este número
    if (!messageQueue.has(normalizedTo)) {
      messageQueue.set(normalizedTo, []);
    }
    messageQueue.get(normalizedTo)?.push(content);
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem para WhatsApp:', error);
    return false;
  }
};

// Função para normalizar números de telefone
export function normalizePhoneNumber(phone: string): string {
  // Adiciona o "+" no início se não existir
  let normalizedPhone = phone;
  if (!normalizedPhone.startsWith('+') && !normalizedPhone.startsWith('whatsapp:+')) {
    normalizedPhone = `+${normalizedPhone}`;
  }
  // Remove prefixo 'whatsapp:' se existir
  if (normalizedPhone.startsWith('whatsapp:+')) {
    normalizedPhone = normalizedPhone.replace('whatsapp:', '');
  }
  return normalizedPhone;
}

// Obtém as mensagens na fila para um determinado número
export const getQueuedMessagesForPhone = (phone: string): string[] => {
  const normalizedPhone = normalizePhoneNumber(phone);
  return messageQueue.get(normalizedPhone) || [];
};

// Limpa a fila de mensagens para um determinado número
export const clearQueuedMessagesForPhone = (phone: string): void => {
  const normalizedPhone = normalizePhoneNumber(phone);
  messageQueue.delete(normalizedPhone);
};

// Função auxiliar para gerar uma barra de progresso visual
export function createProgressBar(percentage: number): string {
  const filledLength = Math.floor(percentage / 10);
  const emptyLength = 10 - filledLength;
  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);
  return `${filled}${empty}`;
}

// Utiliza o sistema de processamento de mensagens para gerar respostas
async function generateAIResponse(message: string): Promise<string> {
  try {
    // Tenta usar o adaptador TarefoAI primeiro (multi-provider)
    try {
      const { processMessage } = await import('./tarefo-ai-adapter');
      const tempUserId = 0;
      return await processMessage(tempUserId, message);
    } catch (tarefoError) {
      console.warn('Falha ao usar adaptador TarefoAI, tentando OpenAI diretamente:', tarefoError);
      
      // Fallback para OpenAI direto
      const { processMessage } = await import('./openai');
      const tempUserId = 0;
      return await processMessage(tempUserId, message);
    }
  } catch (error) {
    console.error('Erro ao processar mensagem com AI:', error);
    return 'Desculpe, estou com dificuldades para processar sua mensagem. Pode tentar novamente?';
  }
}

// Função para gerar um código de verificação
export function generateVerificationCode(phone: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(code, phone);
  return code;
}

// Função para enviar mensagem para um usuário específico
export async function sendMessageToUser(userId: number, message: string): Promise<boolean> {
  // Encontra o número de WhatsApp associado a este usuário
  let found = false;
  
  phoneToUserId.forEach((id, phone) => {
    if (id === userId && !found) {
      found = true;
      try {
        sendMessageToPhone(phone, message);
      } catch (error) {
        console.error(`Erro ao enviar mensagem para o usuário ${userId}:`, error);
        found = false;
      }
    }
  });
  
  return found;
}

// Inicia o cliente do WhatsApp
export async function startWhatsAppClient(): Promise<void> {
  try {
    // Simula inicialização
    console.log('🔄 Inicializando cliente WhatsApp...');
    
    // Espera um curto período para simular inicialização
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Marca cliente como pronto
    isClientReady = true;
    
    console.log('✓ Cliente WhatsApp (modo simulação) inicializado com sucesso');
    console.log('ℹ️ Nota: Este é um cliente WhatsApp simulado para desenvolvimento');
    console.log('ℹ️ Para testar, use a rota "/api/whatsapp/simulate" para simular mensagens recebidas');
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Erro ao iniciar o cliente WhatsApp simulado:', error);
    return Promise.reject(error);
  }
}

/**
 * Processa uma mensagem recebida via webhook do WhatsApp
 * Esta função deve ser chamada pelo endpoint do webhook quando uma notificação de mensagem for recebida
 */
export async function processWebhookMessage(messageData: any): Promise<void> {
  try {
    // Verifica se a mensagem tem o formato esperado
    if (!messageData || !messageData.from || !messageData.body) {
      console.warn('⚠️ Formato de mensagem do webhook inválido:', messageData);
      return;
    }
    
    // Cria uma instância da mensagem simulada se não for uma
    const message = messageData instanceof MessageSimulator 
      ? messageData 
      : new MessageSimulator(messageData.from, messageData.body);
    
    console.log(`📥 Processando mensagem do webhook do WhatsApp: ${message.id}`);
    
    // Extrai as informações da mensagem e normaliza o número de telefone
    // Remove @c.us se presente
    let phoneNumber = message.from.includes('@c.us') 
      ? message.from.replace('@c.us', '') 
      : message.from;
    
    // Normaliza o número de telefone usando a função auxiliar
    phoneNumber = normalizePhoneNumber(phoneNumber);
      
    const messageText = message.body;
    
    // Verifica se o número está associado a um usuário no sistema
    let userId = phoneToUserId.get(phoneNumber);
    
    // Se não encontrou o usuário pelo mapa em memória, tenta encontrar no banco de dados
    if (!userId) {
      try {
        // Busca um usuário com este número de telefone
        const [user] = await db.select().from(users).where(eq(users.phone, phoneNumber));
        if (user) {
          // Guarda a associação para uso futuro
          userId = user.id;
          phoneToUserId.set(phoneNumber, userId);
        }
      } catch (dbError) {
        console.error('Erro ao buscar usuário no banco de dados:', dbError);
      }
    }
    
    // Se é um código de verificação
    if (verificationCodes.has(messageText)) {
      const phone = verificationCodes.get(messageText);
      if (phone) {
        try {
          // Busca o usuário por telefone
          const [user] = await db.select().from(users).where(eq(users.phone, phone));
          
          if (user) {
            // Vincula o número do WhatsApp ao ID do usuário
            phoneToUserId.set(phoneNumber, user.id);
            
            // Remove o código de verificação
            verificationCodes.delete(messageText);
            
            // Envia mensagem de confirmação
            await sendMessageToPhone(phoneNumber, 
              'Sua conta foi verificada com sucesso! 🎉\n\n' +
              'Agora você pode usar o Tarefo AI pelo WhatsApp. Envie *ajuda* para ver os comandos disponíveis.'
            );
            
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
        }
      }
    }
    
    // Se o usuário já está autenticado
    if (userId) {
      // Salva a mensagem no banco de dados
      await storage.createChatMessage({
        userId,
        content: messageText,
        isFromUser: true,
        platform: 'whatsapp'
      });
      
      // Processa comandos específicos
      if (messageText.toLowerCase() === 'ajuda') {
        await sendMessageToPhone(phoneNumber,
          '*Comandos disponíveis:*\n\n' +
          '*lembretes* - Ver seus próximos lembretes\n' +
          '*agenda* - Ver sua agenda para hoje\n' +
          '*contas* - Ver saldo de suas contas bancárias\n' +
          '*transações* - Ver suas últimas transações\n' +
          '*metas* - Ver suas metas financeiras\n' +
          '*ajuda* - Mostrar esta mensagem de ajuda'
        );
        return;
      }
      
      if (messageText.toLowerCase() === 'lembretes') {
        const reminders = await storage.getUpcomingReminders(userId, 5);
        
        if (reminders.length === 0) {
          await sendMessageToPhone(phoneNumber, 'Você não tem lembretes próximos.');
          return;
        }
        
        let message = '*Seus próximos lembretes:*\n\n';
        
        for (const reminder of reminders) {
          const date = new Date(reminder.dueDate).toLocaleDateString('pt-BR');
          message += `- *${reminder.title}* (${date})\n`;
        }
        
        await sendMessageToPhone(phoneNumber, message);
        return;
      }
      
      if (messageText.toLowerCase() === 'agenda') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = await storage.getEventsByDate(userId, today);
        
        if (events.length === 0) {
          await sendMessageToPhone(phoneNumber, 'Você não tem eventos para hoje.');
          return;
        }
        
        let message = '*Seus eventos para hoje:*\n\n';
        
        for (const event of events) {
          const time = new Date(event.startTime).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          message += `- *${time}* - ${event.title}\n`;
          if (event.location) {
            message += `  Local: ${event.location}\n`;
          }
        }
        
        await sendMessageToPhone(phoneNumber, message);
        return;
      }
      
      // Comandos para funcionalidades financeiras
      if (messageText.toLowerCase() === 'contas') {
        try {
          const bankAccounts = await storage.getBankAccountsByUserId(userId);
          
          if (bankAccounts.length === 0) {
            await sendMessageToPhone(phoneNumber, 'Você ainda não tem contas bancárias cadastradas. Acesse o app web para configurar.');
            return;
          }
          
          let message = '*Suas contas bancárias:*\n\n';
          
          for (const account of bankAccounts) {
            // Busca informações do banco
            const bank = await storage.getBank(account.bankId);
            const bankName = bank?.name || 'Banco';
            
            // Formata o saldo como moeda brasileira
            const balance = parseFloat(account.balance || '0');
            const formattedBalance = balance.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
            
            message += `- *${bankName}* - ${account.accountName || 'Conta Principal'}\n`;
            message += `  Saldo: *${formattedBalance}*\n`;
            
            // Se tiver data de última sincronização
            if (account.lastSyncedAt) {
              const lastSyncDate = new Date(account.lastSyncedAt).toLocaleDateString('pt-BR');
              message += `  Atualizado em: ${lastSyncDate}\n`;
            }
            
            message += '\n';
          }
          
          await sendMessageToPhone(phoneNumber, message);
        } catch (error) {
          console.error('Erro ao buscar contas bancárias:', error);
          await sendMessageToPhone(phoneNumber, 'Ocorreu um erro ao consultar suas contas bancárias. Por favor, tente novamente mais tarde.');
        }
        return;
      }
      
      if (messageText.toLowerCase() === 'transações' || messageText.toLowerCase() === 'transacoes') {
        try {
          // Obtém data atual menos 30 dias para mostrar transações recentes
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          
          // Busca as transações do usuário
          const transactions = await storage.getTransactionsByUserId(userId, startDate, undefined, 10);
          
          if (transactions.length === 0) {
            await sendMessageToPhone(phoneNumber, 'Você não tem transações recentes nos últimos 30 dias.');
            return;
          }
          
          let message = '*Suas transações recentes:*\n\n';
          
          for (const transaction of transactions) {
            // Obtém dados da conta bancária
            const account = await storage.getBankAccount(transaction.bankAccountId);
            const bank = account ? await storage.getBank(account.bankId) : null;
            const bankName = bank ? bank.name : 'Banco';
            
            // Formata a data
            const date = new Date(transaction.date).toLocaleDateString('pt-BR');
            
            // Formata o valor como moeda brasileira
            const amount = parseFloat(transaction.amount);
            const formattedAmount = amount.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
            
            // Símbolo para indicar entrada ou saída
            const symbol = transaction.type === 'entrada' ? '↗️' : '↘️';
            
            // Adiciona a transação à mensagem
            message += `${symbol} *${formattedAmount}* (${date})\n`;
            message += `📝 ${transaction.description}\n`;
            
            // Adiciona a categoria se disponível
            if (transaction.category) {
              message += `🏷️ ${transaction.category}\n`;
            }
            
            message += `🏦 ${bankName}\n\n`;
          }
          
          await sendMessageToPhone(phoneNumber, message);
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
          await sendMessageToPhone(phoneNumber, 'Ocorreu um erro ao consultar suas transações. Por favor, tente novamente mais tarde.');
        }
        return;
      }
      
      if (messageText.toLowerCase() === 'metas') {
        try {
          // Busca as metas financeiras do usuário
          const goals = await storage.getFinancialGoalsByUserId(userId);
          
          if (goals.length === 0) {
            await sendMessageToPhone(phoneNumber, 'Você não tem metas financeiras cadastradas. Acesse o app web para criar suas metas.');
            return;
          }
          
          let message = '*Suas metas financeiras:*\n\n';
          
          for (const goal of goals) {
            // Calcula o progresso da meta
            const target = parseFloat(goal.targetAmount);
            const current = parseFloat(goal.currentAmount || '0');
            const percentage = Math.min(Math.round((current / target) * 100), 100);
            
            // Formata os valores como moeda brasileira
            const formattedTarget = target.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
            
            const formattedCurrent = current.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
            
            // Cria uma barra de progresso visual simples usando a função auxiliar
            const progressBar = createProgressBar(percentage);
            
            // Adiciona a meta à mensagem
            message += `*${goal.title}*\n`;
            message += `${formattedCurrent} de ${formattedTarget} (${percentage}%)\n`;
            message += `${progressBar}\n\n`;
          }
          
          await sendMessageToPhone(phoneNumber, message);
        } catch (error) {
          console.error('Erro ao buscar metas financeiras:', error);
          await sendMessageToPhone(phoneNumber, 'Ocorreu um erro ao consultar suas metas financeiras. Por favor, tente novamente mais tarde.');
        }
        return;
      }
      
      // Para mensagens normais, usa OpenAI para gerar resposta
      try {
        const aiResponse = await generateAIResponse(messageText);
        
        // Salva a resposta no banco de dados
        await storage.createChatMessage({
          userId,
          content: aiResponse,
          isFromUser: false,
          platform: 'whatsapp'
        });
        
        // Envia a resposta
        await sendMessageToPhone(phoneNumber, aiResponse);
      } catch (aiError) {
        console.error('Erro ao processar resposta IA:', aiError);
        await sendMessageToPhone(phoneNumber, 
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.'
        );
      }
    } else {
      // Usuário não autenticado
      await sendMessageToPhone(phoneNumber, 
        'Olá! Para usar o Tarefo AI pelo WhatsApp, você precisa vincular sua conta.\n\n' +
        'Acesse o site do Tarefo AI e siga as instruções de vinculação na seção de Preferências.'
      );
    }
  } catch (error) {
    console.error('❌ Erro ao processar mensagem do webhook:', error);
  }
}

/**
 * Simula o envio de uma mensagem do WhatsApp para o sistema
 * Útil para testes durante o desenvolvimento
 */
export async function simulateIncomingMessage(phoneNumber: string, messageText: string): Promise<void> {
  // Cria uma mensagem simulada
  const message = new MessageSimulator(`${phoneNumber}`, messageText);
  
  // Processa a mensagem como se fosse recebida via webhook
  await processWebhookMessage(message);
}