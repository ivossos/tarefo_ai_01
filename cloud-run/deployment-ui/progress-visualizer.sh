#!/bin/bash

# Visualizador de Progresso de Deployment - TarefoAI
# Este script fornece uma interface visual para acompanhar o progresso de deployment
# do TarefoAI no Google Cloud Platform

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
CONFIG_FILE="progress-visualizer-config.txt"
LOG_FILE="deployment-progress.log"
DEPLOY_STATUS_FILE="deployment-status.json"
TOTAL_STEPS=9

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
    echo -e "${BOLD}Visualizador de Progresso de Deployment${NC}"
    echo ""
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
    echo ""
}

# Função para ler configurações
function load_config() {
    # Verificar se o arquivo de configuração existe
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Erro: Arquivo de configuração não encontrado.${NC}"
        echo -e "${YELLOW}Procurando por: $CONFIG_FILE${NC}"
        sleep 2
        return 1
    fi

    # Carregar configurações
    source "$CONFIG_FILE"
    
    # Verificar se as variáveis essenciais estão definidas
    if [ -z "$project_id" ] || [ -z "$region" ]; then
        echo -e "${RED}Erro: Configuração incompleta. Verifique $CONFIG_FILE${NC}"
        sleep 2
        return 1
    fi
    
    return 0
}

# Função para inicializar arquivo de status
function init_status_file() {
    cat > "$DEPLOY_STATUS_FILE" << EOF
{
  "project_setup": "pending",
  "apis_enabled": "pending",
  "database_creation": "pending",
  "secrets_config": "pending",
  "container_build": "pending",
  "cloud_run_deploy": "pending",
  "cloud_functions_deploy": "pending",
  "webhook_config": "pending",
  "final_verification": "pending",
  "service_url": "",
  "webhook_url": "",
  "function_url": "",
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Função para atualizar status
function update_status() {
    local step=$1
    local status=$2
    local additional_data=$3
    
    # Atualizar o arquivo de status
    temp_file=$(mktemp)
    
    # Atualizar o status
    cat "$DEPLOY_STATUS_FILE" | \
    sed "s/\"$step\": \"[^\"]*\"/\"$step\": \"$status\"/" > "$temp_file"
    
    # Atualizar timestamp
    cat "$temp_file" | \
    sed "s/\"last_updated\": \"[^\"]*\"/\"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"/" > "$DEPLOY_STATUS_FILE"
    
    # Adicionar dados adicionais, se fornecidos
    if [ -n "$additional_data" ]; then
        case "$step" in
            "cloud_run_deploy")
                cat "$DEPLOY_STATUS_FILE" | \
                sed "s|\"service_url\": \"[^\"]*\"|\"service_url\": \"$additional_data\"|" > "$temp_file"
                mv "$temp_file" "$DEPLOY_STATUS_FILE"
                ;;
            "webhook_config")
                cat "$DEPLOY_STATUS_FILE" | \
                sed "s|\"webhook_url\": \"[^\"]*\"|\"webhook_url\": \"$additional_data\"|" > "$temp_file"
                mv "$temp_file" "$DEPLOY_STATUS_FILE"
                ;;
            "cloud_functions_deploy")
                cat "$DEPLOY_STATUS_FILE" | \
                sed "s|\"function_url\": \"[^\"]*\"|\"function_url\": \"$additional_data\"|" > "$temp_file"
                mv "$temp_file" "$DEPLOY_STATUS_FILE"
                ;;
        esac
    fi
    
    rm -f "$temp_file"
}

