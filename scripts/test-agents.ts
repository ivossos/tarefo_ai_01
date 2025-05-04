/**
 * Script para testar os agentes do TarefoAI
 *
 * Este script testa cada um dos agentes criados no TarefoAI:
 * - Message Agent
 * - Calendar Agent
 * - Reminders Agent
 * - OCR Agent
 * - Compliance Agent
 */

import fetch from 'node-fetch';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Criando interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer uma pergunta e obter a resposta
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// URLs das APIs de teste
const TEST_MESSAGE_URL = 'http://localhost:5000/api/test/message';
const TEST_CALENDAR_URL = 'http://localhost:5000/api/test/calendar';
const TEST_REMINDER_URL = 'http://localhost:5000/api/test/reminder';
const TEST_OCR_URL = 'http://localhost:5000/api/test/ocr';
const TEST_COMPLIANCE_URL = 'http://localhost:5000/api/test/compliance';

// Função para testar o Message Agent
async function testMessageAgent() {
  console.log(`\n${colors.bright}${colors.blue}=== Testando Message Agent ===${colors.reset}`);
  
  const userId = 999; // ID de teste
  const message = await question(`${colors.yellow}Digite uma mensagem para testar:${colors.reset} `);
  
  console.log(`\n${colors.cyan}Enviando mensagem "${message}" para o agente...${colors.reset}`);
  
  try {
    const response = await fetch(TEST_MESSAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`\n${colors.green}✅ Resposta do agente:${colors.reset}\n`);
      console.log(data.response);
    } else {
      console.log(`\n${colors.red}❌ Erro ao processar mensagem:${colors.reset} ${data.message}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro na requisição:${colors.reset}`, error);
  }
}

// Função para testar o Calendar Agent
async function testCalendarAgent() {
  console.log(`\n${colors.bright}${colors.blue}=== Testando Calendar Agent ===${colors.reset}`);
  
  const userId = 999; // ID de teste
  const title = await question(`${colors.yellow}Título do evento:${colors.reset} `);
  const date = await question(`${colors.yellow}Data (AAAA-MM-DD):${colors.reset} `);
  const time = await question(`${colors.yellow}Hora (HH:MM):${colors.reset} `);
  const duration = parseInt(await question(`${colors.yellow}Duração em minutos (padrão: 60):${colors.reset} `) || '60');
  
  console.log(`\n${colors.cyan}Enviando evento "${title}" para o agente...${colors.reset}`);
  
  try {
    const response = await fetch(TEST_CALENDAR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, time, duration, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`\n${colors.green}✅ Evento criado com sucesso:${colors.reset}\n`);
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.log(`\n${colors.red}❌ Erro ao criar evento:${colors.reset} ${data.message}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro na requisição:${colors.reset}`, error);
  }
}

// Função para testar o Reminders Agent
async function testRemindersAgent() {
  console.log(`\n${colors.bright}${colors.blue}=== Testando Reminders Agent ===${colors.reset}`);
  
  const userId = 999; // ID de teste
  const text = await question(`${colors.yellow}Texto do lembrete:${colors.reset} `);
  const date = await question(`${colors.yellow}Data (AAAA-MM-DD):${colors.reset} `);
  const time = await question(`${colors.yellow}Hora (HH:MM):${colors.reset} `);
  
  const priorityInput = await question(`${colors.yellow}Prioridade (normal/high):${colors.reset} `);
  const priority = priorityInput.toLowerCase() === 'high' ? 'high' : 'normal';
  
  console.log(`\n${colors.cyan}Enviando lembrete "${text}" para o agente...${colors.reset}`);
  
  try {
    const response = await fetch(TEST_REMINDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date, time, priority, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`\n${colors.green}✅ Lembrete criado com sucesso:${colors.reset}\n`);
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.log(`\n${colors.red}❌ Erro ao criar lembrete:${colors.reset} ${data.message}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro na requisição:${colors.reset}`, error);
  }
}

