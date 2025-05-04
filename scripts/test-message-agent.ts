/**
 * Script para testar o Message Agent do TarefoAI
 */
import fetch from 'node-fetch';

async function testMessageAgent() {
  console.log('🧪 Testando Message Agent...');
  
  const userId = 999; // ID de teste
  const message = "Olá, me ajude a organizar minha agenda para a próxima semana";
  
  console.log(`📤 Enviando mensagem: "${message}"`);
  
  try {
    const response = await fetch('http://localhost:5000/api/test/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Resposta recebida com sucesso:');
      console.log('=========================================');
      console.log(data.response);
      console.log('=========================================');
    } else {
      console.error('❌ Erro ao processar mensagem:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executa o teste
testMessageAgent();