#!/bin/bash

# Script de Deployment do Tarefo AI para Google Cloud Platform
# Este script automatiza o processo de deployment do Tarefo AI no GCP
# Criado a partir das configurações definidas no assistente de implementação

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Carregar configurações do arquivo implementation-config-simple.txt
CONFIG_FILE="deployment-ui/implementation-config-simple.txt"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}Execute primeiro o assistente de implementação:${NC}"
    echo "cd deployment-ui && ./implementation-wizard-simple.sh"
    exit 1
fi

# Carregar configurações
source "$CONFIG_FILE"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Erro: Google Cloud SDK (gcloud) não encontrado.${NC}"
    echo "Por favor, instale o gcloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Função para verificar o sucesso do último comando
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro na etapa: $1${NC}"
        echo "Verifique os logs para mais detalhes."
        exit 1
    fi
}

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${YELLOW}Deployment Automatizado do Tarefo AI${NC}"
echo ""
echo -e "${CYAN}Configuração:${NC}"
echo "- Projeto: $project_id"
echo "- Região: $region"
echo "- Serviço: $service_name"
echo "- Banco de Dados: $db_instance (PostgreSQL $db_version)"
echo ""

# Confirmar antes de prosseguir
read -p "Deseja prosseguir com o deployment? (s/N): " confirm
if [[ $confirm != [sS] ]]; then
    echo -e "${YELLOW}Deployment cancelado pelo usuário.${NC}"
    exit 0
fi

echo -e "\n${CYAN}Iniciando deployment...${NC}"

# Etapa 1: Configurar projeto GCP
echo -e "\n${YELLOW}[1/9] Configurando projeto GCP...${NC}"
gcloud config set project $project_id
check_error "Configuração do projeto"
echo -e "${GREEN}✓ Projeto configurado com sucesso!${NC}"

# Etapa 2: Habilitar APIs necessárias
echo -e "\n${YELLOW}[2/9] Habilitando APIs necessárias...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com cloudfunctions.googleapis.com
check_error "Habilitação de APIs"
echo -e "${GREEN}✓ APIs habilitadas com sucesso!${NC}"

# Etapa 3: Criar banco de dados PostgreSQL
echo -e "\n${YELLOW}[3/9] Criando instância do banco de dados PostgreSQL...${NC}"
gcloud sql instances create $db_instance \
    --database-version=POSTGRES_$db_version \
    --tier=$db_tier \
    --region=$region \
    --storage-size=10GB \
    --root-password="tarefo-ai-db-pwd-$(date +%s%N | md5sum | head -c 8)" \
    --database-flags="max_connections=100"
check_error "Criação do banco de dados"

# Criar banco de dados específico do Tarefo AI
gcloud sql databases create tarefoai --instance=$db_instance
check_error "Criação do banco de dados Tarefo AI"

# Criar usuário para o aplicativo
TAREFO_DB_USER="tarefo_app"
TAREFO_DB_PASS="Tarefo-$(date +%s%N | md5sum | head -c 16)"
gcloud sql users create $TAREFO_DB_USER \
    --instance=$db_instance \
    --password=$TAREFO_DB_PASS
check_error "Criação do usuário do banco de dados"

echo -e "${GREEN}✓ Banco de dados PostgreSQL criado com sucesso!${NC}"

# Construir string de conexão
DB_CONNECTION_STRING="postgresql://$TAREFO_DB_USER:$TAREFO_DB_PASS@127.0.0.1:5432/tarefoai"
INSTANCE_CONNECTION_NAME="${project_id}:${region}:${db_instance}"

# Etapa 4: Configurar secrets no Secret Manager
echo -e "\n${YELLOW}[4/9] Configurando secrets no Secret Manager...${NC}"

# Verificar se as variáveis de ambiente necessárias estão definidas
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ OPENAI_API_KEY não encontrada no ambiente.${NC}"
    read -p "Digite sua chave de API do OpenAI: " OPENAI_API_KEY
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ TELEGRAM_BOT_TOKEN não encontrada no ambiente.${NC}"
    read -p "Digite o token do seu bot do Telegram: " TELEGRAM_BOT_TOKEN
fi

if [ -z "$TWILIO_ACCOUNT_SID" ]; then
    echo -e "${YELLOW}⚠️ TWILIO_ACCOUNT_SID não encontrada no ambiente.${NC}"
    read -p "Digite o Account SID do Twilio (deixe em branco para pular): " TWILIO_ACCOUNT_SID
fi

