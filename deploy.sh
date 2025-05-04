#!/bin/bash

# Script centralizado de deployment - TarefoAI
# Integra todas as opções de deployment em um único local
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
echo -e "${GREEN}Hub de Deployment de Produção${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Funções
function show_menu() {
  echo -e "\n${YELLOW}Escolha uma opção de deployment:${NC}"
  echo -e "  ${CYAN}1)${NC} Deployment via GitHub Actions (recomendado)"
  echo -e "  ${CYAN}2)${NC} Deployment direto via Cloud Build"
  echo -e "  ${CYAN}3)${NC} Deployment manual via Google Cloud CLI (gcloud)"
  echo -e "  ${CYAN}4)${NC} Deployment via Terraform"
  echo -e "  ${CYAN}5)${NC} Verificar pré-requisitos de deployment"
  echo -e "  ${CYAN}6)${NC} Preparar ambiente GitHub para CI/CD"
  echo -e "  ${CYAN}7)${NC} Documentação e ajuda"
  echo -e "  ${CYAN}0)${NC} Sair"
  echo -ne "\n${YELLOW}Sua escolha:${NC} "
  read -r option
}

function github_actions() {
  clear
  echo -e "${BLUE}"
  echo "  GitHub Actions Deployment"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  echo -e "\n${YELLOW}Verificando estrutura do repositório...${NC}"
  
  if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Este não parece ser um repositório Git.${NC}"
    echo -e "${YELLOW}Para usar o GitHub Actions, você precisa:${NC}"
    echo -e "  ${CYAN}1. Inicializar um repositório Git${NC}"
    echo -e "  ${CYAN}2. Adicionar um repositório remoto${NC}"
    echo -e "  ${CYAN}3. Fazer commit e push das alterações${NC}"
    
    echo -e "\n${YELLOW}Deseja inicializar um repositório Git agora? (s/n)${NC}"
    read -r init_git
    
    if [[ $init_git == "s" || $init_git == "S" ]]; then
      echo -e "\n${YELLOW}Inicializando repositório Git...${NC}"
      git init
      echo -e "${GREEN}✓ Repositório Git inicializado${NC}"
      
      echo -e "\n${YELLOW}Qual é a URL do seu repositório GitHub?${NC}"
      read -r github_url
      
      if [ -n "$github_url" ]; then
        git remote add origin "$github_url"
        echo -e "${GREEN}✓ Repositório remoto adicionado: $github_url${NC}"
      fi
    else
      echo -e "${YELLOW}Operação cancelada.${NC}"
      return
    fi
  else
    echo -e "${GREEN}✓ Repositório Git encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando arquivo de workflow do GitHub Actions...${NC}"
  
  if [ ! -f ".github/workflows/deploy-to-cloud-run.yml" ]; then
    echo -e "${RED}❌ Arquivo de workflow não encontrado!${NC}"
    echo -e "${YELLOW}Criando diretório de workflows...${NC}"
    
    mkdir -p .github/workflows
    
    echo -e "${YELLOW}Criando arquivo de workflow...${NC}"
    
    cat > .github/workflows/deploy-to-cloud-run.yml << EOF
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
          project_id: tarefoai
      
      - name: Deploy using Cloud Build
        run: |
          gcloud builds submit --config cloudbuild.yaml
EOF
    
    echo -e "${GREEN}✓ Arquivo de workflow criado: .github/workflows/deploy-to-cloud-run.yml${NC}"
  else
    echo -e "${GREEN}✓ Arquivo de workflow encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando cloudbuild.yaml...${NC}"
  
  if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}❌ Arquivo cloudbuild.yaml não encontrado!${NC}"
    echo -e "${YELLOW}Não é possível continuar sem o arquivo cloudbuild.yaml${NC}"
    return
  else
    echo -e "${GREEN}✓ Arquivo cloudbuild.yaml encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando configurações do GitHub...${NC}"
  echo -e "${YELLOW}Para completar a configuração do GitHub Actions, você precisa configurar os seguintes secrets no seu repositório GitHub:${NC}"
  echo -e "  ${CYAN}WIF_PROVIDER${NC}: O provider de identidade de carga de trabalho (Workload Identity Federation)"
  echo -e "  ${CYAN}WIF_SERVICE_ACCOUNT${NC}: O email da conta de serviço do GCP"
  
  echo -e "\n${YELLOW}Você tem essas informações configuradas no GitHub? (s/n)${NC}"
  read -r has_secrets
  
  if [[ $has_secrets == "s" || $has_secrets == "S" ]]; then
    echo -e "${GREEN}✓ Secrets configurados${NC}"
  else
    echo -e "${YELLOW}Para configurar os secrets:${NC}"
    echo -e "  ${CYAN}1. Vá para seu repositório no GitHub${NC}"
    echo -e "  ${CYAN}2. Acesse Settings > Secrets and variables > Actions${NC}"
    echo -e "  ${CYAN}3. Clique em 'New repository secret'${NC}"
    echo -e "  ${CYAN}4. Adicione WIF_PROVIDER e WIF_SERVICE_ACCOUNT${NC}"
    
    echo -e "\n${YELLOW}Você pode obter essas informações executando:${NC}"
    echo -e "  ${CYAN}gcloud iam workload-identity-pools providers describe github \\
    --location=global \\
    --workload-identity-pool=github-pool \\
    --format=\"value(name)\"${NC}"
    
    echo -e "\n${YELLOW}E para a conta de serviço:${NC}"
    echo -e "  ${CYAN}[SEU-PROJETO]@appspot.gserviceaccount.com${NC}"
  fi
  
  echo -e "\n${YELLOW}Para iniciar o deployment via GitHub Actions:${NC}"
  echo -e "  ${CYAN}1. Faça commit de todas as alterações${NC}"
  echo -e "  ${CYAN}2. Push para a branch 'main' do seu repositório GitHub${NC}"
  echo -e "  ${CYAN}3. O workflow será acionado automaticamente${NC}"
  echo -e "  ${CYAN}4. Você pode acompanhar o progresso na aba 'Actions' do GitHub${NC}"
  
  echo -e "\n${YELLOW}Deseja fazer commit e push das alterações agora? (s/n)${NC}"
  read -r do_push
  
  if [[ $do_push == "s" || $do_push == "S" ]]; then
    echo -e "\n${YELLOW}Adicionando arquivos...${NC}"
    git add .
    
    echo -e "\n${YELLOW}Digite uma mensagem de commit:${NC}"
    read -r commit_message
    
    if [ -z "$commit_message" ]; then
      commit_message="Atualização do TarefoAI para deployment"
    fi
    
    echo -e "\n${YELLOW}Realizando commit...${NC}"
    git commit -m "$commit_message"
    
    echo -e "\n${YELLOW}Fazendo push para o repositório remoto...${NC}"
    git push -u origin main
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Push realizado com sucesso!${NC}"
      echo -e "${YELLOW}O GitHub Actions iniciará o deployment automaticamente.${NC}"
      echo -e "${YELLOW}Verifique o progresso na aba 'Actions' do seu repositório.${NC}"
    else
      echo -e "${RED}❌ Falha ao fazer push. Verifique as mensagens de erro acima.${NC}"
    fi
  else
    echo -e "${YELLOW}Operação cancelada. Você pode fazer o push manualmente mais tarde.${NC}"
  fi
}

