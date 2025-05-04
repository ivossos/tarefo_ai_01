#!/bin/bash

# Script de autenticação não-interativo no Google Cloud Platform
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

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Chave de serviço não fornecida.${NC}"
    echo -e "${YELLOW}Uso: $0 <caminho-para-chave-servico.json>${NC}"
    exit 1
fi

KEY_FILE=$1

# Verificar existência do arquivo
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de chave não encontrado: $KEY_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo de chave encontrado: $KEY_FILE${NC}"

# Extrair informações da chave
PROJECT_ID=$(cat "$KEY_FILE" | grep "project_id" | sed 's/"project_id": "//g' | sed 's/",//g' | tr -d '[:space:]')
CLIENT_EMAIL=$(cat "$KEY_FILE" | grep "client_email" | sed 's/"client_email": "//g' | sed 's/",//g' | tr -d '[:space:]')

if [ -z "$PROJECT_ID" ] || [ -z "$CLIENT_EMAIL" ]; then
    echo -e "${RED}Erro: Não foi possível extrair informações da chave de serviço.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ ID do Projeto: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Email da Conta de Serviço: $CLIENT_EMAIL${NC}"

# Autenticar com a chave de serviço
echo -e "\n${YELLOW}Autenticando no Google Cloud...${NC}"
gcloud auth activate-service-account --key-file="$KEY_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha na autenticação.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticação bem-sucedida!${NC}"

# Configurar o projeto padrão
echo -e "\n${YELLOW}Configurando projeto padrão...${NC}"
gcloud config set project "$PROJECT_ID"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha ao configurar o projeto padrão.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Projeto padrão configurado: $PROJECT_ID${NC}"

# Verificar permissões
echo -e "\n${YELLOW}Verificando permissões...${NC}"

# Verificar Cloud Run
gcloud run services list --platform=managed &>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Permissão para Cloud Run${NC}"
else
    echo -e "${YELLOW}⚠ Sem permissão para listar serviços Cloud Run${NC}"
fi

# Verificar Cloud Build
gcloud builds list &>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Permissão para Cloud Build${NC}"
else
    echo -e "${YELLOW}⚠ Sem permissão para listar builds${NC}"
fi

# Resumo
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Autenticação concluída.${NC}"
echo -e "${YELLOW}Você está autenticado como $CLIENT_EMAIL${NC}"
echo -e "${YELLOW}Projeto atual: $PROJECT_ID${NC}"
echo -e "\n${GREEN}✓ Pronto para iniciar o deployment!${NC}"