/**
 * Script para testar todos os agentes do TarefoAI em sequência
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Em módulos ES, __dirname não está disponível diretamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  'test-message-agent.ts',
  'test-calendar-agent.ts',
  'test-reminders-agent.ts',
  'test-ocr-agent.ts',
  'test-compliance-agent.ts'
];

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

console.log(`\n${colors.bright}${colors.magenta}=====================================${colors.reset}`);
console.log(`${colors.bright}${colors.magenta}     TESTES DE AGENTES DO TAREFOAI     ${colors.reset}`);
console.log(`${colors.bright}${colors.magenta}=====================================${colors.reset}\n`);

async function runTest(fileName: string): Promise<void> {
  const testName = path.basename(fileName, '.ts').replace('test-', '').replace('-agent', '');
  
  console.log(`\n${colors.bright}${colors.cyan}=== Testando Agente: ${testName.toUpperCase()} ===${colors.reset}\n`);
  
  return new Promise((resolve) => {
    const child = spawn('npx', ['tsx', path.join(__dirname, fileName)], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✅ Teste do agente ${testName.toUpperCase()} concluído com sucesso${colors.reset}`);
      } else {
        console.log(`\n${colors.red}❌ Teste do agente ${testName.toUpperCase()} falhou com código ${code}${colors.reset}`);
      }
      
      console.log(`\n${colors.dim}--------------------------------------${colors.reset}`);
      resolve();
    });
  });
}

/**
 * Executa os testes em sequência
 */
async function runAllTests() {
  console.log(`${colors.blue}ℹ️ Iniciando testes de todos os agentes...${colors.reset}\n`);
  
  for (const fileName of testFiles) {
    await runTest(fileName);
  }
  
  console.log(`\n${colors.bright}${colors.green}=====================================${colors.reset}`);
  console.log(`${colors.bright}${colors.green}         TODOS OS TESTES CONCLUÍDOS        ${colors.reset}`);
  console.log(`${colors.bright}${colors.green}=====================================${colors.reset}\n`);
}

// Inicia os testes
runAllTests();