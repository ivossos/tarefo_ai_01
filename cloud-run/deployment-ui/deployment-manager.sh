#!/bin/bash

# Deployment Manager para Tarefo AI - Ferramenta interativa para deployment
#
# Este script oferece uma interface de terminal interativa para facilitar
# todos os aspectos do deployment do Tarefo AI no Google Cloud Platform.

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # Sem cor

# Variáveis de configuração
CONFIG_FILE="deployment-config.json"
PROJECT_ID=""
REGION=""
SERVICE_NAME=""
DATABASE_INSTANCE=""

# Verificação de dependências
function check_dependencies() {
    local missing_deps=0
    
    echo -e "${BLUE}Verificando dependências...${NC}"
    
    # Verificar gcloud
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}✗ Google Cloud SDK (gcloud) não encontrado.${NC}"
        echo -e "   Instale em: https://cloud.google.com/sdk/docs/install"
        missing_deps=1
    else
        echo -e "${GREEN}✓ Google Cloud SDK encontrado.${NC}"
    fi
    
    # Verificar jq (para manipulação de JSON)
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠ jq não encontrado. Algumas funcionalidades podem ser limitadas.${NC}"
        echo -e "   Recomendado instalar: https://stedolan.github.io/jq/download/"
    else
        echo -e "${GREEN}✓ jq encontrado.${NC}"
    fi
    
    # Verificar whiptail (para interface TUI)
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}⚠ whiptail não encontrado. Interface será limitada.${NC}"
    else
        echo -e "${GREEN}✓ whiptail encontrado.${NC}"
    fi
    
    if [ $missing_deps -eq 1 ]; then
        echo -e "${RED}Algumas dependências obrigatórias estão faltando. Por favor, instale-as antes de continuar.${NC}"
        exit 1
    fi
}

# Carregar configuração existente
function load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${BLUE}Carregando configuração existente...${NC}"
        
        # Usar jq se disponível, caso contrário usar grep simples
        if command -v jq &> /dev/null; then
            PROJECT_ID=$(jq -r '.project_id // ""' "$CONFIG_FILE")
            REGION=$(jq -r '.region // ""' "$CONFIG_FILE")
            SERVICE_NAME=$(jq -r '.service_name // ""' "$CONFIG_FILE")
            DATABASE_INSTANCE=$(jq -r '.database_instance // ""' "$CONFIG_FILE")
        else
            PROJECT_ID=$(grep -o '"project_id": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            REGION=$(grep -o '"region": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            SERVICE_NAME=$(grep -o '"service_name": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            DATABASE_INSTANCE=$(grep -o '"database_instance": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
        fi
        
        echo -e "${GREEN}✓ Configuração carregada.${NC}"
    else
        echo -e "${YELLOW}Nenhuma configuração existente encontrada. Usando valores padrão.${NC}"
        
        # Valores padrão
        PROJECT_ID="tarefo-ai-prod"
        REGION="southamerica-east1"
        SERVICE_NAME="tarefo-ai"
        DATABASE_INSTANCE="tarefo-ai-db"
    fi
}

# Salvar configuração
function save_config() {
    echo -e "${BLUE}Salvando configuração...${NC}"
    
    # Verificar se jq está instalado para formatação adequada
    if command -v jq &> /dev/null; then
        echo "{
  \"project_id\": \"$PROJECT_ID\",
  \"region\": \"$REGION\",
  \"service_name\": \"$SERVICE_NAME\",
  \"database_instance\": \"$DATABASE_INSTANCE\"
}" | jq '.' > "$CONFIG_FILE"
    else
        # Fallback para salvamento básico sem jq
        echo "{
  \"project_id\": \"$PROJECT_ID\",
  \"region\": \"$REGION\",
  \"service_name\": \"$SERVICE_NAME\",
  \"database_instance\": \"$DATABASE_INSTANCE\"
}" > "$CONFIG_FILE"
    fi
    
    echo -e "${GREEN}✓ Configuração salva em $CONFIG_FILE${NC}"
}

