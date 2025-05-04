# Guia de Deployment do Tarefo AI

Este documento fornece instruções detalhadas para o deployment do Tarefo AI no Google Cloud Platform (GCP). Existem três opções de deployment disponíveis, desde o assistente interativo até scripts completamente automatizados.

## Pré-requisitos

Antes de iniciar o deployment, certifique-se de ter:

1. **Uma conta no Google Cloud Platform** com faturamento ativado
2. **Google Cloud SDK (gcloud CLI)** instalado e configurado em seu ambiente
3. **Docker** instalado (opcional, necessário apenas para build local)
4. **Node.js 18+** e **Python 3.8+** instalados
5. **Chaves de API** para serviços externos:
   - OpenAI API Key
   - Telegram Bot Token (opcional)
   - Twilio Account SID, Auth Token e número de telefone (opcional)
   - Google OAuth Client ID e Secret (opcional, para integração com Google Calendar)

## Opções de Deployment

### Opção 1: Assistente de Implementação Interativo

O Assistente de Implementação oferece uma interface interativa para guiá-lo pelo processo de configuração e deployment.

```bash
# Navegue até o diretório de deployment
cd cloud-run/deployment-ui

# Execute o assistente de implementação
./implementation-wizard-simple.sh
```

O assistente irá:
1. Solicitar as configurações do projeto GCP
2. Configurar o banco de dados PostgreSQL
3. Configurar o serviço Cloud Run
4. Configurar Cloud Functions para webhooks
5. Configurar integrações (Telegram, WhatsApp, etc.)
6. Configurar provedores e modelos de IA
7. Gerar um script de implementação ou iniciar o deployment

### Opção 2: Visualizador de Progresso de Deployment

O Visualizador de Progresso oferece uma experiência visual com atualizações em tempo real sobre o andamento do deployment.

```bash
# Navegue até o diretório de deployment
cd cloud-run/deployment-ui

# Execute primeiro o assistente de implementação para gerar o arquivo de configuração
./implementation-wizard-simple.sh

# Em seguida, execute o visualizador de progresso
cp implementation-config-simple.txt progress-visualizer-config.txt
./progress-visualizer.sh
```

O visualizador mostrará:
- Status de cada etapa (Pendente, Em progresso, Concluído)
- Barra de progresso geral
- URLs do serviço após o deployment
- Logs de cada comando executado

### Opção 3: Script de Deployment Automatizado

O script de deployment automatizado executa todas as etapas necessárias sem interação do usuário.

```bash
# Navegue até o diretório de cloud-run
cd cloud-run

# Execute o script de deployment
./tarefo-ai-deploy.sh
```

O script solicita as variáveis de ambiente necessárias que não estejam definidas e executa todas as etapas de deployment.

## Configuração Manual

Se preferir configurar e implantar manualmente, siga estas etapas:

1. **Configurar o projeto GCP**:
   ```bash
   gcloud config set project [PROJECT_ID]
   ```

2. **Habilitar as APIs necessárias**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com cloudfunctions.googleapis.com
   ```

3. **Criar o banco de dados PostgreSQL**:
   ```bash
   gcloud sql instances create tarefo-ai-db \
       --database-version=POSTGRES_14 \
       --tier=db-f1-micro \
       --region=southamerica-east1
   ```

4. **Criar o banco de dados e usuário**:
   ```bash
   gcloud sql databases create tarefoai --instance=tarefo-ai-db
   gcloud sql users create tarefo_app --instance=tarefo-ai-db --password=[SENHA]
   ```

5. **Configurar secrets no Secret Manager**:
   ```bash
   echo -n "[CONNECTION_STRING]" | gcloud secrets create database-url --data-file=-
   echo -n "[OPENAI_API_KEY]" | gcloud secrets create openai-api-key --data-file=-
   echo -n "[TELEGRAM_BOT_TOKEN]" | gcloud secrets create telegram-bot-token --data-file=-
   ```

6. **Construir a imagem Docker**:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/tarefo-ai .
   ```

7. **Implantar no Cloud Run**:
   ```bash
   gcloud run deploy tarefo-ai \
       --image gcr.io/[PROJECT_ID]/tarefo-ai \
       --platform managed \
       --region southamerica-east1 \
       --allow-unauthenticated \
       --memory 1Gi \
       --cpu 1 \
       --min-instances 0 \
       --max-instances 2 \
       --add-cloudsql-instances [PROJECT_ID]:southamerica-east1:tarefo-ai-db \
       --set-secrets=DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest,TELEGRAM_BOT_TOKEN=telegram-bot-token:latest \
       --set-env-vars="NODE_ENV=production"
   ```

8. **Implantar Cloud Function para webhooks**:
   ```bash
   cd webhook-function
   gcloud functions deploy tarefo-ai-webhook \
       --runtime nodejs18 \
       --trigger-http \
       --allow-unauthenticated \
       --region southamerica-east1 \
       --memory 256MB \
       --timeout 60s
   ```

9. **Configurar webhook do Telegram**:
   ```bash
   curl -s "https://api.telegram.org/bot[TOKEN]/setWebhook?url=[SERVICE_URL]/api/webhook/telegram"
   ```

## Verificação da Instalação

Para verificar se a instalação foi bem-sucedida:

1. Acesse a aplicação web no URL fornecido após o deployment
2. Faça login com as credenciais de administrador (padrão: `system_admin` / `808120`)
3. Verifique se os serviços de mensageria estão funcionando enviando uma mensagem para o bot do Telegram
4. Verifique os logs da aplicação para garantir que não há erros

## Solução de Problemas

Se encontrar problemas durante o deployment:

1. **Erros de permissão**: Verifique se sua conta GCP tem as permissões necessárias (roles/editor, roles/secretmanager.admin, etc.)
2. **Erros de conexão com o banco de dados**: Verifique a string de conexão e se o IP do Cloud Run está autorizado no Cloud SQL
3. **Erros nos webhooks**: Verifique se os URLs dos webhooks estão corretos e acessíveis publicamente
4. **Erros nos serviços de IA**: Verifique se as chaves de API são válidas e estão configuradas corretamente

Para ajuda adicional, consulte os logs detalhados gerados durante o deployment ou abra uma issue no GitHub.

## Atualizações e Manutenção

Para atualizar o Tarefo AI após modificações no código:

1. Construa uma nova imagem Docker:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/tarefo-ai .
   ```

2. Atualize o serviço Cloud Run:
   ```bash
   gcloud run services update tarefo-ai --image gcr.io/[PROJECT_ID]/tarefo-ai --region southamerica-east1
   ```

## Custos e Dimensionamento

O deployment padrão do Tarefo AI no GCP tem custo estimado entre R$150-300 por mês, dependendo do uso:

- **Cloud Run**: Cobrado apenas pelo tempo de execução (~R$0,06/hora)
- **Cloud SQL**: Instância db-f1-micro (~R$35/mês + armazenamento)
- **Cloud Functions**: Cobrado por invocação (~R$0,40/milhão de invocações)
- **Secret Manager**: Gratuito para poucos segredos
- **Cloud Build**: Gratuito para 120 minutos/dia

Para reduzir custos:
- Utilize o número mínimo de instâncias como 0 para escalar a zero quando não estiver em uso
- Escolha uma região com preços mais baixos
- Use instâncias menores para o banco de dados em ambientes de desenvolvimento

Para escalar para mais usuários:
- Aumente o número máximo de instâncias do Cloud Run
- Atualize para uma instância de banco de dados maior (db-g1-small ou maior)
- Considere usar Cloud Storage para armazenar arquivos estáticos e uploads de usuários