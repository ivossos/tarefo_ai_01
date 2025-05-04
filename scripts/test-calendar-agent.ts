/**
 * Script para testar o Calendar Agent do TarefoAI
 */
import fetch from 'node-fetch';

async function testCalendarAgent() {
  console.log('🧪 Testando Calendar Agent...');
  
  const userId = 999; // ID de teste
  const title = "Reunião com cliente";
  const date = new Date();
  // Ajustar para o próximo dia útil
  date.setDate(date.getDate() + 1);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Se domingo, move para segunda
  if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Se sábado, move para segunda

  // Formatar data YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  const time = "14:30";
  const duration = 60; // minutos
  
  console.log(`📤 Criando evento: "${title}" para ${formattedDate} às ${time}, duração: ${duration} minutos`);
  
  try {
    const response = await fetch('http://localhost:5000/api/test/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        date: formattedDate, 
        time, 
        duration, 
        user_id: userId,
        description: "Discutir proposta de projeto e cronograma inicial"
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Evento criado com sucesso:');
      console.log('=========================================');
      console.log(JSON.stringify(data.result, null, 2));
      console.log('=========================================');
    } else {
      console.error('❌ Erro ao criar evento:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executa o teste
testCalendarAgent();