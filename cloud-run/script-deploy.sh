#!/bin/bash

# Script para implantar o Tarefo AI no Google Cloud Run
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"
CLOUD_SQL_INSTANCE="tarefo-ai-db"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

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
gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com

# Construir e enviar a imagem Docker
echo "🏗️ Construindo e enviando a imagem Docker para o Container Registry..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Obter a string de conexão com o Cloud SQL
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}"

# Implantar a aplicação no Cloud Run
echo "🚀 Implantando aplicação no Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --add-cloudsql-instances ${INSTANCE_CONNECTION_NAME} \
  --update-secrets=DATABASE_URL=database-url:latest \
  --update-secrets=TWILIO_AUTH_TOKEN=twilio-auth-token:latest \
  --update-secrets=TWILIO_ACCOUNT_SID=twilio-account-sid:latest \
  --update-secrets=TWILIO_PHONE_NUMBER=twilio-phone-number:latest \
  --update-secrets=OPENAI_API_KEY=openai-api-key:latest \
  --update-secrets=TELEGRAM_BOT_TOKEN=telegram-bot-token:latest \
  --update-secrets=GOOGLE_CLIENT_ID=google-client-id:latest \
  --update-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest \
  --update-secrets=GOOGLE_REDIRECT_URL=google-redirect-url:latest \
  --set-env-vars="NODE_ENV=production"

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)")

echo "✅ Implantação concluída com sucesso!"
echo "🌐 Aplicação disponível em: ${SERVICE_URL}"
echo ""
echo "🔄 Para configurar o webhook do WhatsApp, use a seguinte URL:"
echo "   ${SERVICE_URL}/api/webhooks/whatsapp"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure o webhook do WhatsApp na Meta Business Platform"
echo "2. Implante a Cloud Function para o webhook"
echo "3. Configure tarefas agendadas no Cloud Scheduler se necessário"