# Verificar login no Google Cloud
function check_gcloud_login() {
    echo -e "${BLUE}Verificando autenticação no Google Cloud...${NC}"
    
    if ! gcloud auth print-access-token &> /dev/null; then
        echo -e "${YELLOW}Você não está autenticado no Google Cloud.${NC}"
        read -p "Deseja fazer login agora? (s/n): " do_login
        
        if [[ $do_login == "s" || $do_login == "S" ]]; then
            gcloud auth login
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}Falha ao autenticar. Por favor, tente novamente.${NC}"
                exit 1
            fi
        else
            echo -e "${RED}Autenticação necessária para continuar.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Já autenticado no Google Cloud.${NC}"
    fi
    
    # Configurar projeto
    if [ -n "$PROJECT_ID" ]; then
        echo -e "${BLUE}Configurando projeto $PROJECT_ID...${NC}"
        gcloud config set project "$PROJECT_ID"
    else
        echo -e "${YELLOW}ID do projeto não configurado.${NC}"
        read -p "Digite o ID do projeto Google Cloud: " PROJECT_ID
        gcloud config set project "$PROJECT_ID"
    fi
}

# Menu principal através de interface de texto (TUI) usando whiptail
function show_tui_menu() {
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}whiptail não está instalado. Usando menu de texto simples.${NC}"
        show_text_menu
        return
    fi
    
    local MENU_HEIGHT=16
    local MENU_WIDTH=78
    local CHOICE_HEIGHT=10
    
    while true; do
        OPTION=$(whiptail --title "Tarefo AI Deployment Manager" --menu "Escolha uma operação:" $MENU_HEIGHT $MENU_WIDTH $CHOICE_HEIGHT \
        "1" "Configurar ambiente de implantação" \
        "2" "Implantar aplicação completa" \
        "3" "Gerenciar serviços individuais" \
        "4" "Gerenciar banco de dados" \
        "5" "Configurar webhooks e integrações" \
        "6" "Gerenciar segredos" \
        "7" "Visualizar logs e diagnósticos" \
        "8" "Configurar CI/CD" \
        "9" "Sobre e ajuda" \
        "0" "Sair" 3>&1 1>&2 2>&3)
        
        local EXIT_STATUS=$?
        
        if [ $EXIT_STATUS -ne 0 ]; then
            echo -e "${YELLOW}Saindo do Deployment Manager.${NC}"
            break
        fi
        
        case $OPTION in
            1) configure_environment_menu ;;
            2) deploy_full_application ;;
            3) manage_services_menu ;;
            4) manage_database_menu ;;
            5) configure_webhooks_menu ;;
            6) manage_secrets_menu ;;
            7) view_logs_menu ;;
            8) configure_cicd_menu ;;
            9) show_help ;;
            0) echo -e "${YELLOW}Saindo do Deployment Manager.${NC}"; break ;;
        esac
    done
}

# Menu principal em texto simples (fallback se whiptail não estiver disponível)
function show_text_menu() {
    while true; do
        echo -e "\n${BLUE}${BOLD}=== Tarefo AI Deployment Manager ===${NC}\n"
        echo -e "1) Configurar ambiente de implantação"
        echo -e "2) Implantar aplicação completa"
        echo -e "3) Gerenciar serviços individuais"
        echo -e "4) Gerenciar banco de dados"
        echo -e "5) Configurar webhooks e integrações"
        echo -e "6) Gerenciar segredos"
        echo -e "7) Visualizar logs e diagnósticos"
        echo -e "8) Configurar CI/CD"
        echo -e "9) Sobre e ajuda"
        echo -e "0) Sair"
        echo ""
        read -p "Escolha uma opção: " OPTION
        
        case $OPTION in
            1) configure_environment_menu ;;
            2) deploy_full_application ;;
            3) manage_services_menu ;;
            4) manage_database_menu ;;
            5) configure_webhooks_menu ;;
            6) manage_secrets_menu ;;
            7) view_logs_menu ;;
            8) configure_cicd_menu ;;
            9) show_help ;;
            0) echo -e "${YELLOW}Saindo do Deployment Manager.${NC}"; break ;;
            *) echo -e "${RED}Opção inválida.${NC}" ;;
        esac
    done
}