// Função para testar o OCR Agent
async function testOcrAgent() {
  console.log(`\n${colors.bright}${colors.blue}=== Testando OCR Agent ===${colors.reset}`);
  
  const userId = 999; // ID de teste
  
  // Lista imagens disponíveis no diretório attached_assets
  console.log(`\n${colors.yellow}Imagens disponíveis:${colors.reset}`);
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  
  try {
    const files = fs.readdirSync(assetsDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    
    if (files.length === 0) {
      console.log(`${colors.red}Nenhuma imagem encontrada em ${assetsDir}${colors.reset}`);
      return;
    }
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });
    
    const fileIndex = parseInt(await question(`\n${colors.yellow}Selecione uma imagem (1-${files.length}):${colors.reset} `));
    
    if (isNaN(fileIndex) || fileIndex < 1 || fileIndex > files.length) {
      console.log(`${colors.red}Índice inválido. Abortando teste.${colors.reset}`);
      return;
    }
    
    const selectedFile = files[fileIndex - 1];
    const imagePath = path.join(assetsDir, selectedFile);
    
    const extractTypeInput = await question(`${colors.yellow}Tipo de extração (full/receipt/invoice):${colors.reset} `);
    const extractType = ['full', 'receipt', 'invoice'].includes(extractTypeInput) ? extractTypeInput : 'full';
    
    console.log(`\n${colors.cyan}Processando imagem "${selectedFile}" com o agente OCR...${colors.reset}`);
    
    const response = await fetch(TEST_OCR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: imagePath, extract_type: extractType, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`\n${colors.green}✅ Imagem processada com sucesso:${colors.reset}\n`);
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.log(`\n${colors.red}❌ Erro ao processar imagem:${colors.reset} ${data.message}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro:${colors.reset}`, error);
  }
}

// Função para testar o Compliance Agent
async function testComplianceAgent() {
  console.log(`\n${colors.bright}${colors.blue}=== Testando Compliance Agent ===${colors.reset}`);
  
  const userId = 999; // ID de teste
  
  console.log(`\n${colors.yellow}Operações disponíveis:${colors.reset}`);
  console.log(`1. save_user_data - Salvar dados pessoais do usuário`);
  console.log(`2. share_data - Compartilhar dados com terceiros`);
  console.log(`3. process_payment - Processar informações de pagamento`);
  console.log(`4. analyze_behavior - Analisar comportamento do usuário`);
  
  const operationIndex = parseInt(await question(`\n${colors.yellow}Selecione uma operação (1-4):${colors.reset} `));
  
  if (isNaN(operationIndex) || operationIndex < 1 || operationIndex > 4) {
    console.log(`${colors.red}Índice inválido. Abortando teste.${colors.reset}`);
    return;
  }
  
  const operations = ['save_user_data', 'share_data', 'process_payment', 'analyze_behavior'];
  const selectedOperation = operations[operationIndex - 1];
  
  // Dados para teste baseados na operação selecionada
  let testData: any = { user_id: userId };
  
  switch (selectedOperation) {
    case 'save_user_data':
      testData.personal_info = {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+5511999998888',
        cpf: '123.456.789-00' // CPF é um dado sensível no Brasil
      };
      break;
    case 'share_data':
      testData.sharing_purpose = 'marketing';
      testData.third_party = 'Parceiro Comercial XYZ';
      testData.data_categories = ['nome', 'email', 'histórico de compras'];
      testData.user_consent = false; // Sem consentimento, deve falhar na verificação
      break;
    case 'process_payment':
      testData.payment_info = {
        credit_card: '**** **** **** 1234',
        expiry: '12/25',
        amount: 157.80,
        currency: 'BRL'
      };
      testData.merchant = 'Loja Online ABC';
      break;
    case 'analyze_behavior':
      testData.tracking_data = {
        pages_visited: ['/home', '/products', '/checkout'],
        time_spent: 345, // segundos
        scroll_depth: '75%'
      };
      testData.purpose = 'melhoria da experiência',
      testData.anonymized = true
      break;
  }
  
  console.log(`\n${colors.cyan}Verificando conformidade da operação "${selectedOperation}"...${colors.reset}`);
  console.log(`\n${colors.dim}Dados para verificação:${colors.reset}`);
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(TEST_COMPLIANCE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: selectedOperation, data: testData, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.result.compliant) {
        console.log(`\n${colors.green}✅ Operação está em conformidade!${colors.reset}\n`);
      } else {
        console.log(`\n${colors.yellow}⚠️ Operação NÃO está em conformidade!${colors.reset}\n`);
      }
      
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.log(`\n${colors.red}❌ Erro na verificação de conformidade:${colors.reset} ${data.message}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro na requisição:${colors.reset}`, error);
  }
}

