#!/bin/bash

# Script para autenticação não-interativa no Google Cloud usando uma chave de serviço
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
echo -e "${GREEN}Autenticação no Google Cloud Platform${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

echo -e "\n${YELLOW}Configurando autenticação no Google Cloud...${NC}"

# Verificar se o arquivo de chave foi especificado
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Nenhum arquivo de chave de serviço especificado.${NC}"
    echo -e "${YELLOW}Uso: $0 caminho/para/chave-servico.json${NC}"
    exit 1
fi

KEY_FILE=$1

# Verificar se o arquivo existe
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de chave não encontrado: $KEY_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo de chave encontrado: $KEY_FILE${NC}"

# Autenticar no Google Cloud com a chave de serviço
echo -e "\n${YELLOW}Autenticando no Google Cloud com a chave de serviço...${NC}"
gcloud auth activate-service-account --key-file="$KEY_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha na autenticação com a chave de serviço.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticação bem-sucedida!${NC}"

# Extrair informações da conta de serviço
SERVICE_ACCOUNT=$(cat "$KEY_FILE" | grep client_email | cut -d'"' -f4)
PROJECT_ID=$(cat "$KEY_FILE" | grep project_id | cut -d'"' -f4)

echo -e "${GREEN}✓ Conta de serviço: $SERVICE_ACCOUNT${NC}"
echo -e "${GREEN}✓ ID do projeto: $PROJECT_ID${NC}"

# Definir o projeto atual
echo -e "\n${YELLOW}Configurando o projeto padrão...${NC}"
gcloud config set project "$PROJECT_ID"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha ao definir o projeto padrão.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Projeto padrão configurado: $PROJECT_ID${NC}"

# Verificar permissões essenciais
echo -e "\n${YELLOW}Verificando permissões da conta de serviço...${NC}"
echo -e "${CYAN}Observação: A conta de serviço deve ter os seguintes papéis (roles):${NC}"
echo -e "${CYAN}  - roles/editor${NC}"
echo -e "${CYAN}  - roles/cloudbuild.builds.editor${NC}"
echo -e "${CYAN}  - roles/run.admin${NC}"
echo -e "${CYAN}  - roles/cloudsql.admin${NC}"
echo -e "${CYAN}  - roles/secretmanager.admin${NC}"
echo -e "${CYAN}  - roles/iam.serviceAccountUser${NC}"

# Resumo
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Autenticação no Google Cloud concluída com sucesso!${NC}"
echo -e "\n${YELLOW}Agora você pode executar o script de deployment:${NC}"
echo -e "  ${CYAN}./tarefo-ai-deploy.sh${NC}"