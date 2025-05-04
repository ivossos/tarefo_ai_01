#!/bin/bash

# Assistente de Implementação (Implementation Wizard) para Tarefo AI
#
# Esta ferramenta guia o usuário pelo processo completo de implementação do Tarefo AI,
# desde a preparação do ambiente até o deployment final, incluindo todas as integrações.

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # Sem cor

# Ícones
CHECK_MARK="✓"
CROSS_MARK="✗"
ARROW="→"
ROCKET="🚀"
GEAR="⚙️"
DATABASE="🗄️"
KEY="🔑"
CLOUD="☁️"
SERVER="📡"
BRAIN="🧠"
CALENDAR="📅"
PHONE="📱"
BELL="🔔"
BANK="🏦"

# Variáveis de estado
CONFIG_FILE="implementation-config.json"
LOG_FILE="implementation-wizard.log"
CURRENT_STEP=1
TOTAL_STEPS=7

# Função para registrar logs
function log() {
    local message=$1
    local level=${2:-INFO}
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    if [[ "$level" == "ERROR" ]]; then
        echo -e "${RED}[$level] $message${NC}"
    fi
}

# Função para criar arquivo de configuração JSON
function create_default_config() {
    cat > "$CONFIG_FILE" << EOF
{
    "project_id": "",
    "region": "us-central1",
    "database": {
        "type": "postgresql",
        "instance_name": "tarefo-ai-db",
        "version": "14",
        "tier": "db-f1-micro"
    },
    "cloud_run": {
        "service_name": "tarefo-ai",
        "memory": "1Gi",
        "cpu": "1",
        "min_instances": 0,
        "max_instances": 2
    },
    "cloud_functions": {
        "webhook_function": "tarefo-ai-webhook",
        "scheduler_function": "tarefo-ai-scheduler",
        "memory": "256MB",
        "timeout": "60s"
    },
    "integrations": {
        "telegram": false,
        "whatsapp": false,
        "sms": false,
        "google_calendar": false,
        "apple_calendar": false,
        "open_banking": false
    },
    "ai_config": {
        "provider": "openai",
        "model": "gpt-4o",
        "backup_provider": "anthropic",
        "backup_model": "claude-3-7-sonnet-20250219"
    },
    "security": {
        "enable_ssl": true,
        "enable_iap": false,
        "enable_vpc": false
    }
}
EOF
    log "Arquivo de configuração padrão criado: $CONFIG_FILE"
}

# Função para mostrar cabeçalho
function show_header() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "  ______                  __          ___    ___ "
    echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
    echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
    echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
    echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
    echo -e "${NC}"
    echo -e "${BOLD}Assistente de Implementação${NC} - Passo a passo para implementar o Tarefo AI"
    echo ""
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 80))${NC}"
    echo ""
}

# Função para mostrar a barra de progresso
function show_progress() {
    local percent=$(( CURRENT_STEP * 100 / TOTAL_STEPS ))
    local width=50
    local completed=$(( width * percent / 100 ))
    
    echo -ne "${CYAN}Progresso: [${NC}"
    for ((i=0; i<completed; i++)); do echo -ne "${GREEN}#${NC}"; done
    for ((i=completed; i<width; i++)); do echo -ne "-"; done
    echo -e "${CYAN}] $percent%${NC}"
    echo -e "${CYAN}Etapa $CURRENT_STEP de $TOTAL_STEPS: $1${NC}"
    echo ""
}

# Função para confirmar ação
function confirm_action() {
    local message=$1
    local default=${2:-"s"}
    
    if [ "$default" = "s" ]; then
        local options="[S/n]"
    else
        local options="[s/N]"
    fi
    
    read -p "$message $options: " response
    response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
    
    if [ -z "$response" ]; then
        response=$default
    fi
    
    if [ "$response" = "s" ]; then
        return 0
    else
        return 1
    fi
}