# [Implemente as funções individuais para cada menu]
# Esta é apenas uma estrutura básica para a interface.
# Cada função precisaria implementar os comandos específicos para cada operação.

function configure_environment_menu() {
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}Para usar o assistente de configuração, o whiptail é necessário.${NC}"
        echo -e "Instale com 'sudo apt-get install whiptail' (Ubuntu/Debian)"
        echo -e "ou 'brew install newt' (macOS com Homebrew)"
        return
    fi
    
    # Menu de configuração de ambiente
    local OPTION=$(whiptail --title "Configuração de Ambiente" \
        --menu "Escolha uma opção:" 15 70 3 \
        "1" "Assistente de Configuração (configuração guiada)" \
        "2" "Estimador de Custos (calcular custos mensais)" \
        "0" "Voltar ao menu principal" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return
    fi
    
    case $OPTION in
        1)
            run_config_wizard
            ;;
        2)
            run_cost_estimator
            ;;
        0)
            return
            ;;
    esac
}

# Executar o assistente de configuração
function run_config_wizard() {
    # Verificar se o script do assistente existe
    if [ ! -f "cloud-run/deployment-ui/config-wizard.sh" ]; then
        echo -e "${RED}Erro: O arquivo do assistente de configuração não foi encontrado.${NC}"
        echo -e "Verifique se o arquivo 'cloud-run/deployment-ui/config-wizard.sh' existe."
        return
    fi
    
    # Tornar o script executável
    chmod +x cloud-run/deployment-ui/config-wizard.sh
    
    # Executar o assistente de configuração
    echo -e "${BLUE}Iniciando o assistente de configuração...${NC}"
    ./cloud-run/deployment-ui/config-wizard.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Configuração concluída com sucesso!${NC}"
        # Recarregar configurações
        load_config
    else
        echo -e "${YELLOW}O assistente de configuração foi cancelado ou encontrou um erro.${NC}"
    fi
}

# Executar o estimador de custos
function run_cost_estimator() {
    # Verificar se o script do estimador existe
    if [ ! -f "cloud-run/deployment-ui/cost-estimator.sh" ]; then
        echo -e "${RED}Erro: O arquivo do estimador de custos não foi encontrado.${NC}"
        echo -e "Verifique se o arquivo 'cloud-run/deployment-ui/cost-estimator.sh' existe."
        return
    fi
    
    # Verificar se bc está instalado (necessário para cálculos)
    if ! command -v bc &> /dev/null; then
        echo -e "${RED}Erro: O utilitário 'bc' não está instalado. Ele é necessário para os cálculos de custo.${NC}"
        echo -e "   Instale-o com 'sudo apt-get install bc' (Ubuntu/Debian)"
        echo -e "   ou 'brew install bc' (macOS com Homebrew)"
        return
    fi
    
    # Tornar o script executável
    chmod +x cloud-run/deployment-ui/cost-estimator.sh
    
    # Executar o estimador de custos
    echo -e "${BLUE}Iniciando o estimador de custos...${NC}"
    ./cloud-run/deployment-ui/cost-estimator.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Estimativa de custos concluída com sucesso!${NC}"
    else
        echo -e "${YELLOW}O estimador de custos foi cancelado ou encontrou um erro.${NC}"
    fi
}