function cloud_build() {
  clear
  echo -e "${BLUE}"
  echo "  Cloud Build Deployment"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  echo -e "\n${YELLOW}Verificando cloudbuild.yaml...${NC}"
  
  if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}❌ Arquivo cloudbuild.yaml não encontrado!${NC}"
    echo -e "${YELLOW}Não é possível continuar sem o arquivo cloudbuild.yaml${NC}"
    return
  else
    echo -e "${GREEN}✓ Arquivo cloudbuild.yaml encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando autenticação do Google Cloud...${NC}"
  
  # Checar se o gcloud está instalado
  if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK (gcloud) não encontrado.${NC}"
    echo -e "${YELLOW}Por favor, instale o gcloud CLI: https://cloud.google.com/sdk/docs/install${NC}"
    return
  else
    echo -e "${GREEN}✓ Google Cloud SDK (gcloud) encontrado${NC}"
  fi
  
  # Verificar se está autenticado
  gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
  
  if [ -z "$gcloud_auth" ]; then
    echo -e "${RED}❌ Nenhuma conta autenticada encontrada no gcloud.${NC}"
    echo -e "${YELLOW}Escolha uma opção de autenticação:${NC}"
    echo -e "  ${CYAN}1)${NC} Autenticação interativa (navegador)"
    echo -e "  ${CYAN}2)${NC} Autenticação com chave de serviço (JSON)"
    echo -ne "\n${YELLOW}Sua escolha:${NC} "
    read -r auth_option
    
    case $auth_option in
      1)
        echo -e "\n${YELLOW}Iniciando autenticação interativa...${NC}"
        gcloud auth login
        if [ $? -ne 0 ]; then
          echo -e "${RED}❌ Autenticação falhou.${NC}"
          return
        fi
        ;;
      2)
        echo -e "\n${YELLOW}Digite o caminho completo para o arquivo de chave de serviço JSON:${NC}"
        read -r key_file
        
        if [ ! -f "$key_file" ]; then
          echo -e "${RED}❌ Arquivo não encontrado: $key_file${NC}"
          return
        fi
        
        echo -e "\n${YELLOW}Autenticando com chave de serviço...${NC}"
        gcloud auth activate-service-account --key-file="$key_file"
        
        if [ $? -ne 0 ]; then
          echo -e "${RED}❌ Autenticação com chave de serviço falhou.${NC}"
          return
        fi
        ;;
      *)
        echo -e "${RED}❌ Opção inválida.${NC}"
        return
        ;;
    esac
    
    # Verificar novamente se a autenticação funcionou
    gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    
    if [ -z "$gcloud_auth" ]; then
      echo -e "${RED}❌ Autenticação falhou. Nenhuma conta ativa encontrada.${NC}"
      return
    fi
  fi
  
  echo -e "${GREEN}✓ Autenticado como: $gcloud_auth${NC}"
  
  # Verificar projeto atual
  current_project=$(gcloud config get-value project 2>/dev/null)
  
  if [ -z "$current_project" ] || [ "$current_project" == "(unset)" ]; then
    echo -e "${YELLOW}Nenhum projeto selecionado. Por favor, selecione o projeto:${NC}"
    read -r project_id
    
    if [ -z "$project_id" ]; then
      echo -e "${RED}❌ ID do projeto não pode ser vazio.${NC}"
      return
    fi
    
    gcloud config set project "$project_id"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha ao definir o projeto.${NC}"
      return
    fi
    
    current_project="$project_id"
  fi
  
  echo -e "${GREEN}✓ Projeto atual: $current_project${NC}"
  
  echo -e "\n${YELLOW}Iniciando deployment com Cloud Build...${NC}"
  echo -e "${YELLOW}Isso irá iniciar o processo de build e deployment usando Cloud Build.${NC}"
  echo -e "${YELLOW}O processo pode levar vários minutos.${NC}"
  
  echo -e "\n${YELLOW}Continuar com o deployment? (s/n)${NC}"
  read -r confirm_deploy
  
  if [[ $confirm_deploy == "s" || $confirm_deploy == "S" ]]; then
    echo -e "\n${YELLOW}Iniciando submissão para Cloud Build...${NC}"
    gcloud builds submit --config=cloudbuild.yaml
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Submissão para Cloud Build concluída com sucesso!${NC}"
      echo -e "${YELLOW}Você pode verificar o status do build no Console do Google Cloud:${NC}"
      echo -e "${CYAN}https://console.cloud.google.com/cloud-build/builds?project=$current_project${NC}"
    else
      echo -e "${RED}❌ Falha na submissão para Cloud Build. Verifique os logs acima.${NC}"
    fi
  else
    echo -e "${YELLOW}Operação cancelada pelo usuário.${NC}"
  fi
}