# Função para selecionar opção de um menu
function select_option() {
    local title=$1
    shift
    local options=("$@")
    local choice
    
    echo -e "${BLUE}$title${NC}"
    for i in "${!options[@]}"; do
        echo "  $((i+1)). ${options[$i]}"
    done
    echo ""
    
    while true; do
        read -p "Escolha uma opção (1-${#options[@]}): " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
            return $((choice-1))
        else
            echo -e "${RED}Opção inválida. Tente novamente.${NC}"
        fi
    done
}

# Função para definir configuração
function set_config() {
    local key=$1
    local value=$2
    local temp_file="temp_config.json"
    
    jq ".$key = \"$value\"" "$CONFIG_FILE" > "$temp_file" && mv "$temp_file" "$CONFIG_FILE"
    log "Configuração atualizada: $key = $value"
}

# Função para definir configuração aninhada
function set_nested_config() {
    local parent=$1
    local key=$2
    local value=$3
    local temp_file="temp_config.json"
    
    if [[ "$value" == "true" || "$value" == "false" ]]; then
        jq ".$parent.$key = $value" "$CONFIG_FILE" > "$temp_file" && mv "$temp_file" "$CONFIG_FILE"
    else
        jq ".$parent.$key = \"$value\"" "$CONFIG_FILE" > "$temp_file" && mv "$temp_file" "$CONFIG_FILE"
    fi
    
    log "Configuração aninhada atualizada: $parent.$key = $value"
}

# Passo 1: Configuração do Projeto GCP
function step_project_setup() {
    show_header
    show_progress "Configuração do Projeto Google Cloud Platform"
    
    echo -e "${BOLD}${CLOUD} Configuração do Projeto GCP${NC}"
    echo -e "${YELLOW}Esta etapa configura as informações básicas do seu projeto Google Cloud.${NC}"
    echo ""
    
    read -p "ID do Projeto GCP (ex: tarefo-ai-prod): " project_id
    if [ -n "$project_id" ]; then
        set_config "project_id" "$project_id"
    fi
    
    local regions=("us-central1 (Iowa)" "us-east1 (South Carolina)" "us-east4 (N. Virginia)" "us-west1 (Oregon)" "southamerica-east1 (São Paulo)" "europe-west1 (Belgium)" "asia-east1 (Taiwan)")
    select_option "Selecione a região para deployment:" "${regions[@]}"
    local region_choice=$?
    
    case $region_choice in
        0) region="us-central1" ;;
        1) region="us-east1" ;;
        2) region="us-east4" ;;
        3) region="us-west1" ;;
        4) region="southamerica-east1" ;;
        5) region="europe-west1" ;;
        6) region="asia-east1" ;;
    esac
    
    set_config "region" "$region"
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração do projeto concluída!${NC}"
    echo -e "ID do Projeto: ${CYAN}$project_id${NC}"
    echo -e "Região: ${CYAN}$region${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 2: Configuração do Banco de Dados
function step_database_setup() {
    show_header
    show_progress "Configuração do Banco de Dados"
    
    echo -e "${BOLD}${DATABASE} Configuração do Banco de Dados${NC}"
    echo -e "${YELLOW}Esta etapa configura o banco de dados PostgreSQL para o Tarefo AI.${NC}"
    echo ""
    
    read -p "Nome da instância do banco de dados [tarefo-ai-db]: " db_instance
    if [ -n "$db_instance" ]; then
        set_nested_config "database" "instance_name" "$db_instance"
    fi
    
    local versions=("PostgreSQL 14 (Recomendado)" "PostgreSQL 13" "PostgreSQL 12")
    select_option "Selecione a versão do PostgreSQL:" "${versions[@]}"
    local version_choice=$?
    
    case $version_choice in
        0) db_version="14" ;;
        1) db_version="13" ;;
        2) db_version="12" ;;
    esac
    
    set_nested_config "database" "version" "$db_version"
    
    local tiers=("db-f1-micro (Desenvolvimento)" "db-g1-small (Pequeno)" "db-custom-1-3840 (Médio)" "db-custom-2-7680 (Grande)")
    select_option "Selecione o tipo de máquina para o banco de dados:" "${tiers[@]}"
    local tier_choice=$?
    
    case $tier_choice in
        0) db_tier="db-f1-micro" ;;
        1) db_tier="db-g1-small" ;;
        2) db_tier="db-custom-1-3840" ;;
        3) db_tier="db-custom-2-7680" ;;
    esac
    
    set_nested_config "database" "tier" "$db_tier"
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração do banco de dados concluída!${NC}"
    echo -e "Instância: ${CYAN}$db_instance${NC}"
    echo -e "Versão: ${CYAN}PostgreSQL $db_version${NC}"
    echo -e "Tipo: ${CYAN}$db_tier${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 3: Configuração do Cloud Run
