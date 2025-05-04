#!/bin/bash

# Script de deployment simplificado para produção - TarefoAI
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
echo -e "${GREEN}Deployment de Produção - Execution Plan${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Carregar configurações do arquivo
CONFIG_FILE="cloud-run/implementation-config-simple.txt"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    echo -e "${GREEN}✓ Arquivo de configuração carregado: $CONFIG_FILE${NC}"
    
    # Mostrar as configurações carregadas
    echo -e "\n${YELLOW}Configurações atuais:${NC}"
    echo -e "  ${CYAN}Projeto:${NC} $project_id"
    echo -e "  ${CYAN}Região:${NC} $region"
    echo -e "  ${CYAN}Serviço:${NC} $service_name"
    echo -e "  ${CYAN}DB:${NC} $db_instance (PostgreSQL $db_version)"
    echo -e "  ${CYAN}Memória:${NC} $memory / ${CYAN}CPU:${NC} $cpu"
    echo -e "  ${CYAN}AI:${NC} $ai_provider/$ai_model (Backup: $backup_provider/$backup_model)"
    
    # Mostrar integrações
    echo -e "\n${YELLOW}Integrações ativas:${NC}"
    if [ "$telegram" == "true" ]; then echo -e "  ${GREEN}✓${NC} Telegram"; fi
    if [ "$whatsapp" == "true" ]; then echo -e "  ${GREEN}✓${NC} WhatsApp"; fi
    if [ "$sms" == "true" ]; then echo -e "  ${GREEN}✓${NC} SMS"; fi
    if [ "$google_calendar" == "true" ]; then echo -e "  ${GREEN}✓${NC} Google Calendar"; fi
else
    echo -e "${RED}❌ Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    exit 1
fi

# Detecção de ambiente
echo -e "\n${YELLOW}Avaliando ambiente:${NC}"

# Verificar se estamos no Replit
if [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]; then
    echo -e "  ${CYAN}Ambiente:${NC} Replit (REPL_ID: $REPL_ID)"
    is_replit=true
else
    echo -e "  ${CYAN}Ambiente:${NC} Local ou CI/CD"
    is_replit=false
fi

# Verificar se o gcloud está instalado
if command -v gcloud &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Google Cloud SDK (gcloud) encontrado"
    has_gcloud=true
else
    echo -e "  ${RED}❌${NC} Google Cloud SDK (gcloud) não encontrado"
    has_gcloud=false
fi

# Verificar se o docker está instalado
if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Docker encontrado"
    has_docker=true
else
    echo -e "  ${RED}❌${NC} Docker não encontrado"
    has_docker=false
fi

# Determinar o método de deployment mais adequado
echo -e "\n${YELLOW}Determinando método de deployment ideal:${NC}"

if [ "$is_replit" = true ]; then
    if [ "$has_gcloud" = true ]; then
        echo -e "  ${GREEN}✓${NC} Método recomendado: Cloud Build direto via gcloud"
        deployment_method="cloud_build"
    else
        echo -e "  ${GREEN}✓${NC} Método recomendado: GitHub Actions (CI/CD)"
        deployment_method="github_actions"
    fi
else
    if [ "$has_docker" = true ] && [ "$has_gcloud" = true ]; then
        echo -e "  ${GREEN}✓${NC} Método recomendado: Deployment local via gcloud"
        deployment_method="gcloud"
    elif [ "$has_gcloud" = true ]; then
        echo -e "  ${GREEN}✓${NC} Método recomendado: Cloud Build direto via gcloud"
        deployment_method="cloud_build"
    else
        echo -e "  ${GREEN}✓${NC} Método recomendado: GitHub Actions (CI/CD)"
        deployment_method="github_actions"
    fi
fi