function gcloud_cli() {
  clear
  echo -e "${BLUE}"
  echo "  Deployment Manual via Google Cloud CLI"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  echo -e "\n${YELLOW}Verificando autenticação do Google Cloud...${NC}"
  
  # Checar se o gcloud está instalado
  if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK (gcloud) não encontrado.${NC}"
    echo -e "${YELLOW}Por favor, instale o gcloud CLI: https://cloud.google.com/sdk/docs/install${NC}"
    return
  else
    echo -e "${GREEN}✓ Google Cloud SDK (gcloud) encontrado${NC}"
  fi
  
  # Verificar se está autenticado
  gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
  
  if [ -z "$gcloud_auth" ]; then
    echo -e "${RED}❌ Nenhuma conta autenticada encontrada no gcloud.${NC}"
    echo -e "${YELLOW}Escolha uma opção de autenticação:${NC}"
    echo -e "  ${CYAN}1)${NC} Autenticação interativa (navegador)"
    echo -e "  ${CYAN}2)${NC} Autenticação com chave de serviço (JSON)"
    echo -ne "\n${YELLOW}Sua escolha:${NC} "
    read -r auth_option
    
    case $auth_option in
      1)
        echo -e "\n${YELLOW}Iniciando autenticação interativa...${NC}"
        gcloud auth login
        if [ $? -ne 0 ]; then
          echo -e "${RED}❌ Autenticação falhou.${NC}"
          return
        fi
        ;;
      2)
        echo -e "\n${YELLOW}Digite o caminho completo para o arquivo de chave de serviço JSON:${NC}"
        read -r key_file
        
        if [ ! -f "$key_file" ]; then
          echo -e "${RED}❌ Arquivo não encontrado: $key_file${NC}"
          return
        fi
        
        echo -e "\n${YELLOW}Autenticando com chave de serviço...${NC}"
        gcloud auth activate-service-account --key-file="$key_file"
        
        if [ $? -ne 0 ]; then
          echo -e "${RED}❌ Autenticação com chave de serviço falhou.${NC}"
          return
        fi
        ;;
      *)
        echo -e "${RED}❌ Opção inválida.${NC}"
        return
        ;;
    esac
    
    # Verificar novamente se a autenticação funcionou
    gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    
    if [ -z "$gcloud_auth" ]; then
      echo -e "${RED}❌ Autenticação falhou. Nenhuma conta ativa encontrada.${NC}"
      return
    fi
  fi
  
  echo -e "${GREEN}✓ Autenticado como: $gcloud_auth${NC}"
  
  # Verificar projeto atual
  current_project=$(gcloud config get-value project 2>/dev/null)
  
  if [ -z "$current_project" ] || [ "$current_project" == "(unset)" ]; then
    echo -e "${YELLOW}Nenhum projeto selecionado. Por favor, digite o ID do projeto:${NC}"
    read -r project_id
    
    if [ -z "$project_id" ]; then
      echo -e "${RED}❌ ID do projeto não pode ser vazio.${NC}"
      return
    fi
    
    gcloud config set project "$project_id"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha ao definir o projeto.${NC}"
      return
    fi
    
    current_project="$project_id"
  fi
  
  echo -e "${GREEN}✓ Projeto atual: $current_project${NC}"
  
  # Carregar configurações do arquivo de deployment
  config_file="cloud-run/implementation-config-simple.txt"
  if [ -f "$config_file" ]; then
    source "$config_file"
    echo -e "${GREEN}✓ Arquivo de configuração carregado: $config_file${NC}"
  else
    echo -e "${YELLOW}⚠ Arquivo de configuração não encontrado. Usando valores padrão.${NC}"
    
    # Valores padrão
    project_id="$current_project"
    region="southamerica-east1"
    service_name="tarefo-ai"
    memory="1Gi"
    cpu="1"
  fi
  
  echo -e "\n${YELLOW}Configurações de deployment:${NC}"
  echo -e "  ${CYAN}Projeto:${NC} $project_id"
  echo -e "  ${CYAN}Região:${NC} $region"
  echo -e "  ${CYAN}Nome do serviço:${NC} $service_name"
  echo -e "  ${CYAN}Memória:${NC} $memory"
  echo -e "  ${CYAN}CPU:${NC} $cpu"
  
  echo -e "\n${YELLOW}Você deseja alterar alguma configuração? (s/n)${NC}"
  read -r change_config
  
  if [[ $change_config == "s" || $change_config == "S" ]]; then
    echo -e "\n${YELLOW}Região (padrão: $region):${NC}"
    read -r new_region
    if [ -n "$new_region" ]; then
      region="$new_region"
    fi
    
    echo -e "\n${YELLOW}Nome do serviço (padrão: $service_name):${NC}"
    read -r new_service_name
    if [ -n "$new_service_name" ]; then
      service_name="$new_service_name"
    fi
    
    echo -e "\n${YELLOW}Memória (padrão: $memory):${NC}"
    read -r new_memory
    if [ -n "$new_memory" ]; then
      memory="$new_memory"
    fi
    
    echo -e "\n${YELLOW}CPU (padrão: $cpu):${NC}"
    read -r new_cpu
    if [ -n "$new_cpu" ]; then
      cpu="$new_cpu"
    fi
    
    echo -e "\n${YELLOW}Novas configurações:${NC}"
    echo -e "  ${CYAN}Projeto:${NC} $project_id"
    echo -e "  ${CYAN}Região:${NC} $region"
    echo -e "  ${CYAN}Nome do serviço:${NC} $service_name"
    echo -e "  ${CYAN}Memória:${NC} $memory"
    echo -e "  ${CYAN}CPU:${NC} $cpu"
  fi
  
  echo -e "\n${YELLOW}Iniciando processo de deployment manual...${NC}"
  
  # Verificar Dockerfile
  if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile não encontrado!${NC}"
    echo -e "${YELLOW}Não é possível continuar sem o Dockerfile${NC}"
    return
  else
    echo -e "${GREEN}✓ Dockerfile encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Etapas do deployment manual:${NC}"
  echo -e "  ${CYAN}1)${NC} Build da imagem Docker"
  echo -e "  ${CYAN}2)${NC} Push para Container Registry"
  echo -e "  ${CYAN}3)${NC} Deployment no Cloud Run"
  echo -e "  ${CYAN}4)${NC} Deployment da Cloud Function para webhooks"
  
  echo -e "\n${YELLOW}Continuar com o deployment? (s/n)${NC}"
  read -r confirm_deploy
  
  if [[ $confirm_deploy != "s" && $confirm_deploy != "S" ]]; then
    echo -e "${YELLOW}Operação cancelada pelo usuário.${NC}"
    return
  fi
  
  # Gerar tag de versão única
  timestamp=$(date +%Y%m%d%H%M%S)
  image_tag="gcr.io/$project_id/$service_name:v$timestamp"
  
  # Etapa 1: Build da imagem
  echo -e "\n${YELLOW}[1/4] Construindo imagem Docker...${NC}"
  docker_installed=$(command -v docker &> /dev/null && echo "yes" || echo "no")
  
  if [ "$docker_installed" == "no" ]; then
    echo -e "${RED}❌ Docker não encontrado. Não é possível construir a imagem localmente.${NC}"
    echo -e "${YELLOW}Alternativa: Usando Cloud Build para construção remota...${NC}"
    
    gcloud builds submit --tag="$image_tag" .
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha na construção da imagem com Cloud Build.${NC}"
      return
    fi
  else
    echo -e "${GREEN}✓ Docker encontrado${NC}"
    
    docker build -t "$image_tag" .
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha na construção da imagem Docker.${NC}"
      return
    fi
    
    # Etapa 2: Push para Container Registry
    echo -e "\n${YELLOW}[2/4] Enviando imagem para Container Registry...${NC}"
    
    # Configurar Docker para autenticação com GCR
    gcloud auth configure-docker gcr.io -q
    
    docker push "$image_tag"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha ao enviar imagem para Container Registry.${NC}"
      return
    fi
  fi
  
  # Etapa 3: Deployment no Cloud Run
  echo -e "\n${YELLOW}[3/4] Implantando serviço no Cloud Run...${NC}"
  
  gcloud run deploy "$service_name" \
    --image="$image_tag" \
    --platform=managed \
    --region="$region" \
    --allow-unauthenticated \
    --memory="$memory" \
    --cpu="$cpu" \
    --min-instances=0 \
    --max-instances=2 \
    --set-env-vars="NODE_ENV=production"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no deployment no Cloud Run.${NC}"
    return
  fi
  
  # Obter URL do serviço
  service_url=$(gcloud run services describe "$service_name" --platform=managed --region="$region" --format="value(status.url)")
  
  echo -e "${GREEN}✓ Serviço implantado com sucesso!${NC}"
  echo -e "${GREEN}✓ URL do serviço: $service_url${NC}"
  
  # Etapa 4: Deployment da Cloud Function
  echo -e "\n${YELLOW}[4/4] Implantando Cloud Function para webhooks...${NC}"
  
  if [ ! -d "webhook-function" ]; then
    echo -e "${RED}❌ Diretório webhook-function não encontrado!${NC}"
    echo -e "${YELLOW}⚠ A Cloud Function para webhooks não será implantada.${NC}"
  else
    gcloud functions deploy "tarefo-ai-webhook" \
      --region="$region" \
      --runtime="nodejs18" \
      --trigger-http \
      --source="webhook-function" \
      --memory="256MB" \
      --timeout="60s" \
      --set-env-vars="SERVICE_URL=$service_url" \
      --allow-unauthenticated
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Falha no deployment da Cloud Function.${NC}"
    else
      # Obter URL da função
      function_url=$(gcloud functions describe "tarefo-ai-webhook" --region="$region" --format="value(httpsTrigger.url)")
      
      echo -e "${GREEN}✓ Cloud Function implantada com sucesso!${NC}"
      echo -e "${GREEN}✓ URL da função: $function_url${NC}"
    fi
  fi
  
  echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  echo -e "${GREEN}✅ Deployment manual concluído!${NC}"
  
  echo -e "\n${YELLOW}Resumo do deployment:${NC}"
  echo -e "  ${CYAN}Projeto:${NC} $project_id"
  echo -e "  ${CYAN}Região:${NC} $region"
  echo -e "  ${CYAN}Serviço:${NC} $service_name"
  echo -e "  ${CYAN}URL do serviço:${NC} $service_url"
  
  if [ -n "$function_url" ]; then
    echo -e "  ${CYAN}Cloud Function:${NC} tarefo-ai-webhook"
    echo -e "  ${CYAN}URL da função:${NC} $function_url"
  fi
}