function step_cloud_run_setup() {
    show_header
    show_progress "Configuração do Cloud Run"
    
    echo -e "${BOLD}${SERVER} Configuração do Cloud Run${NC}"
    echo -e "${YELLOW}Esta etapa configura o serviço Cloud Run para o backend do Tarefo AI.${NC}"
    echo ""
    
    read -p "Nome do serviço Cloud Run [tarefo-ai]: " service_name
    if [ -n "$service_name" ]; then
        set_nested_config "cloud_run" "service_name" "$service_name"
    fi
    
    local memories=("512Mi (Mínimo)" "1Gi (Recomendado)" "2Gi (Médio)" "4Gi (Grande)")
    select_option "Selecione a memória para o serviço Cloud Run:" "${memories[@]}"
    local memory_choice=$?
    
    case $memory_choice in
        0) memory="512Mi" ;;
        1) memory="1Gi" ;;
        2) memory="2Gi" ;;
        3) memory="4Gi" ;;
    esac
    
    set_nested_config "cloud_run" "memory" "$memory"
    
    local cpus=("1 (Mínimo)" "2 (Médio)" "4 (Grande)")
    select_option "Selecione o número de CPUs para o serviço Cloud Run:" "${cpus[@]}"
    local cpu_choice=$?
    
    case $cpu_choice in
        0) cpu="1" ;;
        1) cpu="2" ;;
        2) cpu="4" ;;
    esac
    
    set_nested_config "cloud_run" "cpu" "$cpu"
    
    read -p "Número mínimo de instâncias [0]: " min_instances
    if [ -n "$min_instances" ]; then
        set_nested_config "cloud_run" "min_instances" "$min_instances"
    fi
    
    read -p "Número máximo de instâncias [2]: " max_instances
    if [ -n "$max_instances" ]; then
        set_nested_config "cloud_run" "max_instances" "$max_instances"
    fi
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração do Cloud Run concluída!${NC}"
    echo -e "Serviço: ${CYAN}$service_name${NC}"
    echo -e "Memória: ${CYAN}$memory${NC}"
    echo -e "CPUs: ${CYAN}$cpu${NC}"
    echo -e "Instâncias: ${CYAN}$min_instances - $max_instances${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 4: Configuração das Cloud Functions
