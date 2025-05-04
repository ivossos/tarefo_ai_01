#!/bin/bash

# Script para configurar a instância de banco de dados PostgreSQL no Google Cloud SQL
# Este script deve ser executado a partir da raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
PROJECT_ID="tarefo-ai-prod"
REGION="southamerica-east1"
INSTANCE_NAME="tarefo-ai-db"
DB_NAME="tarefo_ai"
DB_USER="tarefo_app"
ROOT_PASSWORD=""
DB_PASSWORD=""

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

# Habilitar a API do Cloud SQL
echo "🔌 Habilitando API do Cloud SQL..."
gcloud services enable sqladmin.googleapis.com

# Solicitar senhas se não estiverem definidas
if [ -z "$ROOT_PASSWORD" ]; then
    echo "📝 Digite a senha para o usuário root do PostgreSQL:"
    read -s ROOT_PASSWORD
    echo
    
    if [ -z "$ROOT_PASSWORD" ]; then
        echo "❌ Senha root não pode estar vazia!"
        exit 1
    fi
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "📝 Digite a senha para o usuário da aplicação (${DB_USER}):"
    read -s DB_PASSWORD
    echo
    
    if [ -z "$DB_PASSWORD" ]; then
        echo "❌ Senha do usuário da aplicação não pode estar vazia!"
        exit 1
    fi
fi

# Criar a instância do Cloud SQL
echo "🏗️ Criando instância do Cloud SQL (${INSTANCE_NAME})..."
echo "⏱️ Esta operação pode levar vários minutos..."

gcloud sql instances create ${INSTANCE_NAME} \
  --database-version=POSTGRES_13 \
  --cpu=1 \
  --memory=3840MB \
  --region=${REGION} \
  --root-password=${ROOT_PASSWORD} \
  --storage-type=SSD \
  --storage-size=10GB \
  --availability-type=zonal

# Criar banco de dados
echo "🗄️ Criando banco de dados ${DB_NAME}..."
gcloud sql databases create ${DB_NAME} --instance=${INSTANCE_NAME}

# Criar usuário para a aplicação
echo "👤 Criando usuário ${DB_USER}..."
gcloud sql users create ${DB_USER} \
  --instance=${INSTANCE_NAME} \
  --password=${DB_PASSWORD}

# Obter a string de conexão
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@/crud?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

# Armazenar a string de conexão no Secret Manager
echo "🔐 Armazenando string de conexão no Secret Manager..."
echo ${CONNECTION_STRING} | gcloud secrets create database-url --data-file=- --replication-policy="automatic"

echo "✅ Configuração do banco de dados concluída com sucesso!"
echo "ℹ️ Instância: ${INSTANCE_NAME}"
echo "ℹ️ Banco de dados: ${DB_NAME}"
echo "ℹ️ Usuário da aplicação: ${DB_USER}"
echo
echo "📝 Próximos passos:"
echo "1. Execute o script ./cloud-run/script-deploy.sh para implantar a aplicação"
echo "2. Após a implantação, execute a migração do banco de dados"