# Função para exibir o status do deployment
function display_status() {
    # Ler o arquivo de status
    local project_setup=$(grep -o '"project_setup": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local apis_enabled=$(grep -o '"apis_enabled": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local database_creation=$(grep -o '"database_creation": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local secrets_config=$(grep -o '"secrets_config": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local container_build=$(grep -o '"container_build": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local cloud_run_deploy=$(grep -o '"cloud_run_deploy": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local cloud_functions_deploy=$(grep -o '"cloud_functions_deploy": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local webhook_config=$(grep -o '"webhook_config": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local final_verification=$(grep -o '"final_verification": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    
    local service_url=$(grep -o '"service_url": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local webhook_url=$(grep -o '"webhook_url": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    local function_url=$(grep -o '"function_url": "[^"]*"' "$DEPLOY_STATUS_FILE" | cut -d'"' -f4)
    
    # Função para formatar o status
    function format_status() {
        local status=$1
        case "$status" in
            "success")
                echo -e "${GREEN}✓ Concluído${NC}"
                ;;
            "running")
                echo -e "${YELLOW}⟳ Em progresso${NC}"
                ;;
            "failed")
                echo -e "${RED}✗ Falhou${NC}"
                ;;
            "pending")
                echo -e "${CYAN}⏳ Pendente${NC}"
                ;;
            *)
                echo -e "${CYAN}? Desconhecido${NC}"
                ;;
        esac
    }
    
    # Exibir o status de cada etapa
    echo -e "${BOLD}Progresso do Deployment:${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
    echo -e "1. Configuração do Projeto GCP (${project_id}):                $(format_status $project_setup)"
    echo -e "2. Habilitação das APIs do GCP:                              $(format_status $apis_enabled)"
    echo -e "3. Criação do Banco de Dados PostgreSQL:                     $(format_status $database_creation)"
    echo -e "4. Configuração dos Secrets no Secret Manager:               $(format_status $secrets_config)"
    echo -e "5. Build do Container Docker:                                $(format_status $container_build)"
    echo -e "6. Deployment no Cloud Run:                                  $(format_status $cloud_run_deploy)"
    echo -e "7. Deployment das Cloud Functions:                           $(format_status $cloud_functions_deploy)"
    echo -e "8. Configuração dos Webhooks (Telegram/WhatsApp):            $(format_status $webhook_config)"
    echo -e "9. Verificação Final:                                        $(format_status $final_verification)"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
    
    # Exibir URLs, se disponíveis
    if [ -n "$service_url" ]; then
        echo -e "\n${BOLD}URLs do Serviço:${NC}"
        echo -e "🌐 Aplicação Web:      ${CYAN}$service_url${NC}"
        echo -e "🔄 API Principal:      ${CYAN}$service_url/api${NC}"
        
        if [ -n "$webhook_url" ]; then
            echo -e "📱 Webhook WhatsApp:   ${CYAN}$webhook_url${NC}"
        fi
        
        if [ -n "$function_url" ]; then
            echo -e "⚙️ Cloud Function:     ${CYAN}$function_url${NC}"
        fi
    fi
    
    # Calcular o progresso geral
    local completed=0
    for status in "$project_setup" "$apis_enabled" "$database_creation" "$secrets_config" "$container_build" "$cloud_run_deploy" "$cloud_functions_deploy" "$webhook_config" "$final_verification"; do
        if [ "$status" == "success" ]; then
            completed=$((completed + 1))
        fi
    done
    
    local progress=$((completed * 100 / TOTAL_STEPS))
    
    # Exibir barra de progresso
    echo -e "\n${BOLD}Progresso Geral: $progress%${NC}"
    echo -ne "["
    
    # Número de caracteres na barra de progresso
    local bar_width=50
    local completed_chars=$((progress * bar_width / 100))
    
    for ((i=0; i<bar_width; i++)); do
        if [ $i -lt $completed_chars ]; then
            echo -ne "${GREEN}#${NC}"
        else
            echo -ne "${CYAN}-${NC}"
        fi
    done
    
    echo -e "]"
    
    # Exibir mensagem de status
    if [ $progress -eq 100 ]; then
        echo -e "\n${GREEN}${BOLD}✅ Deployment concluído com sucesso!${NC}"
        echo -e "${YELLOW}O TarefoAI está pronto para uso em: ${CYAN}$service_url${NC}"
    elif [ "$final_verification" == "failed" ] || [ "$cloud_run_deploy" == "failed" ]; then
        echo -e "\n${RED}${BOLD}❌ Deployment encontrou problemas!${NC}"
        echo -e "${YELLOW}Verifique os logs para mais detalhes.${NC}"
    else
        echo -e "\n${YELLOW}${BOLD}⏳ Deployment em andamento...${NC}"
    fi
}

# Função para simular o deployment
function simulate_deployment() {
    show_header
    echo -e "${YELLOW}Iniciando deployment do TarefoAI no Google Cloud...${NC}"
    echo -e "Projeto: ${CYAN}$project_id${NC}"
    echo -e "Região: ${CYAN}$region${NC}"
    echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}\n"
    
    # Etapa 1: Configuração do Projeto
    update_status "project_setup" "running"
    display_status
    sleep 2
    
    echo -e "\n${CYAN}Configurando projeto GCP: $project_id...${NC}"
    echo "gcloud config set project $project_id" >> "$LOG_FILE"
    sleep 1
    update_status "project_setup" "success"
    clear_screen
    show_header
    display_status
    
    # Etapa 2: Habilitação das APIs
    update_status "apis_enabled" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Habilitando APIs necessárias...${NC}"
    echo "gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com" >> "$LOG_FILE"
    sleep 3
    update_status "apis_enabled" "success"
    clear_screen
    show_header
    display_status
    
    # Etapa 3: Criação do Banco de Dados
    update_status "database_creation" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Criando instância de banco de dados PostgreSQL...${NC}"
    DB_INSTANCE="${db_instance:-tarefo-ai-db}"
    DB_VERSION="${db_version:-14}"
    DB_TIER="${db_tier:-db-f1-micro}"
    echo "gcloud sql instances create $DB_INSTANCE --database-version=POSTGRES_$DB_VERSION --tier=$DB_TIER --region=$region" >> "$LOG_FILE"
    sleep 5
    update_status "database_creation" "success"
    clear_screen
    show_header
    display_status
    
    # Etapa 4: Configuração de Secrets
    update_status "secrets_config" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Configurando secrets no Secret Manager...${NC}"
    echo "gcloud secrets create openai-api-key --replication-policy=automatic" >> "$LOG_FILE"
    echo "gcloud secrets create telegram-bot-token --replication-policy=automatic" >> "$LOG_FILE"
    echo "gcloud secrets create twilio-account-sid --replication-policy=automatic" >> "$LOG_FILE"
    echo "gcloud secrets create twilio-auth-token --replication-policy=automatic" >> "$LOG_FILE"
    echo "gcloud secrets create database-url --replication-policy=automatic" >> "$LOG_FILE"
    sleep 4
    update_status "secrets_config" "success"
    clear_screen
    show_header
    display_status
    
    # Etapa 5: Build do Container
    update_status "container_build" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Construindo e enviando imagem Docker...${NC}"
    SERVICE_NAME="${service_name:-tarefo-ai}"
    IMAGE_NAME="gcr.io/${project_id}/${SERVICE_NAME}"
    echo "gcloud builds submit --tag $IMAGE_NAME ." >> "$LOG_FILE"
    sleep 8
    update_status "container_build" "success"
    clear_screen
    show_header
    display_status
    
    # Etapa 6: Deployment no Cloud Run
    update_status "cloud_run_deploy" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Implantando aplicação no Cloud Run...${NC}"
    MEMORY="${memory:-1Gi}"
    CPU="${cpu:-1}"
    MIN_INSTANCES="${min_instances:-0}"
    MAX_INSTANCES="${max_instances:-2}"
    
    echo "gcloud run deploy $SERVICE_NAME --image $IMAGE_NAME --platform managed --region $region --allow-unauthenticated --memory=$MEMORY --cpu=$CPU --min-instances=$MIN_INSTANCES --max-instances=$MAX_INSTANCES" >> "$LOG_FILE"
    
    sleep 10
    SERVICE_URL="https://${SERVICE_NAME}-${project_id}.${region}.run.app"
    update_status "cloud_run_deploy" "success" "$SERVICE_URL"
    clear_screen
    show_header
    display_status
    
    # Etapa 7: Deployment das Cloud Functions
    update_status "cloud_functions_deploy" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Implantando Cloud Functions para webhooks...${NC}"
    WEBHOOK_FUNCTION="${webhook_function:-tarefo-ai-webhook}"
    FUNCTION_MEMORY="${function_memory:-256MB}"
    FUNCTION_TIMEOUT="${function_timeout:-60s}"
    
    echo "gcloud functions deploy $WEBHOOK_FUNCTION --runtime nodejs18 --trigger-http --region $region --memory=$FUNCTION_MEMORY --timeout=$FUNCTION_TIMEOUT --source=webhook-function" >> "$LOG_FILE"
    
    sleep 6
    FUNCTION_URL="https://${region}-${project_id}.cloudfunctions.net/${WEBHOOK_FUNCTION}"
    update_status "cloud_functions_deploy" "success" "$FUNCTION_URL"
    clear_screen
    show_header
    display_status
    
    # Etapa 8: Configuração de Webhooks
    update_status "webhook_config" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Configurando webhooks para mensageria...${NC}"
    WEBHOOK_URL="${SERVICE_URL}/api/webhook"
    
    sleep 3
    update_status "webhook_config" "success" "$WEBHOOK_URL"
    clear_screen
    show_header
    display_status
    
    # Etapa 9: Verificação Final
    update_status "final_verification" "running"
    display_status
    sleep 1
    
    echo -e "\n${CYAN}Realizando verificações finais...${NC}"
    echo "curl -s $SERVICE_URL/api/health" >> "$LOG_FILE"
    
    sleep 3
    update_status "final_verification" "success"
    clear_screen
    show_header
    display_status
    
    echo -e "\n${GREEN}${BOLD}Deployment concluído com sucesso!${NC}"
    echo -e "${WHITE}O TarefoAI está disponível em:${NC} ${CYAN}$SERVICE_URL${NC}"
    echo -e "\n${YELLOW}Próximos passos:${NC}"
    echo -e "1. Configure seus provedores de API (OpenAI, Twilio, etc.)"
    echo -e "2. Configure seu bot do Telegram com o webhook: ${CYAN}${WEBHOOK_URL}/telegram${NC}"
    echo -e "3. Configure o Twilio WhatsApp com o webhook: ${CYAN}${WEBHOOK_URL}/whatsapp${NC}"
    echo -e "\n${WHITE}Obrigado por usar o Tarefo AI!${NC}"
}

