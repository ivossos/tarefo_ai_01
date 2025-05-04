/**
 * Script para testar a integração com modelos locais
 * Este script usa o adaptador LLM para se conectar a um servidor local e testar o processamento de mensagens
 * 
 * Instruções:
 * 1. Instale e inicie o Ollama (https://ollama.ai/) ou outro servidor local compatível com a API OpenAI
 * 2. Configure a variável LOCAL_LLM_URL no .env apontando para o servidor
 * 3. Execute este script com: npx tsx server/test-local-llm.ts
 */

// importando o LLMAdapter
import { LLMAdapter } from './llm-adapter';

async function testLocalLLM() {
  console.log("🧪 Testando integração com LLM local");
  
  // URL do servidor local
  const baseUrl = process.env.LOCAL_LLM_URL || "http://localhost:11434/v1";
  const modelName = process.env.LOCAL_LLM_MODEL || 'Qwen3-32B-Q3_K_L.gguf';
  
  console.log(`ℹ️ Configuração:`);
  console.log(`   URL do servidor: ${baseUrl}`);
  console.log(`   Modelo: ${modelName}`);
  
  try {
    // Tenta primeiro verificar se o servidor está online
    console.log(`\n🔍 Verificando conexão com o servidor LLM...`);
    
    try {
      // Tentamos fazer uma requisição simples para verificar se o servidor está disponível
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const models = await response.json();
        console.log(`✅ Servidor LLM está online!`);
        console.log(`📋 Modelos disponíveis:`);
        
        if (Array.isArray(models.data)) {
          models.data.forEach((model: any) => {
            console.log(`   • ${model.id || model.name}`);
          });
        } else {
          console.log(`   Resposta do servidor: `, JSON.stringify(models).substring(0, 200) + "...");
        }
      } else {
        console.log(`⚠️ Servidor está online, mas retornou status ${response.status}`);
      }
    } catch (checkError: any) {
      throw new Error(`Não foi possível conectar ao servidor: ${checkError.message}`);
    }
    
    // Cria um adaptador LLM configurado para usar o servidor local
    console.log(`\n⚙️ Inicializando adaptador LLM para modelo ${modelName}...`);
    const llm = new LLMAdapter({
      provider: 'local',
      baseUrl: baseUrl,
      model: modelName
    });
    
    // Mensagem de teste
    const systemPrompt = "Você é o assistente TarefoAI, especializado em ajudar com produtividade. Responda em português do Brasil.";
    const userMessage = "Olá, pode me ajudar a organizar minha agenda para a próxima semana?";
    
    console.log("\n📝 Mensagem de teste:");
    console.log(`   Sistema: ${systemPrompt}`);
    console.log(`   Usuário: ${userMessage}`);
    
    console.log("\n🔄 Enviando solicitação para o modelo local...");
    
    // Inicia o cronômetro para medir o tempo de resposta
    const startTime = Date.now();
    
    // Tenta obter uma resposta com timeout
    let timeoutId: NodeJS.Timeout;
    
    // Crie uma promise com timeout
    const responsePromise = Promise.race([
      llm.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]),
      new Promise<string>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Tempo limite excedido ao esperar resposta do servidor local (15s)"));
        }, 15000); // 15 segundos de timeout
      })
    ]);
    
    // Processa a mensagem
    const response = await responsePromise;
    clearTimeout(timeoutId!);
    
    // Calcula o tempo de resposta
    const responseTime = Date.now() - startTime;
    
    console.log("\n✅ Resposta recebida do modelo local:");
    console.log("---------------------------------------");
    console.log(response);
    console.log("---------------------------------------");
    console.log(`⏱️ Tempo de resposta: ${responseTime}ms (${(responseTime/1000).toFixed(2)}s)`);
    
    console.log("\n✅ Teste com LLM local concluído com sucesso");
    
    console.log("\n🚀 Para usar este modelo em produção:");
    console.log("   1. Configure as variáveis de ambiente:");
    console.log(`      LOCAL_LLM_URL=${baseUrl}`);
    console.log(`      LOCAL_LLM_MODEL=${modelName}`);
    console.log("   2. Reinicie o servidor");
    console.log("   3. O adaptador LLM usará automaticamente o modelo local");
    
    return true;
  } catch (error: any) {
    console.error("\n❌ Erro ao testar modelo local:");
    
    if (error?.message) {
      console.error(`   Mensagem: ${error.message}`);
    }
    
    if (error?.cause) {
      console.error(`   Causa: ${error.cause.message || JSON.stringify(error.cause)}`);
    }
    
    const isConnRefused = typeof error?.message === 'string' && 
      (error.message.includes('ECONNREFUSED') || 
       error.message.includes('Failed to fetch') || 
       error.message.includes('Tempo limite excedido') ||
       error.message.includes('Não foi possível conectar'));
      
    if (isConnRefused) {
      console.log("\n⚠️ Não foi possível conectar ao servidor LLM local:");
      console.log("   1. Verifique se o Ollama está instalado e em execução");
      console.log("   2. Verifique se o URL está correto (padrão: http://localhost:11434/v1)");
      console.log("   3. Certifique-se que o modelo está disponível no servidor");
      
      console.log("\n📋 Instruções para instalar Ollama com Qwen3:");
      console.log("   • Download Ollama: https://ollama.ai/download");
      console.log("   • Para baixar o modelo Qwen3: ollama pull qwen");
      console.log("   • OU para baixar o modelo quantizado: ollama pull qwen:7b-q4_0");
      console.log("   • Para usar Qwen3-32B-Q3_K_L.gguf, siga estas etapas:");
      console.log("     1. Baixe o arquivo GGUF do modelo");
      console.log("     2. Crie um arquivo Modelfile com:");
      console.log("        FROM Qwen3-32B-Q3_K_L.gguf");
      console.log("        PARAMETER temperature 0.7");
      console.log("     3. Execute: ollama create qwen3-32b -f Modelfile");
      console.log("     4. Inicie com: ollama run qwen3-32b");
      
      console.log("\n🔍 Alternativas para testar em ambiente Replit:");
      console.log("   1. Configure um túnel SSH (ex: ngrok) para seu Ollama local:");
      console.log("      ngrok http 11434");
      console.log("   2. Use o URL fornecido pelo ngrok em LOCAL_LLM_URL");
      console.log("   3. Ou use serviços online com API compatível com OpenAI");
    }
    
    return false;
  }
}

// Executa o teste
testLocalLLM();