function step_functions_setup() {
    show_header
    show_progress "Configuração das Cloud Functions"
    
    echo -e "${BOLD}${GEAR} Configuração das Cloud Functions${NC}"
    echo -e "${YELLOW}Esta etapa configura as Cloud Functions necessárias para webhooks e tarefas agendadas.${NC}"
    echo ""
    
    read -p "Nome da função para webhooks [tarefo-ai-webhook]: " webhook_function
    if [ -n "$webhook_function" ]; then
        set_nested_config "cloud_functions" "webhook_function" "$webhook_function"
    fi
    
    read -p "Nome da função para agendamento [tarefo-ai-scheduler]: " scheduler_function
    if [ -n "$scheduler_function" ]; then
        set_nested_config "cloud_functions" "scheduler_function" "$scheduler_function"
    fi
    
    local memories=("128MB (Mínimo)" "256MB (Recomendado)" "512MB (Médio)" "1024MB (Grande)")
    select_option "Selecione a memória para as Cloud Functions:" "${memories[@]}"
    local memory_choice=$?
    
    case $memory_choice in
        0) function_memory="128MB" ;;
        1) function_memory="256MB" ;;
        2) function_memory="512MB" ;;
        3) function_memory="1024MB" ;;
    esac
    
    set_nested_config "cloud_functions" "memory" "$function_memory"
    
    local timeouts=("30s (Mínimo)" "60s (Recomendado)" "120s (Médio)" "300s (Máximo)")
    select_option "Selecione o timeout para as Cloud Functions:" "${timeouts[@]}"
    local timeout_choice=$?
    
    case $timeout_choice in
        0) function_timeout="30s" ;;
        1) function_timeout="60s" ;;
        2) function_timeout="120s" ;;
        3) function_timeout="300s" ;;
    esac
    
    set_nested_config "cloud_functions" "timeout" "$function_timeout"
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração das Cloud Functions concluída!${NC}"
    echo -e "Função Webhook: ${CYAN}$webhook_function${NC}"
    echo -e "Função Scheduler: ${CYAN}$scheduler_function${NC}"
    echo -e "Memória: ${CYAN}$function_memory${NC}"
    echo -e "Timeout: ${CYAN}$function_timeout${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 5: Configuração das Integrações
