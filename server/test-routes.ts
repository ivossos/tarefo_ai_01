import type { Request, Response } from "express";
import { processMessage, processImage, checkCompliance } from "./tarefo-ai-adapter";
import fs from "fs";
import path from "path";

/**
 * Rotas para testes completos de agentes do TarefoAI
 * Estas rotas permitem testar o fluxo completo de cada um dos agentes
 */
export function addTestFlowRoutes(app: any) {
  // Teste de processamento de mensagem
  app.post("/api/test/message", async (req: Request, res: Response) => {
    try {
      const { message, user_id = 999 } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: "Mensagem é obrigatória" 
        });
      }
      
      console.log('🧪 Testando processamento de mensagem: "' + message + '" (user_id: ' + user_id + ')');
      
      // Processa a mensagem usando o adaptador
      const response = await processMessage(user_id, message, "test");
      
      console.log('✅ Mensagem processada: "' + response.substring(0, 100) + '..."');
      res.json({ 
        success: true, 
        message: "Mensagem processada com sucesso",
        request: message,
        response
      });
      
    } catch (error) {
      console.error("❌ Erro ao processar mensagem de teste:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao processar mensagem: " + (error instanceof Error ? error.message : String(error))
      });
    }
  });

  // Teste de OCR (processamento de imagem)
  app.post("/api/test/ocr", async (req: Request, res: Response) => {
    try {
      const { image_path, extract_type = "full", user_id = 999 } = req.body;
      
      if (!image_path) {
        return res.status(400).json({ 
          success: false, 
          message: "Caminho da imagem é obrigatório" 
        });
      }
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(image_path)) {
        return res.status(400).json({ 
          success: false, 
          message: "Arquivo não encontrado: " + image_path
        });
      }
      
      console.log('🧪 Testando processamento OCR da imagem: "' + image_path + '" (tipo: ' + extract_type + ')');
      
      // Processa a imagem usando o adaptador
      const result = await processImage(user_id, image_path, extract_type);
      
      console.log("✅ Imagem processada com sucesso");
      res.json({ 
        success: true, 
        message: "Imagem processada com sucesso",
        result
      });
      
    } catch (error) {
      console.error("❌ Erro ao processar imagem de teste:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao processar imagem: " + (error instanceof Error ? error.message : String(error))
      });
    }
  });

  // Teste de criação de evento no calendário
  app.post("/api/test/calendar", async (req: Request, res: Response) => {
    try {
      const { title, date, time, duration = 60, user_id = 999 } = req.body;
      
      if (!title || !date || !time) {
        return res.status(400).json({ 
          success: false, 
          message: "Título, data e hora são obrigatórios" 
        });
      }
      
      console.log('🧪 Testando criação de evento: "' + title + '" (data: ' + date + ' ' + time + ')');
      
      // Formata a mensagem para processamento
      const message = 'Crie um evento de calendário chamado "' + title + '" no dia ' + date + ' às ' + time + ' com duração de ' + duration + ' minutos';
      
      // Processa a mensagem usando o adaptador
      const response = await processMessage(user_id, message, "test");
      
      // Retorna um resultado formatado
      const eventDate = new Date(date + 'T' + time);
      const eventEndDate = new Date(eventDate.getTime() + duration * 60000);
      
      const result = {
        title,
        start: eventDate.toISOString(),
        end: eventEndDate.toISOString(),
        duration_minutes: duration,
        created_at: new Date().toISOString(),
        response_message: response
      };
      
      console.log("✅ Evento criado com sucesso");
      res.json({ 
        success: true, 
        message: "Evento criado com sucesso",
        result
      });
      
    } catch (error) {
      console.error("❌ Erro ao criar evento de teste:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao criar evento: " + (error instanceof Error ? error.message : String(error))
      });
    }
  });

  // Teste de criação de lembrete
  app.post("/api/test/reminder", async (req: Request, res: Response) => {
    try {
      const { text, date, time, priority = "normal", user_id = 999 } = req.body;
      
      if (!text || !date || !time) {
        return res.status(400).json({ 
          success: false, 
          message: "Texto, data e hora são obrigatórios" 
        });
      }
      
      console.log('🧪 Testando criação de lembrete: "' + text + '" (data: ' + date + ' ' + time + ', prioridade: ' + priority + ')');
      
      // Formata a mensagem para processamento
      const importantText = priority === "high" ? "importante" : "";
      const message = 'Crie um lembrete ' + importantText + ' para "' + text + '" no dia ' + date + ' às ' + time;
      
      // Processa a mensagem usando o adaptador
      const response = await processMessage(user_id, message, "test");
      
      // Retorna um resultado formatado
      const reminderDate = new Date(date + 'T' + time);
      
      const result = {
        text,
        date: reminderDate.toISOString(),
        priority,
        created_at: new Date().toISOString(),
        response_message: response
      };
      
      console.log("✅ Lembrete criado com sucesso");
      res.json({ 
        success: true, 
        message: "Lembrete criado com sucesso",
        result
      });
      
    } catch (error) {
      console.error("❌ Erro ao criar lembrete de teste:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao criar lembrete: " + (error instanceof Error ? error.message : String(error))
      });
    }
  });

  // Teste de verificação de conformidade
  app.post("/api/test/compliance", async (req: Request, res: Response) => {
    try {
      const { operation, data, user_id = 999 } = req.body;
      
      if (!operation || !data) {
        return res.status(400).json({ 
          success: false, 
          message: "Operação e dados são obrigatórios" 
        });
      }
      
      console.log('🧪 Testando verificação de conformidade: "' + operation + '"');
      
      // Adiciona user_id se não estiver presente
      const complianceData = { ...data };
      if (!complianceData.user_id) {
        complianceData.user_id = user_id;
      }
      
      // Verifica conformidade usando o adaptador
      const result = await checkCompliance(operation, complianceData);
      
      const complianceStatus = result.compliant ? "Conforme" : "Não conforme";
      console.log("✅ Verificação de conformidade concluída: " + complianceStatus);
      
      res.json({ 
        success: true, 
        message: "Verificação de conformidade concluída",
        result
      });
      
    } catch (error) {
      console.error("❌ Erro ao verificar conformidade:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao verificar conformidade: " + (error instanceof Error ? error.message : String(error))
      });
    }
  });
}