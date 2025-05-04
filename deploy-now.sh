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
    echo -e "${YELLOW}Por favor, instale o gcloud CLI: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Google Cloud SDK (gcloud) encontrado${NC}"

# Autenticar direto com as credenciais da chave de serviço
echo -e "\n${YELLOW}Configurando autenticação...${NC}"

# Salvar a chave de serviço do ambiente para um arquivo
echo $GCP_SERVICE_ACCOUNT_KEY > service-account-key.json

# Autenticar no GCP
echo -e "\n${YELLOW}Autenticando no Google Cloud...${NC}"
gcloud auth activate-service-account --key-file=service-account-key.json

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
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Carregando parâmetros do arquivo de configuração
echo -e "\n${YELLOW}Carregando configurações...${NC}"
region="southamerica-east1"
service_name="tarefo-ai"

echo -e "${GREEN}✓ Região: $region${NC}"
echo -e "${GREEN}✓ Serviço: $service_name${NC}"

# Iniciar o build
echo -e "\n${YELLOW}Iniciando o deployment com Cloud Build...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

gcloud builds submit --config=cloudbuild.yaml

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha no deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment iniciado com sucesso!${NC}"

# Verificar status do serviço
echo -e "\n${YELLOW}Verificando status do serviço...${NC}"
gcloud run services describe $service_name --region=$region --format="value(status.url)" 2>/dev/null

# Limpeza
echo -e "\n${YELLOW}Removendo arquivos temporários...${NC}"
rm -f service-account-key.json

echo -e "\n${GREEN}✅ Deployment iniciado com sucesso!${NC}"
echo -e "${YELLOW}Acompanhe o progresso no Console do Google Cloud:${NC}"
echo -e "${CYAN}https://console.cloud.google.com/cloud-build/builds?project=tarefoai${NC}"
echo -e "\n${YELLOW}Após a conclusão, acesse o serviço em:${NC}"
echo -e "${CYAN}https://$service_name-[hash].run.app${NC}"