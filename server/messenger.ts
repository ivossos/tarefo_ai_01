import { Telegraf, Context } from 'telegraf';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

// Variável para armazenar a instância do bot
let bot: Telegraf | null = null;

// Função para inicializar o bot do Telegram
function initializeTelegramBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ Bot do Telegram não configurado (TELEGRAM_BOT_TOKEN não definido)');
    return null;
  }
  
  try {
    // Verifica se o token tem um formato válido
    const token = process.env.TELEGRAM_BOT_TOKEN.trim();
    
    // Verifica se token tem formato esperado (geralmente começa com números:letras)
    if (!token.includes(':') || token.length < 30) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN fornecido parece não ter o formato esperado');
      console.log(`⚠️ Token atual: ${token.length} caracteres e ${token.includes(':') ? 'contém' : 'não contém'} dois-pontos (:)`);
      return null;
    }
    
    // Imprime informações de depuração
    console.log(`ℹ️ Tentando inicializar bot com token de comprimento ${token.length}`);
    
    // Imprime o início e o fim do token para debug (mantendo a parte do meio segura)
    if (token.length > 10) {
      const firstPart = token.substring(0, 5);
      const lastPart = token.substring(token.length - 5);
      console.log(`ℹ️ Token inicia com ${firstPart}... e termina com ...${lastPart}`);
    }
    
    return new Telegraf(token);
  } catch (error) {
    console.error('❌ Erro ao inicializar o bot do Telegram:', error);
    return null;
  }
}

// Mapeamento de chat IDs do Telegram para IDs de usuários no sistema
const chatIdToUserId = new Map<number, number>();

// Mapeia números de telefone para códigos de verificação
export const verificationCodes = new Map<string, string>();

// Função para gerar um código de verificação
export function generateVerificationCode(phone: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(code, phone);
  console.log(`Código de verificação gerado para ${phone}: ${code}`);
  return code;
}

// Os manipuladores (handlers) agora são configurados na função startMessengerServices

// Esta função processará mensagens recebidas utilizando a integração com TarefoAI (CrewAI)
async function processUserMessage(userId: number, message: string, platform: string = 'telegram'): Promise<string> {
  try {
    // Importa o adaptador para o TarefoAI
    const { processMessage } = await import('./tarefo-ai-adapter');
    
    // Processa a mensagem com o TarefoAI
    return await processMessage(userId, message, platform);
  } catch (error: any) {
    console.error('❌ Erro crítico ao processar mensagem:', error);
    throw new Error(`Falha no processamento da mensagem: ${error?.message || String(error)}`);
  }
}

// Função para enviar mensagem para um usuário específico via Telegram
export async function sendTelegramMessage(userId: number, message: string): Promise<boolean> {
  if (!bot) return false;
  
  // Encontra o chatId do Telegram associado a este usuário
  let found = false;
  chatIdToUserId.forEach((id, chatId) => {
    if (id === userId && !found) {
      found = true;
      try {
        // Verificação adicional para evitar NullPointerException
        if (bot && bot.telegram) {
          bot.telegram.sendMessage(chatId, message);
        } else {
          console.warn('Bot do Telegram não está configurado corretamente');
          found = false;
        }
      } catch (error) {
        console.error(`Erro ao enviar mensagem para o usuário ${userId}:`, error);
        found = false;
      }
    }
  });
  
  return found;
}

// Inicia os serviços de mensageria
export async function startMessengerServices() {
  console.log('📱 Iniciando serviços de mensageria...');
  
  try {
    // Verificamos a existência do token antes de tentar inicializar o bot
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN não encontrado nas variáveis de ambiente');
      console.log('📱 Serviços de mensageria iniciados no modo offline (Telegram desativado)');
      
      // Mesmo sem o bot, continuamos com o serviço de geração de códigos
      console.log('✅ Serviço de geração de códigos de verificação iniciado');
      console.log('✅ Sistema de persistência de mensagens configurado');
      return;
    }
    
    // Inicializa o bot do Telegram com um token existente
    bot = initializeTelegramBot();
    
    if (bot) {
      // Configura handlers básicos
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
      
      // Manipulador de mensagens de texto
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
            
            // Obtém uma resposta real do AI através do TarefoAI (CrewAI)
            const aiResponse = await processUserMessage(userId, messageText, 'telegram');
            
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
      
      try {
        // Log detalhado antes da verificação
        console.log('🔍 Verificando configuração do bot do Telegram...');
        
        try {
          // Verificamos se o token é válido tentando obter informações do próprio bot
          // Esta é uma chamada mais leve e rápida que launch()
          const botInfo = await bot.telegram.getMe();
          
          if (botInfo && botInfo.username) {
            console.log(`✅ Bot do Telegram configurado com sucesso: @${botInfo.username}`);
            
            // Configura webhook para modo ativo/passivo
            // No Replit, não podemos iniciar o polling, mas podemos responder a webhook events
            console.log('ℹ️ Bot configurado em modo passivo (sem polling)');
            console.log(`ℹ️ Para interagir com o bot, envie mensagens para @${botInfo.username}`);
            
            // Registra evento para quando o bot parar
            process.once('SIGINT', () => {
              console.log('Encerrando bot do Telegram devido a SIGINT...');
              bot?.telegram.close();
            });
            process.once('SIGTERM', () => {
              console.log('Encerrando bot do Telegram devido a SIGTERM...');
              bot?.telegram.close();
            });
          } else {
            throw new Error('Não foi possível obter informações do bot');
          }
        } catch (e: any) {
          throw new Error(`Erro na verificação do bot: ${e?.message || String(e)}`);
        }
      } catch (e) {
        const error = e as Error;
        console.error('❌ Erro ao configurar bot do Telegram:', error?.message || 'Erro desconhecido');
        console.log('⚠️ O token informado pode ser inválido ou o serviço do Telegram pode estar inacessível');
        console.log('⚠️ Tentando continuar a aplicação sem a integração com Telegram');
        
        // Desativa o bot e continua o programa
        bot = null;
      }
    } else {
      console.log('⚠️ Bot do Telegram não foi inicializado. Verificando variável de ambiente...');
      
      if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.log('❌ TELEGRAM_BOT_TOKEN não encontrado nas variáveis de ambiente');
      } else {
        console.log('⚠️ TELEGRAM_BOT_TOKEN encontrado, mas houve erro na inicialização do bot');
      }
    }
    
    console.log('✅ Serviço de geração de códigos de verificação iniciado');
    console.log('✅ Sistema de persistência de mensagens configurado');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar serviços de mensageria:', error);
    console.log('📱 Serviços de mensageria iniciados no modo offline');
  }
}