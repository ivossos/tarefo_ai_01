#!/bin/bash

# Script para configurar a escala de recursos no Google Cloud Run
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"

# Configurações de recursos e escala
MIN_INSTANCES=1      # Mínimo de instâncias
MAX_INSTANCES=10     # Máximo de instâncias
CPU="1"              # CPUs por instância (0.5, 1, 2, 4, 8)
MEMORY="2Gi"         # Memória por instância (128Mi, 256Mi, 512Mi, 1Gi, 2Gi, 4Gi, 8Gi)
CONCURRENCY=80       # Máximo de requisições por instância
TIMEOUT="300s"       # Timeout para requisições

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

# Verificar se o serviço existe
if ! gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(name)" &>/dev/null; then
    echo "❌ Serviço ${SERVICE_NAME} não encontrado na região ${REGION}."
    echo "   Verifique se o serviço foi implantado corretamente."
    exit 1
fi

# Atualizar configurações de recursos e escala
echo "⚙️ Atualizando configurações de recursos e escala do serviço ${SERVICE_NAME}..."
gcloud run services update ${SERVICE_NAME} \
  --region=${REGION} \
  --min-instances=${MIN_INSTANCES} \
  --max-instances=${MAX_INSTANCES} \
  --cpu=${CPU} \
  --memory=${MEMORY} \
  --concurrency=${CONCURRENCY} \
  --timeout=${TIMEOUT}

# Mostrar as configurações atualizadas
echo "📊 Configurações atualizadas para o serviço ${SERVICE_NAME}:"
gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="table(
  name,
  serving_state,
  last_deployed_time,
  traffic_statuses,
  uri,
  template.scaling.minInstanceCount,
  template.scaling.maxInstanceCount,
  template.containers[0].resources.limits,
  template.containers[0].resources.requests,
  template.timeoutSeconds,
  template.containerConcurrency
)"

echo "✅ Configuração de escala concluída com sucesso!"
echo ""
echo "📝 Recomendações para escala:"
echo "- Monitore o uso de recursos e ajuste as configurações conforme necessário"
echo "- Para cargas de trabalho previsíveis, considere aumentar o mínimo de instâncias"
echo "- Para operações de longa duração, considere aumentar o timeout"
echo "- Se a aplicação for stateful, reduza a concorrência por instância"