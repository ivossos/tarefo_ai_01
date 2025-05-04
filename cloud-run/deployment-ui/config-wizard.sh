#!/bin/bash

# Assistente de Configuração de Deployment para Tarefo AI
# Este script guia o usuário por todas as etapas de configuração do deployment
# com explicações detalhadas e tooltips para cada opção.

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
WIZARD_STATE="wizard-state.json"
PROJECT_ID=""
REGION=""
SERVICE_NAME=""
DATABASE_INSTANCE=""
WEBHOOK_URL=""
SECRET_PREFIX=""
ENABLE_MONITORING=true
ENABLE_ALERTS=true
AUTO_SCALING_MIN=1
AUTO_SCALING_MAX=10

# Verifica se o whiptail está disponível
function check_whiptail() {
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}⚠ whiptail não encontrado. Este script requer whiptail para a interface gráfica.${NC}"
        echo -e "   Instale-o com 'sudo apt-get install whiptail' (Ubuntu/Debian)"
        echo -e "   ou 'brew install newt' (macOS com Homebrew)"
        exit 1
    fi
}

# Carrega a configuração existente se houver
function load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${BLUE}Carregando configuração existente...${NC}"
        
        # Usar jq se disponível, caso contrário usar grep
        if command -v jq &> /dev/null; then
            PROJECT_ID=$(jq -r '.project_id // ""' "$CONFIG_FILE")
            REGION=$(jq -r '.region // ""' "$CONFIG_FILE")
            SERVICE_NAME=$(jq -r '.service_name // ""' "$CONFIG_FILE")
            DATABASE_INSTANCE=$(jq -r '.database_instance // ""' "$CONFIG_FILE")
            WEBHOOK_URL=$(jq -r '.webhook_url // ""' "$CONFIG_FILE")
            SECRET_PREFIX=$(jq -r '.secret_prefix // ""' "$CONFIG_FILE")
            ENABLE_MONITORING=$(jq -r '.enable_monitoring // true' "$CONFIG_FILE")
            ENABLE_ALERTS=$(jq -r '.enable_alerts // true' "$CONFIG_FILE")
            AUTO_SCALING_MIN=$(jq -r '.auto_scaling_min // 1' "$CONFIG_FILE")
            AUTO_SCALING_MAX=$(jq -r '.auto_scaling_max // 10' "$CONFIG_FILE")
        else
            # Fallback simples sem jq
            PROJECT_ID=$(grep -o '"project_id": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            REGION=$(grep -o '"region": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            SERVICE_NAME=$(grep -o '"service_name": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            DATABASE_INSTANCE=$(grep -o '"database_instance": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
        fi
    else
        # Valores padrão
        PROJECT_ID="tarefo-ai-prod"
        REGION="southamerica-east1"
        SERVICE_NAME="tarefo-ai"
        DATABASE_INSTANCE="tarefo-ai-db"
        SECRET_PREFIX="tarefo-ai"
        WEBHOOK_URL=""
        ENABLE_MONITORING=true
        ENABLE_ALERTS=true
        AUTO_SCALING_MIN=1
        AUTO_SCALING_MAX=10
    fi
}

# Salva a configuração atual
function save_config() {
    echo -e "${BLUE}Salvando configuração...${NC}"
    
    # Verificar se jq está instalado para formatação adequada
    if command -v jq &> /dev/null; then
        echo "{
  \"project_id\": \"$PROJECT_ID\",
  \"region\": \"$REGION\",
  \"service_name\": \"$SERVICE_NAME\",
  \"database_instance\": \"$DATABASE_INSTANCE\",
  \"webhook_url\": \"$WEBHOOK_URL\",
  \"secret_prefix\": \"$SECRET_PREFIX\",
  \"enable_monitoring\": $ENABLE_MONITORING,
  \"enable_alerts\": $ENABLE_ALERTS,
  \"auto_scaling_min\": $AUTO_SCALING_MIN,
  \"auto_scaling_max\": $AUTO_SCALING_MAX
}" | jq '.' > "$CONFIG_FILE"
    else
        # Fallback para salvamento básico sem jq
        echo "{
  \"project_id\": \"$PROJECT_ID\",
  \"region\": \"$REGION\",
  \"service_name\": \"$SERVICE_NAME\",
  \"database_instance\": \"$DATABASE_INSTANCE\",
  \"webhook_url\": \"$WEBHOOK_URL\",
  \"secret_prefix\": \"$SECRET_PREFIX\",
  \"enable_monitoring\": $ENABLE_MONITORING,
  \"enable_alerts\": $ENABLE_ALERTS,
  \"auto_scaling_min\": $AUTO_SCALING_MIN,
  \"auto_scaling_max\": $AUTO_SCALING_MAX
}" > "$CONFIG_FILE"
    fi
    
    echo -e "${GREEN}✓ Configuração salva em $CONFIG_FILE${NC}"
}

