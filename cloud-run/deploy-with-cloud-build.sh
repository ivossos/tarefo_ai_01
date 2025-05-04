#!/bin/bash

# Script de deployment via Cloud Build
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
echo -e "${GREEN}Deployment via Cloud Build${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Verificar autenticação no GCP
echo -e "\n${YELLOW}Verificando autenticação no Google Cloud...${NC}"
gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)

if [ -z "$gcloud_auth" ]; then
    echo -e "${RED}Erro: Nenhuma autenticação encontrada.${NC}"
    echo -e "${YELLOW}Use o script authenticate-gcp.sh primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticado como: $gcloud_auth${NC}"

# Verificar projeto atual
project=$(gcloud config get-value project 2>/dev/null)
if [ -z "$project" ] || [ "$project" == "(unset)" ]; then
    echo -e "${RED}Erro: Nenhum projeto configurado.${NC}"
    echo -e "${YELLOW}Use 'gcloud config set project ID_DO_PROJETO' para configurar o projeto.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Projeto atual: $project${NC}"

# Carregar configurações do arquivo
CONFIG_FILE="implementation-config-simple.txt"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    echo -e "${GREEN}✓ Arquivo de configuração carregado: $CONFIG_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo de configuração não encontrado. Usando valores padrão.${NC}"
    region="southamerica-east1"
    service_name="tarefo-ai"
fi

# Verificar existência do cloudbuild.yaml
if [ ! -f "../cloudbuild.yaml" ]; then
    echo -e "${RED}Erro: cloudbuild.yaml não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo cloudbuild.yaml encontrado${NC}"

# Habilitar APIs necessárias
echo -e "\n${YELLOW}Habilitando APIs necessárias...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

apis_to_enable=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "cloudfunctions.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "sqladmin.googleapis.com"
    "containerregistry.googleapis.com"
)

for api in "${apis_to_enable[@]}"; do
    echo -e "  ${CYAN}Habilitando $api...${NC}"
    gcloud services enable "$api" --quiet
    
    if [ $? -ne 0 ]; then
        echo -e "  ${YELLOW}⚠ Falha ao habilitar $api. Continuando...${NC}"
    else
        echo -e "  ${GREEN}✓ API habilitada: $api${NC}"
    fi
done

# Iniciar o build e deployment
echo -e "\n${YELLOW}Iniciando deployment com Cloud Build...${NC}"
echo -e "${YELLOW}Isso irá iniciar o build e deployment da aplicação.${NC}"
echo -e "${YELLOW}O processo pode levar vários minutos.${NC}"

# Mostrar configurações de deployment
echo -e "\n${YELLOW}Configurações do deployment:${NC}"
echo -e "  ${CYAN}Projeto:${NC} $project"
echo -e "  ${CYAN}Região:${NC} $region"
echo -e "  ${CYAN}Serviço:${NC} $service_name"

echo -e "\n${YELLOW}Continuar com o deployment? (s/n)${NC}"
read -r confirm

if [[ $confirm != "s" && $confirm != "S" ]]; then
    echo -e "${YELLOW}Deployment cancelado pelo usuário.${NC}"
    exit 0
fi

# Submeter o build ao Cloud Build
echo -e "\n${YELLOW}Iniciando build...${NC}"

cd ..
gcloud builds submit --config=cloudbuild.yaml --substitutions=_REGION="$region",_SERVICE_NAME="$service_name"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha no build.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build e deployment concluídos com sucesso!${NC}"

# Obter URL do serviço
echo -e "\n${YELLOW}Obtendo URL do serviço...${NC}"
service_url=$(gcloud run services describe "$service_name" --platform=managed --region="$region" --format="value(status.url)")

if [ -n "$service_url" ]; then
    echo -e "${GREEN}✓ Serviço implantado com sucesso!${NC}"
    echo -e "${GREEN}✓ URL do serviço: $service_url${NC}"
else
    echo -e "${YELLOW}⚠ Não foi possível obter a URL do serviço.${NC}"
fi

# Verificar se o webhook foi implantado
echo -e "\n${YELLOW}Verificando implantação do webhook...${NC}"
function_exists=$(gcloud functions list --filter="name:tarefo-ai-webhook" --format="value(name)" 2>/dev/null)

if [ -n "$function_exists" ]; then
    function_url=$(gcloud functions describe tarefo-ai-webhook --format="value(httpsTrigger.url)" 2>/dev/null)
    
    if [ -n "$function_url" ]; then
        echo -e "${GREEN}✓ Webhook implantado com sucesso!${NC}"
        echo -e "${GREEN}✓ URL do webhook: $function_url${NC}"
    else
        echo -e "${YELLOW}⚠ Webhook implantado, mas não foi possível obter a URL.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Webhook não encontrado. Verifique os logs do build.${NC}"
fi

# Resumo final
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Deployment concluído!${NC}"

if [ -n "$service_url" ]; then
    echo -e "${YELLOW}Acesse o TarefoAI em: $service_url${NC}"
fi

if [ -n "$function_url" ]; then
    echo -e "${YELLOW}Configure os webhooks externos para apontar para: $function_url${NC}"
fi

echo -e "\n${YELLOW}Próximos passos:${NC}"
echo -e "  ${CYAN}1.${NC} Configure os webhooks do Telegram, WhatsApp e outros serviços"
echo -e "  ${CYAN}2.${NC} Verifique os logs do serviço para garantir que tudo está funcionando"
echo -e "  ${CYAN}3.${NC} Faça um teste completo das funcionalidades"

echo -e "\n${GREEN}✅ TarefoAI implantado com sucesso na nuvem!${NC}"