#!/bin/bash

# Estimador de Custos do Tarefo AI
#
# Este script calcula o custo estimado mensal no Google Cloud
# com base nas configurações de deployment escolhidas.

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # Sem cor

# Arquivo de configuração
CONFIG_FILE="deployment-config.json"

# Variáveis de configuração
PROJECT_ID=""
REGION=""
SERVICE_NAME=""
DATABASE_INSTANCE=""
AUTO_SCALING_MIN=1
AUTO_SCALING_MAX=10
ENABLE_MONITORING=true

# Variáveis para cálculo de custo
USERS_PER_DAY=0
DB_TIER="db-f1-micro"
STORAGE_GB=10
NETWORK_EGRESS_GB=50
FUNCTION_INVOCATIONS=100000
FUNCTION_MEMORY_MB=256
ESTIMATED_REQUESTS_PER_DAY=1000

# Função para verificar se whiptail está disponível
function check_whiptail() {
    if ! command -v whiptail &> /dev/null; then
        echo -e "${YELLOW}⚠ whiptail não encontrado. Este script requer whiptail para a interface gráfica.${NC}"
        echo -e "   Instale-o com 'sudo apt-get install whiptail' (Ubuntu/Debian)"
        echo -e "   ou 'brew install newt' (macOS com Homebrew)"
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
            AUTO_SCALING_MIN=$(jq -r '.auto_scaling_min // 1' "$CONFIG_FILE")
            AUTO_SCALING_MAX=$(jq -r '.auto_scaling_max // 10' "$CONFIG_FILE")
            ENABLE_MONITORING=$(jq -r '.enable_monitoring // true' "$CONFIG_FILE")
        else
            # Fallback simples sem jq
            PROJECT_ID=$(grep -o '"project_id": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            REGION=$(grep -o '"region": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            SERVICE_NAME=$(grep -o '"service_name": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            DATABASE_INSTANCE=$(grep -o '"database_instance": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
            AUTO_SCALING_MIN=$(grep -o '"auto_scaling_min": *[0-9]*' "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
            AUTO_SCALING_MAX=$(grep -o '"auto_scaling_max": *[0-9]*' "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
            ENABLE_MONITORING=$(grep -o '"enable_monitoring": *[a-z]*' "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
        fi
        
        echo -e "${GREEN}✓ Configuração carregada.${NC}"
    else
        echo -e "${YELLOW}Nenhuma configuração existente encontrada. Usando valores padrão.${NC}"
        
        # Valores padrão
        PROJECT_ID="tarefo-ai-prod"
        REGION="southamerica-east1"
        SERVICE_NAME="tarefo-ai"
        DATABASE_INSTANCE="tarefo-ai-db"
        AUTO_SCALING_MIN=1
        AUTO_SCALING_MAX=10
        ENABLE_MONITORING=true
    fi
}

# Calcular custo do Cloud Run
function calculate_cloud_run_cost() {
    local cpu_rate=0.00002400  # $0.00002400 por vCPU-segundo
    local memory_rate=0.00000250  # $0.00000250 por GiB-segundo
    local vcpu=1
    local mem_gb=2
    local instances=$AUTO_SCALING_MIN
    local hours_per_month=730  # 24h * 30.42 dias
    
    # Se escala a zero, considerar uso médio de 12h por dia
    if [ "$AUTO_SCALING_MIN" -eq 0 ]; then
        local hours_per_month=365  # 12h * 30.42 dias
    fi
    
    # Cálculo de CPU
    local cpu_seconds=$((vcpu * instances * hours_per_month * 3600))
    local cpu_cost=$(echo "$cpu_seconds * $cpu_rate" | bc -l)
    
    # Cálculo de memória
    local mem_seconds=$((mem_gb * instances * hours_per_month * 3600))
    local mem_cost=$(echo "$mem_seconds * $memory_rate" | bc -l)
    
    # Tier gratuito: 180K vCPU-seconds, 360K GiB-seconds
    local free_cpu_seconds=180000
    local free_mem_seconds=360000
    
    if (( $(echo "$cpu_seconds > $free_cpu_seconds" | bc -l) )); then
        cpu_cost=$(echo "($cpu_seconds - $free_cpu_seconds) * $cpu_rate" | bc -l)
    else
        cpu_cost=0
    fi
    
    if (( $(echo "$mem_seconds > $free_mem_seconds" | bc -l) )); then
        mem_cost=$(echo "($mem_seconds - $free_mem_seconds) * $memory_rate" | bc -l)
    else
        mem_cost=0
    fi
    
    # Total (arredondado para 2 casas decimais)
    local total_cost=$(echo "$cpu_cost + $mem_cost" | bc -l)
    printf "%.2f" $total_cost
}

# Calcular custo do Cloud SQL
function calculate_cloud_sql_cost() {
    local db_cost_per_month=0
    
    case $DB_TIER in
        "db-f1-micro")
            db_cost_per_month=8.05
            ;;
        "db-g1-small")
            db_cost_per_month=27.63
            ;;
        "db-custom-1-3840")
            db_cost_per_month=52.44
            ;;
        "db-custom-2-7680")
            db_cost_per_month=104.88
            ;;
    esac
    
    # Custo de armazenamento: $0.17 por GB por mês para SSD
    local storage_cost=$(echo "$STORAGE_GB * 0.17" | bc -l)
    
    # Total (arredondado para 2 casas decimais)
    local total_cost=$(echo "$db_cost_per_month + $storage_cost" | bc -l)
    printf "%.2f" $total_cost
}

# Calcular custo de transferência de rede
function calculate_network_cost() {
    # 0-1 TB/month: $0.12/GB
    # Primeiros 10GB gratuitos
    local free_gb=10
    local rate_per_gb=0.12
    
    if [ "$NETWORK_EGRESS_GB" -le "$free_gb" ]; then
        echo "0.00"
    else
        local billable_gb=$((NETWORK_EGRESS_GB - free_gb))
        local total_cost=$(echo "$billable_gb * $rate_per_gb" | bc -l)
        printf "%.2f" $total_cost
    fi
}

# Calcular custo de funções Cloud
function calculate_functions_cost() {
    # Tier gratuito: 2 milhões de invocações, 400.000 GB-segundos
    local free_invocations=2000000
    local free_gb_seconds=400000
    
    # Calcular GB-segundos (aproximado)
    local gb_mem=$(echo "$FUNCTION_MEMORY_MB / 1024" | bc -l)
    local execution_time_seconds=1  # tempo médio por execução
    local gb_seconds=$(echo "$FUNCTION_INVOCATIONS * $gb_mem * $execution_time_seconds" | bc -l)
    
    local invocation_rate=0.0000004  # $0.40 por milhão
    local gb_seconds_rate=0.0000025  # por GB-segundo
    
    local invocation_cost=0
    local gb_seconds_cost=0
    
    if (( $(echo "$FUNCTION_INVOCATIONS > $free_invocations" | bc -l) )); then
        local billable_invocations=$(echo "$FUNCTION_INVOCATIONS - $free_invocations" | bc -l)
        invocation_cost=$(echo "$billable_invocations * $invocation_rate" | bc -l)
    fi
    
    if (( $(echo "$gb_seconds > $free_gb_seconds" | bc -l) )); then
        local billable_gb_seconds=$(echo "$gb_seconds - $free_gb_seconds" | bc -l)
        gb_seconds_cost=$(echo "$billable_gb_seconds * $gb_seconds_rate" | bc -l)
    fi
    
    # Total (arredondado para 2 casas decimais)
    local total_cost=$(echo "$invocation_cost + $gb_seconds_cost" | bc -l)
    printf "%.2f" $total_cost
}

# Calcular custo de monitoramento
function calculate_monitoring_cost() {
    if [ "$ENABLE_MONITORING" = true ]; then
        # Assumindo uso básico: $0.30/milhão de métricas ingeridas
        # Um modelo simples seria usar uma estimativa fixa, como $5 por mês para uso básico
        echo "5.00"
    else
        echo "0.00"
    fi
}

# Calcular custo de Secret Manager
function calculate_secrets_cost() {
    # Estimativa: 10 segredos, 1000 acessos por mês
    # $0.06/segredo/mês + $0.03/10K acessos
    
    local secret_count=10
    local secret_rate=0.06
    local access_count=1000
    local access_rate_per_10k=0.03
    
    local secret_cost=$(echo "$secret_count * $secret_rate" | bc -l)
    local access_cost=$(echo "($access_count / 10000) * $access_rate_per_10k" | bc -l)
    
    # Total (arredondado para 2 casas decimais)
    local total_cost=$(echo "$secret_cost + $access_cost" | bc -l)
    printf "%.2f" $total_cost
}

# Calcular estimativa de custo total por mês
function calculate_total_cost() {
    local cloud_run_cost=$(calculate_cloud_run_cost)
    local cloud_sql_cost=$(calculate_cloud_sql_cost)
    local network_cost=$(calculate_network_cost)
    local functions_cost=$(calculate_functions_cost)
    local monitoring_cost=$(calculate_monitoring_cost)
    local secrets_cost=$(calculate_secrets_cost)
    
    # Considerar 10% para outros serviços e margem de erro
    local others_cost=$(echo "($cloud_run_cost + $cloud_sql_cost + $network_cost + $functions_cost + $monitoring_cost + $secrets_cost) * 0.1" | bc -l)
    
    # Total (arredondado para 2 casas decimais)
    local total_cost=$(echo "$cloud_run_cost + $cloud_sql_cost + $network_cost + $functions_cost + $monitoring_cost + $secrets_cost + $others_cost" | bc -l)
    printf "%.2f" $total_cost
}

# Coletar informações sobre o uso esperado
function collect_usage_info() {
    # Coletando informações de uso
    USERS_PER_DAY=$(whiptail --title "Estimador de Custos - Usuários" \
        --menu "Selecione a quantidade aproximada de usuários DIÁRIOS:" 16 60 4 \
        "50" "Até 50 usuários por dia (pequeno)" \
        "200" "Até 200 usuários por dia (médio)" \
        "1000" "Até 1.000 usuários por dia (grande)" \
        "5000" "Até 5.000 usuários por dia (muito grande)" 3>&1 1>&2 2>&3)
    
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # Definir quantidade de requisições baseada nos usuários
    ESTIMATED_REQUESTS_PER_DAY=$(($USERS_PER_DAY * 10))  # Estimativa: 10 requisições por usuário por dia
    
    # Definir invocações de funções baseada nos usuários
    FUNCTION_INVOCATIONS=$(($USERS_PER_DAY * 100))  # Estimativa: 100 invocações por usuário por mês
    
    # Tipo de banco de dados
    DB_TIER=$(whiptail --title "Estimador de Custos - Banco de Dados" \
        --menu "Selecione o tipo de instância do Cloud SQL:" 16 70 4 \
        "db-f1-micro" "Shared-core, 1 vCPU, 614MB (pequeno, ~$8/mês)" \
        "db-g1-small" "Shared-core, 1 vCPU, 1.7GB (médio, ~$28/mês)" \
        "db-custom-1-3840" "1 vCPU, 3.75GB (dedicado, ~$52/mês)" \
        "db-custom-2-7680" "2 vCPU, 7.5GB (grande, ~$105/mês)" 3>&1 1>&2 2>&3)
    
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # Armazenamento do banco de dados
    STORAGE_GB=$(whiptail --title "Estimador de Custos - Armazenamento" \
        --menu "Selecione o armazenamento do banco de dados:" 16 60 4 \
        "10" "10 GB (pequeno, ~$1,70/mês)" \
        "20" "20 GB (médio, ~$3,40/mês)" \
        "50" "50 GB (grande, ~$8,50/mês)" \
        "100" "100 GB (muito grande, ~$17/mês)" 3>&1 1>&2 2>&3)
    
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # Transferência de rede
    NETWORK_EGRESS_GB=$(whiptail --title "Estimador de Custos - Transferência de Rede" \
        --menu "Selecione a transferência de dados mensal estimada:" 16 70 4 \
        "10" "Até 10 GB/mês (pequeno, gratuito)" \
        "50" "Até 50 GB/mês (médio, ~$5/mês)" \
        "100" "Até 100 GB/mês (grande, ~$11/mês)" \
        "500" "Até 500 GB/mês (muito grande, ~$59/mês)" 3>&1 1>&2 2>&3)
    
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    return 0
}

# Mostrar resultado da estimativa
function show_cost_estimate() {
    local cloud_run_cost=$(calculate_cloud_run_cost)
    local cloud_sql_cost=$(calculate_cloud_sql_cost)
    local network_cost=$(calculate_network_cost)
    local functions_cost=$(calculate_functions_cost)
    local monitoring_cost=$(calculate_monitoring_cost)
    local secrets_cost=$(calculate_secrets_cost)
    local total_cost=$(calculate_total_cost)
    
    local message=""
    message+="Estimativa de Custo Mensal (USD):\n\n"
    message+="• Cloud Run (App principal): \$${cloud_run_cost}\n"
    message+="• Cloud SQL (PostgreSQL): \$${cloud_sql_cost}\n"
    message+="• Transferência de rede: \$${network_cost}\n"
    message+="• Cloud Functions (Webhooks): \$${functions_cost}\n"
    message+="• Monitoramento e alertas: \$${monitoring_cost}\n"
    message+="• Secret Manager: \$${secrets_cost}\n"
    message+="• Outros (10% buffer): \$$(printf "%.2f" $(echo "($cloud_run_cost + $cloud_sql_cost + $network_cost + $functions_cost + $monitoring_cost + $secrets_cost) * 0.1" | bc -l))\n"
    message+="\n"
    message+="Total estimado: \$${total_cost} por mês\n\n"
    
    # Adicionar informações extras com base na configuração
    message+="Este valor é uma estimativa baseada em:\n"
    message+="- ${USERS_PER_DAY} usuários diários\n"
    message+="- ${ESTIMATED_REQUESTS_PER_DAY} requisições diárias\n"
    message+="- Instância Cloud SQL: ${DB_TIER}\n"
    message+="- Armazenamento: ${STORAGE_GB} GB\n"
    message+="- Transferência de dados: ${NETWORK_EGRESS_GB} GB/mês\n"
    message+="- Auto-scaling: min=${AUTO_SCALING_MIN}, max=${AUTO_SCALING_MAX}\n"
    
    if [ "$AUTO_SCALING_MIN" -eq 0 ]; then
        message+="\nNota: Com mínimo de zero instâncias, o custo real\n"
        message+="pode ser menor, mas haverá \"cold starts\".\n"
    fi
    
    whiptail --title "Resultado da Estimativa de Custos" \
        --msgbox "$message" 25 78
}

# Exportar estimativa em formato JSON
function export_cost_estimate() {
    local cloud_run_cost=$(calculate_cloud_run_cost)
    local cloud_sql_cost=$(calculate_cloud_sql_cost)
    local network_cost=$(calculate_network_cost)
    local functions_cost=$(calculate_functions_cost)
    local monitoring_cost=$(calculate_monitoring_cost)
    local secrets_cost=$(calculate_secrets_cost)
    local total_cost=$(calculate_total_cost)
    local others_cost=$(printf "%.2f" $(echo "($cloud_run_cost + $cloud_sql_cost + $network_cost + $functions_cost + $monitoring_cost + $secrets_cost) * 0.1" | bc -l))
    
    # Nome do arquivo de saída
    local date_str=$(date +"%Y%m%d-%H%M%S")
    local output_file="tarefo-ai-cost-estimate-${date_str}.json"
    
    # Criar JSON
    if command -v jq &> /dev/null; then
        # Usar jq para formatar saída
        echo '{
            "estimate_date": "'$(date +'%Y-%m-%d')'",
            "project_id": "'$PROJECT_ID'",
            "region": "'$REGION'",
            "costs": {
                "cloud_run": '$cloud_run_cost',
                "cloud_sql": '$cloud_sql_cost',
                "network": '$network_cost',
                "functions": '$functions_cost',
                "monitoring": '$monitoring_cost',
                "secrets": '$secrets_cost',
                "others": '$others_cost',
                "total": '$total_cost'
            },
            "configuration": {
                "users_per_day": '$USERS_PER_DAY',
                "requests_per_day": '$ESTIMATED_REQUESTS_PER_DAY',
                "db_tier": "'$DB_TIER'",
                "storage_gb": '$STORAGE_GB',
                "network_egress_gb": '$NETWORK_EGRESS_GB',
                "auto_scaling_min": '$AUTO_SCALING_MIN',
                "auto_scaling_max": '$AUTO_SCALING_MAX',
                "enable_monitoring": '$ENABLE_MONITORING'
            }
        }' | jq '.' > "$output_file"
    else
        # Fallback para saída básica sem jq
        echo '{
            "estimate_date": "'$(date +'%Y-%m-%d')'",
            "project_id": "'$PROJECT_ID'",
            "region": "'$REGION'",
            "costs": {
                "cloud_run": '$cloud_run_cost',
                "cloud_sql": '$cloud_sql_cost',
                "network": '$network_cost',
                "functions": '$functions_cost',
                "monitoring": '$monitoring_cost',
                "secrets": '$secrets_cost',
                "others": '$others_cost',
                "total": '$total_cost'
            },
            "configuration": {
                "users_per_day": '$USERS_PER_DAY',
                "requests_per_day": '$ESTIMATED_REQUESTS_PER_DAY',
                "db_tier": "'$DB_TIER'",
                "storage_gb": '$STORAGE_GB',
                "network_egress_gb": '$NETWORK_EGRESS_GB',
                "auto_scaling_min": '$AUTO_SCALING_MIN',
                "auto_scaling_max": '$AUTO_SCALING_MAX',
                "enable_monitoring": '$ENABLE_MONITORING'
            }
        }' > "$output_file"
    fi
    
    # Confirmação
    if [ -f "$output_file" ]; then
        whiptail --title "Exportação Concluída" \
            --msgbox "A estimativa de custos foi exportada com sucesso para:\n${output_file}" 10 70
    else
        whiptail --title "Erro na Exportação" \
            --msgbox "Ocorreu um erro ao exportar a estimativa de custos." 10 60
    fi
}

