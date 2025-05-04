/**
 * Adaptador para integração entre a arquitetura CrewAI e o aplicativo TarefoAI existente.
 * 
 * Este arquivo fornece funções para interagir com o framework CrewAI,
 * servindo como uma ponte entre o código existente e a nova arquitetura baseada em agentes.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { processMessage as processMessageOpenAI } from './openai';

// Interface para representar um agente no CrewAI
interface Agent {
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  tools?: string[];
}

// Interface para representar uma tarefa no CrewAI
interface Task {
  description: string;
  agent: string;
  expected_output?: string;
}

// Interface para representar o CrewAI
interface Crew {
  name: string;
  agents: Agent[];
  tasks: Task[];
}

// Caminhos para os scripts do TarefoAI
const TAREFO_AI_PATH = path.join(process.cwd(), 'tarefo_ai');
const MAIN_SCRIPT = path.join(TAREFO_AI_PATH, 'main.py');

/**
 * Verifica se o módulo TarefoAI está disponível
 */
export function isTarefoAIAvailable(): boolean {
  try {
    // Verifica se o diretório e script principal existem
    return fs.existsSync(TAREFO_AI_PATH) && fs.existsSync(MAIN_SCRIPT);
  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade do TarefoAI:', error);
    return false;
  }
}

/**
 * Processa uma mensagem de usuário usando o framework CrewAI.
 * 
 * @param userId ID do usuário
 * @param message Mensagem a ser processada
 * @param platform Plataforma de origem (app, telegram, whatsapp)
 * @returns Resposta processada
 */
