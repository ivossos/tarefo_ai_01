#!/bin/bash

# Script de deployment direto e simplificado para o GCP
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
echo -e "${GREEN}Deployment de Produção - Execução Direta${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Verificar se o arquivo de chave existe
KEYFILE="cloud-run/tarefoai-0566d678ba75.json"
if [ ! -f "$KEYFILE" ]; then
    echo -e "${RED}Erro: Arquivo de chave $KEYFILE não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo de chave encontrado: $KEYFILE${NC}"

# Projeto e região
PROJECT_ID="tarefoai"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"

echo -e "${GREEN}✓ Projeto: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Região: $REGION${NC}"
echo -e "${GREEN}✓ Nome do serviço: $SERVICE_NAME${NC}"

# Autenticar com gcloud
echo -e "\n${YELLOW}Autenticando com Google Cloud...${NC}"
gcloud auth activate-service-account --key-file="$KEYFILE"

# Configurar projeto
echo -e "\n${YELLOW}Configurando projeto padrão...${NC}"
gcloud config set project "$PROJECT_ID"

# Abordagem 1: Tentar com gcloud builds submit
echo -e "\n${YELLOW}Iniciando processo de deployment com Cloud Build...${NC}"
echo -e "${YELLOW}Este processo pode levar alguns minutos.${NC}"

gcloud builds submit --config=cloudbuild.yaml --project="$PROJECT_ID" --substitutions=_REGION="$REGION",_SERVICE_NAME="$SERVICE_NAME" --quiet

echo -e "\n${GREEN}✅ Comando de deployment enviado com sucesso!${NC}"
echo -e "${YELLOW}O deployment real está em andamento no Google Cloud Platform.${NC}"
echo -e "\n${YELLOW}Para monitorar o progresso e verificar o status:${NC}"
echo -e "${CYAN}1. Acesse o console do Google Cloud: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID${NC}"
echo -e "${CYAN}2. Verifique o status do serviço: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID${NC}"
echo -e "${CYAN}3. Após a conclusão, a aplicação estará disponível em: https://$SERVICE_NAME-[hash].$REGION.run.app${NC}"

echo -e "\n${GREEN}Deployment iniciado com sucesso!${NC}"
echo -e "${YELLOW}O TarefoAI estará disponível para uso após a conclusão do deployment.${NC}"