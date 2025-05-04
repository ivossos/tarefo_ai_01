/**
 * Twilio SMS Integration - Implementação de envio de SMS via Twilio
 * 
 * Este módulo fornece funções para enviar SMS utilizando a API Twilio.
 * É utilizado principalmente para verificação de número de telefone e notificações.
 */

import twilio from 'twilio';
import { verificationCodes } from './whatsapp';

// Inicializa o cliente Twilio com as credenciais do ambiente
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Cria o cliente Twilio se as credenciais estiverem presentes
const twilioClient = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

/**
 * Verifica se a configuração do Twilio está completa e válida
 */
export function hasTwilioConfig(): boolean {
  return Boolean(twilioClient && twilioPhone);
}

/**
 * Envia uma mensagem SMS via Twilio
 * 
 * @param to Número de telefone do destinatário (formato E.164)
 * @param message Conteúdo da mensagem
 * @returns Promise<boolean> Sucesso do envio
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  if (!hasTwilioConfig()) {
    console.error('❌ Configuração do Twilio não está completa');
    return false;
  }

  try {
    // Formata o número para E.164 se necessário
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    // Envia o SMS
    await twilioClient!.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedTo
    });
    
    console.log(`✅ SMS enviado com sucesso para ${formattedTo}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error);
    return false;
  }
}

/**
 * Envia código de verificação via SMS
 * 
 * @param phone Número de telefone (formato E.164)
 * @returns Promise<string|null> Código gerado ou null em caso de falha
 */
export async function sendVerificationCode(phone: string): Promise<string|null> {
  try {
    // Gera um código de verificação de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Armazena o código no mapa de verificação (compartilhado com WhatsApp)
    verificationCodes.set(code, phone);
    
    // Mensagem de verificação
    const message = `Seu código de verificação do Tarefo AI é: ${code}. Este código expira em 10 minutos.`;
    
    // Envia o SMS
    const success = await sendSms(phone, message);
    
    if (success) {
      // Configura expiração do código (10 minutos)
      setTimeout(() => {
        if (verificationCodes.has(code)) {
          verificationCodes.delete(code);
          console.log(`⏱️ Código de verificação para ${phone} expirou`);
        }
      }, 10 * 60 * 1000);
      
      return code;
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar código de verificação:', error);
    return null;
  }
}

/**
 * Verifica um código de verificação para um número de telefone
 * 
 * @param code Código de verificação
 * @param phone Número de telefone para verificar
 * @returns boolean Resultado da verificação
 */
export function verifyCode(code: string, phone: string): boolean {
  // Verifica se o código existe
  if (!verificationCodes.has(code)) {
    return false;
  }
  
  // Verifica se o código corresponde ao número de telefone
  const storedPhone = verificationCodes.get(code);
  if (storedPhone !== phone) {
    return false;
  }
  
  // Remove o código após verificação bem-sucedida
  verificationCodes.delete(code);
  return true;
}

/**
 * Envia um lembrete via SMS
 * 
 * @param phone Número de telefone do destinatário
 * @param title Título do lembrete
 * @param time Horário do lembrete (opcional)
 * @returns Promise<boolean> Sucesso do envio
 */
export async function sendReminderSms(
  phone: string, 
  title: string, 
  time?: Date
): Promise<boolean> {
  let message = `🔔 Lembrete do Tarefo AI: ${title}`;
  
  if (time) {
    const formattedTime = time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    message += ` às ${formattedTime}`;
  }
  
  return await sendSms(phone, message);
}