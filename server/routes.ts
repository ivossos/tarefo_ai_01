import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertReminderSchema, 
  insertChatMessageSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import { setupAuthRoutes, isAuthenticated, isAdmin } from "./auth";
import session from "express-session";
import { z } from "zod";
import { generateVerificationCode as generateTelegramCode, startMessengerServices } from "./messenger";
import { 
  startWhatsAppClient, 
  simulateIncomingMessage,
  getQueuedMessagesForPhone,
  clearQueuedMessagesForPhone,
  generateVerificationCode
} from "./whatsapp";
import { 
  sendSms, 
  sendVerificationCode, 
  verifyCode, 
  hasTwilioConfig 
} from "./twilio-messenger";
import { setupVoiceServer, voiceRouter, hasValidVoiceConfig } from "./voice";
import twilio from "twilio";
import { hasValidOpenAIConfig } from "./openai";
import { processMessage, processImage, checkCompliance } from "./tarefo-ai-adapter";
import { addTestRoutes } from "./routes-test";
import { addTestFlowRoutes } from "./test-routes";
import smsRouter from "./routes-sms";
import verifyRouter from "./routes-verify";
import telegramRouter from "./routes-telegram";
import { docsRouter } from "./routes-docs";
import { registerFinanceRoutes } from "./routes-finance";
// Importações para integrações de calendário
import {
  getAuthUrl as getGoogleAuthUrl,
  handleGoogleCallback,
  getGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  syncGoogleCalendar,
  disconnectGoogleCalendar,
  hasGoogleCalendarIntegration
} from "./google-calendar";
import {
  getAuthUrl as getAppleAuthUrl,
  handleAppleCallback,
  getAppleCalendarEvents,
  createAppleCalendarEvent,
  updateAppleCalendarEvent,
  deleteAppleCalendarEvent,
  syncAppleCalendar,
  disconnectAppleCalendar,
  hasAppleCalendarIntegration
} from "./apple-calendar";

