#!/bin/bash

# Script para implantar a função Cloud Function para o webhook do WhatsApp
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
FUNCTION_NAME="whatsappWebhook"
CLOUD_RUN_SERVICE="tarefo-ai"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) não encontrado. Por favor, instale-o primeiro."
    echo "   Instruções: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar login
echo "🔑 Verificando autenticação no Google Cloud..."
if ! gcloud auth print-access-token &> /dev/null; then
    echo "📝 Faça login no Google Cloud..."
    gcloud auth login
fi

# Configurar projeto
echo "🔧 Configurando projeto ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Habilitar APIs necessárias
echo "🔌 Habilitando APIs necessárias..."
gcloud services enable cloudfunctions.googleapis.com secretmanager.googleapis.com run.googleapis.com

# Obter URL do serviço Cloud Run
SERVICE_URL=$(gcloud run services describe ${CLOUD_RUN_SERVICE} --platform managed --region ${REGION} --format="value(status.url)")

if [ -z "$SERVICE_URL" ]; then
    echo "❌ Não foi possível obter a URL do serviço Cloud Run. Verifique se o serviço foi implantado."
    exit 1
fi

echo "ℹ️ URL do serviço Cloud Run: ${SERVICE_URL}"

# Entrar no diretório da função
cd webhook-function

# Implantar a função Cloud Function
echo "🚀 Implantando função ${FUNCTION_NAME}..."
gcloud functions deploy ${FUNCTION_NAME} \
  --gen2 \
  --runtime=nodejs20 \
  --source=. \
  --entry-point=whatsappWebhook \
  --trigger-http \
  --allow-unauthenticated \
  --region=${REGION} \
  --set-env-vars=APP_URL=${SERVICE_URL},PROJECT_ID=${PROJECT_ID}

# Obter URL da função
FUNCTION_URL=$(gcloud functions describe ${FUNCTION_NAME} --gen2 --region=${REGION} --format="value(serviceConfig.uri)")

echo "✅ Implantação da função concluída com sucesso!"
echo "🌐 Função disponível em: ${FUNCTION_URL}"
echo ""
echo "📝 Para configurar o webhook do WhatsApp na Meta Business Platform:"
echo "1. Acesse https://developers.facebook.com/apps/"
echo "2. Selecione seu aplicativo"
echo "3. Vá para 'WhatsApp' > 'Configuração'"
echo "4. Em 'Webhooks', adicione a URL: ${FUNCTION_URL}"
echo "5. Adicione o token de verificação (configurado no Secret Manager)"
echo "6. Selecione os campos 'messages' e 'message_status'"
echo ""
echo "ℹ️ Certifique-se de que os segredos necessários estão configurados no Secret Manager:"
echo "- whatsapp-verify-token"
echo "- webhook-internal-secret"