function deploy_full_application() {
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}Para usar o assistente de deployment, o whiptail é necessário.${NC}"
        echo -e "Instale com 'sudo apt-get install whiptail' (Ubuntu/Debian)"
        echo -e "ou 'brew install newt' (macOS com Homebrew)"
        return
    fi

    # Menu de opções de deployment
    local OPTION=$(whiptail --title "Deployment de Aplicação" \
        --menu "Escolha o tipo de visualização:" 15 70 3 \
        "1" "Deployment com visualizador animado" \
        "2" "Deployment padrão (sem animação)" \
        "0" "Voltar ao menu principal" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return
    fi
    
    case $OPTION in
        1)
            run_animated_deployment
            ;;
        2)
            run_standard_deployment
            ;;
        0)
            return
            ;;
    esac
}

# Executar deployment com visualizador animado
function run_animated_deployment() {
    # Verificar se o script do visualizador existe
    if [ ! -f "cloud-run/deployment-ui/progress-visualizer.sh" ]; then
        echo -e "${RED}Erro: O arquivo do visualizador de progresso não foi encontrado.${NC}"
        echo -e "Verifique se o arquivo 'cloud-run/deployment-ui/progress-visualizer.sh' existe."
        return
    fi
    
    # Tornar o script executável
    chmod +x cloud-run/deployment-ui/progress-visualizer.sh
    
    # Executar o visualizador de progresso
    echo -e "${BLUE}Iniciando visualizador de progresso...${NC}"
    ./cloud-run/deployment-ui/progress-visualizer.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Visualização concluída com sucesso!${NC}"
    else
        echo -e "${YELLOW}O visualizador foi interrompido ou encontrou um erro.${NC}"
    fi
}

# Executar deployment padrão (sem animação)
function run_standard_deployment() {
    echo -e "${BLUE}Iniciando deployment padrão...${NC}"
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function manage_services_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function manage_database_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function configure_webhooks_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function manage_secrets_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function view_logs_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function configure_cicd_menu() {
    echo -e "${YELLOW}Esta funcionalidade será implementada na próxima versão.${NC}"
}

function show_help() {
    clear
    echo -e "${BLUE}${BOLD}=== Ajuda do Tarefo AI Deployment Manager ===${NC}\n"
    echo -e "${BOLD}Sobre:${NC}"
    echo -e "O Tarefo AI Deployment Manager é uma ferramenta all-in-one para facilitar"
    echo -e "o deployment e gerenciamento da aplicação Tarefo AI no Google Cloud Platform."
    echo -e ""
    echo -e "${BOLD}Funções principais:${NC}"
    echo -e "- Configuração completa do ambiente"
    echo -e "- Deployment da aplicação no Cloud Run"
    echo -e "- Gerenciamento do banco de dados PostgreSQL"
    echo -e "- Configuração de webhooks para integrações"
    echo -e "- Gerenciamento de segredos e configurações"
    echo -e "- Visualização de logs e diagnósticos"
    echo -e "- Configuração de CI/CD"
    echo -e ""
    echo -e "${BOLD}Requisitos:${NC}"
    echo -e "- Google Cloud SDK (gcloud) instalado"
    echo -e "- Conta Google Cloud com permissões de administrador"
    echo -e "- Versão 2.0 ou superior do bash"
    echo -e ""
    echo -e "${BOLD}Dicas:${NC}"
    echo -e "- Use a opção 'Configurar ambiente' antes de qualquer operação"
    echo -e "- Verifique os logs regularmente para monitorar a aplicação"
    echo -e "- Faça backup do banco de dados periodicamente"
    echo -e ""
    read -p "Pressione Enter para voltar ao menu principal..." dummy
}

# Função principal
function main() {
    mkdir -p cloud-run/deployment-ui
    
    echo -e "${BLUE}${BOLD}"
    echo "  ______                  __          ___    ___ "
    echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
    echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
    echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
    echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
    echo "                                                 "
    echo -e "${NC}"
    echo -e "${BOLD}Deployment Manager${NC} - Versão 1.0.0"
    echo ""
    
    # Verificar dependências
    check_dependencies
    
    # Carregar configuração
    load_config
    
    # Verificar login no Google Cloud
    check_gcloud_login
    
    # Mostrar menu principal
    show_tui_menu
}

# Executar função principal
main