#!/bin/bash

# Script para configurar os segredos no Secret Manager do Google Cloud
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) não encontrado. Por favor, instale-o primeiro."
    echo "   Instruções: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar login
echo "🔑 Verificando autenticação no Google Cloud..."
if ! gcloud auth print-access-token &> /dev/null; then
    echo "📝 Faça login no Google Cloud..."
    gcloud auth login
fi

# Configurar projeto
echo "🔧 Configurando projeto ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Habilitar a API do Secret Manager
echo "🔌 Habilitando API do Secret Manager..."
gcloud services enable secretmanager.googleapis.com

# Função para criar um segredo
create_secret() {
    local secret_name=$1
    local description=$2
    
    # Verificar se o segredo já existe
    if gcloud secrets describe ${secret_name} &>/dev/null; then
        echo "ℹ️ Segredo ${secret_name} já existe."
    else
        echo "🔐 Criando segredo ${secret_name}..."
        gcloud secrets create ${secret_name} --description="${description}"
    }
}

# Função para atualizar o valor de um segredo
update_secret_value() {
    local secret_name=$1
    local prompt=$2
    
    echo "📝 ${prompt}"
    read -s secret_value
    echo
    
    if [ -z "$secret_value" ]; then
        echo "⚠️ Valor não fornecido para ${secret_name}. Pulando..."
        return
    fi
    
    echo "🔄 Atualizando valor do segredo ${secret_name}..."
    echo "$secret_value" | gcloud secrets versions add ${secret_name} --data-file=-
    echo "✅ Valor do segredo ${secret_name} atualizado com sucesso!"
}

# Criar segredos para o banco de dados
create_secret "database-url" "URL de conexão com o banco de dados PostgreSQL"

# Criar segredos para o WhatsApp/Twilio
create_secret "twilio-account-sid" "SID da conta Twilio"
create_secret "twilio-auth-token" "Token de autenticação da Twilio"
create_secret "twilio-phone-number" "Número de telefone da Twilio para WhatsApp"

# Criar segredos para APIs
create_secret "openai-api-key" "Chave de API da OpenAI"
create_secret "telegram-bot-token" "Token do bot do Telegram"

# Criar segredos para o Google OAuth
create_secret "google-client-id" "ID do cliente OAuth do Google"
create_secret "google-client-secret" "Segredo do cliente OAuth do Google"
create_secret "google-redirect-url" "URL de redirecionamento do OAuth do Google"

# Criar segredos para o webhook do WhatsApp
create_secret "whatsapp-verify-token" "Token de verificação para o webhook do WhatsApp"
create_secret "webhook-internal-secret" "Segredo interno para comunicação entre webhook e aplicação principal"

# Solicitar os valores dos segredos
echo "📝 Agora você precisa fornecer os valores para os segredos."
echo "⚠️ Os valores não serão exibidos na tela por motivos de segurança."
echo

update_secret_value "database-url" "Digite a URL de conexão com o banco de dados PostgreSQL:"
update_secret_value "twilio-account-sid" "Digite o SID da conta Twilio:"
update_secret_value "twilio-auth-token" "Digite o token de autenticação da Twilio:"
update_secret_value "twilio-phone-number" "Digite o número de telefone da Twilio para WhatsApp (formato: +XXXXXXXXXXXX):"
update_secret_value "openai-api-key" "Digite a chave de API da OpenAI:"
update_secret_value "telegram-bot-token" "Digite o token do bot do Telegram:"
update_secret_value "google-client-id" "Digite o ID do cliente OAuth do Google:"
update_secret_value "google-client-secret" "Digite o segredo do cliente OAuth do Google:"
update_secret_value "google-redirect-url" "Digite a URL de redirecionamento do OAuth do Google:"

# Gerar segredos aleatórios
echo "🔐 Gerando tokens de segurança aleatórios..."

# Gerar token de verificação para o webhook do WhatsApp (32 caracteres)
VERIFY_TOKEN=$(openssl rand -hex 16)
echo "$VERIFY_TOKEN" | gcloud secrets versions add whatsapp-verify-token --data-file=-
echo "✅ Token de verificação para o webhook do WhatsApp gerado: ${VERIFY_TOKEN}"

# Gerar segredo interno para comunicação entre webhook e aplicação principal (32 caracteres)
INTERNAL_SECRET=$(openssl rand -hex 16)
echo "$INTERNAL_SECRET" | gcloud secrets versions add webhook-internal-secret --data-file=-
echo "✅ Segredo interno para comunicação gerado com sucesso!"

echo "✅ Todos os segredos foram configurados com sucesso!"
echo "ℹ️ Agora você pode executar os scripts de implantação."