/**
 * Script para testar o Reminders Agent do TarefoAI
 */
import fetch from 'node-fetch';

async function testRemindersAgent() {
  console.log('🧪 Testando Reminders Agent...');
  
  const userId = 999; // ID de teste
  
  // Criar um lembrete para amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toISOString().split('T')[0];
  
  const reminderData = {
    user_id: userId,
    text: "Revisar proposta do cliente XYZ",
    date: formattedDate,
    time: "10:00",
    priority: "high",
    channels: ["app", "telegram"] // Canais para notificação
  };
  
  console.log(`📤 Criando lembrete: "${reminderData.text}" para ${formattedDate} às ${reminderData.time}, prioridade: ${reminderData.priority}`);
  
  try {
    const response = await fetch('http://localhost:5000/api/test/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Lembrete criado com sucesso:');
      console.log('=========================================');
      console.log(JSON.stringify(data.result, null, 2));
      console.log('=========================================');
    } else {
      console.error('❌ Erro ao criar lembrete:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executa o teste
testRemindersAgent();