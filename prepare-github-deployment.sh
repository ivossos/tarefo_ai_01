#!/bin/bash

# Script para preparação do deployment via GitHub Actions
# Autor: TarefoAI Team

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${GREEN}Preparação para Deployment via GitHub Actions${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Informações do projeto
PROJECT_ID="tarefoai"
REGION="southamerica-east1"
SERVICE_NAME="tarefo-ai"

echo -e "${GREEN}✓ Projeto: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Região: $REGION${NC}"
echo -e "${GREEN}✓ Nome do serviço: $SERVICE_NAME${NC}"

# Verificar arquivos críticos para o deployment
echo -e "\n${YELLOW}Verificando arquivos necessários para o deployment...${NC}"

if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}❌ Arquivo cloudbuild.yaml não encontrado!${NC}"
    echo -e "${YELLOW}Este arquivo é essencial para o processo de build. Verifique se está no diretório raiz.${NC}"
else
    echo -e "${GREEN}✓ Arquivo cloudbuild.yaml encontrado${NC}"
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile não encontrado!${NC}"
    echo -e "${YELLOW}Este arquivo é essencial para a criação da imagem do container.${NC}"
else
    echo -e "${GREEN}✓ Dockerfile encontrado${NC}"
fi

if [ ! -d ".github" ]; then
    echo -e "${YELLOW}⚠ Diretório .github não encontrado. Será criado agora.${NC}"
    mkdir -p .github/workflows
else
    echo -e "${GREEN}✓ Diretório .github encontrado${NC}"
fi

if [ ! -d ".github/workflows" ]; then
    echo -e "${YELLOW}⚠ Diretório .github/workflows não encontrado. Será criado agora.${NC}"
    mkdir -p .github/workflows
else
    echo -e "${GREEN}✓ Diretório .github/workflows encontrado${NC}"
fi

# Criar arquivo de workflow do GitHub Actions
echo -e "\n${YELLOW}Criando/atualizando arquivo de workflow do GitHub Actions...${NC}"

cat > .github/workflows/deploy-to-cloud-run.yml << EOF
name: Deploy TarefoAI to Cloud Run

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
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: $PROJECT_ID
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: \${{ secrets.GOOGLE_CREDENTIALS }}
      
      - name: Enable required APIs
        run: |
          gcloud services enable cloudbuild.googleapis.com
          gcloud services enable run.googleapis.com
          gcloud services enable secretmanager.googleapis.com
          gcloud services enable cloudfunctions.googleapis.com
      
      - name: Deploy using Cloud Build
        run: |
          gcloud builds submit --config cloudbuild.yaml --substitutions=_REGION=$REGION,_SERVICE_NAME=$SERVICE_NAME
EOF

echo -e "${GREEN}✓ Arquivo de workflow criado: .github/workflows/deploy-to-cloud-run.yml${NC}"

# Criar um arquivo com instruções
echo -e "\n${YELLOW}Criando arquivo de instruções para deployment...${NC}"

cat > DEPLOYMENT_GITHUB.md << EOF
# Deployment do TarefoAI via GitHub Actions

Este arquivo contém instruções detalhadas para realizar o deployment do TarefoAI no Google Cloud Platform usando GitHub Actions.

## Pré-requisitos

1. Um repositório GitHub (público ou privado)
2. Uma conta no Google Cloud Platform com o projeto "$PROJECT_ID" criado
3. A conta de serviço com as permissões adequadas

## Configuração do GitHub

1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione um novo secret com o nome \`GOOGLE_CREDENTIALS\`
5. Cole o conteúdo do arquivo JSON da chave de serviço (\`tarefoai-0566d678ba75.json\`) no valor do secret
6. Clique em "Add secret"

## Iniciar o Deployment

Para iniciar o deployment, você tem duas opções:

### Opção 1: Push para a branch main
Simplesmente faça push das suas alterações para a branch \`main\`. O workflow será acionado automaticamente.

\`\`\`bash
git add .
git commit -m "Iniciar deployment do TarefoAI"
git push origin main
\`\`\`

### Opção 2: Execução manual
1. Acesse seu repositório no GitHub
2. Vá para a aba "Actions"
3. Selecione o workflow "Deploy TarefoAI to Cloud Run"
4. Clique em "Run workflow"

## Monitoramento

Você pode monitorar o progresso do deployment na aba "Actions" do GitHub.

Após a conclusão do deployment, o TarefoAI estará disponível em:
\`https://$SERVICE_NAME-[hash].$REGION.run.app\`

## Suporte

Se você encontrar algum problema durante o deployment, consulte os logs na aba "Actions" do GitHub ou no Cloud Build no Google Cloud Console.
EOF

echo -e "${GREEN}✓ Arquivo de instruções criado: DEPLOYMENT_GITHUB.md${NC}"

# Resumo final
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Preparação concluída!${NC}"
echo -e "${YELLOW}Para finalizar o deployment no GitHub:${NC}"
echo -e "  ${CYAN}1.${NC} Crie um repositório no GitHub (caso ainda não tenha)"
echo -e "  ${CYAN}2.${NC} Adicione o secret GOOGLE_CREDENTIALS com o conteúdo da chave de serviço"
echo -e "  ${CYAN}3.${NC} Execute os seguintes comandos para enviar o código para o GitHub:${NC}"
echo -e ""
echo -e "     ${CYAN}git init${NC}"
echo -e "     ${CYAN}git add .${NC}"
echo -e "     ${CYAN}git commit -m \"Iniciar deployment do TarefoAI\"${NC}"
echo -e "     ${CYAN}git remote add origin https://github.com/SEU_USUARIO/tarefoai.git${NC}"
echo -e "     ${CYAN}git push -u origin main${NC}"
echo -e ""
echo -e "${YELLOW}Siga as instruções detalhadas em DEPLOYMENT_GITHUB.md${NC}"
echo -e "${GREEN}✅ Tudo pronto para o deployment via GitHub Actions!${NC}"