if [ -z "$TWILIO_AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ TWILIO_AUTH_TOKEN não encontrada no ambiente.${NC}"
    read -p "Digite o Auth Token do Twilio (deixe em branco para pular): " TWILIO_AUTH_TOKEN
fi

if [ -z "$TWILIO_PHONE_NUMBER" ]; then
    echo -e "${YELLOW}⚠️ TWILIO_PHONE_NUMBER não encontrada no ambiente.${NC}"
    read -p "Digite o número de telefone do Twilio (formato +1234567890, deixe em branco para pular): " TWILIO_PHONE_NUMBER
fi

# Criar secrets
echo -n "$DB_CONNECTION_STRING" | gcloud secrets create database-url --data-file=-
check_error "Criação do secret database-url"

echo -n "$OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
check_error "Criação do secret openai-api-key"

echo -n "$TELEGRAM_BOT_TOKEN" | gcloud secrets create telegram-bot-token --data-file=-
check_error "Criação do secret telegram-bot-token"

if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    echo -n "$TWILIO_ACCOUNT_SID" | gcloud secrets create twilio-account-sid --data-file=-
    check_error "Criação do secret twilio-account-sid"
fi

if [ -n "$TWILIO_AUTH_TOKEN" ]; then
    echo -n "$TWILIO_AUTH_TOKEN" | gcloud secrets create twilio-auth-token --data-file=-
    check_error "Criação do secret twilio-auth-token"
fi

if [ -n "$TWILIO_PHONE_NUMBER" ]; then
    echo -n "$TWILIO_PHONE_NUMBER" | gcloud secrets create twilio-phone-number --data-file=-
    check_error "Criação do secret twilio-phone-number"
fi

echo -e "${GREEN}✓ Secrets configurados com sucesso!${NC}"

# Etapa 5: Construir a imagem Docker usando Cloud Build
echo -e "\n${YELLOW}[5/9] Construindo a imagem Docker com Cloud Build...${NC}"
IMAGE_NAME="gcr.io/${project_id}/${service_name}"
gcloud builds submit --tag $IMAGE_NAME .
check_error "Construção da imagem Docker"
echo -e "${GREEN}✓ Imagem Docker construída com sucesso!${NC}"

# Etapa 6: Implantar no Cloud Run
echo -e "\n${YELLOW}[6/9] Implantando o serviço no Cloud Run...${NC}"
MEMORY="${memory:-1Gi}"
CPU="${cpu:-1}"
MIN_INSTANCES="${min_instances:-0}"
MAX_INSTANCES="${max_instances:-2}"

SECRET_MOUNTS="--set-secrets=DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest,TELEGRAM_BOT_TOKEN=telegram-bot-token:latest"

if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    SECRET_MOUNTS="$SECRET_MOUNTS,TWILIO_ACCOUNT_SID=twilio-account-sid:latest"
fi

if [ -n "$TWILIO_AUTH_TOKEN" ]; then
    SECRET_MOUNTS="$SECRET_MOUNTS,TWILIO_AUTH_TOKEN=twilio-auth-token:latest"
fi

if [ -n "$TWILIO_PHONE_NUMBER" ]; then
    SECRET_MOUNTS="$SECRET_MOUNTS,TWILIO_PHONE_NUMBER=twilio-phone-number:latest"
fi

gcloud run deploy $service_name \
    --image $IMAGE_NAME \
    --platform managed \
    --region $region \
    --allow-unauthenticated \
    --memory $MEMORY \
    --cpu $CPU \
    --min-instances $MIN_INSTANCES \
    --max-instances $MAX_INSTANCES \
    --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
    $SECRET_MOUNTS \
    --set-env-vars="NODE_ENV=production"
check_error "Deployment no Cloud Run"

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe $service_name --platform managed --region $region --format="value(status.url)")
check_error "Obtendo URL do serviço"

echo -e "${GREEN}✓ Serviço implantado com sucesso!${NC}"
echo -e "${CYAN}URL do serviço: $SERVICE_URL${NC}"

# Etapa 7: Implantar Cloud Functions para webhooks
echo -e "\n${YELLOW}[7/9] Implantando Cloud Functions para webhooks...${NC}"
WEBHOOK_FUNCTION="${webhook_function:-tarefo-ai-webhook}"
FUNCTION_MEMORY="${function_memory:-256MB}"
FUNCTION_TIMEOUT="${function_timeout:-60s}"

cd webhook-function
gcloud functions deploy $WEBHOOK_FUNCTION \
    --runtime nodejs18 \
    --trigger-http \
    --allow-unauthenticated \
    --region $region \
    --memory $FUNCTION_MEMORY \
    --timeout $FUNCTION_TIMEOUT \
    --set-env-vars SERVICE_URL=$SERVICE_URL
