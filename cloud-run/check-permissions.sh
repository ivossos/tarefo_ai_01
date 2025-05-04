#!/bin/bash

# Script para verificar permissões da conta de serviço do GCP
# Autor: TarefoAI Team

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem cor

# Cabeçalho
echo -e "${BLUE}"
echo "  ______                  __          ___    ___ "
echo " /_  __/___ ______  ____/ /___     _/_/    /  _/ "
echo "  / / / __ \`/ ___/ / __  / __ \   / /     / /   "
echo " / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    "
echo "/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    "
echo -e "${NC}"
echo -e "${GREEN}Verificação de Permissões da Conta de Serviço${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Verificar se o arquivo de chave existe
KEYFILE="tarefoai-0566d678ba75.json"
if [ ! -f "$KEYFILE" ]; then
    echo -e "${RED}Erro: Arquivo de chave $KEYFILE não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo de chave encontrado: $KEYFILE${NC}"

# Extrair informações da conta de serviço
PROJECT_ID=$(grep -o '"project_id": *"[^"]*"' $KEYFILE | cut -d'"' -f4)
CLIENT_EMAIL=$(grep -o '"client_email": *"[^"]*"' $KEYFILE | cut -d'"' -f4)

echo -e "${GREEN}✓ ID do Projeto: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Email da Conta de Serviço: $CLIENT_EMAIL${NC}"

# Autenticar com gcloud
echo -e "\n${YELLOW}Autenticando com Google Cloud...${NC}"
gcloud auth activate-service-account --key-file="$KEYFILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha na autenticação.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticação bem-sucedida!${NC}"

# Configurar projeto
echo -e "\n${YELLOW}Configurando projeto padrão...${NC}"
gcloud config set project "$PROJECT_ID"

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: Falha ao configurar o projeto.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Projeto padrão configurado: $PROJECT_ID${NC}"

# Verificar as permissões atuais
echo -e "\n${YELLOW}Verificando permissões atuais da conta de serviço...${NC}"
ROLES=$(gcloud projects get-iam-policy $PROJECT_ID --format="flattened(bindings[].role)" | grep role | sort)

echo -e "\n${GREEN}Permissões atuais:${NC}"
echo "$ROLES"

# Verificar se as permissões necessárias estão presentes
REQUIRED_ROLES=(
    "roles/run.admin"
    "roles/cloudbuild.builds.builder"
    "roles/storage.admin"
    "roles/iam.serviceAccountUser"
)

echo -e "\n${YELLOW}Verificando permissões necessárias...${NC}"

MISSING_ROLES=()
for role in "${REQUIRED_ROLES[@]}"; do
    if ! echo "$ROLES" | grep -q "$role"; then
        MISSING_ROLES+=("$role")
        echo -e "${RED}❌ Faltando: $role${NC}"
    else
        echo -e "${GREEN}✓ Presente: $role${NC}"
    fi
done

# Gerar um relatório de permissões
echo -e "\n${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "${GREEN}Relatório de Verificação de Permissões${NC}"

if [ ${#MISSING_ROLES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ A conta de serviço já possui todas as permissões necessárias!${NC}"
    echo -e "${YELLOW}Você pode prosseguir com o deployment diretamente.${NC}"
else
    echo -e "${YELLOW}⚠️ A conta de serviço está faltando ${#MISSING_ROLES[@]} permissões necessárias.${NC}"
    echo -e "\n${BLUE}Instruções para adicionar as permissões faltantes:${NC}"
    echo -e "${YELLOW}1. Acesse o console do Google Cloud: https://console.cloud.google.com/iam-admin/iam?project=$PROJECT_ID${NC}"
    echo -e "${YELLOW}2. Encontre a conta de serviço: $CLIENT_EMAIL${NC}"
    echo -e "${YELLOW}3. Clique no botão de edição (ícone de lápis)${NC}"
    echo -e "${YELLOW}4. Clique em \"Adicionar outra função\"${NC}"
    echo -e "${YELLOW}5. Adicione cada uma das seguintes funções:${NC}"
    
    for role in "${MISSING_ROLES[@]}"; do
        ROLE_DISPLAY=$(echo $role | sed 's/roles\///')
        echo -e "   ${CYAN}- $ROLE_DISPLAY${NC}"
    done
    
    echo -e "\n${YELLOW}6. Clique em \"Salvar\" para aplicar as alterações${NC}"
    echo -e "${YELLOW}7. Após adicionar todas as permissões, execute o script de deployment novamente${NC}"
fi

echo -e "\n${GREEN}✅ Verificação de permissões concluída!${NC}"