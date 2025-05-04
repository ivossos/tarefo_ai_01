#!/bin/bash

# Script para configurar tarefas agendadas no Cloud Scheduler
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"

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

# Habilitar a API do Cloud Scheduler
echo "🔌 Habilitando API do Cloud Scheduler..."
gcloud services enable cloudscheduler.googleapis.com

# Obter URL do serviço Cloud Run
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)")

if [ -z "$SERVICE_URL" ]; then
    echo "❌ Não foi possível obter a URL do serviço Cloud Run. Verifique se o serviço foi implantado."
    exit 1
fi

echo "ℹ️ URL do serviço Cloud Run: ${SERVICE_URL}"

# Obter o token para autenticação das tarefas agendadas
echo "🔑 Obtendo token para autenticação das tarefas agendadas..."
SCHEDULER_SECRET=$(gcloud secrets versions access latest --secret="scheduler-secret" || echo "SECRET_NOT_FOUND")

if [ "$SCHEDULER_SECRET" == "SECRET_NOT_FOUND" ]; then
    echo "⚠️ Segredo 'scheduler-secret' não encontrado. Gerando um novo..."
    SCHEDULER_SECRET=$(openssl rand -hex 16)
    echo "$SCHEDULER_SECRET" | gcloud secrets create scheduler-secret --data-file=- --replication-policy="automatic"
    echo "✅ Novo segredo 'scheduler-secret' criado com sucesso!"
fi

# Criar tarefa para verificação de lembretes a cada 5 minutos
echo "🕒 Criando tarefa para verificação de lembretes (a cada 5 minutos)..."
gcloud scheduler jobs create http check-reminders \
  --schedule="*/5 * * * *" \
  --uri="${SERVICE_URL}/api/internal/scheduler/check-reminders" \
  --http-method=POST \
  --headers="Authorization=Bearer ${SCHEDULER_SECRET}" \
  --attempt-deadline=30s \
  --time-zone="America/Sao_Paulo" \
  --description="Verifica lembretes pendentes e envia notificações"

# Criar tarefa para sincronizar calendários diariamente às 3 da manhã
echo "🕒 Criando tarefa para sincronização de calendários (diariamente às 3 da manhã)..."
gcloud scheduler jobs create http sync-calendars \
  --schedule="0 3 * * *" \
  --uri="${SERVICE_URL}/api/internal/scheduler/sync-calendars" \
  --http-method=POST \
  --headers="Authorization=Bearer ${SCHEDULER_SECRET}" \
  --attempt-deadline=5m \
  --time-zone="America/Sao_Paulo" \
  --description="Sincroniza eventos de calendário com serviços externos"

# Criar tarefa para atualizar transações financeiras diariamente
echo "🕒 Criando tarefa para atualização de transações financeiras (diariamente às 4 da manhã)..."
gcloud scheduler jobs create http sync-finances \
  --schedule="0 4 * * *" \
  --uri="${SERVICE_URL}/api/internal/scheduler/sync-finances" \
  --http-method=POST \
  --headers="Authorization=Bearer ${SCHEDULER_SECRET}" \
  --attempt-deadline=10m \
  --time-zone="America/Sao_Paulo" \
  --description="Sincroniza transações financeiras com serviços bancários"

# Criar tarefa para processar transações recorrentes uma vez por dia
echo "🕒 Criando tarefa para processamento de transações recorrentes (diariamente às 1 da manhã)..."
gcloud scheduler jobs create http process-recurring-transactions \
  --schedule="0 1 * * *" \
  --uri="${SERVICE_URL}/api/internal/scheduler/process-recurring-transactions" \
  --http-method=POST \
  --headers="Authorization=Bearer ${SCHEDULER_SECRET}" \
  --attempt-deadline=5m \
  --time-zone="America/Sao_Paulo" \
  --description="Processa transações financeiras recorrentes"

echo "✅ Todas as tarefas agendadas foram criadas com sucesso!"
echo ""
echo "📝 Detalhes das tarefas:"
gcloud scheduler jobs list --format="table(name, schedule, target.uri, state)"