function step_integrations_setup() {
    show_header
    show_progress "Configuração das Integrações"
    
    echo -e "${BOLD}${PHONE} Configuração das Integrações${NC}"
    echo -e "${YELLOW}Esta etapa configura as integrações externas para o Tarefo AI.${NC}"
    echo ""
    
    if confirm_action "Deseja ativar a integração com Telegram?"; then
        set_nested_config "integrations" "telegram" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com Telegram ativada!${NC}"
    else
        set_nested_config "integrations" "telegram" "false"
        echo -e "${RED}${CROSS_MARK} Integração com Telegram desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com WhatsApp (via Twilio)?"; then
        set_nested_config "integrations" "whatsapp" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com WhatsApp ativada!${NC}"
    else
        set_nested_config "integrations" "whatsapp" "false"
        echo -e "${RED}${CROSS_MARK} Integração com WhatsApp desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com SMS (via Twilio)?"; then
        set_nested_config "integrations" "sms" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com SMS ativada!${NC}"
    else
        set_nested_config "integrations" "sms" "false"
        echo -e "${RED}${CROSS_MARK} Integração com SMS desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Google Calendar?"; then
        set_nested_config "integrations" "google_calendar" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com Google Calendar ativada!${NC}"
    else
        set_nested_config "integrations" "google_calendar" "false"
        echo -e "${RED}${CROSS_MARK} Integração com Google Calendar desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Apple Calendar?"; then
        set_nested_config "integrations" "apple_calendar" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com Apple Calendar ativada!${NC}"
    else
        set_nested_config "integrations" "apple_calendar" "false"
        echo -e "${RED}${CROSS_MARK} Integração com Apple Calendar desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Open Banking?"; then
        set_nested_config "integrations" "open_banking" "true"
        echo -e "${GREEN}${CHECK_MARK} Integração com Open Banking ativada!${NC}"
    else
        set_nested_config "integrations" "open_banking" "false"
        echo -e "${RED}${CROSS_MARK} Integração com Open Banking desativada.${NC}"
    fi
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração das integrações concluída!${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 6: Configuração da IA
function step_ai_setup() {
    show_header
    show_progress "Configuração dos Modelos de IA"
    
    echo -e "${BOLD}${BRAIN} Configuração dos Modelos de IA${NC}"
    echo -e "${YELLOW}Esta etapa configura os provedores e modelos de IA utilizados pelo Tarefo AI.${NC}"
    echo ""
    
    local providers=("OpenAI (Recomendado)" "Anthropic" "Google AI (Gemini)" "Local (Ollama)")
    select_option "Selecione o provedor principal de IA:" "${providers[@]}"
    local provider_choice=$?
    
    case $provider_choice in
        0)
            provider="openai"
            local models=("gpt-4o (Recomendado)" "gpt-4-turbo" "gpt-3.5-turbo")
            select_option "Selecione o modelo OpenAI:" "${models[@]}"
            local model_choice=$?
            
            case $model_choice in
                0) model="gpt-4o" ;;
                1) model="gpt-4-turbo" ;;
                2) model="gpt-3.5-turbo" ;;
            esac
            ;;
        1)
            provider="anthropic"
            local models=("claude-3-7-sonnet-20250219 (Recomendado)" "claude-3-opus" "claude-3-sonnet")
            select_option "Selecione o modelo Anthropic:" "${models[@]}"
            local model_choice=$?
            
            case $model_choice in
                0) model="claude-3-7-sonnet-20250219" ;;
                1) model="claude-3-opus" ;;
                2) model="claude-3-sonnet" ;;
            esac
            ;;
        2)
            provider="google"
            local models=("gemini-pro (Recomendado)" "gemini-ultra")
            select_option "Selecione o modelo Google AI:" "${models[@]}"
            local model_choice=$?
            
            case $model_choice in
                0) model="gemini-pro" ;;
                1) model="gemini-ultra" ;;
            esac
            ;;
        3)
            provider="local"
            local models=("llama-3-70b (Recomendado)" "llama-3-8b" "mixtral-8x7b")
            select_option "Selecione o modelo local:" "${models[@]}"
            local model_choice=$?
            
            case $model_choice in
                0) model="llama-3-70b" ;;
                1) model="llama-3-8b" ;;
                2) model="mixtral-8x7b" ;;
            esac
            ;;
    esac
    
    set_nested_config "ai_config" "provider" "$provider"
    set_nested_config "ai_config" "model" "$model"
    
    # Configurar provedor de backup
    local backup_providers=("Anthropic (Recomendado)" "OpenAI" "Google AI (Gemini)" "Nenhum")
    select_option "Selecione o provedor de backup de IA:" "${backup_providers[@]}"
    local backup_provider_choice=$?
    
    case $backup_provider_choice in
        0)
            backup_provider="anthropic"
            backup_model="claude-3-7-sonnet-20250219"
            ;;
        1)
            backup_provider="openai"
            backup_model="gpt-3.5-turbo"
            ;;
        2)
            backup_provider="google"
            backup_model="gemini-pro"
            ;;
        3)
            backup_provider="none"
            backup_model="none"
            ;;
    esac
    
    set_nested_config "ai_config" "backup_provider" "$backup_provider"
    set_nested_config "ai_config" "backup_model" "$backup_model"
    
    echo -e "\n${GREEN}${CHECK_MARK} Configuração da IA concluída!${NC}"
    echo -e "Provedor Principal: ${CYAN}$provider${NC}"
    echo -e "Modelo Principal: ${CYAN}$model${NC}"
    echo -e "Provedor de Backup: ${CYAN}$backup_provider${NC}"
    echo -e "Modelo de Backup: ${CYAN}$backup_model${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 7: Resumo e Implementação
