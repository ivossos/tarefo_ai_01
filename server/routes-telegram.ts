/**
 * Rotas do Telegram - Implementação de rotas para integração com o Telegram
 */
import express, { Request, Response, Router } from "express";
import { isAuthenticated } from "./auth";
import { sendTelegramMessage } from "./messenger";
import { verificationCodes } from "./messenger";

export const telegramRouter = Router();

// Verifica o status da integração com o Telegram
telegramRouter.get('/status', (req: Request, res: Response) => {
  try {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      res.status(200).json({
        status: 'online',
        botName: '@TarefoAI_bot',
        message: 'Integração com Telegram está disponível'
      });
    } else {
      res.status(503).json({ 
        status: 'offline',
        message: 'Token do Telegram não configurado'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Erro ao verificar status do Telegram'
    });
  }
});

// Enviar mensagem via Telegram
telegramRouter.post('/send', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Chat ID e mensagem são obrigatórios' 
      });
    }
    
    const result = await sendTelegramMessage(parseInt(chatId), message);
    
    if (result) {
      return res.status(200).json({ 
        success: true, 
        message: 'Mensagem enviada com sucesso' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Falha ao enviar mensagem' 
      });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem pelo Telegram:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao processar solicitação' 
    });
  }
});

// Obter chat ID associado a um usuário
telegramRouter.get('/chat-id/:userId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Aqui precisaríamos de um método para obter o chat ID do Telegram
    // associado a um usuário específico do nosso sistema
    // Isso normalmente seria armazenado no banco de dados após a verificação
    
    // Como exemplo, retornamos um erro
    return res.status(404).json({
      success: false,
      message: 'Chat ID não encontrado para este usuário'
    });
  } catch (error) {
    console.error('Erro ao obter chat ID do Telegram:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar solicitação'
    });
  }
});

// Webhook para receber atualizações do Telegram
telegramRouter.post('/webhook', (req: Request, res: Response) => {
  try {
    const update = req.body;
    console.log('Atualização recebida do Telegram:', JSON.stringify(update));
    
    // Aqui processaríamos as atualizações do webhook
    // Isso seria implementado para um ambiente de produção
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao processar webhook do Telegram:', error);
    res.sendStatus(500);
  }
});

export default telegramRouter;