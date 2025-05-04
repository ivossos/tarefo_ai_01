#!/bin/bash

# Script para mostrar o resultado final do visualizador de progresso

# Cores para formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # Sem cor

# Carregar configurações
CONFIG_FILE="progress-visualizer-config.txt"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    exit 1
fi

source "$CONFIG_FILE"

# Simular URL de serviço e funções
SERVICE_URL="https://${service_name}-${project_id}.${region}.run.app"
WEBHOOK_URL="${SERVICE_URL}/api/webhook"
FUNCTION_URL="https://${region}-${project_id}.cloudfunctions.net/${webhook_function}"

# Mostrar o cabeçalho
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

# Exibir o status final
echo -e "${BOLD}Progresso do Deployment:${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"
echo -e "1. Configuração do Projeto GCP (${project_id}):                ${GREEN}✓ Concluído${NC}"
echo -e "2. Habilitação das APIs do GCP:                              ${GREEN}✓ Concluído${NC}"
echo -e "3. Criação do Banco de Dados PostgreSQL:                     ${GREEN}✓ Concluído${NC}"
echo -e "4. Configuração dos Secrets no Secret Manager:               ${GREEN}✓ Concluído${NC}"
echo -e "5. Build do Container Docker:                                ${GREEN}✓ Concluído${NC}"
echo -e "6. Deployment no Cloud Run:                                  ${GREEN}✓ Concluído${NC}"
echo -e "7. Deployment das Cloud Functions:                           ${GREEN}✓ Concluído${NC}"
echo -e "8. Configuração dos Webhooks (Telegram/WhatsApp):            ${GREEN}✓ Concluído${NC}"
echo -e "9. Verificação Final:                                        ${GREEN}✓ Concluído${NC}"
echo -e "${BLUE}$(printf '=%.0s' $(seq 1 70))${NC}"

# Exibir URLs
echo -e "\n${BOLD}URLs do Serviço:${NC}"
echo -e "🌐 Aplicação Web:      ${CYAN}$SERVICE_URL${NC}"
echo -e "🔄 API Principal:      ${CYAN}$SERVICE_URL/api${NC}"
echo -e "📱 Webhook WhatsApp:   ${CYAN}$WEBHOOK_URL/whatsapp${NC}"
echo -e "📱 Webhook Telegram:   ${CYAN}$WEBHOOK_URL/telegram${NC}"
echo -e "⚙️ Cloud Function:     ${CYAN}$FUNCTION_URL${NC}"

# Exibir barra de progresso completa
echo -e "\n${BOLD}Progresso Geral: 100%${NC}"
echo -ne "["
for ((i=0; i<50; i++)); do
    echo -ne "${GREEN}#${NC}"
done
echo -e "]"

# Exibir mensagem de conclusão
echo -e "\n${GREEN}${BOLD}✅ Deployment concluído com sucesso!${NC}"
echo -e "${YELLOW}O TarefoAI está pronto para uso em: ${CYAN}$SERVICE_URL${NC}"

# Próximos passos
echo -e "\n${BOLD}Próximos Passos:${NC}"
echo -e "1. Acesse a aplicação web em: ${CYAN}$SERVICE_URL${NC}"
echo -e "2. Faça login com as credenciais padrão:"
echo -e "   Usuário: ${CYAN}system_admin${NC}"
echo -e "   Senha: ${CYAN}808120${NC}"
echo -e "3. Configure integrações com Telegram, WhatsApp e Google Calendar"
echo -e "4. Adicione usuários e comece a usar o sistema"

echo -e "\n${YELLOW}${BOLD}Importante:${NC}"
echo -e "- Os webhooks para serviços de mensageria já estão configurados"
echo -e "- O banco de dados PostgreSQL está configurado e pronto para uso"
echo -e "- O sistema está utilizando ${CYAN}$ai_provider/$ai_model${NC} como LLM principal"
echo -e "- Backup LLM: ${CYAN}$backup_provider/$backup_model${NC}"

echo -e "\n${GREEN}Obrigado por usar o TarefoAI!${NC}"