export async function processMessage(
  userId: number,
  message: string,
  platform: string = 'app'
): Promise<string> {
  console.log(`🔄 Processando mensagem do usuário ${userId} via ${platform}: "${message.substring(0, 50)}..."`);
  
  // Verifica se o TarefoAI está disponível
  if (!isTarefoAIAvailable()) {
    const error = 'TarefoAI não está disponível. Verifique a configuração do sistema.';
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  
  try {
    // Prepara os dados para o script Python
    const data = JSON.stringify({
      user_id: userId,
      message: message,
      platform: platform,
      timestamp: new Date().toISOString()
    });
    
    return new Promise<string>((resolve, reject) => {
      // Executa o script Python com os dados
      const python = spawn('python', [MAIN_SCRIPT], {
        env: { ...process.env, TAREFO_DATA: data }
      });
      
      let dataString = '';
      let errorString = '';
      
      // Coleta a saída padrão
      python.stdout.on('data', (data: Buffer) => {
        dataString += data.toString();
      });
      
      // Coleta erros
      python.stderr.on('data', (data: Buffer) => {
        errorString += data.toString();
        console.error(`⚠️ Erro do script Python: ${data.toString()}`);
      });
      
      // Processa quando o script terminar
      python.on('close', (code: number) => {
        if (code !== 0) {
          console.error(`❌ Processo Python encerrado com código ${code}`);
          console.error(`Erro: ${errorString}`);
          reject(new Error(`Falha no processamento: ${errorString}`));
          return;
        }
        
        // Extrai a resposta dos dados de saída
        try {
          // A resposta pode estar em formato JSON ou texto simples
          // Tentamos primeiro analisar como JSON
          const output = dataString.trim();
          if (output.startsWith('{') && output.endsWith('}')) {
            const jsonResponse = JSON.parse(output);
            resolve(jsonResponse.response || jsonResponse.text || jsonResponse.message || output);
          } else {
            // Se não for JSON, procuramos a resposta no texto
            // Localizando a parte após "Resposta:" se existir
            const responseMatch = output.match(/Resposta:\s*([\s\S]*)/i);
            if (responseMatch && responseMatch[1]) {
              resolve(responseMatch[1].trim());
            } else {
              // Caso contrário, retornamos toda a saída
              resolve(output);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar saída do script Python:', error);
          resolve(dataString.trim()); // Retornamos os dados brutos
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro ao executar TarefoAI:', error);
    throw error; // Propaga o erro para ser tratado pelo chamador
  }
}

/**
 * Processa uma imagem enviada pelo usuário (usa OCR via CrewAI)
 * 
 * @param userId ID do usuário
 * @param imagePath Caminho para a imagem
 * @param extractType Tipo de extração (full, receipt, invoice)
 * @returns Dados extraídos da imagem
 */
export async function processImage(
  userId: number,
  imagePath: string,
  extractType: string = 'full'
): Promise<any> {
  console.log(`🔄 Processando imagem para o usuário ${userId}: "${imagePath}"`);
  
  // Verifica se o TarefoAI está disponível
  if (!isTarefoAIAvailable()) {
    const error = 'TarefoAI não está disponível para processamento de imagem. Verifique a configuração do sistema.';
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  
  try {
    // Prepara os dados para o script Python
    const data = JSON.stringify({
      user_id: userId,
      image_path: imagePath,
      extract_type: extractType,
      timestamp: new Date().toISOString()
    });
    
    return new Promise<any>((resolve, reject) => {
      // Executa o script Python com os dados
      const python = spawn('python', [MAIN_SCRIPT, 'process_image'], {
        env: { ...process.env, TAREFO_DATA: data }
      });
      
      let dataString = '';
      let errorString = '';
      
      // Coleta a saída padrão
      python.stdout.on('data', (data: Buffer) => {
        dataString += data.toString();
      });
      
      // Coleta erros
      python.stderr.on('data', (data: Buffer) => {
        errorString += data.toString();
        console.error(`⚠️ Erro do script Python: ${data.toString()}`);
      });
      
      // Processa quando o script terminar
      python.on('close', (code: number) => {
        if (code !== 0) {
          console.error(`❌ Processo Python encerrado com código ${code}`);
          console.error(`Erro: ${errorString}`);
          resolve({ error: 'Falha ao processar imagem', details: errorString });
          return;
        }
        
        // Extrai a resposta dos dados de saída
        try {
          // A resposta deve estar em formato JSON
          const output = dataString.trim();
          if (output.startsWith('{') && output.endsWith('}')) {
            const jsonResponse = JSON.parse(output);
            resolve(jsonResponse);
          } else {
            // Se não for JSON, tentamos encontrar a parte que é JSON
            const jsonMatch = output.match(/({[\s\S]*})/);
            if (jsonMatch && jsonMatch[1]) {
              resolve(JSON.parse(jsonMatch[1]));
            } else {
              // Caso contrário, retornamos um objeto com o texto
              resolve({ text: output, extract_type: extractType });
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar saída do script Python:', error);
          resolve({ text: dataString.trim(), extract_type: extractType });
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro ao executar processamento de imagem:', error);
    return { error: 'Erro interno no processamento de imagem', details: String(error) };
  }
}

/**
 * Verifica a conformidade de uma operação com LGPD/GDPR
 * 
 * @param operation Tipo de operação
 * @param data Dados relacionados à operação
 * @returns Resultado da verificação
 */
/**
 * Inicializa os agentes do CrewAI
 * 
 * @returns Objeto Crew com agentes e tarefas, ou null se falhar
 */
export function initialize_crew(): Crew | null {
  console.log("🔄 Inicializando agentes do CrewAI...");
  
  // Verifica se o TarefoAI está disponível
  if (!isTarefoAIAvailable()) {
    console.error("❌ TarefoAI não está disponível. Verificação de configuração do sistema falhou.");
    return null;
  }
  
  // Verifica se pelo menos um LLM está configurado
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.LOCAL_LLM_URL) {
    console.error("❌ Nenhum provedor LLM configurado. Não é possível inicializar os agentes.");
    return null;
  }
  
  try {
    // Cria um crew com agentes reais
    const crew: Crew = {
      name: "TarefoAI Crew",
      agents: [
        {
          name: "Orchestrator Agent",
          role: "Coordenador central do sistema",
          goal: "Analisar solicitações, coordenar agentes especializados e integrar respostas",
          backstory: "Como coordenador principal, analiso cada solicitação para determinar quais agentes ativar, mantenho o contexto da conversa e garanto respostas coerentes."
        },
        {
          name: "Message Agent",
          role: "Especialista em processamento de mensagens",
          goal: "Processar e responder mensagens dos usuários com eficiência",
          backstory: "Especializado em compreender linguagem natural e responder de maneira concisa e empática."
        },
        {
          name: "Calendar Agent",
          role: "Especialista em gerenciamento de calendário",
          goal: "Gerenciar eventos e compromissos no calendário do usuário",
          backstory: "Especializado em criar, modificar e rastrear eventos de calendário, detectar conflitos e sugerir horários disponíveis."
        },
        {
          name: "Reminders Agent",
          role: "Especialista em lembretes",
          goal: "Criar e gerenciar lembretes para o usuário",
          backstory: "Especializado em configurar lembretes eficazes com prioridades e notificações apropriadas."
        },
        {
          name: "OCR Agent",
          role: "Especialista em reconhecimento de texto em imagens",
          goal: "Extrair informações relevantes de imagens",
          backstory: "Especializado em analisar imagens, extrair texto e dados estruturados de documentos e recibos."
        },
        {
          name: "Compliance Agent",
          role: "Especialista em conformidade com LGPD/GDPR",
          goal: "Garantir que todas as operações estejam em conformidade com as leis de proteção de dados",
          backstory: "Especializado em verificar operações contra requisitos de privacidade e proteção de dados."
        }
      ],
      tasks: [
        {
          description: "Analisar solicitações e coordenar o trabalho entre agentes",
          agent: "Orchestrator Agent"
        },
        {
          description: "Processar mensagens do usuário",
          agent: "Message Agent"
        },
        {
          description: "Gerenciar eventos do calendário",
          agent: "Calendar Agent"
        },
        {
          description: "Gerenciar lembretes",
          agent: "Reminders Agent"
        },
        {
          description: "Reconhecer texto em imagens",
          agent: "OCR Agent"
        },
        {
          description: "Verificar conformidade com LGPD/GDPR",
          agent: "Compliance Agent"
        }
      ]
    };
    
    console.log(`✅ CrewAI inicializado com ${crew.agents.length} agentes e ${crew.tasks.length} tarefas`);
    return crew;
  } catch (error) {
    console.error("❌ Erro ao inicializar CrewAI:", error);
    return null;
  }
}

export async function checkCompliance(
  operation: string,
  data: any
): Promise<any> {
  console.log(`🔄 Verificando conformidade para operação ${operation}`);
  
  // Verifica se o TarefoAI está disponível
  if (!isTarefoAIAvailable()) {
    const error = 'TarefoAI não está disponível para verificação de conformidade. Verifique a configuração do sistema.';
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  
  try {
    // Prepara os dados para o script Python
    const requestData = JSON.stringify({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    
    return new Promise<any>((resolve, reject) => {
      // Executa o script Python com os dados
      const python = spawn('python', [MAIN_SCRIPT, 'check_compliance'], {
        env: { ...process.env, TAREFO_DATA: requestData }
      });
      
      let dataString = '';
      let errorString = '';
      
      // Coleta a saída padrão
      python.stdout.on('data', (data: Buffer) => {
        dataString += data.toString();
      });
      
      // Coleta erros
      python.stderr.on('data', (data: Buffer) => {
        errorString += data.toString();
        console.error(`⚠️ Erro do script Python: ${data.toString()}`);
      });
      
      // Processa quando o script terminar
      python.on('close', (code: number) => {
        if (code !== 0) {
          console.error(`❌ Processo Python encerrado com código ${code}`);
          console.error(`Erro: ${errorString}`);
          resolve({ 
            compliant: false, 
            reason: 'Falha na verificação de conformidade',
            details: errorString,
            operation
          });
          return;
        }
        
        // Extrai a resposta dos dados de saída
        try {
          // A resposta deve estar em formato JSON
          const output = dataString.trim();
          if (output.startsWith('{') && output.endsWith('}')) {
            const jsonResponse = JSON.parse(output);
            resolve(jsonResponse);
          } else {
            // Se não for JSON, tentamos encontrar a parte que é JSON
            const jsonMatch = output.match(/({[\s\S]*})/);
            if (jsonMatch && jsonMatch[1]) {
              resolve(JSON.parse(jsonMatch[1]));
            } else {
              // Caso contrário, retornamos um resultado genérico
              resolve({ 
                compliant: false, 
                reason: 'Formato de resposta inválido',
                operation,
                output
              });
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar saída do script Python:', error);
          resolve({ 
            compliant: false, 
            reason: 'Erro ao processar verificação de conformidade',
            details: String(error),
            operation
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro ao executar verificação de conformidade:', error);
    return { 
      compliant: false, 
      reason: 'Erro interno na verificação de conformidade',
      details: String(error),
      operation
    };
  }
}