/**
 * Rotas de SMS - Implementação de rotas para integração com Twilio
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from './auth';
import { 
  sendSms, 
  sendVerificationCode, 
  verifyCode, 
  hasTwilioConfig 
} from './twilio-messenger';

// Esquema para validação de envio de SMS
const sendSmsSchema = z.object({
  phoneNumber: z.string().min(1, { message: "Número de telefone é obrigatório" }),
  message: z.string().min(1, { message: "Mensagem é obrigatória" })
});

// Esquema para validação de solicitação de código
const phoneSchema = z.object({
  phone: z.string().min(1, { message: "Número de telefone é obrigatório" })
});

// Esquema para verificação de código
const verificationSchema = z.object({
  phone: z.string().min(1, { message: "Número de telefone é obrigatório" }),
  code: z.string().min(1, { message: "Código de verificação é obrigatório" })
});

// Cria o roteador para as rotas de SMS
const smsRouter = Router();

// Rota para verificar o status da integração com Twilio
smsRouter.get('/status', (req: Request, res: Response) => {
  const status = hasTwilioConfig();
  
  res.json({
    status: status ? 'active' : 'inactive',
    message: status 
      ? 'Integração com Twilio configurada e ativa' 
      : 'Integração com Twilio não configurada ou inativa'
  });
});

// Rota para enviar SMS
smsRouter.post('/send', async (req: Request, res: Response) => {
  try {
    // Valida o corpo da requisição
    const { phoneNumber, message } = sendSmsSchema.parse(req.body);
    
    // Verifica se a configuração do Twilio está presente
    if (!hasTwilioConfig()) {
      return res.status(503).json({
        success: false,
        message: "Serviço de SMS não está configurado"
      });
    }
    
    // Envia o SMS
    const success = await sendSms(phoneNumber, message);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: "SMS enviado com sucesso",
        data: {
          to: phoneNumber,
          length: message.length
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Falha ao enviar SMS"
      });
    }
  } catch (error) {
    console.error("Erro ao enviar SMS:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Erro interno ao enviar SMS"
    });
  }
});

// Exporta o roteador
export default smsRouter;