function step_summary_implementation() {
    show_header
    show_progress "Resumo e Implementação"
    
    echo -e "${BOLD}${ROCKET} Resumo da Configuração${NC}"
    echo -e "${YELLOW}Revise as configurações e prepare-se para a implementação.${NC}"
    echo ""
    
    echo -e "${BOLD}Projeto GCP:${NC}"
    echo -e "  ID do Projeto: ${CYAN}$(jq -r '.project_id' "$CONFIG_FILE")${NC}"
    echo -e "  Região: ${CYAN}$(jq -r '.region' "$CONFIG_FILE")${NC}"
    echo ""
    
    echo -e "${BOLD}Banco de Dados:${NC}"
    echo -e "  Tipo: ${CYAN}$(jq -r '.database.type' "$CONFIG_FILE")${NC}"
    echo -e "  Instância: ${CYAN}$(jq -r '.database.instance_name' "$CONFIG_FILE")${NC}"
    echo -e "  Versão: ${CYAN}$(jq -r '.database.version' "$CONFIG_FILE")${NC}"
    echo -e "  Tier: ${CYAN}$(jq -r '.database.tier' "$CONFIG_FILE")${NC}"
    echo ""
    
    echo -e "${BOLD}Cloud Run:${NC}"
    echo -e "  Serviço: ${CYAN}$(jq -r '.cloud_run.service_name' "$CONFIG_FILE")${NC}"
    echo -e "  Memória: ${CYAN}$(jq -r '.cloud_run.memory' "$CONFIG_FILE")${NC}"
    echo -e "  CPU: ${CYAN}$(jq -r '.cloud_run.cpu' "$CONFIG_FILE")${NC}"
    echo -e "  Instâncias: ${CYAN}$(jq -r '.cloud_run.min_instances' "$CONFIG_FILE") - $(jq -r '.cloud_run.max_instances' "$CONFIG_FILE")${NC}"
    echo ""
    
    echo -e "${BOLD}Cloud Functions:${NC}"
    echo -e "  Webhook: ${CYAN}$(jq -r '.cloud_functions.webhook_function' "$CONFIG_FILE")${NC}"
    echo -e "  Scheduler: ${CYAN}$(jq -r '.cloud_functions.scheduler_function' "$CONFIG_FILE")${NC}"
    echo -e "  Memória: ${CYAN}$(jq -r '.cloud_functions.memory' "$CONFIG_FILE")${NC}"
    echo -e "  Timeout: ${CYAN}$(jq -r '.cloud_functions.timeout' "$CONFIG_FILE")${NC}"
    echo ""
    
    echo -e "${BOLD}Integrações Ativas:${NC}"
    if [ "$(jq -r '.integrations.telegram' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} Telegram${NC}"
    fi
    if [ "$(jq -r '.integrations.whatsapp' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} WhatsApp${NC}"
    fi
    if [ "$(jq -r '.integrations.sms' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} SMS${NC}"
    fi
    if [ "$(jq -r '.integrations.google_calendar' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} Google Calendar${NC}"
    fi
    if [ "$(jq -r '.integrations.apple_calendar' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} Apple Calendar${NC}"
    fi
    if [ "$(jq -r '.integrations.open_banking' "$CONFIG_FILE")" == "true" ]; then
        echo -e "  ${GREEN}${CHECK_MARK} Open Banking${NC}"
    fi
    echo ""
    
    echo -e "${BOLD}Configuração de IA:${NC}"
    echo -e "  Provedor Principal: ${CYAN}$(jq -r '.ai_config.provider' "$CONFIG_FILE")${NC}"
    echo -e "  Modelo Principal: ${CYAN}$(jq -r '.ai_config.model' "$CONFIG_FILE")${NC}"
    echo -e "  Provedor de Backup: ${CYAN}$(jq -r '.ai_config.backup_provider' "$CONFIG_FILE")${NC}"
    echo -e "  Modelo de Backup: ${CYAN}$(jq -r '.ai_config.backup_model' "$CONFIG_FILE")${NC}"
    echo ""
    
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 80))${NC}"
    echo ""
    
    echo -e "${BOLD}Opções de Implementação:${NC}"
    echo ""
    echo -e "1. ${GREEN}Implementar com Visualizador de Progresso${NC}"
    echo -e "   Implemente o Tarefo AI com visualização detalhada do progresso."
    echo ""
    echo -e "2. ${YELLOW}Implementar com Terraform${NC}"
    echo -e "   Gere e aplique configurações do Terraform (infraestrutura como código)."
    echo ""
    echo -e "3. ${BLUE}Gerar Script de Implementação${NC}"
    echo -e "   Crie um script para executar mais tarde."
    echo ""
    echo -e "4. ${CYAN}Salvar Configuração e Sair${NC}"
    echo -e "   Salve suas escolhas sem implementar agora."
    echo ""
    
    read -p "Escolha uma opção (1-4): " implementation_choice
    
    case $implementation_choice in
        1)
            echo -e "\n${GREEN}Iniciando implementação com Visualizador de Progresso...${NC}"
            # Exportar configuração para o visualizador
            cp "$CONFIG_FILE" "progress-visualizer-config.json"
            
            # Verificar se o visualizador existe
            if [ -f "progress-visualizer.sh" ]; then
                chmod +x progress-visualizer.sh
                ./progress-visualizer.sh
            else
                echo -e "${RED}Erro: Visualizador de progresso não encontrado.${NC}"
                echo -e "${YELLOW}Procurando por: progress-visualizer.sh${NC}"
                sleep 2
            fi
            ;;
            
        2)
            echo -e "\n${YELLOW}Gerando configuração Terraform...${NC}"
            # Criar diretório para terraform se não existir
            mkdir -p terraform_config
            
            # Gerar arquivo de configuração do Terraform
            cat > "terraform_config/main.tf" << EOF
# Terraform Configuration for Tarefo AI
# Generated by Implementation Wizard

provider "google" {
  project = "$(jq -r '.project_id' "$CONFIG_FILE")"
  region  = "$(jq -r '.region' "$CONFIG_FILE")"
}

# Defina suas variáveis e recursos aqui

# Exemplo de serviço Cloud Run
resource "google_cloud_run_service" "tarefo_ai" {
  name     = "$(jq -r '.cloud_run.service_name' "$CONFIG_FILE")"
  location = "$(jq -r '.region' "$CONFIG_FILE")"

  template {
    spec {
      containers {
        image = "gcr.io/\${var.project_id}/tarefo-ai:latest"
        resources {
          limits = {
            cpu    = "$(jq -r '.cloud_run.cpu' "$CONFIG_FILE")"
            memory = "$(jq -r '.cloud_run.memory' "$CONFIG_FILE")"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "$(jq -r '.cloud_run.min_instances' "$CONFIG_FILE")"
        "autoscaling.knative.dev/maxScale" = "$(jq -r '.cloud_run.max_instances' "$CONFIG_FILE")"
      }
    }
  }
}

# Mais recursos seriam definidos aqui...
EOF

            echo -e "${GREEN}${CHECK_MARK} Configuração Terraform gerada em: terraform_config/main.tf${NC}"
            echo -e "${YELLOW}Nota: Você precisa revisar e personalizar o arquivo de configuração Terraform.${NC}"
            ;;
            
        3)
            echo -e "\n${BLUE}Gerando script de implementação...${NC}"
            local script_file="implement-tarefo-ai.sh"
            
            cat > "$script_file" << EOF
#!/bin/bash

# Script de Implementação do Tarefo AI
# Gerado pelo Implementation Wizard

echo "Iniciando implementação do Tarefo AI..."

# Definir projeto GCP
gcloud config set project $(jq -r '.project_id' "$CONFIG_FILE")

# Criar banco de dados
echo "Criando instância do banco de dados..."
gcloud sql instances create $(jq -r '.database.instance_name' "$CONFIG_FILE") \\
    --database-version=POSTGRES_$(jq -r '.database.version' "$CONFIG_FILE") \\
    --tier=$(jq -r '.database.tier' "$CONFIG_FILE") \\
    --region=$(jq -r '.region' "$CONFIG_FILE")

# Implementar Cloud Run
echo "Implementando serviço Cloud Run..."
gcloud run deploy $(jq -r '.cloud_run.service_name' "$CONFIG_FILE") \\
    --source . \\
    --region=$(jq -r '.region' "$CONFIG_FILE") \\
    --memory=$(jq -r '.cloud_run.memory' "$CONFIG_FILE") \\
    --cpu=$(jq -r '.cloud_run.cpu' "$CONFIG_FILE") \\
    --min-instances=$(jq -r '.cloud_run.min_instances' "$CONFIG_FILE") \\
    --max-instances=$(jq -r '.cloud_run.max_instances' "$CONFIG_FILE")

# Implementar Cloud Functions
echo "Implementando Cloud Functions..."
gcloud functions deploy $(jq -r '.cloud_functions.webhook_function' "$CONFIG_FILE") \\
    --runtime nodejs18 \\
    --trigger-http \\
    --region=$(jq -r '.region' "$CONFIG_FILE") \\
    --memory=$(jq -r '.cloud_functions.memory' "$CONFIG_FILE") \\
    --timeout=$(jq -r '.cloud_functions.timeout' "$CONFIG_FILE") \\
    --source=webhook-function

# Mais comandos de implementação seriam adicionados aqui...

echo "Implementação do Tarefo AI concluída!"
EOF

            chmod +x "$script_file"
            echo -e "${GREEN}${CHECK_MARK} Script de implementação gerado: $script_file${NC}"
            echo -e "${YELLOW}Nota: Revise o script antes de executá-lo.${NC}"
            ;;
            
        4)
            echo -e "\n${CYAN}Salvando configuração e saindo...${NC}"
            echo -e "${GREEN}${CHECK_MARK} Configuração salva em: $CONFIG_FILE${NC}"
            ;;
            
        *)
            echo -e "\n${RED}Opção inválida. Salvando configuração e saindo.${NC}"
            echo -e "${GREEN}${CHECK_MARK} Configuração salva em: $CONFIG_FILE${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BOLD}${ROCKET} Assistente de Implementação concluído!${NC}"
    echo -e "${YELLOW}Obrigado por usar o Assistente de Implementação do Tarefo AI.${NC}"
    echo ""
    
    read -p "Pressione Enter para sair..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Função principal
function main() {
    # Inicializar arquivo de log
    echo "=== Logs do Assistente de Implementação do Tarefo AI $(date) ===" > "$LOG_FILE"
    
    # Verificar se jq está instalado
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Erro: O comando 'jq' não está instalado.${NC}"
        echo -e "${YELLOW}Por favor, instale o jq para continuar:${NC}"
        echo -e "  Ubuntu/Debian: sudo apt-get install jq"
        echo -e "  MacOS: brew install jq"
        echo -e "  Windows: https://stedolan.github.io/jq/download/"
        exit 1
    fi
    
    # Criar arquivo de configuração padrão se não existir
    if [ ! -f "$CONFIG_FILE" ]; then
        create_default_config
    fi
    
    # Mostrar menu principal
    show_header
    echo -e "${BOLD}Bem-vindo ao Assistente de Implementação do Tarefo AI!${NC}"
    echo -e "${YELLOW}Este assistente irá guiá-lo pelo processo de implementação passo a passo.${NC}"
    echo ""
    echo -e "O assistente irá configurar:"
    echo -e "  ${CLOUD} Projeto Google Cloud Platform"
    echo -e "  ${DATABASE} Banco de dados PostgreSQL"
    echo -e "  ${SERVER} Serviço Cloud Run"
    echo -e "  ${GEAR} Cloud Functions para webhooks"
    echo -e "  ${PHONE} Integrações (Telegram, WhatsApp, etc.)"
    echo -e "  ${BRAIN} Provedores e modelos de IA"
    echo -e "  ${ROCKET} Implementação final"
    echo ""
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 80))${NC}"
    echo ""
    
    if confirm_action "Deseja começar o processo de implementação agora?"; then
        # Executar cada passo
        step_project_setup
        step_database_setup
        step_cloud_run_setup
        step_functions_setup
        step_integrations_setup
        step_ai_setup
        step_summary_implementation
    else
        echo -e "${YELLOW}Assistente de Implementação cancelado.${NC}"
        exit 0
    fi
}

# Iniciar o assistente
main