# Salva o estado atual do assistente para poder continuar de onde parou
function save_wizard_state() {
    local step=$1
    echo "{\"last_step\": $step}" > "$WIZARD_STATE"
}

# Carrega o último estado do assistente
function load_wizard_state() {
    if [ -f "$WIZARD_STATE" ]; then
        if command -v jq &> /dev/null; then
            local last_step=$(jq -r '.last_step // 1' "$WIZARD_STATE")
            echo $last_step
        else
            local last_step=$(grep -o '"last_step": *[0-9]*' "$WIZARD_STATE" | cut -d: -f2 | tr -d ' ')
            echo $last_step
        fi
    else
        echo 1
    fi
}

# Exibe tela de boas-vindas
function show_welcome() {
    whiptail --title "Assistente de Configuração do Tarefo AI" \
        --msgbox "Bem-vindo ao Assistente de Configuração do Tarefo AI!\n\nEste assistente irá guiá-lo através do processo de configuração para deployment no Google Cloud Platform. Cada etapa incluirá explicações detalhadas sobre as opções disponíveis.\n\nPressione OK para começar." 15 70
}

# Etapa 1: Configuração do projeto GCP
function configure_project() {
    local tooltip_text="O ID do Projeto GCP é um identificador único para seu projeto no Google Cloud Platform.\n\nFormato válido: letras minúsculas, números, e hífens. Ex: tarefo-ai-prod\n\nSe você ainda não tem um projeto, vá ao Console do Google Cloud para criar um."
    
    local new_project_id=$(whiptail --title "Etapa 1/9: Configuração do Projeto GCP" \
        --inputbox "Digite o ID do seu projeto no Google Cloud Platform:\n\n[ℹ️ Dica: $tooltip_text]" 15 70 "$PROJECT_ID" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Verificar formato básico
    if [[ ! $new_project_id =~ ^[a-z0-9][-a-z0-9]*[a-z0-9]$ ]]; then
        whiptail --title "Erro de Validação" --msgbox "O ID do projeto '$new_project_id' parece inválido.\n\nO ID do projeto deve conter apenas letras minúsculas, números e hífens, e não pode começar ou terminar com hífen." 12 70
        return 1
    fi
    
    PROJECT_ID=$new_project_id
    save_wizard_state 2
    return 0
}

# Etapa 2: Seleção de região
function select_region() {
    local tooltip_text="A região determina onde seus recursos serão hospedados fisicamente.\n\nEscolha a mais próxima dos seus usuários para obter menor latência.\n\nPara usuários no Brasil, recomendamos southamerica-east1 (São Paulo)."
    
    local options=("southamerica-east1" "São Paulo, Brasil (recomendado)" \
                   "us-central1" "Iowa, Estados Unidos" \
                   "us-east1" "Carolina do Sul, Estados Unidos" \
                   "europe-west1" "Bélgica, Europa" \
                   "asia-east1" "Taiwan, Ásia")
    
    local current_region_index=0
    for i in "${!options[@]}"; do
        if [[ $((i % 2)) -eq 0 && "${options[$i]}" == "$REGION" ]]; then
            current_region_index=$((i / 2 + 1))
            break
        fi
    done
    
    if [ $current_region_index -eq 0 ]; then
        current_region_index=1
    fi
    
    local new_region=$(whiptail --title "Etapa 2/9: Seleção de Região" \
        --radiolist "Selecione a região para deployment:\n\n[ℹ️ Dica: $tooltip_text]" 18 70 5 \
        "1" "${options[0]} (${options[1]})" $([[ $current_region_index -eq 1 ]] && echo "ON" || echo "OFF") \
        "2" "${options[2]} (${options[3]})" $([[ $current_region_index -eq 2 ]] && echo "ON" || echo "OFF") \
        "3" "${options[4]} (${options[5]})" $([[ $current_region_index -eq 3 ]] && echo "ON" || echo "OFF") \
        "4" "${options[6]} (${options[7]})" $([[ $current_region_index -eq 4 ]] && echo "ON" || echo "OFF") \
        "5" "${options[8]} (${options[9]})" $([[ $current_region_index -eq 5 ]] && echo "ON" || echo "OFF") \
        3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Mapear a seleção para o valor real
    case $new_region in
        1) REGION="${options[0]}" ;;
        2) REGION="${options[2]}" ;;
        3) REGION="${options[4]}" ;;
        4) REGION="${options[6]}" ;;
        5) REGION="${options[8]}" ;;
    esac
    
    save_wizard_state 3
    return 0
}

