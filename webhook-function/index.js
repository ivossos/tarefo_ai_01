const functions = require('@google-cloud/functions-framework');
const axios = require('axios');

// Importe o segredo do Secret Manager
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

// URL do serviço principal no Cloud Run (atualizar após o deploy)
const APP_URL = process.env.APP_URL || 'https://tarefo-ai-XXXX-rj.a.run.app';

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env.PROJECT_ID}/secrets/${name}/versions/latest`,
  });
  return version.payload.data.toString();
}

// Middleware para registro de log
const logRequest = (req, res, next) => {
  console.log(`📥 Webhook recebido: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', JSON.stringify(req.query));
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
};

// Função para processar webhook do WhatsApp
functions.http('whatsappWebhook', async (req, res) => {
  logRequest(req, res, () => {});
  
  try {
    // Verificar se é uma requisição de verificação
    if (req.query['hub.mode'] === 'subscribe' && 
        req.query['hub.verify_token']) {
      
      const verifyToken = await getSecret('whatsapp-verify-token');
      
      if (req.query['hub.verify_token'] === verifyToken) {
        console.log('✅ Webhook do WhatsApp verificado com sucesso');
        res.send(req.query['hub.challenge']);
        return;
      } else {
        console.error('❌ Token de verificação inválido');
        res.status(403).send('Token de verificação inválido');
        return;
      }
    }
    
    // Processar mensagem recebida do WhatsApp
    if (req.body && req.body.object === 'whatsapp_business_account') {
      console.log('📨 Mensagem de webhook do WhatsApp recebida');
      
      // Obter o segredo interno para autenticação
      const internalSecret = await getSecret('webhook-internal-secret');
      
      // Enviar para o serviço principal
      try {
        const response = await axios.post(`${APP_URL}/api/webhooks/whatsapp`, req.body, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': internalSecret
          },
          timeout: 10000 // 10 segundos
        });
        
        console.log(`✅ Mensagem encaminhada com sucesso: ${response.status}`);
        res.status(200).send('EVENT_RECEIVED');
      } catch (error) {
        console.error('❌ Erro ao encaminhar mensagem:', error.message);
        
        // Ainda retornamos 200 para a Meta para evitar reenvio
        res.status(200).send('EVENT_RECEIVED');
        
        // Mas registramos o erro para monitoramento
        console.error('Detalhes do erro:', error.response ? error.response.data : 'Sem resposta');
      }
    } else {
      console.warn('⚠️ Payload inválido ou desconhecido');
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Erro no processamento do webhook:', error);
    res.status(500).send('Erro interno ao processar webhook');
  }
});