function terraform_deploy() {
  clear
  echo -e "${BLUE}"
  echo "  Terraform Deployment"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  echo -e "\n${YELLOW}Verificando se o Terraform está instalado...${NC}"
  
  if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform não encontrado.${NC}"
    echo -e "${YELLOW}Deseja instalar o Terraform agora? (s/n)${NC}"
    read -r install_terraform
    
    if [[ $install_terraform == "s" || $install_terraform == "S" ]]; then
      echo -e "\n${YELLOW}Instalando Terraform...${NC}"
      # Adicionar lógica de instalação do Terraform aqui
      echo -e "${RED}❌ Funcionalidade de instalação automática não implementada.${NC}"
      echo -e "${YELLOW}Por favor, instale o Terraform manualmente:${NC}"
      echo -e "${CYAN}https://learn.hashicorp.com/tutorials/terraform/install-cli${NC}"
      return
    else
      echo -e "${YELLOW}Operação cancelada.${NC}"
      return
    fi
  else
    echo -e "${GREEN}✓ Terraform encontrado: $(terraform version | head -n1)${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando arquivos do Terraform...${NC}"
  
  if [ ! -d "terraform" ]; then
    echo -e "${RED}❌ Diretório terraform não encontrado!${NC}"
    echo -e "${YELLOW}Não é possível continuar sem os arquivos do Terraform${NC}"
    return
  fi
  
  if [ ! -f "terraform/main.tf" ]; then
    echo -e "${RED}❌ Arquivo terraform/main.tf não encontrado!${NC}"
    echo -e "${YELLOW}Não é possível continuar sem o arquivo main.tf${NC}"
    return
  else
    echo -e "${GREEN}✓ Arquivo terraform/main.tf encontrado${NC}"
  fi
  
  echo -e "\n${YELLOW}Verificando autenticação do Google Cloud...${NC}"
  
  # Verificar se o gcloud está instalado e autenticado
  if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK (gcloud) não encontrado.${NC}"
    echo -e "${YELLOW}É recomendado ter o gcloud instalado para autenticação.${NC}"
    echo -e "${YELLOW}Você pode continuar, mas pode enfrentar problemas de autenticação.${NC}"
  else
    gcloud_auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    
    if [ -z "$gcloud_auth" ]; then
      echo -e "${RED}❌ Nenhuma conta autenticada encontrada no gcloud.${NC}"
      echo -e "${YELLOW}É recomendado autenticar-se com o gcloud antes de usar o Terraform.${NC}"
      echo -e "${YELLOW}Você pode continuar, mas pode enfrentar problemas de autenticação.${NC}"
    else
      echo -e "${GREEN}✓ Autenticado no gcloud como: $gcloud_auth${NC}"
    fi
    
    # Verificar projeto atual
    current_project=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$current_project" ] || [ "$current_project" == "(unset)" ]; then
      echo -e "${YELLOW}⚠ Nenhum projeto selecionado no gcloud.${NC}"
    else
      echo -e "${GREEN}✓ Projeto atual no gcloud: $current_project${NC}"
    fi
  fi
  
  echo -e "\n${YELLOW}Iniciando deployment com Terraform...${NC}"
  
  cd terraform || { echo -e "${RED}❌ Falha ao entrar no diretório terraform.${NC}"; return; }
  
  echo -e "\n${YELLOW}Inicializando Terraform...${NC}"
  terraform init
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha na inicialização do Terraform.${NC}"
    cd ..
    return
  fi
  
  echo -e "\n${YELLOW}Gerando plano do Terraform...${NC}"
  terraform plan -out=tfplan
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao gerar o plano do Terraform.${NC}"
    cd ..
    return
  fi
  
  echo -e "\n${YELLOW}Revisar o plano acima e confirmar o deployment? (s/n)${NC}"
  read -r confirm_deploy
  
  if [[ $confirm_deploy == "s" || $confirm_deploy == "S" ]]; then
    echo -e "\n${YELLOW}Aplicando configuração Terraform...${NC}"
    terraform apply "tfplan"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Deployment com Terraform concluído com sucesso!${NC}"
      
      # Tentar obter outputs
      service_url=$(terraform output -raw service_url 2>/dev/null)
      
      if [ -n "$service_url" ]; then
        echo -e "${GREEN}✓ URL do serviço: $service_url${NC}"
      fi
      
      function_url=$(terraform output -raw function_url 2>/dev/null)
      
      if [ -n "$function_url" ]; then
        echo -e "${GREEN}✓ URL da Cloud Function: $function_url${NC}"
      fi
    else
      echo -e "${RED}❌ Falha ao aplicar a configuração Terraform.${NC}"
    fi
  else
    echo -e "${YELLOW}Operação cancelada pelo usuário.${NC}"
  fi
  
  cd ..
}

