#!/bin/bash

# Script de verificação pré-deployment para ambiente de produção
# Verifica se todas as configurações necessárias estão presentes antes do deployment
# Autor: TarefoAI Team

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Carregar configurações do arquivo
CONFIG_FILE="implementation-config-simple.txt"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}Execute primeiro o assistente de implementação para gerar o arquivo de configuração.${NC}"
    exit 1
fi

source "$CONFIG_FILE"

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${GREEN}Verificação de Ambiente de Produção${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Verificar configurações do projeto
echo -e "\n${YELLOW}[1/5] Verificando configurações do projeto...${NC}"

if [ -z "$project_id" ]; then
    echo -e "${RED}✗ Erro: ID do projeto não definido${NC}"
    exit 1
else
    echo -e "${GREEN}✓ ID do projeto: $project_id${NC}"
fi

if [ -z "$region" ]; then
    echo -e "${RED}✗ Erro: Região não definida${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Região: $region${NC}"
fi

# Verificar configurações do banco de dados
echo -e "\n${YELLOW}[2/5] Verificando configurações do banco de dados...${NC}"

if [ -z "$db_instance" ]; then
    echo -e "${RED}✗ Aviso: Nome da instância do banco de dados não definido${NC}"
else
    echo -e "${GREEN}✓ Instância do banco de dados: $db_instance${NC}"
fi

if [ -z "$db_version" ]; then
    echo -e "${RED}✗ Aviso: Versão do PostgreSQL não definida${NC}"
else
    echo -e "${GREEN}✓ Versão do PostgreSQL: $db_version${NC}"
fi

# Verificar configurações do serviço
echo -e "\n${YELLOW}[3/5] Verificando configurações do serviço Cloud Run...${NC}"

if [ -z "$service_name" ]; then
    echo -e "${RED}✗ Erro: Nome do serviço não definido${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Nome do serviço: $service_name${NC}"
fi

if [ -z "$memory" ]; then
    echo -e "${RED}✗ Aviso: Memória não definida, será usado o padrão${NC}"
else
    echo -e "${GREEN}✓ Memória: $memory${NC}"
fi

if [ -z "$cpu" ]; then
    echo -e "${RED}✗ Aviso: CPU não definida, será usado o padrão${NC}"
else
    echo -e "${GREEN}✓ CPU: $cpu${NC}"
fi

# Verificar configurações das integrações
echo -e "\n${YELLOW}[4/5] Verificando configurações de integração...${NC}"

if [ "$telegram" == "true" ]; then
    echo -e "${GREEN}✓ Integração com Telegram habilitada${NC}"
else
    echo -e "${YELLOW}⚠ Integração com Telegram desabilitada${NC}"
fi

if [ "$whatsapp" == "true" ]; then
    echo -e "${GREEN}✓ Integração com WhatsApp habilitada${NC}"
else
    echo -e "${YELLOW}⚠ Integração com WhatsApp desabilitada${NC}"
fi

if [ "$sms" == "true" ]; then
    echo -e "${GREEN}✓ Integração com SMS habilitada${NC}"
else
    echo -e "${YELLOW}⚠ Integração com SMS desabilitada${NC}"
fi

if [ "$google_calendar" == "true" ]; then
    echo -e "${GREEN}✓ Integração com Google Calendar habilitada${NC}"
else
    echo -e "${YELLOW}⚠ Integração com Google Calendar desabilitada${NC}"
fi

# Verificar configurações de IA
echo -e "\n${YELLOW}[5/5] Verificando configurações dos provedores de IA...${NC}"

if [ -z "$ai_provider" ] || [ -z "$ai_model" ]; then
    echo -e "${RED}✗ Erro: Provedor ou modelo de IA principal não definido${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Provedor de IA principal: $ai_provider/$ai_model${NC}"
fi

if [ -z "$backup_provider" ] || [ -z "$backup_model" ]; then
    echo -e "${YELLOW}⚠ Aviso: Provedor ou modelo de IA de backup não definido${NC}"
else
    echo -e "${GREEN}✓ Provedor de IA de backup: $backup_provider/$backup_model${NC}"
fi

# Verificar arquivos essenciais
echo -e "\n${YELLOW}[Verificação Extra] Verificando arquivos essenciais para deployment...${NC}"

# Array de arquivos essenciais
essential_files=(
    "../Dockerfile"
    "../package.json"
    "../cloudbuild.yaml"
    "tarefo-ai-deploy.sh"
    "../webhook-function/index.js"
    "../webhook-function/package.json"
)

all_files_present=true

for file in "${essential_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Arquivo essencial não encontrado: $file${NC}"
        all_files_present=false
    else
        echo -e "${GREEN}✓ Arquivo essencial encontrado: $file${NC}"
    fi
done

if [ "$all_files_present" = false ]; then
    echo -e "\n${RED}⚠ Atenção: Alguns arquivos essenciais estão faltando!${NC}"
    echo -e "${YELLOW}Verifique se o repositório está completo antes de prosseguir com o deployment.${NC}"
else
    echo -e "\n${GREEN}✓ Todos os arquivos essenciais encontrados.${NC}"
fi

# Resumo final
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Verificação de pré-deployment concluída.${NC}"

if [ "$all_files_present" = true ] && [ -n "$project_id" ] && [ -n "$region" ] && [ -n "$service_name" ] && [ -n "$ai_provider" ] && [ -n "$ai_model" ]; then
    echo -e "\n${GREEN}✅ Ambiente pronto para deployment de produção!${NC}"
    echo -e "${YELLOW}Para iniciar o deployment, execute:${NC}"
    echo -e "  ${CYAN}./tarefo-ai-deploy.sh${NC}"
else
    echo -e "\n${RED}❌ Existem problemas que precisam ser corrigidos antes do deployment!${NC}"
    echo -e "${YELLOW}Revise as mensagens acima e corrija os problemas encontrados.${NC}"
fi