# Mostrar tela de boas-vindas
function show_welcome() {
    whiptail --title "Estimador de Custos do Tarefo AI" \
        --msgbox "Bem-vindo ao Estimador de Custos do Tarefo AI!\n\nEsta ferramenta irá ajudá-lo a estimar os custos mensais de execução do Tarefo AI no Google Cloud Platform, com base nas configurações de deployment e no volume de uso esperado.\n\nPressione OK para começar." 15 70
}

# Menu principal
function show_main_menu() {
    while true; do
        local OPTION=$(whiptail --title "Estimador de Custos do Tarefo AI" \
            --menu "Escolha uma opção:" 15 60 3 \
            "1" "Criar nova estimativa de custos" \
            "2" "Mostrar última estimativa" \
            "3" "Exportar estimativa (JSON)" \
            "0" "Sair" 3>&1 1>&2 2>&3)
        
        local EXIT_STATUS=$?
        if [ $EXIT_STATUS -ne 0 ]; then
            break
        fi
        
        case $OPTION in
            1)
                # Coletar informações e mostrar estimativa
                collect_usage_info
                if [ $? -eq 0 ]; then
                    show_cost_estimate
                fi
                ;;
            2)
                # Mostrar última estimativa novamente
                show_cost_estimate
                ;;
            3)
                # Exportar estimativa em JSON
                export_cost_estimate
                ;;
            0)
                # Sair
                break
                ;;
        esac
    done
}

# Verificar se bc está instalado (necessário para cálculos)
function check_bc() {
    if ! command -v bc &> /dev/null; then
        echo -e "${RED}Erro: O utilitário 'bc' não está instalado. Ele é necessário para cálculos.${NC}"
        echo -e "   Instale-o com 'sudo apt-get install bc' (Ubuntu/Debian)"
        echo -e "   ou 'brew install bc' (macOS com Homebrew)"
        exit 1
    fi
}

# Função principal
function main() {
    # Verificar dependências
    check_whiptail
    check_bc
    
    # Carregar configuração
    load_config
    
    # Mostrar boas-vindas
    show_welcome
    
    # Mostrar menu principal
    show_main_menu
}

# Executar script
main