function check_prerequisites() {
  clear
  echo -e "${BLUE}"
  echo "  Verificação de Pré-requisitos para Deployment"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  cd cloud-run || { echo -e "${RED}❌ Diretório cloud-run não encontrado.${NC}"; return; }
  
  if [ -f "pre-deployment-check.sh" ]; then
    echo -e "${YELLOW}Executando verificação de pré-deployment...${NC}"
    ./pre-deployment-check.sh
  else
    echo -e "${RED}❌ Script de verificação de pré-deployment não encontrado.${NC}"
    echo -e "${YELLOW}Criando script de verificação...${NC}"
    
    # Criar script de verificação aqui (código omitido por brevidade)
    echo -e "${RED}❌ Funcionalidade de criação automática não implementada.${NC}"
  fi
  
  cd ..
}

function setup_github_cicd() {
  clear
  echo -e "${BLUE}"
  echo "  Configuração de CI/CD no GitHub"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Este não parece ser um repositório Git.${NC}"
    echo -e "${YELLOW}Para configurar CI/CD no GitHub, você precisa ter um repositório Git.${NC}"
    
    echo -e "\n${YELLOW}Deseja inicializar um repositório Git agora? (s/n)${NC}"
    read -r init_git
    
    if [[ $init_git == "s" || $init_git == "S" ]]; then
      echo -e "\n${YELLOW}Inicializando repositório Git...${NC}"
      git init
      echo -e "${GREEN}✓ Repositório Git inicializado${NC}"
    else
      echo -e "${YELLOW}Operação cancelada.${NC}"
      return
    fi
  else
    echo -e "${GREEN}✓ Repositório Git encontrado${NC}"
  fi
  
  if [ -f ".github/workflows/deploy-to-cloud-run.yml" ]; then
    echo -e "${GREEN}✓ Arquivo de workflow do GitHub Actions já existe${NC}"
  else
    echo -e "${YELLOW}Criando diretório de workflows...${NC}"
    mkdir -p .github/workflows
    
    echo -e "${YELLOW}Criando arquivo de workflow...${NC}"
    
    cat > .github/workflows/deploy-to-cloud-run.yml << EOF
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
          project_id: tarefoai
      
      - name: Deploy using Cloud Build
        run: |
          gcloud builds submit --config cloudbuild.yaml
EOF
    
    echo -e "${GREEN}✓ Arquivo de workflow criado: .github/workflows/deploy-to-cloud-run.yml${NC}"
  fi
  
  echo -e "\n${YELLOW}Para configurar a autenticação do GitHub com o Google Cloud Platform:${NC}"
  echo -e "\n${CYAN}1. Configure a Federação de Identidade de Carga de Trabalho (Workload Identity Federation):${NC}"
  echo -e "   gcloud iam workload-identity-pools create github-pool --location=global"
  echo -e "   gcloud iam workload-identity-pools providers create-oidc github \\
      --workload-identity-pool=github-pool \\
      --location=global \\
      --issuer-uri=https://token.actions.githubusercontent.com \\
      --attribute-mapping=google.subject=assertion.sub"
  
  echo -e "\n${CYAN}2. Obtenha o nome completo do provedor:${NC}"
  echo -e "   gcloud iam workload-identity-pools providers describe github \\
      --location=global \\
      --workload-identity-pool=github-pool \\
      --format=\"value(name)\""
  
  echo -e "\n${CYAN}3. Conceda à conta de serviço permissão para ser usada pelo GitHub:${NC}"
  echo -e "   gcloud iam service-accounts add-iam-policy-binding \\
      [SEU-PROJETO]@appspot.gserviceaccount.com \\
      --role=roles/iam.workloadIdentityUser \\
      --member=\"principalSet://iam.googleapis.com/projects/[NÚMERO-DO-PROJETO]/locations/global/workloadIdentityPools/github-pool/attribute.repository/[USUÁRIO]/[REPOSITÓRIO]\""
  
  echo -e "\n${CYAN}4. Adicione os seguintes secrets ao seu repositório GitHub:${NC}"
  echo -e "   WIF_PROVIDER: O valor obtido no passo 2"
  echo -e "   WIF_SERVICE_ACCOUNT: [SEU-PROJETO]@appspot.gserviceaccount.com"
  
  echo -e "\n${YELLOW}Você já configurou a Federação de Identidade de Carga de Trabalho? (s/n)${NC}"
  read -r has_wif
  
  if [[ $has_wif == "s" || $has_wif == "S" ]]; then
    echo -e "${GREEN}✓ Federação de Identidade de Carga de Trabalho configurada${NC}"
  else
    echo -e "${YELLOW}⚠ Sem a configuração de Federação de Identidade, o GitHub Actions não poderá autenticar-se no GCP.${NC}"
    echo -e "${YELLOW}Siga os passos acima para configurar a autenticação.${NC}"
  fi
  
  echo -e "\n${YELLOW}Você já adicionou os secrets necessários ao repositório GitHub? (s/n)${NC}"
  read -r has_secrets
  
  if [[ $has_secrets == "s" || $has_secrets == "S" ]]; then
    echo -e "${GREEN}✓ Secrets configurados${NC}"
  else
    echo -e "${YELLOW}⚠ Sem os secrets, o GitHub Actions não poderá autenticar-se no GCP.${NC}"
    echo -e "${YELLOW}Acesse as configurações do seu repositório GitHub e adicione os secrets.${NC}"
  fi
  
  echo -e "\n${GREEN}✅ Configuração de CI/CD concluída!${NC}"
  echo -e "${YELLOW}Para testar o CI/CD, faça push das alterações para a branch main.${NC}"
}

