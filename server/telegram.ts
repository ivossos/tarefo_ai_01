import { Telegraf } from 'telegraf';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN deve ser definido nas variáveis de ambiente');
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Mapeamento de chat IDs do Telegram para IDs de usuários no sistema
const chatIdToUserId = new Map<number, number>();

// Mapeia números de telefone para códigos de verificação
export const verificationCodes = new Map<string, string>();

// Comandos básicos
bot.start(async (ctx) => {
  await ctx.reply('Olá! Bem-vindo ao TarefoAI. Use /ajuda para ver os comandos disponíveis.');
});

bot.help((ctx) => {
  ctx.reply(
    'Comandos disponíveis:\n' +
    '/lembretes - Ver seus próximos lembretes\n' +
    '/agenda - Ver sua agenda para hoje\n' +
    '/ajuda - Mostrar esta mensagem de ajuda'
  );
});

// Comando para mostrar os próximos lembretes
bot.command('lembretes', async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = chatIdToUserId.get(chatId);
  
  if (!userId) {
    return ctx.reply('Você precisa estar vinculado a uma conta do Tarefo AI. Visite o site para vincular sua conta.');
  }
  
  try {
    const reminders = await storage.getUpcomingReminders(userId, 5);
    
    if (reminders.length === 0) {
      return ctx.reply('Você não tem lembretes próximos.');
    }
    
    let message = 'Seus próximos lembretes:\n\n';
    
    for (const reminder of reminders) {
      const date = new Date(reminder.dueDate).toLocaleDateString('pt-BR');
      message += `- ${reminder.title} (${date})\n`;
    }
    
    ctx.reply(message);
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    ctx.reply('Desculpe, ocorreu um erro ao buscar seus lembretes.');
  }
});

// Comando para mostrar a agenda do dia
bot.command('agenda', async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = chatIdToUserId.get(chatId);
  
  if (!userId) {
    return ctx.reply('Você precisa estar vinculado a uma conta do Tarefo AI. Visite o site para vincular sua conta.');
  }
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await storage.getEventsByDate(userId, today);
    
    if (events.length === 0) {
      return ctx.reply('Você não tem eventos para hoje.');
    }
    
    let message = 'Seus eventos para hoje:\n\n';
    
    for (const event of events) {
      const time = new Date(event.startTime).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      message += `- ${time} - ${event.title}\n`;
      if (event.location) {
        message += `  Local: ${event.location}\n`;
      }
    }
    
    ctx.reply(message);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    ctx.reply('Desculpe, ocorreu um erro ao buscar seus eventos.');
  }
});

// Função para processar mensagens de texto genéricas
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = chatIdToUserId.get(chatId);
  const messageText = ctx.message.text;

  // Se o usuário estiver verificando seu código
  if (verificationCodes.has(messageText)) {
    const phone = verificationCodes.get(messageText);
    if (phone) {
      try {
        // Busca o usuário por telefone
        const [user] = await db.select().from(users).where(eq(users.phone, phone));
        
        if (user) {
          // Vincula o chat ID do Telegram ao ID do usuário
          chatIdToUserId.set(chatId, user.id);
          
          // Remove o código de verificação
          verificationCodes.delete(messageText);
          
          return ctx.reply(
            'Sua conta foi verificada com sucesso! 🎉\n\n' +
            'Agora você pode usar o TarefoAI pelo Telegram. Use /ajuda para ver os comandos disponíveis.'
          );
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      }
    }
  }

  // Se o usuário já estiver autenticado, trata como uma mensagem de chat
  if (userId) {
    try {
      await storage.createChatMessage({
        userId,
        content: messageText,
        isFromUser: true,
        platform: 'telegram'
      });
      
      // Obtém uma resposta real do AI via OpenAI
      const aiResponse = await generateAIResponse(messageText);
      
      await storage.createChatMessage({
        userId,
        content: aiResponse,
        isFromUser: false,
        platform: 'telegram'
      });
      
      ctx.reply(aiResponse);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      ctx.reply('Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
  } else {
    ctx.reply(
      'Olá! Para usar o TarefoAI pelo Telegram, você precisa vincular sua conta.\n\n' +
      'Acesse o site do TarefoAI e siga as instruções de vinculação na seção de Preferências.'
    );
  }
});

// Utiliza o OpenAI para gerar respostas
async function generateAIResponse(message: string): Promise<string> {
  try {
    // Importa o processador de mensagens OpenAI
    const { processMessage } = await import('./openai');
    
    // Busca o userId associado à mensagem para contexto
    // Como estamos em um contexto Telegram, vamos usar um userId temporário para processamento
    const tempUserId = 0;
    
    return await processMessage(tempUserId, message);
  } catch (error) {
    console.error('Erro ao processar mensagem com OpenAI:', error);
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
  // Encontra o chatId do Telegram associado a este usuário
  let found = false;
  chatIdToUserId.forEach((id, chatId) => {
    if (id === userId && !found) {
      found = true;
      try {
        bot.telegram.sendMessage(chatId, message);
      } catch (error) {
        console.error(`Erro ao enviar mensagem para o usuário ${userId}:`, error);
        found = false;
      }
    }
  });
  
  return found;
}

// Inicia o bot
export async function startTelegramBot() {
  try {
    await bot.launch();
    console.log('🤖 Bot do Telegram iniciado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao iniciar o bot do Telegram:', error);
  }
}

// Manipula o encerramento adequado
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));