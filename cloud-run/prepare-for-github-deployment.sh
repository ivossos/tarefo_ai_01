#!/bin/bash

# Script para preparar o repositório para deployment via GitHub Actions e Cloud Build
# Autor: TarefoAI Team

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Carregar configurações
CONFIG_FILE="implementation-config-simple.txt"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}Execute primeiro o assistente de implementação ou crie manualmente o arquivo de configuração.${NC}"
    exit 1
fi

source "$CONFIG_FILE"

# Verificar variáveis essenciais
if [ -z "$project_id" ] || [ -z "$region" ] || [ -z "$service_name" ]; then
    echo -e "${RED}Erro: Configuração incompleta. Verifique o arquivo $CONFIG_FILE${NC}"
    exit 1
fi

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${GREEN}Preparação para Deployment via GitHub Actions e Cloud Build${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Criar ou atualizar o arquivo cloudbuild.yaml
echo -e "\n${YELLOW}[1/3] Configurando arquivo cloudbuild.yaml...${NC}"

cat > ../cloudbuild.yaml <<EOF
steps:
  # Instalar dependências Node.js
  - name: 'node:18'
    entrypoint: npm
    args: ['install']
  
  # Instalar dependências Python
  - name: 'python:3.9'
    entrypoint: pip
    args: ['install', '-r', 'requirements.txt']
  
  # Executar testes (opcional)
  - name: 'node:18'
    entrypoint: npm
    args: ['test']
    id: 'run-tests'
    waitFor: ['install-deps']
  
  # Construir o container
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-t', 'gcr.io/$PROJECT_ID/${service_name}:$COMMIT_SHA',
      '.'
    ]
    id: 'build-container'
  
  # Push para Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/${service_name}:$COMMIT_SHA']
    id: 'push-container'
    waitFor: ['build-container']
  
  # Deploy no Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: [
      'run', 'deploy', '${service_name}',
      '--image', 'gcr.io/$PROJECT_ID/${service_name}:$COMMIT_SHA',
      '--region', '${region}',
      '--platform', 'managed',
      '--allow-unauthenticated',
      '--memory', '${memory}',
      '--cpu', '${cpu}',
      '--min-instances', '${min_instances}',
      '--max-instances', '${max_instances}',
      '--set-env-vars', 'NODE_ENV=production'
    ]
    id: 'deploy-cloud-run'
    waitFor: ['push-container']

  # Deploy da Cloud Function webhook
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: [
      'functions', 'deploy', '${webhook_function}',
      '--region', '${region}',
      '--runtime', 'nodejs18',
      '--trigger-http',
      '--source', 'webhook-function',
      '--memory', '${function_memory}',
      '--timeout', '${function_timeout}',
      '--allow-unauthenticated'
    ]
    id: 'deploy-webhook'
    waitFor: ['deploy-cloud-run']

# Imagens para push
images:
  - 'gcr.io/$PROJECT_ID/${service_name}:$COMMIT_SHA'

# Timeout do build (30 minutos)
timeout: '1800s'
EOF

echo -e "${GREEN}✅ Arquivo cloudbuild.yaml criado/atualizado${NC}"

# Criar ou atualizar o workflow do GitHub Actions
echo -e "\n${YELLOW}[2/3] Configurando GitHub Actions workflow...${NC}"

mkdir -p ../.github/workflows