function show_help() {
  clear
  echo -e "${BLUE}"
  echo "  Documentação e Ajuda de Deployment"
  echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  
  echo -e "\n${YELLOW}O TarefoAI oferece várias opções de deployment:${NC}"
  
  echo -e "\n${CYAN}1. GitHub Actions (Recomendado)${NC}"
  echo -e "   A maneira mais automatizada de fazer deployment, usando CI/CD."
  echo -e "   Cada push para a branch main aciona automaticamente um novo deployment."
  echo -e "   Requisitos: Repositório GitHub, Federação de Identidade de Carga de Trabalho."
  
  echo -e "\n${CYAN}2. Cloud Build${NC}"
  echo -e "   Deploy diretamente usando o Cloud Build do Google Cloud."
  echo -e "   Requisitos: gcloud CLI configurado e autenticado."
  
  echo -e "\n${CYAN}3. Manual via gcloud CLI${NC}"
  echo -e "   Processo passo a passo para deployment usando comandos gcloud."
  echo -e "   Oferece maior controle, mas requer mais etapas manuais."
  echo -e "   Requisitos: gcloud CLI, Docker (opcional)."
  
  echo -e "\n${CYAN}4. Terraform${NC}"
  echo -e "   Deployment usando infraestrutura como código."
  echo -e "   Gerencia todos os recursos do GCP de forma declarativa."
  echo -e "   Requisitos: Terraform, gcloud CLI."
  
  echo -e "\n${YELLOW}Estrutura de Arquivos Importantes:${NC}"
  echo -e "  ${CYAN}Dockerfile${NC} - Define como a aplicação é empacotada"
  echo -e "  ${CYAN}cloudbuild.yaml${NC} - Configuração do Cloud Build"
  echo -e "  ${CYAN}.github/workflows/deploy-to-cloud-run.yml${NC} - Workflow do GitHub Actions"
  echo -e "  ${CYAN}terraform/main.tf${NC} - Configuração do Terraform"
  echo -e "  ${CYAN}cloud-run/implementation-config-simple.txt${NC} - Configurações de deployment"
  echo -e "  ${CYAN}cloud-run/pre-deployment-check.sh${NC} - Verificação de pré-requisitos"
  
  echo -e "\n${YELLOW}Infraestrutura do TarefoAI:${NC}"
  echo -e "  ${CYAN}Cloud Run${NC} - Serviço principal"
  echo -e "  ${CYAN}Cloud Functions${NC} - Webhooks e integrações"
  echo -e "  ${CYAN}Cloud SQL${NC} - Banco de dados PostgreSQL"
  echo -e "  ${CYAN}Secret Manager${NC} - Armazenamento seguro de credenciais"
  
  echo -e "\n${YELLOW}URLs Importantes:${NC}"
  echo -e "  ${CYAN}Aplicação:${NC} https://tarefo-ai-[hash].run.app"
  echo -e "  ${CYAN}Webhook:${NC} https://[região]-[projeto].cloudfunctions.net/tarefo-ai-webhook"
  
  echo -e "\n${YELLOW}Para mais informações, consulte:${NC}"
  echo -e "  ${CYAN}docs/DEPLOYMENT.md${NC} - Documentação detalhada de deployment"
  echo -e "  ${CYAN}cloud-run/GITHUB_DEPLOYMENT.md${NC} - Guia de deployment com GitHub"
  
  echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
  echo -e "${GREEN}Pressione Enter para voltar ao menu principal${NC}"
  read -r
}

# Menu principal
while true; do
  clear
  show_menu
  
  case $option in
    1)
      github_actions
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    2)
      cloud_build
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    3)
      gcloud_cli
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    4)
      terraform_deploy
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    5)
      check_prerequisites
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    6)
      setup_github_cicd
      echo -e "\n${YELLOW}Pressione Enter para voltar ao menu principal${NC}"
      read -r
      ;;
    7)
      show_help
      ;;
    0)
      echo -e "\n${GREEN}Saindo do Hub de Deployment. Até logo!${NC}"
      exit 0
      ;;
    *)
      echo -e "\n${RED}Opção inválida!${NC}"
      sleep 1
      ;;
  esac
done