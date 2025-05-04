#!/bin/bash

# Script simplificado para deployment direto - TarefoAI
# Autor: TarefoAI Team

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${GREEN}Deployment Direto para o Google Cloud${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Verificar se o gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Erro: Google Cloud SDK (gcloud) não encontrado.${NC}"
    echo -e "${YELLOW}Instalando o gcloud CLI...${NC}"
    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-445.0.0-linux-x86_64.tar.gz
    tar -xf google-cloud-cli-445.0.0-linux-x86_64.tar.gz
    ./google-cloud-sdk/install.sh --quiet
    source ./google-cloud-sdk/path.bash.inc
    echo -e "${GREEN}✓ Google Cloud SDK (gcloud) instalado${NC}"
else
    echo -e "${GREEN}✓ Google Cloud SDK (gcloud) encontrado${NC}"
fi

# Salvar a chave de serviço
echo -e "\n${YELLOW}Configurando autenticação...${NC}"
KEYFILE="cloud-run/tarefoai-0566d678ba75.json"

# Verificar se o arquivo existe
if [ ! -f "$KEYFILE" ]; then
    echo -e "${RED}Erro: Arquivo de chave $KEYFILE não encontrado.${NC}"
    exit 1
fi

# Autenticar no GCP com a chave de serviço
echo -e "\n${YELLOW}Autenticando no Google Cloud...${NC}"
gcloud auth activate-service-account tarefoai@tarefoai.iam.gserviceaccount.com --key-file="$KEYFILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha na autenticação.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticação bem-sucedida!${NC}"

# Definir o projeto
echo -e "\n${YELLOW}Configurando projeto...${NC}"
gcloud config set project tarefoai

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha ao configurar o projeto.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Projeto configurado: tarefoai${NC}"

# Habilitar APIs necessárias
echo -e "\n${YELLOW}Habilitando APIs principais...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com --project tarefoai

# Carregando parâmetros do arquivo de configuração
echo -e "\n${YELLOW}Carregando configurações...${NC}"
region="southamerica-east1"
service_name="tarefo-ai"

echo -e "${GREEN}✓ Região: $region${NC}"
echo -e "${GREEN}✓ Serviço: $service_name${NC}"

# Criar imagem Docker com o Cloud Build
echo -e "\n${YELLOW}Construindo a imagem com Cloud Build...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

IMAGE_NAME="gcr.io/tarefoai/tarefo-ai:latest"
gcloud builds submit --tag "$IMAGE_NAME" --project tarefoai --quiet

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha na construção da imagem.${NC}"
    echo -e "${YELLOW}Tentando método alternativo...${NC}"
    
    # Método alternativo usando Dockerfile direto
    echo -e "${YELLOW}Construindo imagem localmente e fazendo upload...${NC}"
    
    # Verificar se o Docker está instalado
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Erro: Docker não disponível no ambiente Replit.${NC}"
        echo -e "${YELLOW}Sugerimos usar o GitHub Actions para deployment.${NC}"
        exit 1
    fi
    
    docker build -t "$IMAGE_NAME" .
    gcloud auth configure-docker gcr.io
    docker push "$IMAGE_NAME"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro: Falha na construção e upload da imagem.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Imagem construída com sucesso!${NC}"

# Fazer o deploy no Cloud Run
echo -e "\n${YELLOW}Implantando no Cloud Run...${NC}"
gcloud run deploy "$service_name" \
    --image "$IMAGE_NAME" \
    --region "$region" \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 4 \
    --concurrency 80 \
    --min-instances 1 \
    --max-instances 10 \
    --project tarefoai

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha no deployment para o Cloud Run.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment bem-sucedido!${NC}"

# Obter a URL do serviço
echo -e "\n${YELLOW}Obtendo URL do serviço...${NC}"
SERVICE_URL=$(gcloud run services describe "$service_name" --region="$region" --format="value(status.url)" --project tarefoai)

echo -e "\n${GREEN}✅ TarefoAI implantado com sucesso!${NC}"
echo -e "${YELLOW}A aplicação está disponível em:${NC}"
echo -e "${CYAN}$SERVICE_URL${NC}"

# Configurar webhook do Telegram (se necessário)
echo -e "\n${YELLOW}Deseja configurar o webhook do Telegram?${NC}"
echo -e "${YELLOW}1. Sim${NC}"
echo -e "${YELLOW}2. Não${NC}"
read -p "Escolha [1-2]: " webhook_choice

if [ "$webhook_choice" == "1" ]; then
    WEBHOOK_URL="$SERVICE_URL/api/webhook/telegram"
    curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=$WEBHOOK_URL"
    echo -e "${GREEN}✓ Webhook do Telegram configurado para: $WEBHOOK_URL${NC}"
fi

echo -e "\n${GREEN}✅ Deployment concluído com sucesso!${NC}"
echo -e "${YELLOW}Aproveite o TarefoAI em ambiente de produção.${NC}"