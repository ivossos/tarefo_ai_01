/**
 * Rotas de Verificação - Implementação de rotas para verificação de número
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from './auth';
import { 
  sendVerificationCode, 
  verifyCode, 
  hasTwilioConfig 
} from './twilio-messenger';
import { generateVerificationCode as generateTelegramCode } from './messenger';
import { storage } from './storage';

// Esquema para validação de solicitação de código
const phoneSchema = z.object({
  phone: z.string().min(1, { message: "Número de telefone é obrigatório" })
});

// Esquema para verificação de código
const verificationSchema = z.object({
  phone: z.string().min(1, { message: "Número de telefone é obrigatório" }),
  code: z.string().min(1, { message: "Código de verificação é obrigatório" })
});

// Cria o roteador para as rotas de verificação
const verifyRouter = Router();

// Rota para verificação via SMS
verifyRouter.post('/sms', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { phone } = phoneSchema.parse(req.body);
    
    // Verifica se a configuração do Twilio está presente
    if (!hasTwilioConfig()) {
      return res.status(503).json({
        success: false,
        message: "Serviço de SMS não está configurado"
      });
    }
    
    // Envia um código de verificação via SMS
    const code = await sendVerificationCode(phone);
    
    if (!code) {
      return res.status(500).json({
        success: false,
        message: "Falha ao enviar SMS de verificação"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Código de verificação enviado por SMS",
      data: {
        // Não enviamos o código na resposta para SMS, pois ele já foi enviado por SMS
        sent: true,
        expires: "10 minutos",
        method: "sms"
      }
    });
  } catch (error) {
    console.error("Erro ao enviar SMS de verificação:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Erro ao enviar SMS de verificação" 
    });
  }
});

// Rota para verificação via Telegram
verifyRouter.post('/telegram', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { phone } = phoneSchema.parse(req.body);
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Número de telefone é obrigatório" 
      });
    }
    
    // Gera um código de verificação para Telegram
    const code = generateTelegramCode(phone);
    
    res.status(200).json({
      success: true,
      message: "Código de verificação gerado com sucesso",
      data: {
        code,
        expires: "10 minutos",
        method: "telegram"
      }
    });
  } catch (error) {
    console.error("Erro ao verificar Telegram:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Erro ao gerar código de verificação" 
    });
  }
});

// Rota para verificar um código enviado
verifyRouter.post('/check-code', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { code, phone } = verificationSchema.parse(req.body);
    
    // Verifica o código
    const isValid = verifyCode(code, phone);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Código inválido ou expirado"
      });
    }
    
    // Atualiza o número de telefone do usuário, se necessário
    const user = await storage.getUser(userId);
    if (user && user.phone !== phone) {
      await storage.updateUser(userId, { phone });
    }
    
    res.status(200).json({
      success: true,
      message: "Verificação realizada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Erro ao verificar código" 
    });
  }
});

// Exporta o roteador
export default verifyRouter;