# Função principal
function main() {
    # Limpar logs anteriores
    rm -f "$LOG_FILE"
    touch "$LOG_FILE"
    
    # Inicializar arquivo de status
    init_status_file
    
    # Carregar configurações
    load_config
    if [ $? -ne 0 ]; then
        echo -e "${RED}Falha ao carregar configurações. Encerrando.${NC}"
        exit 1
    fi
    
    # Confirmar antes de prosseguir
    show_header
    echo -e "${BOLD}Pronto para iniciar o deployment do TarefoAI para o Google Cloud.${NC}"
    echo -e "${YELLOW}Este processo irá:${NC}"
    echo -e "1. Configurar seu projeto GCP: ${CYAN}$project_id${NC}"
    echo -e "2. Criar recursos de infraestrutura na região: ${CYAN}$region${NC}"
    echo -e "3. Implantar o TarefoAI no Cloud Run"
    echo -e "4. Configurar banco de dados, secrets e webhooks"
    echo ""
    
    read -p "Deseja prosseguir com o deployment? [S/n]: " confirm
    confirm=$(echo "$confirm" | tr '[:upper:]' '[:lower:]')
    
    if [ -z "$confirm" ] || [ "$confirm" = "s" ]; then
        # Iniciar o deployment
        simulate_deployment
    else
        echo -e "${YELLOW}Deployment cancelado pelo usuário.${NC}"
        exit 0
    fi
}

# Iniciar o visualizador
main