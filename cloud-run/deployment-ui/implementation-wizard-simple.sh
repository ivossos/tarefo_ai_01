#!/bin/bash

# Versão simplificada do Assistente de Implementação para Tarefo AI
# Esta versão é otimizada para funcionar no ambiente Replit

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
CONFIG_FILE="implementation-config-simple.txt"
LOG_FILE="implementation-wizard-simple.log"
CURRENT_STEP=1
TOTAL_STEPS=7

# Função para limpar a tela
function clear_screen() {
    clear
}

# Função para mostrar o cabeçalho
function show_header() {
    clear_screen
    echo -e "${BLUE}${BOLD}"
    echo "  ______                  __          ___    ___ "
    echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
    echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
    echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
    echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
    echo -e "${NC}"
    echo -e "${BOLD}Assistente de Implementação${NC} - Versão Simplificada para Replit"
    echo ""
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
    echo ""
}

# Função para mostrar progresso
function show_progress() {
    local step_description=$1
    echo -e "${CYAN}Etapa $CURRENT_STEP de $TOTAL_STEPS: $step_description${NC}"
    echo ""
}

# Função para registrar configuração
function save_config() {
    local key=$1
    local value=$2
    echo "$key=$value" >> "$CONFIG_FILE"
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

# Passo 1: Configuração do Projeto GCP
function step_project_setup() {
    show_header
    show_progress "Configuração do Projeto Google Cloud Platform"
    
    echo -e "${BOLD}☁️ Configuração do Projeto GCP${NC}"
    echo -e "${YELLOW}Esta etapa configura as informações básicas do seu projeto Google Cloud.${NC}"
    echo ""
    
    read -p "ID do Projeto GCP (ex: tarefo-ai-prod): " project_id
    if [ -n "$project_id" ]; then
        save_config "project_id" "$project_id"
    fi
    
    echo -e "\nSelecione a região para deployment:"
    echo "  1. us-central1 (Iowa)"
    echo "  2. us-east1 (South Carolina)"
    echo "  3. us-east4 (N. Virginia)"
    echo "  4. us-west1 (Oregon)"
    echo "  5. southamerica-east1 (São Paulo)"
    echo "  6. europe-west1 (Belgium)"
    echo "  7. asia-east1 (Taiwan)"
    echo ""
    
    read -p "Escolha uma opção (1-7): " region_choice
    
    case $region_choice in
        1) region="us-central1" ;;
        2) region="us-east1" ;;
        3) region="us-east4" ;;
        4) region="us-west1" ;;
        5) region="southamerica-east1" ;;
        6) region="europe-west1" ;;
        7) region="asia-east1" ;;
        *) region="us-central1" ;;
    esac
    
    save_config "region" "$region"
    
    echo -e "\n${GREEN}✓ Configuração do projeto concluída!${NC}"
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
    
    echo -e "${BOLD}🗄️ Configuração do Banco de Dados${NC}"
    echo -e "${YELLOW}Esta etapa configura o banco de dados PostgreSQL para o Tarefo AI.${NC}"
    echo ""
    
    read -p "Nome da instância do banco de dados [tarefo-ai-db]: " db_instance
    if [ -z "$db_instance" ]; then
        db_instance="tarefo-ai-db"
    fi
    save_config "db_instance" "$db_instance"
    
    echo -e "\nSelecione a versão do PostgreSQL:"
    echo "  1. PostgreSQL 14 (Recomendado)"
    echo "  2. PostgreSQL 13"
    echo "  3. PostgreSQL 12"
    echo ""
    
    read -p "Escolha uma opção (1-3): " version_choice
    
    case $version_choice in
        1) db_version="14" ;;
        2) db_version="13" ;;
        3) db_version="12" ;;
        *) db_version="14" ;;
    esac
    
    save_config "db_version" "$db_version"
    
    echo -e "\nSelecione o tipo de máquina para o banco de dados:"
    echo "  1. db-f1-micro (Desenvolvimento)"
    echo "  2. db-g1-small (Pequeno)"
    echo "  3. db-custom-1-3840 (Médio)"
    echo "  4. db-custom-2-7680 (Grande)"
    echo ""
    
    read -p "Escolha uma opção (1-4): " tier_choice
    
    case $tier_choice in
        1) db_tier="db-f1-micro" ;;
        2) db_tier="db-g1-small" ;;
        3) db_tier="db-custom-1-3840" ;;
        4) db_tier="db-custom-2-7680" ;;
        *) db_tier="db-f1-micro" ;;
    esac
    
    save_config "db_tier" "$db_tier"
    
    echo -e "\n${GREEN}✓ Configuração do banco de dados concluída!${NC}"
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
    
    echo -e "${BOLD}📡 Configuração do Cloud Run${NC}"
    echo -e "${YELLOW}Esta etapa configura o serviço Cloud Run para o backend do Tarefo AI.${NC}"
    echo ""
    
    read -p "Nome do serviço Cloud Run [tarefo-ai]: " service_name
    if [ -z "$service_name" ]; then
        service_name="tarefo-ai"
    fi
    save_config "service_name" "$service_name"
    
    echo -e "\nSelecione a memória para o serviço Cloud Run:"
    echo "  1. 512Mi (Mínimo)"
    echo "  2. 1Gi (Recomendado)"
    echo "  3. 2Gi (Médio)"
    echo "  4. 4Gi (Grande)"
    echo ""
    
    read -p "Escolha uma opção (1-4): " memory_choice
    
    case $memory_choice in
        1) memory="512Mi" ;;
        2) memory="1Gi" ;;
        3) memory="2Gi" ;;
        4) memory="4Gi" ;;
        *) memory="1Gi" ;;
    esac
    
    save_config "memory" "$memory"
    
    echo -e "\nSelecione o número de CPUs para o serviço Cloud Run:"
    echo "  1. 1 (Mínimo)"
    echo "  2. 2 (Médio)"
    echo "  3. 4 (Grande)"
    echo ""
    
    read -p "Escolha uma opção (1-3): " cpu_choice
    
    case $cpu_choice in
        1) cpu="1" ;;
        2) cpu="2" ;;
        3) cpu="4" ;;
        *) cpu="1" ;;
    esac
    
    save_config "cpu" "$cpu"
    
    read -p "Número mínimo de instâncias [0]: " min_instances
    if [ -z "$min_instances" ]; then
        min_instances="0"
    fi
    save_config "min_instances" "$min_instances"
    
    read -p "Número máximo de instâncias [2]: " max_instances
    if [ -z "$max_instances" ]; then
        max_instances="2"
    fi
    save_config "max_instances" "$max_instances"
    
    echo -e "\n${GREEN}✓ Configuração do Cloud Run concluída!${NC}"
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
    
    echo -e "${BOLD}⚙️ Configuração das Cloud Functions${NC}"
    echo -e "${YELLOW}Esta etapa configura as Cloud Functions necessárias para webhooks e tarefas agendadas.${NC}"
    echo ""
    
    read -p "Nome da função para webhooks [tarefo-ai-webhook]: " webhook_function
    if [ -z "$webhook_function" ]; then
        webhook_function="tarefo-ai-webhook"
    fi
    save_config "webhook_function" "$webhook_function"
    
    read -p "Nome da função para agendamento [tarefo-ai-scheduler]: " scheduler_function
    if [ -z "$scheduler_function" ]; then
        scheduler_function="tarefo-ai-scheduler"
    fi
    save_config "scheduler_function" "$scheduler_function"
    
    echo -e "\nSelecione a memória para as Cloud Functions:"
    echo "  1. 128MB (Mínimo)"
    echo "  2. 256MB (Recomendado)"
    echo "  3. 512MB (Médio)"
    echo "  4. 1024MB (Grande)"
    echo ""
    
    read -p "Escolha uma opção (1-4): " memory_choice
    
    case $memory_choice in
        1) function_memory="128MB" ;;
        2) function_memory="256MB" ;;
        3) function_memory="512MB" ;;
        4) function_memory="1024MB" ;;
        *) function_memory="256MB" ;;
    esac
    
    save_config "function_memory" "$function_memory"
    
    echo -e "\nSelecione o timeout para as Cloud Functions:"
    echo "  1. 30s (Mínimo)"
    echo "  2. 60s (Recomendado)"
    echo "  3. 120s (Médio)"
    echo "  4. 300s (Máximo)"
    echo ""
    
    read -p "Escolha uma opção (1-4): " timeout_choice
    
    case $timeout_choice in
        1) function_timeout="30s" ;;
        2) function_timeout="60s" ;;
        3) function_timeout="120s" ;;
        4) function_timeout="300s" ;;
        *) function_timeout="60s" ;;
    esac
    
    save_config "function_timeout" "$function_timeout"
    
    echo -e "\n${GREEN}✓ Configuração das Cloud Functions concluída!${NC}"
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
    
    echo -e "${BOLD}📱 Configuração das Integrações${NC}"
    echo -e "${YELLOW}Esta etapa configura as integrações externas para o Tarefo AI.${NC}"
    echo ""
    
    if confirm_action "Deseja ativar a integração com Telegram?"; then
        save_config "telegram" "true"
        echo -e "${GREEN}✓ Integração com Telegram ativada!${NC}"
    else
        save_config "telegram" "false"
        echo -e "${RED}✗ Integração com Telegram desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com WhatsApp (via Twilio)?"; then
        save_config "whatsapp" "true"
        echo -e "${GREEN}✓ Integração com WhatsApp ativada!${NC}"
    else
        save_config "whatsapp" "false"
        echo -e "${RED}✗ Integração com WhatsApp desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com SMS (via Twilio)?"; then
        save_config "sms" "true"
        echo -e "${GREEN}✓ Integração com SMS ativada!${NC}"
    else
        save_config "sms" "false"
        echo -e "${RED}✗ Integração com SMS desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Google Calendar?"; then
        save_config "google_calendar" "true"
        echo -e "${GREEN}✓ Integração com Google Calendar ativada!${NC}"
    else
        save_config "google_calendar" "false"
        echo -e "${RED}✗ Integração com Google Calendar desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Apple Calendar?"; then
        save_config "apple_calendar" "true"
        echo -e "${GREEN}✓ Integração com Apple Calendar ativada!${NC}"
    else
        save_config "apple_calendar" "false"
        echo -e "${RED}✗ Integração com Apple Calendar desativada.${NC}"
    fi
    
    if confirm_action "Deseja ativar a integração com Open Banking?"; then
        save_config "open_banking" "true"
        echo -e "${GREEN}✓ Integração com Open Banking ativada!${NC}"
    else
        save_config "open_banking" "false"
        echo -e "${RED}✗ Integração com Open Banking desativada.${NC}"
    fi
    
    echo -e "\n${GREEN}✓ Configuração das integrações concluída!${NC}"
    echo ""
    
    read -p "Pressione Enter para continuar..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Passo 6: Configuração da IA
