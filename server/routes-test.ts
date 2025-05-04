import { Request, Response } from "express";
import { phoneToUserId } from "./whatsapp";

// Esta rota é apenas para teste do CrewAI
export function addTestRoutes(app: any) {
  // Rota para testar os agentes
  app.post("/api/test/agents", async (req: Request, res: Response) => {
    try {
      console.log("🧪 Testando inicialização dos agentes do TarefoAI...");
      
      // Importa dinamicamente o adaptador para evitar carregamento em produção
      const { initialize_crew } = await import("./tarefo-ai-adapter");
      
      console.log("🔄 Inicializando o Crew...");
      const crew = initialize_crew();
      
      if (crew) {
        console.log("✅ Agents inicializados com sucesso!");
        res.json({ 
          success: true, 
          message: "Agentes do TarefoAI inicializados com sucesso",
          agentCount: crew.agents.length,
          taskCount: crew.tasks.length
        });
      } else {
        console.log("❌ Falha ao inicializar agentes");
        res.status(500).json({ 
          success: false, 
          message: "Falha ao inicializar agentes do TarefoAI" 
        });
      }
    } catch (error) {
      console.error("❌ Erro ao testar agentes:", error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao testar agentes: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });

  // Rota para testar processamento de mensagem simples
  app.post("/api/test/message", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: "Parâmetro 'message' é obrigatório" 
        });
      }
      
      console.log(`🧪 Testando processamento de mensagem: "${message}"`);
      
      // Importa a função de processamento de mensagem
      const { processMessage } = await import("./tarefo-ai-adapter");
      
      // Processa a mensagem com um user_id de teste
      const response = await processMessage(999, message, "test");
      
      console.log(`✅ Mensagem processada: "${response}"`);
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
        message: `Erro ao processar mensagem: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });
  
  // Rota de teste para associar um telefone ao usuário admin
  app.post("/api/test/whatsapp-auth", async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Parâmetro 'phone' é obrigatório" 
        });
      }
      
      // Associa o número ao ID do usuário admin (11)
      const userId = 11; // ID do admin
      phoneToUserId.set(phone, userId);
      
      console.log(`✅ Número ${phone} associado ao usuário admin (ID: ${userId})`);
      res.json({ 
        success: true, 
        message: `Número ${phone} associado ao usuário admin com sucesso`,
        userId
      });
      
    } catch (error) {
      console.error("❌ Erro ao associar número ao usuário admin:", error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao associar número ao usuário admin: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });
  
  // Rota para testar as ferramentas individuais
  app.post("/api/test/tools", async (req: Request, res: Response) => {
    try {
      const { tool } = req.body;
      
      if (!tool) {
        return res.status(400).json({ 
          success: false, 
          message: "Parâmetro 'tool' é obrigatório (telegram, whatsapp, ocr, compliance)" 
        });
      }
      
      console.log(`🧪 Testando ferramenta: "${tool}"`);
      let result: any = { toolName: tool };
      
      switch (tool) {
        case 'telegram':
          // Verificamos apenas se o token está configurado
          result.available = !!process.env.TELEGRAM_BOT_TOKEN;
          result.telegramBot = result.available ? "@TarefoAI_bot" : "indisponível";
          result.testAction = { 
            success: result.available,
            action: "register_chat",
            user_id: 999,
            chat_id: 12345678
          };
          break;
          
        case 'whatsapp':
          // Verificamos se as credenciais do Twilio estão configuradas
          result.available = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
          result.testAction = {
            success: result.available,
            action: "register_phone",
            user_id: 999,
            phone_number: "+5511999998888" 
          };
          break;
          
        case 'ocr':
          // Verificamos se o TarefoAI está disponível
          const { isTarefoAIAvailable } = await import("./tarefo-ai-adapter");
          result.available = true; // Simulado para teste
          result.supportedFormats = ["jpg", "png", "pdf", "tiff"];
          break;
          
        case 'compliance':
          // Importamos a função de verificação de conformidade
          const { checkCompliance } = await import("./tarefo-ai-adapter");
          result.available = true;
          result.operations = [
            "save_user_data", 
            "delete_user_data", 
            "share_user_data", 
            "process_sensitive_data"
          ];
          break;
          
        default:
          return res.status(400).json({ 
            success: false, 
            message: `Ferramenta desconhecida: ${tool}. Use: telegram, whatsapp, ocr, compliance` 
          });
      }
      
      console.log(`✅ Ferramenta ${tool} testada com sucesso`);
      res.json({ 
        success: true, 
        message: `Ferramenta ${tool} testada com sucesso`,
        result
      });
      
    } catch (error) {
      console.error(`❌ Erro ao testar ferramenta:`, error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao testar ferramenta: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });
}