// Configuração das rotas de integração com calendários
function setupCalendarRoutes(app: Express) {
  // Rotas para Google Calendar
  app.get("/api/calendar/google/auth-url", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Usamos URL fixo para garantir compatibilidade com o console do Google Cloud
      const authUrl = getGoogleAuthUrl();
      console.log("URL de autenticação Google gerada e enviada ao cliente:", authUrl);
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Erro ao gerar URL de autenticação Google:", error);
      res.status(500).json({ 
        message: "Erro ao gerar URL de autenticação do Google Calendar", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/calendar/google/callback", async (req: Request, res: Response) => {
    // Esta rota é chamada pelo Google após a autenticação
    try {
      await handleGoogleCallback(req, res);
      // O redirecionamento é feito dentro da função handleGoogleCallback
    } catch (error) {
      console.error("Erro no callback do Google:", error);
      res.redirect("/calendar-integration?error=true&provider=google");
    }
  });

  app.get("/api/calendar/google/events", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasGoogleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Google Calendar", 
          needsAuthentication: true 
        });
      }
      
      const events = await getGoogleCalendarEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Erro ao obter eventos do Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao obter eventos do Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/google/events", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasGoogleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Google Calendar", 
          needsAuthentication: true 
        });
      }
      
      const eventData = req.body;
      const googleEvent = await createGoogleCalendarEvent(userId, eventData);
      
      // Atualiza o evento local com o ID do Google
      if (eventData.eventId) {
        await storage.updateEvent(eventData.eventId, {
          googleEventId: googleEvent.id,
          calendarSource: 'google'
        });
      }
      
      res.status(201).json(googleEvent);
    } catch (error) {
      console.error("Erro ao criar evento no Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao criar evento no Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put("/api/calendar/google/events/:googleEventId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { googleEventId } = req.params;
    
    try {
      const hasIntegration = await hasGoogleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Google Calendar", 
          needsAuthentication: true 
        });
      }
      
      const eventData = req.body;
      const updatedEvent = await updateGoogleCalendarEvent(userId, googleEventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Erro ao atualizar evento no Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao atualizar evento no Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/calendar/google/events/:googleEventId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { googleEventId } = req.params;
    
    try {
      const hasIntegration = await hasGoogleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Google Calendar", 
          needsAuthentication: true 
        });
      }
      
      await deleteGoogleCalendarEvent(userId, googleEventId);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir evento do Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao excluir evento do Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/google/sync", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasGoogleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Google Calendar", 
          needsAuthentication: true 
        });
      }
      
      const result = await syncGoogleCalendar(userId);
      res.json(result);
    } catch (error) {
      console.error("Erro ao sincronizar Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao sincronizar Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/google/disconnect", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const success = await disconnectGoogleCalendar(userId);
      if (success) {
        res.json({ message: "Google Calendar desconectado com sucesso" });
      } else {
        res.status(500).json({ message: "Erro ao desconectar Google Calendar" });
      }
    } catch (error) {
      console.error("Erro ao desconectar Google Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao desconectar Google Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Rotas para Apple Calendar
  app.get("/api/calendar/apple/auth-url", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const authUrl = getAppleAuthUrl();
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Erro ao gerar URL de autenticação Apple:", error);
      res.status(500).json({ 
        message: "Erro ao gerar URL de autenticação do Apple Calendar", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/calendar/apple/callback", async (req: Request, res: Response) => {
    // Esta rota é chamada pela Apple após a autenticação
    try {
      await handleAppleCallback(req, res);
      // O redirecionamento é feito dentro da função handleAppleCallback
    } catch (error) {
      console.error("Erro no callback da Apple:", error);
      res.redirect("/calendar-integration?error=true&provider=apple");
    }
  });

  app.get("/api/calendar/apple/events", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasAppleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Apple Calendar", 
          needsAuthentication: true 
        });
      }
      
      const events = await getAppleCalendarEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Erro ao obter eventos do Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao obter eventos do Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/apple/events", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasAppleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Apple Calendar", 
          needsAuthentication: true 
        });
      }
      
      const eventData = req.body;
      const appleEvent = await createAppleCalendarEvent(userId, eventData);
      
      // Atualiza o evento local com o ID da Apple
      if (eventData.eventId) {
        await storage.updateEvent(eventData.eventId, {
          appleEventId: appleEvent.id,
          calendarSource: 'apple'
        });
      }
      
      res.status(201).json(appleEvent);
    } catch (error) {
      console.error("Erro ao criar evento no Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao criar evento no Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put("/api/calendar/apple/events/:appleEventId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { appleEventId } = req.params;
    
    try {
      const hasIntegration = await hasAppleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Apple Calendar", 
          needsAuthentication: true 
        });
      }
      
      const eventData = req.body;
      const updatedEvent = await updateAppleCalendarEvent(userId, appleEventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Erro ao atualizar evento no Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao atualizar evento no Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/calendar/apple/events/:appleEventId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { appleEventId } = req.params;
    
    try {
      const hasIntegration = await hasAppleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Apple Calendar", 
          needsAuthentication: true 
        });
      }
      
      await deleteAppleCalendarEvent(userId, appleEventId);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir evento do Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao excluir evento do Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/apple/sync", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const hasIntegration = await hasAppleCalendarIntegration(userId);
      if (!hasIntegration) {
        return res.status(400).json({ 
          message: "Usuário não tem integração com Apple Calendar", 
          needsAuthentication: true 
        });
      }
      
      const result = await syncAppleCalendar(userId);
      res.json(result);
    } catch (error) {
      console.error("Erro ao sincronizar Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao sincronizar Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/calendar/apple/disconnect", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const success = await disconnectAppleCalendar(userId);
      if (success) {
        res.json({ message: "Apple Calendar desconectado com sucesso" });
      } else {
        res.status(500).json({ message: "Erro ao desconectar Apple Calendar" });
      }
    } catch (error) {
      console.error("Erro ao desconectar Apple Calendar:", error);
      res.status(500).json({ 
        message: "Erro ao desconectar Apple Calendar", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Rota para verificar o status de integração do calendário
  app.get("/api/calendar/status", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    
    try {
      const googleStatus = await hasGoogleCalendarIntegration(userId);
      const appleStatus = await hasAppleCalendarIntegration(userId);
      
      // Busca o calendário preferido do usuário
      const user = await storage.getUser(userId);
      const preferredCalendar = user?.preferredCalendar || 'none';
      
      res.json({
        google: googleStatus,
        apple: appleStatus,
        preferredCalendar
      });
    } catch (error) {
      console.error("Erro ao verificar status de integração do calendário:", error);
      res.status(500).json({ 
        message: "Erro ao verificar status de integração do calendário", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Rota para definir o calendário preferido
  app.post("/api/calendar/preferred", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { provider } = req.body;
    
    if (!['google', 'apple', 'none'].includes(provider)) {
      return res.status(400).json({ message: "Provedor de calendário inválido" });
    }
    
    try {
      // Se o usuário está definindo um calendário como preferido, verificamos se ele tem essa integração
      if (provider === 'google') {
        const hasGoogle = await hasGoogleCalendarIntegration(userId);
        if (!hasGoogle) {
          return res.status(400).json({ 
            message: "Usuário não tem integração com Google Calendar",
            needsAuthentication: true
          });
        }
      } else if (provider === 'apple') {
        const hasApple = await hasAppleCalendarIntegration(userId);
        if (!hasApple) {
          return res.status(400).json({ 
            message: "Usuário não tem integração com Apple Calendar",
            needsAuthentication: true
          });
        }
      }
      
      // Atualiza a preferência do usuário
      const updatedUser = await storage.updateUser(userId, {
        preferredCalendar: provider
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Erro ao atualizar preferência de calendário" });
      }
      
      res.json({ 
        message: `Calendário preferido definido como ${provider}`,
        preferredCalendar: provider
      });
    } catch (error) {
      console.error("Erro ao definir calendário preferido:", error);
      res.status(500).json({ 
        message: "Erro ao definir calendário preferido", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });
}

// Configuração das rotas de administração
function setupAdminRoutes(app: Express) {
  // Rota para obter todos os usuários
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Obter todos os usuários (implementação simples para exemplo)
      // Em um ambiente de produção, você deve adicionar paginação
      const users = await storage.getAllUsers();
      
      // Remover senhas para segurança
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      res.status(500).json({ message: "Erro ao obter usuários" });
    }
  });

  // Rota para obter todos os eventos
  app.get("/api/admin/events", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Erro ao obter eventos:", error);
      res.status(500).json({ message: "Erro ao obter eventos" });
    }
  });

  // Rota para obter todos os lembretes
  app.get("/api/admin/reminders", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Erro ao obter lembretes:", error);
      res.status(500).json({ message: "Erro ao obter lembretes" });
    }
  });

  // Rota para obter todas as mensagens de chat
  app.get("/api/admin/chat-messages", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Erro ao obter mensagens:", error);
      res.status(500).json({ message: "Erro ao obter mensagens" });
    }
  });

  // Rota para obter todos os logs do sistema
  app.get("/api/admin/logs", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Esta é uma implementação simples para exemplo
      // Em um ambiente real, você teria um sistema de logs mais robusto
      res.json([
        { id: 1, timestamp: new Date(), level: "info", message: "Sistema iniciado", details: {} },
        { id: 2, timestamp: new Date(), level: "warn", message: "Falha na conexão com WhatsApp", details: {} },
      ]);
    } catch (error) {
      console.error("Erro ao obter logs:", error);
      res.status(500).json({ message: "Erro ao obter logs" });
    }
  });

  // Rota para promover um usuário a administrador
  app.put("/api/admin/users/:id/promote", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const updatedUser = await storage.updateUser(id, { role: "admin" });
      if (!updatedUser) {
        return res.status(500).json({ message: "Falha ao promover usuário" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
      res.status(500).json({ message: "Erro ao promover usuário" });
    }
  });

  // Rota para remover privilégios de administrador
  // Rotas para administradores excluírem artefatos

  // Rota para excluir usuário (apenas administradores)
  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }

      // Não permitir excluir a si mesmo
      if (id === req.session.userId) {
        return res.status(403).json({ message: "Você não pode excluir sua própria conta" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verificar se não é o usuário system_admin
      if (user.username === 'system_admin') {
        return res.status(403).json({ message: "O administrador do sistema não pode ser excluído" });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "Falha ao excluir usuário" });
      }

      console.log(`Usuário ${id} excluído pelo administrador ${req.session.userId}`);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      res.status(500).json({ message: "Erro ao excluir usuário" });
    }
  });

  // Rota para editar usuário (apenas administradores)
  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verificar se não está tentando alterar a senha do system_admin
      if (user.username === 'system_admin' && req.body.password) {
        return res.status(403).json({ message: "A senha do administrador do sistema não pode ser alterada" });
      }

      // Validação dos dados
      // Aqui você pode adicionar validações adicionais dependendo dos campos permitidos para edição
      
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(500).json({ message: "Falha ao atualizar usuário" });
      }

      // Remover a senha da resposta
      const { password, ...userWithoutPassword } = updatedUser;
      console.log(`Usuário ${id} editado pelo administrador ${req.session.userId}`);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      res.status(500).json({ message: "Erro ao editar usuário" });
    }
  });

  // Rota para excluir evento (apenas administradores)
  app.delete("/api/admin/events/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(500).json({ message: "Falha ao excluir evento" });
      }

      console.log(`Evento ${id} excluído pelo administrador ${req.session.userId}`);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      res.status(500).json({ message: "Erro ao excluir evento" });
    }
  });

  // Rota para editar evento (apenas administradores)
  app.put("/api/admin/events/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      // Validação dos dados
      // Aqui você pode adicionar validações adicionais dependendo dos campos permitidos para edição
      
      const updatedEvent = await storage.updateEvent(id, req.body);
      if (!updatedEvent) {
        return res.status(500).json({ message: "Falha ao atualizar evento" });
      }

      console.log(`Evento ${id} editado pelo administrador ${req.session.userId}`);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Erro ao editar evento:", error);
      res.status(500).json({ message: "Erro ao editar evento" });
    }
  });

  // Rota para excluir lembrete (apenas administradores)
  app.delete("/api/admin/reminders/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de lembrete inválido" });
      }

      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ message: "Lembrete não encontrado" });
      }

      const success = await storage.deleteReminder(id);
      if (!success) {
        return res.status(500).json({ message: "Falha ao excluir lembrete" });
      }

      console.log(`Lembrete ${id} excluído pelo administrador ${req.session.userId}`);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir lembrete:", error);
      res.status(500).json({ message: "Erro ao excluir lembrete" });
    }
  });

  // Rota para editar lembrete (apenas administradores)
  app.put("/api/admin/reminders/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de lembrete inválido" });
      }

      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ message: "Lembrete não encontrado" });
      }

      // Validação dos dados
      // Aqui você pode adicionar validações adicionais dependendo dos campos permitidos para edição
      
      const updatedReminder = await storage.updateReminder(id, req.body);
      if (!updatedReminder) {
        return res.status(500).json({ message: "Falha ao atualizar lembrete" });
      }

      console.log(`Lembrete ${id} editado pelo administrador ${req.session.userId}`);
      res.json(updatedReminder);
    } catch (error) {
      console.error("Erro ao editar lembrete:", error);
      res.status(500).json({ message: "Erro ao editar lembrete" });
    }
  });

  // Rota para excluir mensagem de chat (apenas administradores)
  app.delete("/api/admin/chat-messages/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de mensagem inválido" });
      }

      const message = await storage.getChatMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }

      const success = await storage.deleteChatMessage(id);
      if (!success) {
        return res.status(500).json({ message: "Falha ao excluir mensagem" });
      }

      console.log(`Mensagem de chat ${id} excluída pelo administrador ${req.session.userId}`);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      res.status(500).json({ message: "Erro ao excluir mensagem" });
    }
  });

  // Rotas originais de promoção/rebaixamento para funções administrativas
  app.put("/api/admin/users/:id/promote", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const updatedUser = await storage.updateUser(id, { role: "admin" });
      if (!updatedUser) {
        return res.status(500).json({ message: "Falha ao remover privilégios" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao remover privilégios:", error);
      res.status(500).json({ message: "Erro ao remover privilégios" });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS já está configurado no index.ts
  
  // Configurar rotas de autenticação (login, registro, logout, perfil)
  setupAuthRoutes(app);
  
  // Rotas de administração
  setupAdminRoutes(app);
  
  // Rotas de calendário
  setupCalendarRoutes(app);
  
  // Rotas de SMS
  app.use('/api/sms', smsRouter);
  
  // Rotas de verificação
  app.use('/api/verify', verifyRouter);
  
  // Rotas do Telegram
  app.use('/api/telegram', telegramRouter);
  
  // Rotas de documentação
  app.use('/api/docs', docsRouter);
  
  // Rotas de voz
  app.use('/api/voice', voiceRouter);
  
  // Obter detalhes de um usuário específico
  app.get("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuário inválido" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    // Não retornar a senha
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Event routes - protegidas por autenticação
  app.get("/api/events", isAuthenticated, async (req: Request, res: Response) => {
    // Usa o ID do usuário da sessão ao invés do parâmetro
    const userId = req.session.userId!;
    const requestedUserId = req.query.userId ? parseInt(req.query.userId as string) : userId;
    
    // Log para depuração
    console.log(`Buscando eventos para userId: ${userId}, requestedUserId: ${requestedUserId}`);
    
    // Verifica se o usuário está tentando acessar seus próprios dados
    if (requestedUserId !== userId) {
      console.warn(`Acesso negado: Usuario ${userId} tentando acessar eventos do usuário ${requestedUserId}`);
      return res.status(403).json({ message: "Você só pode acessar seus próprios eventos" });
    }
    
    try {
      const events = await storage.getEventsByUserId(userId);
      console.log(`Retornando ${events.length} eventos para o usuário ${userId}`);
      res.json(events);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      res.status(500).json({ message: "Erro ao buscar eventos" });
    }
  });
  
  app.get("/api/events/date", isAuthenticated, async (req: Request, res: Response) => {
    // Usa o ID do usuário da sessão ao invés do parâmetro
    const userId = req.session.userId!;
    const requestedUserId = parseInt(req.query.userId as string);
    const dateStr = req.query.date as string;
    
    // Verifica se o usuário está tentando acessar seus próprios dados
    if (requestedUserId !== userId) {
      return res.status(403).json({ message: "Você só pode acessar seus próprios eventos" });
    }
    
    if (!dateStr) {
      return res.status(400).json({ message: "Data inválida" });
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Formato de data inválido" });
    }
    
    const events = await storage.getEventsByDate(userId, date);
    res.json(events);
  });
  
  app.get("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    
    // Verifica se o evento pertence ao usuário autenticado
    if (event.userId !== userId) {
      return res.status(403).json({ message: "Você não tem permissão para acessar este evento" });
    }
    
    res.json(event);
  });
  
  app.post("/api/events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let eventData = insertEventSchema.parse(req.body);
      
      // Garante que o evento seja criado apenas para o usuário autenticado
      if (eventData.userId !== userId) {
        return res.status(403).json({ 
          message: "Você só pode criar eventos para sua própria conta" 
        });
      }
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de evento inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar evento" });
    }
  });
  
  app.put("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const success = await storage.deleteEvent(id);
    if (!success) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(204).send();
  });
  
  // Reminder routes - protegidas por autenticação
  app.get("/api/reminders", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const reminders = await storage.getRemindersByUserId(userId);
    res.json(reminders);
  });
  
  app.get("/api/reminders/upcoming", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const limit = parseInt(req.query.limit as string || "5");
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const reminders = await storage.getUpcomingReminders(userId, limit);
    res.json(reminders);
  });
  
  app.get("/api/reminders/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reminder ID" });
    }
    
    const reminder = await storage.getReminder(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    res.json(reminder);
  });
  
  app.post("/api/reminders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });
  
  app.put("/api/reminders/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reminder ID" });
    }
    
    try {
      const reminderData = insertReminderSchema.partial().parse(req.body);
      const updatedReminder = await storage.updateReminder(id, reminderData);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });
  
  app.delete("/api/reminders/:id", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reminder ID" });
    }
    
    const success = await storage.deleteReminder(id);
    if (!success) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    res.status(204).send();
  });
  
  // Chat routes - protegidas por autenticação
  app.get("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const limit = parseInt(req.query.limit as string || "20");
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const messages = await storage.getChatMessagesByUserId(userId, limit);
    res.json(messages);
  });
  
  app.post("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
      
      // If this is a user message, create a response using TarefoAI (CrewAI)
      if (messageData.isFromUser) {
        setTimeout(async () => {
          // Processar a mensagem usando o framework CrewAI
          const aiResponse = {
            userId: messageData.userId,
            content: await processMessage(
              messageData.userId, 
              messageData.content,
              messageData.platform || 'app'
            ),
            isFromUser: false,
            platform: messageData.platform
          };
          
          await storage.createChatMessage(aiResponse);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Notification routes - protegidas por autenticação
  app.get("/api/notifications", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const notifications = await storage.getNotificationsByUserId(userId);
    res.json(notifications);
  });
  
  app.get("/api/notifications/unread", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const notifications = await storage.getUnreadNotificationsByUserId(userId);
    res.json(notifications);
  });
  
  app.post("/api/notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  app.put("/api/notifications/:id/read", isAuthenticated, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    const success = await storage.markNotificationAsRead(id);
    if (!success) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(204).send();
  });
  
  app.put("/api/notifications/read-all", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    await storage.markAllNotificationsAsRead(userId);
    res.status(204).send();
  });
  
  // Novas rotas para integração com CrewAI
  
  // Endpoint para processar imagens (OCR)
  app.post("/api/ocr", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number(),
        imagePath: z.string(),
        extractType: z.enum(["full", "receipt", "invoice"]).optional()
      });
      
      const { userId, imagePath, extractType = "full" } = schema.parse(req.body);
      
      // Verifica se o usuário existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Processa a imagem usando o TarefoAI (CrewAI)
      const result = await processImage(userId, imagePath, extractType);
      
      // Cria uma notificação para o usuário
      await storage.createNotification({
        userId,
        title: "Processamento de imagem concluído",
        content: `Sua imagem foi processada com sucesso usando o Agente OCR.`,
        type: "ocr",
        isRead: false,
        relatedEntityId: null,
        relatedEntityType: null
      });
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao processar OCR:", error);
      res.status(500).json({ message: "Falha ao processar a imagem" });
    }
  });
  
  // Endpoint para verificar conformidade LGPD/GDPR
  app.post("/api/compliance/check", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        operation: z.string(),
        data: z.record(z.any())
      });
      
      const { operation, data } = schema.parse(req.body);
      
      // Verifica a conformidade usando o TarefoAI (CrewAI)
      const result = await checkCompliance(operation, data);
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao verificar conformidade:", error);
      res.status(500).json({ message: "Falha ao verificar conformidade" });
    }
  });
  
  // Endpoint para mensagens e integração com o Telegram - protegido por autenticação
  app.post("/api/verify/messenger", isAuthenticated, async (req: Request, res: Response) => {
    const schema = z.object({
      phone: z.string().optional(),
      userId: z.number().optional(),
      platform: z.enum(["telegram", "whatsapp"]),
      test: z.boolean().optional()
    });
    
    try {
      const { phone, userId, platform, test } = schema.parse(req.body);
      
      // Modo de teste - não requer usuário válido
      if (test === true) {
        // Verificar apenas a disponibilidade do bot do Telegram
        let statusInfo = {};
        
        if (platform === "telegram") {
          const isBotRunning = !!process.env.TELEGRAM_BOT_TOKEN;
          
          statusInfo = {
            telegramIntegration: isBotRunning ? "ativo" : "inativo",
            telegramBot: isBotRunning ? "@TarefoAI_bot" : "indisponível"
          };
          
          return res.json({ 
            success: isBotRunning, 
            message: isBotRunning ? "Bot do Telegram está configurado e ativo" : "Bot do Telegram não está configurado",
            ...statusInfo
          });
        } else {
          return res.json({
            success: false,
            message: "Teste de WhatsApp não implementado"
          });
        }
      }
      
      // Modo normal - requer usuário válido
      if (!userId) {
        return res.status(400).json({ message: "ID de usuário é obrigatório" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Gera um código de verificação
      const verificationCode = generateVerificationCode(phone);
      
      // Cria uma notificação para o usuário com instruções específicas para a plataforma
      let title = "";
      let content = "";
      
      if (platform === "telegram") {
        title = "Verificação do Telegram";
        content = `Seu código de verificação do Telegram é: ${verificationCode}. Compartilhe este código com o bot do Telegram @TarefoAI_bot para completar a vinculação.`;
      } else { // whatsapp
        title = "Verificação do WhatsApp";
        content = `Seu código de verificação do WhatsApp é: ${verificationCode}. O WhatsApp Web será usado pelo servidor para enviar mensagens para você. Devido a limitações técnicas, esta funcionalidade é apenas ilustrativa e não está totalmente implementada.`;
      }
      
      // Cria a notificação com o código
      await storage.createNotification({
        userId,
        title,
        content,
        type: "verification",
        isRead: false,
        relatedEntityId: null,
        relatedEntityType: null
      });
      
      // Verifica o status do bot do Telegram para fornecer feedback mais preciso
      let statusInfo = {};
      
      if (platform === "telegram") {
        // Importa o módulo messenger e verifica o estado do bot
        const messenger = await import('./messenger');
        // O bot é uma variável privada dentro do módulo, então verificamos se o token existe
        const isBotRunning = !!process.env.TELEGRAM_BOT_TOKEN;
        
        statusInfo = {
          telegramIntegration: isBotRunning ? "ativo" : "inativo",
          telegramBot: isBotRunning ? "@TarefoAI_bot" : "indisponível",
          instruções: isBotRunning 
            ? "Adicione o bot @TarefoAI_bot e envie o código de verificação para concluir a integração."
            : "O bot do Telegram está temporariamente indisponível. Você ainda pode usar o código para verificação quando o serviço estiver ativo novamente."
        };
      }
      
      res.json({ 
        success: true, 
        message: "Código de verificação gerado com sucesso", 
        ...statusInfo
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao gerar código de verificação" });
    }
  });

  // Rotas de integração de voz - protegidas por autenticação
  app.get("/api/voice/status", isAuthenticated, async (req: Request, res: Response) => {
    const hasConfig = hasValidVoiceConfig();
    res.json({
      enabled: hasConfig,
      message: hasConfig 
        ? "Serviço de voz está configurado e pronto para uso." 
        : "Configuração de voz incompleta. Verifique as variáveis de ambiente."
    });
  });

  // TwiML para chamadas telefônicas
  app.post("/api/voice/twiml", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    // Cria um objeto de resposta TwiML
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Adiciona uma mensagem de boas-vindas
    twiml.say({
      voice: 'woman',
      language: 'pt-BR'
    }, 'Olá! Esse é o assistente de voz do Tarefo AI. Como posso ajudar você hoje?');
    
    // Configura a gravação da chamada para processamento
    twiml.record({
      action: `/api/voice/recording?userId=${userId}`,
      transcribe: true,
      transcribeCallback: `/api/voice/transcription?userId=${userId}`,
      maxLength: 30,
      playBeep: true
    });
    
    // Adiciona pausa e mensagem de encerramento
    twiml.pause({ length: 1 });
    twiml.say({
      voice: 'woman',
      language: 'pt-BR'
    }, 'Obrigado por usar o TarefoAI. Sua mensagem será processada.');
    
    // Envia a resposta TwiML
    res.type('text/xml');
    res.send(twiml.toString());
  });
  
  // Endpoint para receber gravações de chamadas
  app.post("/api/voice/recording", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const recordingUrl = req.body.RecordingUrl;
    const callSid = req.body.CallSid;
    
    if (recordingUrl && userId) {
      try {
        // Notifica o usuário sobre a nova gravação
        await storage.createNotification({
          userId,
          title: "Nova mensagem de voz",
          content: "Sua mensagem de voz foi recebida e está sendo processada.",
          type: "voice",
          isRead: false,
          relatedEntityId: callSid,
          relatedEntityType: "call"
        });
        
        res.status(200).send("Recording received");
      } catch (error) {
        console.error("Erro ao processar gravação:", error);
        res.status(500).send("Error processing recording");
      }
    } else {
      res.status(400).send("Missing required parameters");
    }
  });
  
  // Endpoint para receber transcrições de chamadas
  app.post("/api/voice/transcription", isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const transcriptionText = req.body.TranscriptionText;
    const callSid = req.body.CallSid;
    
    if (transcriptionText && userId) {
      try {
        // Armazena a mensagem de voz transcrita
        await storage.createChatMessage({
          userId,
          content: transcriptionText,
          isFromUser: true,
          platform: "voice"
        });
        
        // Processa a mensagem e gera resposta através do TarefoAI (CrewAI)
        const aiResponseText = await processMessage(userId, transcriptionText, 'voice');
        
        // Armazena a resposta do AI
        await storage.createChatMessage({
          userId,
          content: aiResponseText,
          isFromUser: false,
          platform: "voice"
        });
        
        // Notifica o usuário sobre a transcrição
        await storage.createNotification({
          userId,
          title: "Transcrição de voz processada",
          content: `Sua mensagem: "${transcriptionText}" foi processada.`,
          type: "voice",
          isRead: false,
          relatedEntityId: callSid,
          relatedEntityType: "transcription"
        });
        
        res.status(200).send("Transcription processed");
      } catch (error) {
        console.error("Erro ao processar transcrição:", error);
        res.status(500).send("Error processing transcription");
      }
    } else {
      res.status(400).send("Missing required parameters");
    }
  });

  // Callback de status para chamadas Twilio
  app.post("/api/voice/status", async (req: Request, res: Response) => {
    const callStatus = req.body.CallStatus;
    const callSid = req.body.CallSid;
    
    console.log(`Status da chamada ${callSid}: ${callStatus}`);
    res.status(200).send("Status received");
  });

  // Adicionar rotas de webhook para o WhatsApp
  app.post("/api/webhooks/whatsapp", async (req: Request, res: Response) => {
    try {
      // Verifica se a requisição é uma verificação de desafio do WhatsApp
      if (req.query && req.query.hub_mode === 'subscribe' && req.query.hub_verify_token) {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'tarefo_ai_verify_token';
        
        if (req.query.hub_verify_token === verifyToken) {
          console.log("✅ WhatsApp Webhook verificado com sucesso");
          // Responde com o desafio para confirmar a verificação
          return res.status(200).send(req.query.hub_challenge);
        }
        
        // Token inválido
        console.error("❌ Falha na verificação do webhook - token inválido");
        return res.sendStatus(403);
      }
      
      // Importa o módulo do WhatsApp para processar a mensagem
      const { processWebhookMessage } = await import('./whatsapp');
      
      // Processa notificações de mensagens recebidas
      if (req.body && req.body.object === 'whatsapp_business_account') {
        // Processa eventos de mensagens
        const entries = req.body.entry || [];
        let processedMessages = 0;
        
        for (const entry of entries) {
          const changes = entry.changes || [];
          
          for (const change of changes) {
            if (change.field === 'messages') {
              const value = change.value || {};
              const messages = value.messages || [];
              
              for (const message of messages) {
                // Registra a mensagem recebida para debug
                console.log(`📨 Mensagem WhatsApp recebida: ${JSON.stringify(message)}`);
                
                // Cria o objeto no formato esperado pelo processWebhookMessage
                const formattedMessage = {
                  from: message.from || '',
                  body: message.text?.body || '',
                  id: message.id || ''
                };
                
                // Processa a mensagem usando a função específica
                await processWebhookMessage(formattedMessage);
                processedMessages++;
              }
            }
          }
        }
        
        // Responde com 200 OK para confirmar recebimento
        return res.status(200).json({ 
          success: true, 
          messagesProcessed: processedMessages 
        });
      }
      
      // Resposta padrão para outras requisições
      res.status(400).json({ message: "Requisição inválida" });
    } catch (error) {
      console.error("❌ Erro ao processar webhook do WhatsApp:", error);
      res.status(500).json({ message: "Erro ao processar webhook" });
    }
  });
  
  // Rota para simular o envio de mensagens do WhatsApp (ambiente de desenvolvimento)
  app.post("/api/whatsapp/simulate", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Número de telefone e mensagem são obrigatórios" 
        });
      }
      
      // Simula uma mensagem do WhatsApp
      await simulateIncomingMessage(phoneNumber, message);
      
      res.status(200).json({ 
        success: true, 
        message: "Mensagem simulada com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao simular mensagem:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao simular mensagem WhatsApp" 
      });
    }
  });
  
  // Rota para obter mensagens pendentes para um número específico
  app.get("/api/whatsapp/messages/:phone", async (req: Request, res: Response) => {
    try {
      const { phone } = req.params;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Número de telefone é obrigatório" 
        });
      }
      
      const messages = getQueuedMessagesForPhone(phone);
      
      res.status(200).json({ 
        success: true, 
        messages 
      });
    } catch (error) {
      console.error("Erro ao obter mensagens:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao obter mensagens WhatsApp" 
      });
    }
  });
  
  // Rota para limpar mensagens pendentes para um número específico
  app.delete("/api/whatsapp/messages/:phone", async (req: Request, res: Response) => {
    try {
      const { phone } = req.params;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Número de telefone é obrigatório" 
        });
      }
      
      clearQueuedMessagesForPhone(phone);
      
      res.status(200).json({ 
        success: true, 
        message: "Mensagens removidas com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao limpar mensagens:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao limpar mensagens WhatsApp" 
      });
    }
  });
  
  // Adicionar rotas de teste do TarefoAI (não exigem autenticação para facilitar testes)
  addTestRoutes(app);
  addTestFlowRoutes(app);
  
  // Registrar rotas de finanças
  registerFinanceRoutes(app);

  const httpServer = createServer(app);
  
  // Inicia os serviços de mensageria (Telegram e WhatsApp)
  setTimeout(async () => {
    try {
      // Inicializa o serviço do Telegram
      await startMessengerServices();
      
      // Inicializa o cliente do WhatsApp
      try {
        await startWhatsAppClient();
        console.log("📱 Serviço do WhatsApp iniciado com sucesso");
      } catch (whatsappError) {
        console.error("❌ Erro ao iniciar cliente WhatsApp:", whatsappError);
        console.log("⚠️ A integração com WhatsApp não estará disponível. Usuários ainda podem se comunicar via Telegram ou interface web.");
      }
    } catch (error) {
      console.error("Erro ao iniciar serviços de mensageria:", error);
    }
  }, 100); // Pequeno atraso para garantir que o servidor HTTP já esteja pronto
  
  // Verifica se a API do OpenAI está configurada corretamente
  if (hasValidOpenAIConfig()) {
    console.log("✅ OpenAI API configurada com sucesso para o processamento de mensagens");
  } else {
    console.warn("⚠️ OPENAI_API_KEY não está configurada. O chat usará respostas limitadas.");
  }
  
  // Configura o servidor WebSocket para serviço de voz se configuração estiver válida
  if (hasValidVoiceConfig()) {
    setupVoiceServer(httpServer);
    console.log("🎤 Serviço de voz AI inicializado com sucesso");
  } else {
    console.warn("⚠️ Configuração de voz incompleta, serviço de voz não iniciado");
  }
  
  // Rota de diagnóstico para verificar a URL de autenticação do Google
  app.get("/api/debug/google-auth-url", async (req: Request, res: Response) => {
    try {
      const authUrl = getGoogleAuthUrl();
      const redirectUrl = process.env.GOOGLE_REDIRECT_URL;
      console.log("URL de redirecionamento configurada:", redirectUrl);
      console.log("URL de autenticação gerada:", authUrl);
      res.json({ 
        authUrl,
        redirectUrl,
        env: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error("Erro ao gerar URL de diagnóstico:", error);
      res.status(500).json({ 
        error: "Falha ao gerar URL de diagnóstico", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  return httpServer;
}