function step_ai_setup() {
    show_header
    show_progress "Configuração dos Modelos de IA"
    
    echo -e "${BOLD}🧠 Configuração dos Modelos de IA${NC}"
    echo -e "${YELLOW}Esta etapa configura os provedores e modelos de IA utilizados pelo Tarefo AI.${NC}"
    echo ""
    
    echo -e "Selecione o provedor principal de IA:"
    echo "  1. OpenAI (Recomendado)"
    echo "  2. Anthropic"
    echo "  3. Google AI (Gemini)"
    echo "  4. Local (Ollama)"
    echo ""
    
    read -p "Escolha uma opção (1-4): " provider_choice
    
    case $provider_choice in
        1)
            provider="openai"
            echo -e "\nSelecione o modelo OpenAI:"
            echo "  1. gpt-4o (Recomendado)"
            echo "  2. gpt-4-turbo"
            echo "  3. gpt-3.5-turbo"
            echo ""
            
            read -p "Escolha uma opção (1-3): " model_choice
            
            case $model_choice in
                1) model="gpt-4o" ;;
                2) model="gpt-4-turbo" ;;
                3) model="gpt-3.5-turbo" ;;
                *) model="gpt-4o" ;;
            esac
            ;;
        2)
            provider="anthropic"
            echo -e "\nSelecione o modelo Anthropic:"
            echo "  1. claude-3-7-sonnet-20250219 (Recomendado)"
            echo "  2. claude-3-opus"
            echo "  3. claude-3-sonnet"
            echo ""
            
            read -p "Escolha uma opção (1-3): " model_choice
            
            case $model_choice in
                1) model="claude-3-7-sonnet-20250219" ;;
                2) model="claude-3-opus" ;;
                3) model="claude-3-sonnet" ;;
                *) model="claude-3-7-sonnet-20250219" ;;
            esac
            ;;
        3)
            provider="google"
            echo -e "\nSelecione o modelo Google AI:"
            echo "  1. gemini-pro (Recomendado)"
            echo "  2. gemini-ultra"
            echo ""
            
            read -p "Escolha uma opção (1-2): " model_choice
            
            case $model_choice in
                1) model="gemini-pro" ;;
                2) model="gemini-ultra" ;;
                *) model="gemini-pro" ;;
            esac
            ;;
        4)
            provider="local"
            echo -e "\nSelecione o modelo local:"
            echo "  1. llama-3-70b (Recomendado)"
            echo "  2. llama-3-8b"
            echo "  3. mixtral-8x7b"
            echo ""
            
            read -p "Escolha uma opção (1-3): " model_choice
            
            case $model_choice in
                1) model="llama-3-70b" ;;
                2) model="llama-3-8b" ;;
                3) model="mixtral-8x7b" ;;
                *) model="llama-3-70b" ;;
            esac
            ;;
        *)
            provider="openai"
            model="gpt-4o"
            ;;
    esac
    
    save_config "ai_provider" "$provider"
    save_config "ai_model" "$model"
    
    # Configurar provedor de backup
    echo -e "\nSelecione o provedor de backup de IA:"
    echo "  1. Anthropic (Recomendado)"
    echo "  2. OpenAI"
    echo "  3. Google AI (Gemini)"
    echo "  4. Nenhum"
    echo ""
    
    read -p "Escolha uma opção (1-4): " backup_provider_choice
    
    case $backup_provider_choice in
        1)
            backup_provider="anthropic"
            backup_model="claude-3-7-sonnet-20250219"
            ;;
        2)
            backup_provider="openai"
            backup_model="gpt-3.5-turbo"
            ;;
        3)
            backup_provider="google"
            backup_model="gemini-pro"
            ;;
        4)
            backup_provider="none"
            backup_model="none"
            ;;
        *)
            backup_provider="anthropic"
            backup_model="claude-3-7-sonnet-20250219"
            ;;
    esac
    
    save_config "backup_provider" "$backup_provider"
    save_config "backup_model" "$backup_model"
    
    echo -e "\n${GREEN}✓ Configuração da IA concluída!${NC}"
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
    
    echo -e "${BOLD}🚀 Resumo da Configuração${NC}"
    echo -e "${YELLOW}Revise as configurações e prepare-se para a implementação.${NC}"
    echo ""
    
    echo -e "${BOLD}Projeto GCP:${NC}"
    grep "^project_id=" "$CONFIG_FILE" | awk -F= '{print "  ID do Projeto: " $2}'
    grep "^region=" "$CONFIG_FILE" | awk -F= '{print "  Região: " $2}'
    echo ""
    
    echo -e "${BOLD}Banco de Dados:${NC}"
    echo -e "  Tipo: postgresql"
    grep "^db_instance=" "$CONFIG_FILE" | awk -F= '{print "  Instância: " $2}'
    grep "^db_version=" "$CONFIG_FILE" | awk -F= '{print "  Versão: " $2}'
    grep "^db_tier=" "$CONFIG_FILE" | awk -F= '{print "  Tier: " $2}'
    echo ""
    
    echo -e "${BOLD}Cloud Run:${NC}"
    grep "^service_name=" "$CONFIG_FILE" | awk -F= '{print "  Serviço: " $2}'
    grep "^memory=" "$CONFIG_FILE" | awk -F= '{print "  Memória: " $2}'
    grep "^cpu=" "$CONFIG_FILE" | awk -F= '{print "  CPU: " $2}'
    echo -e "  Instâncias: $(grep "^min_instances=" "$CONFIG_FILE" | awk -F= '{print $2}') - $(grep "^max_instances=" "$CONFIG_FILE" | awk -F= '{print $2}')"
    echo ""
    
    echo -e "${BOLD}Cloud Functions:${NC}"
    grep "^webhook_function=" "$CONFIG_FILE" | awk -F= '{print "  Webhook: " $2}'
    grep "^scheduler_function=" "$CONFIG_FILE" | awk -F= '{print "  Scheduler: " $2}'
    grep "^function_memory=" "$CONFIG_FILE" | awk -F= '{print "  Memória: " $2}'
    grep "^function_timeout=" "$CONFIG_FILE" | awk -F= '{print "  Timeout: " $2}'
    echo ""
    
    echo -e "${BOLD}Integrações Ativas:${NC}"
    if grep -q "^telegram=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ Telegram${NC}"
    fi
    if grep -q "^whatsapp=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ WhatsApp${NC}"
    fi
    if grep -q "^sms=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ SMS${NC}"
    fi
    if grep -q "^google_calendar=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ Google Calendar${NC}"
    fi
    if grep -q "^apple_calendar=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ Apple Calendar${NC}"
    fi
    if grep -q "^open_banking=true" "$CONFIG_FILE"; then
        echo -e "  ${GREEN}✓ Open Banking${NC}"
    fi
    echo ""
    
    echo -e "${BOLD}Configuração de IA:${NC}"
    grep "^ai_provider=" "$CONFIG_FILE" | awk -F= '{print "  Provedor Principal: " $2}'
    grep "^ai_model=" "$CONFIG_FILE" | awk -F= '{print "  Modelo Principal: " $2}'
    grep "^backup_provider=" "$CONFIG_FILE" | awk -F= '{print "  Provedor de Backup: " $2}'
    grep "^backup_model=" "$CONFIG_FILE" | awk -F= '{print "  Modelo de Backup: " $2}'
    echo ""
    
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
    echo ""
    
    echo -e "${BOLD}Opções de Implementação:${NC}"
    echo ""
    echo -e "1. ${GREEN}Implementar com Visualizador de Progresso${NC}"
    echo -e "   Implemente o Tarefo AI com visualização detalhada do progresso."
    echo ""
    echo -e "2. ${YELLOW}Gerar Script de Implementação${NC}"
    echo -e "   Crie um script para executar mais tarde."
    echo ""
    echo -e "3. ${CYAN}Salvar Configuração e Sair${NC}"
    echo -e "   Salve suas escolhas sem implementar agora."
    echo ""
    
    read -p "Escolha uma opção (1-3): " implementation_choice
    
    case $implementation_choice in
        1)
            echo -e "\n${GREEN}Iniciando implementação com Visualizador de Progresso...${NC}"
            # Exportar configuração para o visualizador
            cp "$CONFIG_FILE" "progress-visualizer-config.txt"
            
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
            echo -e "\n${BLUE}Gerando script de implementação...${NC}"
            local script_file="implement-tarefo-ai-simple.sh"
            
            cat > "$script_file" << EOF