# Plano de execução
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Plano de Execução do Deployment${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

echo -e "\n${YELLOW}O deployment de produção seguirá estas etapas:${NC}"

case $deployment_method in
    github_actions)
        echo -e "  ${CYAN}1.${NC} Preparar repositório GitHub com arquivo de workflow"
        echo -e "  ${CYAN}2.${NC} Configurar Federação de Identidade de Carga de Trabalho no GCP"
        echo -e "  ${CYAN}3.${NC} Adicionar secrets necessários ao repositório GitHub"
        echo -e "  ${CYAN}4.${NC} Fazer commit e push para a branch main"
        echo -e "  ${CYAN}5.${NC} Monitorar o progresso na aba Actions do GitHub"
        ;;
    cloud_build)
        echo -e "  ${CYAN}1.${NC} Autenticar no Google Cloud Platform"
        echo -e "  ${CYAN}2.${NC} Configurar projeto GCP: $project_id"
        echo -e "  ${CYAN}3.${NC} Habilitar APIs necessárias (Cloud Build, Cloud Run, etc.)"
        echo -e "  ${CYAN}4.${NC} Enviar build para Cloud Build usando cloudbuild.yaml"
        echo -e "  ${CYAN}5.${NC} Monitorar o progresso no Console do GCP"
        ;;
    gcloud)
        echo -e "  ${CYAN}1.${NC} Autenticar no Google Cloud Platform"
        echo -e "  ${CYAN}2.${NC} Configurar projeto GCP: $project_id"
        echo -e "  ${CYAN}3.${NC} Construir imagem Docker localmente"
        echo -e "  ${CYAN}4.${NC} Enviar imagem para Container Registry"
        echo -e "  ${CYAN}5.${NC} Implantar serviço no Cloud Run"
        echo -e "  ${CYAN}6.${NC} Implantar Cloud Function para webhooks"
        echo -e "  ${CYAN}7.${NC} Configurar banco de dados e secrets"
        ;;
esac

echo -e "\n${YELLOW}Recursos a serem criados:${NC}"
echo -e "  ${CYAN}•${NC} Serviço Cloud Run: $service_name ($memory, $cpu)"
echo -e "  ${CYAN}•${NC} Cloud Function: tarefo-ai-webhook"
echo -e "  ${CYAN}•${NC} Banco de dados: $db_instance (PostgreSQL $db_version)"
echo -e "  ${CYAN}•${NC} Secrets para API keys e tokens"

# Estimativa de custos
echo -e "\n${YELLOW}Estimativa de custos mensais (aproximada):${NC}"
echo -e "  ${CYAN}Cloud Run:${NC} $15-30 USD/mês (com base em uso moderado)"
echo -e "  ${CYAN}Cloud SQL:${NC} $25-50 USD/mês (depende da configuração)"
echo -e "  ${CYAN}Cloud Functions:${NC} $0-5 USD/mês (com base em volume de webhooks)"
echo -e "  ${CYAN}Outros serviços:${NC} $5-10 USD/mês"
echo -e "  ${CYAN}Total estimado:${NC} $45-95 USD/mês"

# Confirmação e próximos passos
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Próximos Passos${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

echo -e "\n${YELLOW}Para prosseguir com o deployment via $deployment_method:${NC}"

case $deployment_method in
    github_actions)
        echo -e "  ${CYAN}1.${NC} Execute: ./deploy.sh"
        echo -e "  ${CYAN}2.${NC} Selecione a opção 1 (GitHub Actions)"
        echo -e "  ${CYAN}3.${NC} Siga as instruções interativas"
        ;;
    cloud_build)
        echo -e "  ${CYAN}1.${NC} Execute: ./deploy.sh"
        echo -e "  ${CYAN}2.${NC} Selecione a opção 2 (Cloud Build)"
        echo -e "  ${CYAN}3.${NC} Siga as instruções interativas"
        ;;
    gcloud)
        echo -e "  ${CYAN}1.${NC} Execute: ./deploy.sh"
        echo -e "  ${CYAN}2.${NC} Selecione a opção 3 (Manual via gcloud)"
        echo -e "  ${CYAN}3.${NC} Siga as instruções interativas"
        ;;
esac

echo -e "\n${GREEN}✅ Plano de deployment gerado com sucesso!${NC}"
echo -e "${YELLOW}Execute ./deploy.sh para iniciar o processo interativo de deployment.${NC}"