check_error "Deployment da Cloud Function"
cd ..

# Obter URL da função
FUNCTION_URL=$(gcloud functions describe $WEBHOOK_FUNCTION --region $region --format="value(httpsTrigger.url)")
check_error "Obtendo URL da função"

echo -e "${GREEN}✓ Cloud Function implantada com sucesso!${NC}"
echo -e "${CYAN}URL da função: $FUNCTION_URL${NC}"

# Etapa 8: Configurar webhooks para mensageria
echo -e "\n${YELLOW}[8/9] Configurando webhooks para serviços de mensageria...${NC}"
TELEGRAM_WEBHOOK_URL="${SERVICE_URL}/api/webhook/telegram"
WHATSAPP_WEBHOOK_URL="${SERVICE_URL}/api/webhook/whatsapp"
SMS_WEBHOOK_URL="${SERVICE_URL}/api/webhook/sms"

echo -e "Telegram webhook: ${CYAN}$TELEGRAM_WEBHOOK_URL${NC}"
echo -e "WhatsApp webhook: ${CYAN}$WHATSAPP_WEBHOOK_URL${NC}"
echo -e "SMS webhook: ${CYAN}$SMS_WEBHOOK_URL${NC}"

if [ "$telegram" = "true" ]; then
    echo -e "\n${YELLOW}Configurando webhook do Telegram...${NC}"
    
    # Configurar webhook do Telegram (requer o token do bot)
    if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=$TELEGRAM_WEBHOOK_URL" | \
            python3 -c "import sys, json; data=json.load(sys.stdin); print('✓ Webhook configurado com sucesso!' if data.get('ok') else '✗ Erro ao configurar webhook: ' + str(data))"
    else
        echo -e "${YELLOW}⚠️ Token do Telegram não encontrado. Configure o webhook manualmente.${NC}"
    fi
fi

echo -e "\n${GREEN}✓ Configuração de webhooks concluída!${NC}"

# Etapa 9: Verificação final e resumo
echo -e "\n${YELLOW}[9/9] Realizando verificação final...${NC}"
echo -e "Verificando status do serviço..."
gcloud run services describe $service_name --region $region --format="value(status.conditions[0].message)"
check_error "Verificação final"

echo -e "\n${GREEN}${RED_BG}✅ DEPLOYMENT CONCLUÍDO COM SUCESSO!${NC}"
echo -e "\n${YELLOW}Resumo do Deployment:${NC}"
echo -e "🔹 ID do Projeto: ${CYAN}$project_id${NC}"
echo -e "🔹 Região: ${CYAN}$region${NC}"
echo -e "🔹 Tipo de Banco: PostgreSQL $db_version (${CYAN}$db_tier${NC})"
echo -e "🔹 Memória do Serviço: ${CYAN}$MEMORY${NC}"
echo -e "🔹 CPU do Serviço: ${CYAN}$CPU${NC}"
echo -e "🔹 Instâncias: Min=${CYAN}$MIN_INSTANCES${NC}, Max=${CYAN}$MAX_INSTANCES${NC}"

echo -e "\n${YELLOW}URLs do Serviço:${NC}"
echo -e "🔹 Aplicação Web: ${CYAN}$SERVICE_URL${NC}"
echo -e "🔹 API: ${CYAN}$SERVICE_URL/api${NC}"
echo -e "🔹 Webhooks:"
echo -e "  • Telegram: ${CYAN}$TELEGRAM_WEBHOOK_URL${NC}"
echo -e "  • WhatsApp: ${CYAN}$WHATSAPP_WEBHOOK_URL${NC}"
echo -e "  • SMS: ${CYAN}$SMS_WEBHOOK_URL${NC}"
echo -e "🔹 Cloud Function: ${CYAN}$FUNCTION_URL${NC}"

echo -e "\n${YELLOW}Próximos Passos:${NC}"
echo -e "1. Acesse a aplicação web em: ${CYAN}$SERVICE_URL${NC}"
echo -e "2. Configure as integrações com os serviços de mensageria"
echo -e "3. Adicione usuários administradores ao sistema"
echo -e "4. Configure as tarefas agendadas para lembretes e sincronização"

echo -e "\n${YELLOW}Suporte:${NC}"
echo -e "Para obter suporte, visite: ${CYAN}https://github.com/yssn/tarefo-ai${NC}"
echo -e "Documentação: ${CYAN}$SERVICE_URL/docs${NC}"
echo ""
echo -e "${GREEN}Obrigado por usar o Tarefo AI!${NC}"