#!/bin/bash

# Script de Implementação do Tarefo AI
# Gerado pelo Implementation Wizard (Versão Simplificada)

echo "Iniciando implementação do Tarefo AI..."

# Configurações extraídas do assistente
$(cat "$CONFIG_FILE")

# Definir projeto GCP
gcloud config set project \$project_id

# Criar banco de dados
echo "Criando instância do banco de dados..."
gcloud sql instances create \$db_instance \\
    --database-version=POSTGRES_\$db_version \\
    --tier=\$db_tier \\
    --region=\$region

# Implementar Cloud Run
echo "Implementando serviço Cloud Run..."
gcloud run deploy \$service_name \\
    --source . \\
    --region=\$region \\
    --memory=\$memory \\
    --cpu=\$cpu \\
    --min-instances=\$min_instances \\
    --max-instances=\$max_instances

# Implementar Cloud Functions
echo "Implementando Cloud Functions..."
gcloud functions deploy \$webhook_function \\
    --runtime nodejs18 \\
    --trigger-http \\
    --region=\$region \\
    --memory=\$function_memory \\
    --timeout=\$function_timeout \\
    --source=webhook-function

echo "Implementação do Tarefo AI concluída!"
EOF

            chmod +x "$script_file"
            echo -e "${GREEN}✓ Script de implementação gerado: $script_file${NC}"
            echo -e "${YELLOW}Nota: Revise o script antes de executá-lo.${NC}"
            ;;
            
        3)
            echo -e "\n${CYAN}Salvando configuração e saindo...${NC}"
            echo -e "${GREEN}✓ Configuração salva em: $CONFIG_FILE${NC}"
            ;;
            
        *)
            echo -e "\n${RED}Opção inválida. Salvando configuração e saindo.${NC}"
            echo -e "${GREEN}✓ Configuração salva em: $CONFIG_FILE${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BOLD}🚀 Assistente de Implementação concluído!${NC}"
    echo -e "${YELLOW}Obrigado por usar o Assistente de Implementação do Tarefo AI.${NC}"
    echo ""
    
    read -p "Pressione Enter para sair..."
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

# Função principal
function main() {
    # Inicializar arquivo de configuração e log
    rm -f "$CONFIG_FILE" "$LOG_FILE"
    touch "$CONFIG_FILE" "$LOG_FILE"
    
    # Mostrar menu principal
    show_header
    echo -e "${BOLD}Bem-vindo ao Assistente de Implementação do Tarefo AI!${NC}"
    echo -e "${YELLOW}Este assistente irá guiá-lo pelo processo de implementação passo a passo.${NC}"
    echo ""
    echo -e "O assistente irá configurar:"
    echo -e "  ☁️ Projeto Google Cloud Platform"
    echo -e "  🗄️ Banco de dados PostgreSQL"
    echo -e "  📡 Serviço Cloud Run"
    echo -e "  ⚙️ Cloud Functions para webhooks"
    echo -e "  📱 Integrações (Telegram, WhatsApp, etc.)"
    echo -e "  🧠 Provedores e modelos de IA"
    echo -e "  🚀 Implementação final"
    echo ""
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
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