# Etapa 3: Nome do serviço
function configure_service_name() {
    local tooltip_text="O nome do serviço é usado para identificar seu aplicativo no Cloud Run.\n\nRecomendação: Use apenas letras minúsculas, números e hífens.\n\nExemplo: tarefo-ai"
    
    local new_service_name=$(whiptail --title "Etapa 3/9: Nome do Serviço" \
        --inputbox "Digite o nome do serviço para o Cloud Run:\n\n[ℹ️ Dica: $tooltip_text]" 15 70 "$SERVICE_NAME" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Verificar formato básico
    if [[ ! $new_service_name =~ ^[a-z0-9][-a-z0-9]*[a-z0-9]$ ]]; then
        whiptail --title "Erro de Validação" --msgbox "O nome do serviço '$new_service_name' parece inválido.\n\nO nome deve conter apenas letras minúsculas, números e hífens, e não pode começar ou terminar com hífen." 12 70
        return 1
    fi
    
    SERVICE_NAME=$new_service_name
    save_wizard_state 4
    return 0
}

# Etapa 4: Configuração do banco de dados
function configure_database() {
    local tooltip_text="Nome da instância do Cloud SQL (PostgreSQL).\n\nRecomendação: Use apenas letras minúsculas, números e hífens.\n\nExemplo: tarefo-ai-db"
    
    local new_db_instance=$(whiptail --title "Etapa 4/9: Configuração do Banco de Dados" \
        --inputbox "Digite o nome da instância do Cloud SQL:\n\n[ℹ️ Dica: $tooltip_text]" 15 70 "$DATABASE_INSTANCE" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Verificar formato básico
    if [[ ! $new_db_instance =~ ^[a-z0-9][-a-z0-9]*[a-z0-9]$ ]]; then
        whiptail --title "Erro de Validação" --msgbox "O nome da instância '$new_db_instance' parece inválido.\n\nO nome deve conter apenas letras minúsculas, números e hífens, e não pode começar ou terminar com hífen." 12 70
        return 1
    fi
    
    DATABASE_INSTANCE=$new_db_instance
    save_wizard_state 5
    return 0
}

# Etapa 5: URL do Webhook
function configure_webhook_url() {
    local tooltip_text="URL base para webhooks (sem barras finais).\n\nExemplo: https://tarefo-ai-[unique-id].a.run.app\n\nEsta URL será usada para configurar webhooks do WhatsApp, Telegram e outros serviços. Deixe em branco para configurar mais tarde."
    
    local new_webhook_url=$(whiptail --title "Etapa 5/9: URL do Webhook" \
        --inputbox "Digite a URL base para webhooks (opcional):\n\n[ℹ️ Dica: $tooltip_text]" 15 70 "$WEBHOOK_URL" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Verificar formato básico se não estiver vazio
    if [ ! -z "$new_webhook_url" ] && [[ ! $new_webhook_url =~ ^https?:// ]]; then
        whiptail --title "Erro de Validação" --msgbox "A URL '$new_webhook_url' parece inválida.\n\nA URL deve começar com http:// ou https://" 10 70
        return 1
    fi
    
    WEBHOOK_URL=$new_webhook_url
    save_wizard_state 6
    return 0
}

# Etapa 6: Prefixo para Segredos
function configure_secret_prefix() {
    local tooltip_text="Prefixo para nomes de segredos no Secret Manager.\n\nIsso ajuda a organizar os segredos por aplicação.\n\nExemplo: tarefo-ai"
    
    local new_secret_prefix=$(whiptail --title "Etapa 6/9: Prefixo para Segredos" \
        --inputbox "Digite o prefixo para segredos no Secret Manager:\n\n[ℹ️ Dica: $tooltip_text]" 15 70 "$SECRET_PREFIX" 3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Verificar formato básico
    if [[ ! $new_secret_prefix =~ ^[a-zA-Z0-9][-_a-zA-Z0-9]*[a-zA-Z0-9]$ ]]; then
        whiptail --title "Erro de Validação" --msgbox "O prefixo de segredos '$new_secret_prefix' parece inválido.\n\nO prefixo deve conter apenas letras, números, hífens e underscores, e não pode começar ou terminar com hífen/underscore." 12 70
        return 1
    fi
    
    SECRET_PREFIX=$new_secret_prefix
    save_wizard_state 7
    return 0
}

# Etapa 7: Monitoramento e Alertas
function configure_monitoring() {
    local tooltip_text="O monitoramento inclui métricas, dashboards e logs.\nOs alertas notificam sobre problemas via email."
    
    if whiptail --title "Etapa 7/9: Monitoramento e Alertas" \
        --yesno "Deseja ativar o monitoramento e alertas?\n\n[ℹ️ Dica: $tooltip_text]\n\nMonitoramento: Coleta métricas, cria dashboards e centraliza logs.\nAlertas: Envia notificações sobre problemas (ex: alta latência, erros)." 15 70 $([[ "$ENABLE_MONITORING" == true ]] && echo 0 || echo 1); then
        ENABLE_MONITORING=true
        
        if whiptail --title "Configuração de Alertas" \
            --yesno "Deseja configurar alertas por email?\n\nIsso enviará notificações sobre problemas críticos como:\n- Alto uso de CPU/memória\n- Erros de servidor\n- Indisponibilidade" 15 70 $([[ "$ENABLE_ALERTS" == true ]] && echo 0 || echo 1); then
            ENABLE_ALERTS=true
        else
            ENABLE_ALERTS=false
        fi
    else
        ENABLE_MONITORING=false
        ENABLE_ALERTS=false
    fi
    
    save_wizard_state 8
    return 0
}

# Etapa 8: Configuração de Escala Automática
function configure_autoscaling() {
    local tooltip_text="Defina o número mínimo e máximo de instâncias.\n\nMínimo: Instâncias sempre ativas, mesmo sem tráfego.\nMáximo: Limite de instâncias durante picos de tráfego."
    
    # Selecionar número mínimo de instâncias
    local new_min=$(whiptail --title "Etapa 8/9: Configuração de Escala Automática" \
        --radiolist "Selecione o número MÍNIMO de instâncias:\n\n[ℹ️ Dica: $tooltip_text]\n\n0 = Escala a zero (economia máxima, mas com cold starts)\n1+ = Sempre ativo (melhor performance, maior custo)" 20 70 4 \
        "0" "Escala a zero (economia máxima)" $([[ $AUTO_SCALING_MIN -eq 0 ]] && echo "ON" || echo "OFF") \
        "1" "Uma instância sempre ativa (recomendado)" $([[ $AUTO_SCALING_MIN -eq 1 ]] && echo "ON" || echo "OFF") \
        "2" "Duas instâncias (alta disponibilidade)" $([[ $AUTO_SCALING_MIN -eq 2 ]] && echo "ON" || echo "OFF") \
        "3" "Três instâncias (prod. com tráfego alto)" $([[ $AUTO_SCALING_MIN -eq 3 ]] && echo "ON" || echo "OFF") \
        3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    # Selecionar número máximo de instâncias
    local new_max=$(whiptail --title "Etapa 8/9: Configuração de Escala Automática" \
        --radiolist "Selecione o número MÁXIMO de instâncias:\n\n[ℹ️ Dica: Limita quantas instâncias podem ser criadas durante picos de tráfego. Ajuda a controlar custos.]" 18 70 4 \
        "5" "Até 5 instâncias (tráfego baixo)" $([[ $AUTO_SCALING_MAX -eq 5 ]] && echo "ON" || echo "OFF") \
        "10" "Até 10 instâncias (recomendado)" $([[ $AUTO_SCALING_MAX -eq 10 ]] && echo "ON" || echo "OFF") \
        "20" "Até 20 instâncias (tráfego médio)" $([[ $AUTO_SCALING_MAX -eq 20 ]] && echo "ON" || echo "OFF") \
        "50" "Até 50 instâncias (tráfego alto)" $([[ $AUTO_SCALING_MAX -eq 50 ]] && echo "ON" || echo "OFF") \
        3>&1 1>&2 2>&3)
    
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        return $exit_status
    fi
    
    AUTO_SCALING_MIN=$new_min
    AUTO_SCALING_MAX=$new_max
    
    save_wizard_state 9
    return 0
}

# Etapa 9: Resumo e Confirmação
function show_summary() {
    local summary="Resumo da Configuração:\n\n"
    summary+="• Projeto GCP: $PROJECT_ID\n"
    summary+="• Região: $REGION\n"
    summary+="• Nome do Serviço: $SERVICE_NAME\n"
    summary+="• Instância DB: $DATABASE_INSTANCE\n"
    
    if [ ! -z "$WEBHOOK_URL" ]; then
        summary+="• URL Webhook: $WEBHOOK_URL\n"
    else
        summary+="• URL Webhook: (será configurada posteriormente)\n"
    fi
    
    summary+="• Prefixo Segredos: $SECRET_PREFIX\n"
    
    if [ "$ENABLE_MONITORING" = true ]; then
        summary+="• Monitoramento: Ativado\n"
        
        if [ "$ENABLE_ALERTS" = true ]; then
            summary+="• Alertas: Ativados\n"
        else
            summary+="• Alertas: Desativados\n"
        fi
    else
        summary+="• Monitoramento: Desativado\n"
        summary+="• Alertas: Desativados\n"
    fi
    
    summary+="• Escala Automática: Mín=$AUTO_SCALING_MIN, Máx=$AUTO_SCALING_MAX\n"
    
    if whiptail --title "Etapa 9/9: Resumo e Confirmação" \
        --yesno "$summary\n\nDeseja salvar esta configuração?" 20 70; then
        save_config
        
        whiptail --title "Configuração Concluída" \
            --msgbox "A configuração foi salva com sucesso!\n\nAgora você pode usar o Deployment Manager para implantar o Tarefo AI usando estas configurações.\n\nArquivo de configuração: $CONFIG_FILE" 12 70
        
        # Remover arquivo de estado do assistente
        if [ -f "$WIZARD_STATE" ]; then
            rm "$WIZARD_STATE"
        fi
        
        return 0
    else
        return 1
    fi
}

# Função principal para executar o assistente
function run_wizard() {
    # Verificar whiptail
    check_whiptail
    
    # Carregar configuração existente
    load_config
    
    # Obter último estado ou começar do início
    local last_step=$(load_wizard_state)
    
    # Mostrar tela de boas-vindas apenas na primeira execução
    if [ $last_step -eq 1 ]; then
        show_welcome
    fi
    
    # Loop das etapas
    local current_step=$last_step
    local result=0
    
    while [ $current_step -le 9 ]; do
        case $current_step in
            1) configure_project; result=$? ;;
            2) select_region; result=$? ;;
            3) configure_service_name; result=$? ;;
            4) configure_database; result=$? ;;
            5) configure_webhook_url; result=$? ;;
            6) configure_secret_prefix; result=$? ;;
            7) configure_monitoring; result=$? ;;
            8) configure_autoscaling; result=$? ;;
            9) show_summary; result=$? ;;
        esac
        
        # Voltar uma etapa se usuário pressionar Cancelar
        if [ $result -ne 0 ]; then
            if [ $current_step -gt 1 ]; then
                current_step=$((current_step - 1))
                save_wizard_state $current_step
            else
                # Se estiver na primeira etapa e cancelar, sair
                whiptail --title "Assistente Cancelado" \
                    --msgbox "Configuração cancelada pelo usuário.\n\nNenhuma alteração foi salva." 10 70
                
                # Remover arquivo de estado do assistente
                if [ -f "$WIZARD_STATE" ]; then
                    rm "$WIZARD_STATE"
                fi
                
                return 1
            fi
        else
            current_step=$((current_step + 1))
        fi
    done
    
    return 0
}

# Executar o assistente
run_wizard