cat > ../.github/workflows/deploy-to-cloud-run.yml <<EOF
name: Deploy Tarefo AI to Cloud Run

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Cloud Run
    runs-on: ubuntu-latest
    
    permissions:
      contents: 'read'
      id-token: 'write'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Google Auth
        id: auth
        uses: google-github-actions/auth@v1
        with:
          workload_identity_provider: \${{ secrets.WIF_PROVIDER }}
          service_account: \${{ secrets.WIF_SERVICE_ACCOUNT }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${project_id}
      
      - name: Deploy using Cloud Build
        run: |
          gcloud builds submit --config cloudbuild.yaml
EOF

echo -e "${GREEN}✅ GitHub Actions workflow criado/atualizado${NC}"

# Criar ou atualizar o README.md com instruções de deployment
echo -e "\n${YELLOW}[3/3] Atualizando instruções de deployment...${NC}"

cat > ../cloud-run/GITHUB_DEPLOYMENT.md <<EOF
# Deployment do Tarefo AI via GitHub Actions e Cloud Build

Este documento explica como configurar o deployment automatizado do Tarefo AI usando GitHub Actions e Google Cloud Build.

## Pré-requisitos

1. Repositório no GitHub com o código do Tarefo AI
2. Projeto configurado no Google Cloud Platform (${project_id})
3. APIs necessárias habilitadas no GCP
4. Banco de dados PostgreSQL configurado

## Configuração do Workload Identity Federation

Para permitir que o GitHub Actions interaja com o Google Cloud Platform de forma segura, você precisa configurar o Workload Identity Federation:

\`\`\`bash
# Criar pool de identidade de workload
gcloud iam workload-identity-pools create "github-pool" \\
  --location="global" \\
  --description="GitHub Actions pool" \\
  --display-name="GitHub Actions pool"

# Criar um provedor de identidade no pool
gcloud iam workload-identity-pools providers create-oidc "github-provider" \\
  --location="global" \\
  --workload-identity-pool="github-pool" \\
  --display-name="GitHub provider" \\
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \\
  --issuer-uri="https://token.actions.githubusercontent.com"

# Obtenha o nome completo do pool
WORKLOAD_IDENTITY_POOL_ID=\$(gcloud iam workload-identity-pools describe "github-pool" \\
  --location="global" \\
  --format="value(name)")

# Criar uma conta de serviço para o GitHub Actions
gcloud iam service-accounts create "github-actions-sa" \\
  --description="Service Account for GitHub Actions" \\
  --display-name="GitHub Actions Service Account"

# Dar à conta de serviço as permissões necessárias
gcloud projects add-iam-policy-binding ${project_id} \\
  --member="serviceAccount:github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${project_id} \\
  --member="serviceAccount:github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding ${project_id} \\
  --member="serviceAccount:github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding ${project_id} \\
  --member="serviceAccount:github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding ${project_id} \\
  --member="serviceAccount:github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/iam.serviceAccountUser"

# Conceder permissão para a identidade do GitHub usar a conta de serviço
gcloud iam service-accounts add-iam-policy-binding "github-actions-sa@${project_id}.iam.gserviceaccount.com" \\
  --role="roles/iam.workloadIdentityUser" \\
  --member="principalSet://iam.googleapis.com/\${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/seu-usuario/seu-repositorio"
\`\`\`

## Configuração dos Secrets no GitHub

Adicione os seguintes secrets no seu repositório GitHub:

1. \`WIF_PROVIDER\`: O nome completo do provedor de identidade
   Exemplo: \`projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider\`

2. \`WIF_SERVICE_ACCOUNT\`: O email da conta de serviço
   Exemplo: \`github-actions-sa@${project_id}.iam.gserviceaccount.com\`

## Deployment Manual

Se você precisar acionar o deployment manualmente:

1. Vá para a aba "Actions" no seu repositório no GitHub
2. Selecione o workflow "Deploy Tarefo AI to Cloud Run"
3. Clique em "Run workflow"
4. Selecione a branch desejada (normalmente 'main')
5. Clique em "Run workflow"

## Verificação do Deployment

Após o deployment, o serviço estará disponível em:

- Cloud Run: https://${service_name}-${project_id}.${region}.run.app
- Webhook Function: https://${region}-${project_id}.cloudfunctions.net/${webhook_function}

Para verificar o status do deployment:

\`\`\`bash
gcloud run services describe ${service_name} --region=${region} --format="value(status.url)"
\`\`\`

## Solução de Problemas

Se encontrar problemas durante o deployment:

1. Verifique os logs da execução do GitHub Actions
2. Verifique os logs do Cloud Build:
   \`\`\`bash
   gcloud builds list --filter="status=FAILURE" --limit=1
   BUILD_ID=\$(gcloud builds list --filter="status=FAILURE" --limit=1 --format="value(id)")
   gcloud builds log \$BUILD_ID
   \`\`\`
3. Verifique os logs do Cloud Run:
   \`\`\`bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${service_name} AND severity>=ERROR"
   \`\`\`
EOF

echo -e "${GREEN}✅ Instruções de deployment via GitHub atualizadas${NC}"

echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Preparação para deployment concluída!${NC}"
echo -e "\n${YELLOW}Para completar o setup:${NC}"
echo -e "1. Configure o Workload Identity Federation seguindo as instruções em GITHUB_DEPLOYMENT.md"
echo -e "2. Adicione os secrets necessários ao seu repositório no GitHub"
echo -e "3. Execute o workflow 'Deploy Tarefo AI to Cloud Run' na aba Actions do GitHub"
echo -e "\n${CYAN}Os seguintes arquivos foram configurados:${NC}"
echo -e "- ${CYAN}cloudbuild.yaml${NC}: Define o processo de build e deployment no Cloud Build"
echo -e "- ${CYAN}.github/workflows/deploy-to-cloud-run.yml${NC}: Define o workflow do GitHub Actions"
echo -e "- ${CYAN}cloud-run/GITHUB_DEPLOYMENT.md${NC}: Instruções detalhadas para deployment via GitHub"