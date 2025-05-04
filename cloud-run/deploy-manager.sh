#!/bin/bash

# Script de gerenciamento de implantação do Tarefo AI
# Este script oferece uma interface amigável para todas as operações de implantação

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem cor

# Configurações
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"

# Função para exibir a ajuda
function show_help {
    echo -e "${BLUE}=== Tarefo AI - Gerenciador de Implantação ===${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup              Configuração inicial (projeto, APIs, banco de dados)"
    echo "  deploy             Implanta a aplicação no Cloud Run"
    echo "  deploy-function    Implanta a Cloud Function para webhooks"
    echo "  setup-secrets      Configura os segredos necessários"
    echo "  setup-scheduler    Configura tarefas agendadas"
    echo "  setup-monitoring   Configura alertas e monitoramento"
    echo "  logs               Visualiza logs da aplicação"
    echo "  status             Verifica o status da implantação"
    echo "  all                Executa toda a implantação (setup + deploy + function)"
    echo "  help               Exibe esta ajuda"
    echo ""
    echo -e "${YELLOW}Exemplo: $0 deploy${NC}"
}

# Função para configuração inicial
function setup {
    echo -e "${BLUE}Iniciando configuração inicial...${NC}"
    
    # Verificar login
    echo "🔑 Verificando autenticação no Google Cloud..."
    if ! gcloud auth print-access-token &> /dev/null; then
        echo "📝 Faça login no Google Cloud..."
        gcloud auth login
    fi
    
    # Configurar projeto
    echo "🔧 Configurando projeto ${PROJECT_ID}..."
    gcloud config set project ${PROJECT_ID}
    
    # Habilitar APIs necessárias
    echo "🔌 Habilitando APIs necessárias..."
    gcloud services enable cloudbuild.googleapis.com run.googleapis.com \
        sqladmin.googleapis.com secretmanager.googleapis.com \
        cloudfunctions.googleapis.com cloudscheduler.googleapis.com
    
    echo -e "${GREEN}✓ Configuração inicial concluída.${NC}"
    
    # Perguntar se deseja configurar o banco de dados
    read -p "Deseja configurar o banco de dados agora? (s/n): " setup_db
    if [[ $setup_db == "s" || $setup_db == "S" ]]; then
        bash cloud-run/setup-database.sh
    fi
}

# Função para implantação no Cloud Run
function deploy {
    echo -e "${BLUE}Iniciando implantação no Cloud Run...${NC}"
    
    # Verificar qual método de implantação usar
    if command -v docker &> /dev/null; then
        echo "🐳 Docker encontrado, usando implantação padrão..."
        bash cloud-run/script-deploy.sh
    else
        echo "🔄 Docker não encontrado, usando Cloud Build para implantação..."
        bash cloud-run/deploy-without-docker.sh
    fi
    
    echo -e "${GREEN}✓ Implantação concluída.${NC}"
}

# Função para implantar a Cloud Function
function deploy_function {
    echo -e "${BLUE}Iniciando implantação da Cloud Function para webhooks...${NC}"
    bash cloud-run/deploy-function.sh
    echo -e "${GREEN}✓ Implantação da função concluída.${NC}"
}

# Função para configurar segredos
function setup_secrets {
    echo -e "${BLUE}Configurando segredos...${NC}"
    bash cloud-run/setup-secrets.sh
    echo -e "${GREEN}✓ Configuração de segredos concluída.${NC}"
}

# Função para configurar tarefas agendadas
function setup_scheduler {
    echo -e "${BLUE}Configurando tarefas agendadas...${NC}"
    bash cloud-run/setup-scheduler.sh
    echo -e "${GREEN}✓ Configuração de tarefas agendadas concluída.${NC}"
}

# Função para configurar monitoramento
function setup_monitoring {
    echo -e "${BLUE}Configurando monitoramento...${NC}"
    bash cloud-run/setup-monitoring.sh
    echo -e "${GREEN}✓ Configuração de monitoramento concluída.${NC}"
}

# Função para visualizar logs
function view_logs {
    echo -e "${BLUE}Buscando logs recentes da aplicação...${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit=50
}

# Função para verificar status
function check_status {
    echo -e "${BLUE}Verificando status da implantação...${NC}"
    
    # Verificar serviço Cloud Run
    echo "🔍 Verificando serviço Cloud Run..."
    if gcloud run services describe ${SERVICE_NAME} --region=${REGION} &> /dev/null; then
        SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
        echo -e "${GREEN}✓ Serviço Cloud Run está em execução: ${SERVICE_URL}${NC}"
        
        # Verificar status HTTP
        echo "🌐 Verificando resposta HTTP..."
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL})
        if [[ $HTTP_STATUS == 2* ]]; then
            echo -e "${GREEN}✓ Aplicação está respondendo com status HTTP ${HTTP_STATUS}${NC}"
        else
            echo -e "${RED}✗ Aplicação está respondendo com status HTTP ${HTTP_STATUS}${NC}"
        fi
    else
        echo -e "${RED}✗ Serviço Cloud Run não encontrado${NC}"
    fi
    
    # Verificar banco de dados
    echo "🔍 Verificando instância do Cloud SQL..."
    if gcloud sql instances describe tarefo-ai-db &> /dev/null; then
        echo -e "${GREEN}✓ Instância do Cloud SQL está em execução${NC}"
    else
        echo -e "${RED}✗ Instância do Cloud SQL não encontrada${NC}"
    fi
    
    # Verificar Cloud Function
    echo "🔍 Verificando Cloud Function..."
    if gcloud functions describe whatsapp-webhook --region=${REGION} &> /dev/null; then
        FUNCTION_URL=$(gcloud functions describe whatsapp-webhook --region=${REGION} --format="value(httpsTrigger.url)")
        echo -e "${GREEN}✓ Cloud Function está em execução: ${FUNCTION_URL}${NC}"
    else
        echo -e "${YELLOW}⚠ Cloud Function não encontrada ou não implantada ainda${NC}"
    fi
}

# Função para executar todo o processo
function deploy_all {
    echo -e "${BLUE}Iniciando processo completo de implantação...${NC}"
    setup
    setup_secrets
    deploy
    deploy_function
    setup_scheduler
    setup_monitoring
    check_status
    echo -e "${GREEN}✓ Processo completo de implantação concluído.${NC}"
}

# Menu principal
case "$1" in
    setup)
        setup
        ;;
    deploy)
        deploy
        ;;
    deploy-function)
        deploy_function
        ;;
    setup-secrets)
        setup_secrets
        ;;
    setup-scheduler)
        setup_scheduler
        ;;
    setup-monitoring)
        setup_monitoring
        ;;
    logs)
        view_logs
        ;;
    status)
        check_status
        ;;
    all)
        deploy_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}Comando não reconhecido: $1${NC}"
        show_help
        exit 1
        ;;
esac

exit 0