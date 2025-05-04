/**
 * Script para testar o Compliance Agent do TarefoAI
 */
import fetch from 'node-fetch';

async function testComplianceAgent() {
  console.log('🧪 Testando Compliance Agent...');
  
  const userId = 999; // ID de teste
  
  // Dados para verificação de conformidade - este exemplo verifica se 
  // é permitido compartilhar dados de usuário com parceiros de marketing
  const complianceData = {
    user_id: userId,
    operation: 'share_data',
    data: {
      sharing_purpose: 'marketing',
      third_party: 'Parceiro Comercial XYZ',
      data_categories: ['nome', 'email', 'histórico de compras'],
      user_consent: false, // Sem consentimento, deve falhar na verificação
      retention_period: '6 months'
    }
  };
  
  console.log(`📤 Verificando conformidade da operação "${complianceData.operation}" para compartilhamento de dados...`);
  
  try {
    const response = await fetch('http://localhost:5000/api/test/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complianceData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Verificação de conformidade concluída:');
      console.log('=========================================');
      
      if (data.result.compliant) {
        console.log('✅ Operação ESTÁ em conformidade com LGPD/GDPR');
      } else {
        console.log('❌ Operação NÃO está em conformidade com LGPD/GDPR');
        console.log('Motivo: ' + data.result.reason);
      }
      
      console.log('=========================================');
      console.log(JSON.stringify(data.result, null, 2));
      console.log('=========================================');
    } else {
      console.error('❌ Erro na verificação:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
  
  // Agora testando um caso que deve passar na verificação de conformidade
  console.log('\n🧪 Testando um caso que DEVE passar na verificação...');
  
  const validComplianceData = {
    user_id: userId,
    operation: 'process_payment',
    data: {
      payment_info: {
        credit_card: '**** **** **** 1234', // Dados mascarados
        expiry: '12/25',
        amount: 157.80,
        currency: 'BRL'
      },
      merchant: 'Loja Online ABC',
      transaction_id: '98765-ABCDE',
      secure_transaction: true
    }
  };
  
  console.log(`📤 Verificando conformidade da operação "${validComplianceData.operation}" para processamento de pagamento...`);
  
  try {
    const response = await fetch('http://localhost:5000/api/test/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validComplianceData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Verificação de conformidade concluída:');
      console.log('=========================================');
      
      if (data.result.compliant) {
        console.log('✅ Operação ESTÁ em conformidade com LGPD/GDPR');
      } else {
        console.log('❌ Operação NÃO está em conformidade com LGPD/GDPR');
        console.log('Motivo: ' + data.result.reason);
      }
      
      console.log('=========================================');
      console.log(JSON.stringify(data.result, null, 2));
      console.log('=========================================');
    } else {
      console.error('❌ Erro na verificação:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executa o teste
testComplianceAgent();