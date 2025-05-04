#!/bin/bash

# Script para configurar monitoramento e alertas no Google Cloud
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"
FUNCTION_NAME="whatsappWebhook"
NOTIFICATION_EMAIL="seu-email@exemplo.com"  # Altere para seu e-mail

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

# Habilitar as APIs necessárias
echo "🔌 Habilitando APIs de monitoramento..."
gcloud services enable monitoring.googleapis.com cloudprofiler.googleapis.com

# Criar um canal de notificação por e-mail
echo "📧 Criando canal de notificação por e-mail..."
CHANNEL_CREATION=$(gcloud alpha monitoring channels create --display-name="TarefoAI Alertas" --type=email --channel-labels=email_address=${NOTIFICATION_EMAIL} --format="value(name)")

CHANNEL_NAME=$(echo $CHANNEL_CREATION | awk -F'/' '{print $NF}')
echo "✅ Canal de notificação criado: ${CHANNEL_NAME}"

# Configurar alerta para erros 500 no Cloud Run
echo "🚨 Criando alerta para erros 500 no Cloud Run..."
gcloud alpha monitoring policies create \
  --display-name="TarefoAI - Erros 500 no Cloud Run" \
  --condition-filter="metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${SERVICE_NAME}\" AND metric.labels.response_code_class=\"5xx\"" \
  --condition-threshold-value=5 \
  --condition-threshold-filter="metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${SERVICE_NAME}\"" \
  --condition-aggregations-align-as-sum \
  --condition-aggregations-per-series-aligner=rate \
  --condition-aggregations-cross-series-reducer=sum \
  --condition-aggregations-group-by-fields="resource.label.service_name" \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-trigger-count=1 \
  --condition-trigger-percent=0 \
  --condition-duration=5m \
  --documentation-content="Foram detectados erros 500 no serviço ${SERVICE_NAME}. Verifique os logs para identificar o problema." \
  --notification-channels="projects/${PROJECT_ID}/notificationChannels/${CHANNEL_NAME}"

# Configurar alerta para erros nas Cloud Functions
echo "🚨 Criando alerta para erros na Cloud Function do webhook do WhatsApp..."
gcloud alpha monitoring policies create \
  --display-name="TarefoAI - Erros na Função ${FUNCTION_NAME}" \
  --condition-filter="metric.type=\"cloudfunctions.googleapis.com/function/execution_count\" AND resource.type=\"cloud_function\" AND resource.labels.function_name=\"${FUNCTION_NAME}\" AND metric.labels.status=\"error\"" \
  --condition-threshold-value=5 \
  --condition-threshold-filter="metric.type=\"cloudfunctions.googleapis.com/function/execution_count\" AND resource.type=\"cloud_function\" AND resource.labels.function_name=\"${FUNCTION_NAME}\"" \
  --condition-aggregations-align-as-sum \
  --condition-aggregations-per-series-aligner=rate \
  --condition-aggregations-cross-series-reducer=sum \
  --condition-aggregations-group-by-fields="resource.label.function_name" \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-trigger-count=1 \
  --condition-trigger-percent=0 \
  --condition-duration=5m \
  --documentation-content="Foram detectados erros na função ${FUNCTION_NAME}. Verifique os logs para identificar o problema." \
  --notification-channels="projects/${PROJECT_ID}/notificationChannels/${CHANNEL_NAME}"

# Configurar alerta para alta latência no Cloud Run
echo "🚨 Criando alerta para alta latência no Cloud Run..."
gcloud alpha monitoring policies create \
  --display-name="TarefoAI - Alta Latência no Cloud Run" \
  --condition-filter="metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${SERVICE_NAME}\"" \
  --condition-threshold-value=2000 \
  --condition-aggregations-per-series-aligner=percentile99 \
  --condition-aggregations-cross-series-reducer=mean \
  --condition-aggregations-group-by-fields="resource.label.service_name" \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-trigger-count=1 \
  --condition-trigger-percent=0 \
  --condition-duration=5m \
  --documentation-content="A latência do serviço ${SERVICE_NAME} está alta (>2s para o percentil 99). Verifique a carga e o desempenho." \
  --notification-channels="projects/${PROJECT_ID}/notificationChannels/${CHANNEL_NAME}"

# Configurar alerta para falhas de conexão com o banco de dados (monitoramento personalizado - requer métricas personalizadas)
echo "⚠️ Para monitoramento de conexões com o banco de dados, é necessário implementar métricas personalizadas."
echo "   Veja a documentação: https://cloud.google.com/monitoring/custom-metrics"

# Configurar dashboards (isso precisaria ser feito via API mais complexa ou pela console)
echo "⚠️ Para configurar dashboards, é recomendado usar a interface web do Google Cloud Console."
echo "   Acesse: https://console.cloud.google.com/monitoring/dashboards"

echo "✅ Configuração de monitoramento concluída com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Verifique se recebeu um e-mail de teste do Google Cloud Monitoring"
echo "2. Acesse a página de Alertas para verificar se estão configurados corretamente"
echo "3. Crie dashboards personalizados na interface web"