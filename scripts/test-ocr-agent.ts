/**
 * Script para testar o OCR Agent do TarefoAI
 */
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

async function testOcrAgent() {
  console.log('🧪 Testando OCR Agent...');
  
  const userId = 999; // ID de teste
  
  // Verificar se existe uma imagem de teste na pasta attached_assets
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  
  try {
    // Listar arquivos de imagem na pasta
    const files = fs.readdirSync(assetsDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    
    if (files.length === 0) {
      console.log('❌ Nenhuma imagem encontrada para teste em ' + assetsDir);
      console.log('Por favor, adicione uma imagem em attached_assets para testar o OCR Agent');
      return;
    }
    
    // Usar a primeira imagem encontrada
    const imagePath = path.join(assetsDir, files[0]);
    console.log(`📤 Processando imagem: "${files[0]}" usando OCR...`);
    
    // Dados para o teste de OCR
    const ocrData = {
      user_id: userId,
      image_path: imagePath,
      extract_type: 'receipt', // Tipo de extração: receipt, invoice, document, full
    };
    
    const response = await fetch('http://localhost:5000/api/test/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ocrData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Imagem processada com sucesso:');
      console.log('=========================================');
      console.log(JSON.stringify(data.result, null, 2));
      console.log('=========================================');
    } else {
      console.error('❌ Erro ao processar imagem:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição ou processamento:', error);
  }
}

// Executa o teste
testOcrAgent();