// Menu principal
async function mainMenu() {
  console.log(`\n${colors.bright}${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}      TESTE DE AGENTES DO TAREFOAI${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}======================================${colors.reset}\n`);
  
  console.log(`${colors.white}Este script testa os agentes do TarefoAI através de requisições HTTP.${colors.reset}`);
  console.log(`${colors.white}Certifique-se de que o servidor esteja em execução na porta 5000.${colors.reset}\n`);
  
  console.log(`${colors.yellow}Agentes disponíveis para teste:${colors.reset}`);
  console.log(`1. Message Agent - Processamento de mensagens`);
  console.log(`2. Calendar Agent - Criação de eventos no calendário`);
  console.log(`3. Reminders Agent - Criação de lembretes`);
  console.log(`4. OCR Agent - Processamento de imagens e documentos`);
  console.log(`5. Compliance Agent - Verificação de conformidade com LGPD/GDPR`);
  console.log(`0. Sair`);
  
  const option = parseInt(await question(`\n${colors.yellow}Escolha uma opção (0-5):${colors.reset} `));
  
  switch (option) {
    case 1:
      await testMessageAgent();
      break;
    case 2:
      await testCalendarAgent();
      break;
    case 3:
      await testRemindersAgent();
      break;
    case 4:
      await testOcrAgent();
      break;
    case 5:
      await testComplianceAgent();
      break;
    case 0:
      console.log(`\n${colors.bright}${colors.green}Encerrando. Até mais!${colors.reset}\n`);
      rl.close();
      return;
    default:
      console.log(`\n${colors.red}Opção inválida! Por favor, tente novamente.${colors.reset}\n`);
  }
  
  // Perguntar se deseja continuar testando
  const continuar = await question(`\n${colors.yellow}Deseja testar outro agente? (S/N):${colors.reset} `);
  
  if (continuar.toLowerCase() === 's' || continuar.toLowerCase() === 'sim') {
    await mainMenu();
  } else {
    console.log(`\n${colors.bright}${colors.green}Encerrando. Até mais!${colors.reset}\n`);
    rl.close();
  }
}

// Verifica se o servidor está rodando antes de iniciar os testes
async function checkServerStatus() {
  try {
    // Tenta verificar se o servidor está respondendo
    const res = await fetch('http://localhost:5000/api/test/message', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping' })
    });
    
    // Se chegou aqui sem erro, o servidor está rodando
    console.log(`${colors.green}✅ Servidor está rodando na porta 5000.${colors.reset}`);
    mainMenu();
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao conectar ao servidor: O servidor está rodando na porta 5000?${colors.reset}`);
    console.log(`${colors.yellow}ℹ️ Certifique-se de que o servidor esteja em execução executando:${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  npm run dev${colors.reset}`);
    
    const retry = await question(`\n${colors.yellow}Deseja tentar novamente? (S/N):${colors.reset} `);
    
    if (retry.toLowerCase() === 's' || retry.toLowerCase() === 'sim') {
      await checkServerStatus();
    } else {
      console.log(`\n${colors.bright}${colors.red}Encerrando o teste.${colors.reset}\n`);
      rl.close();
    }
  }
}

// Inicia o script
checkServerStatus();