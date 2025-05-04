# Guia de Implantação do Tarefo AI no Google Cloud

Este guia detalhado descreve o processo de implantação do Tarefo AI no Google Cloud, com foco especial na integração do WhatsApp.

## Arquitetura

O Tarefo AI utiliza os seguintes serviços no Google Cloud:

- **Google Cloud Run**: Hospeda a aplicação principal (backend Node.js/Express)
- **Google Cloud Functions**: Processa os webhooks do WhatsApp
- **Google Cloud SQL**: Armazena todos os dados em PostgreSQL
- **Google Secret Manager**: Gerencia credenciais e chaves de API
- **Google Cloud Scheduler**: Executa tarefas agendadas (lembretes, sincronização)
- **Google Cloud Monitoring**: Monitora saúde e desempenho da aplicação

## Pré-requisitos

1. Conta no Google Cloud com faturamento ativado
2. Google Cloud SDK instalado localmente
3. Docker instalado localmente (para construir a imagem)
4. Acesso ao WhatsApp Business API ou Twilio Sandbox
5. Chaves de API para:
   - OpenAI ou Anthropic (LLM)
   - Twilio (WhatsApp/SMS)
   - Google OAuth (integração de calendário)

## Etapas de Implantação

### 1. Configuração Inicial

Primeiro, configure o ambiente e os recursos básicos:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tarefo-ai.git
cd tarefo-ai

# Instale as dependências
npm install

# Dê permissão de execução aos scripts
chmod +x cloud-run/*.sh
```

### 2. Configurar Banco de Dados

Execute o script para criar a instância PostgreSQL:

```bash
./cloud-run/setup-database.sh
```

Este script:
- Cria uma instância PostgreSQL no Cloud SQL
- Configura usuários e permissões
- Armazena a string de conexão no Secret Manager

### 3. Configurar Segredos

Configure os segredos necessários:

```bash
./cloud-run/setup-secrets.sh
```

Este script solicita e armazena no Secret Manager:
- Credenciais da Twilio
- Chave de API da OpenAI/Anthropic
- Token do bot do Telegram
- Credenciais OAuth do Google
- Tokens para webhooks do WhatsApp

### 4. Implantar a Aplicação Principal

Implante a aplicação no Cloud Run:

```bash
./cloud-run/script-deploy.sh
```

Este script:
- Constrói a imagem Docker
- Envia para o Container Registry
- Implanta no Cloud Run com as configurações adequadas
- Configura acesso ao banco de dados e segredos

### 5. Implantar a Função para Webhook do WhatsApp

Implante a Cloud Function para processar webhooks do WhatsApp:

```bash
./cloud-run/deploy-function.sh
```

Este script:
- Implanta a função que recebe webhooks do WhatsApp
- Configura acesso aos segredos
- Estabelece comunicação com a aplicação principal

### 6. Configurar Tarefas Agendadas

Configure tarefas agendadas para processos recorrentes:

```bash
./cloud-run/setup-scheduler.sh
```

Este script configura tarefas para:
- Verificar lembretes a cada 5 minutos
- Sincronizar calendários diariamente
- Processar transações financeiras recorrentes

### 7. Configurar Monitoramento e Alertas

Configure monitoramento e alertas:

```bash
./cloud-run/setup-monitoring.sh
```

Este script configura:
- Alertas para erros 5xx
- Alertas para falhas nas Cloud Functions
- Alertas para alta latência
- Canal de notificação por e-mail

### 8. Otimizar Escalabilidade

Configure a escalabilidade:

```bash
./cloud-run/scale-resources.sh
```

Este script configura:
- Número mínimo e máximo de instâncias
- Recursos de CPU e memória
- Concorrência e timeouts

## Configuração do WhatsApp Business

### Opção 1: WhatsApp Business API (Meta for Developers)

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um aplicativo Business
3. Adicione o produto WhatsApp
4. Configure o Webhook usando a URL da Cloud Function:
   ```
   https://REGION-PROJECT_ID.cloudfunctions.net/whatsappWebhook
   ```
5. Use o token de verificação armazenado no Secret Manager
6. Assine os campos `messages` e `message_status`

### Opção 2: Twilio Sandbox para WhatsApp

1. Acesse [twilio.com/console](https://www.twilio.com/console)
2. Navegue até WhatsApp Sandbox
3. Configure o Webhook para a URL:
   ```
   https://REGION-PROJECT_ID.cloudfunctions.net/whatsappWebhook
   ```
4. Teste enviando uma mensagem para o número do Sandbox

## Teste e Validação

Após a implantação, teste a integração:

1. **Teste de Autenticação**:
   - Acesse a aplicação web e faça login
   - Verifique se o token de sessão é válido

2. **Teste de WhatsApp**:
   - Envie uma mensagem de teste para o número configurado
   - Verifique se a resposta é recebida
   - Verifique os logs na Cloud Function e no Cloud Run

3. **Teste de Lembretes**:
   - Crie um lembrete para daqui a 5 minutos
   - Verifique se a notificação é enviada
   - Verifique os logs do Cloud Scheduler

## Resolução de Problemas

### Problemas de Webhook

Se o webhook não estiver funcionando:

1. Verifique os logs da Cloud Function
2. Confirme se o token de verificação está correto
3. Verifique se a URL está acessível publicamente
4. Teste a função manualmente com dados de exemplo

### Problemas de Banco de Dados

Se houver problemas de conexão com o banco de dados:

1. Verifique se a instância está em execução
2. Confirme se as credenciais no Secret Manager estão corretas
3. Verifique se o serviço tem permissão para acessar o Cloud SQL

### Problemas de Escalabilidade

Se a aplicação não estiver escalando corretamente:

1. Verifique os logs de CPU e memória
2. Ajuste os limites de recursos
3. Considere reduzir a concorrência por instância

## Manutenção Contínua

Para manter a aplicação funcionando corretamente:

1. **Atualizações**:
   - Implante atualizações durante períodos de baixo tráfego
   - Use implantação gradual (traffic splitting)
   - Faça backup do banco de dados antes de atualizações importantes

2. **Monitoramento**:
   - Revise os dashboards regularmente
   - Ajuste os alertas conforme necessário
   - Configure métricas personalizadas para KPIs específicos

3. **Backup**:
   - Configure backups automáticos do banco de dados
   - Armazene cópias em diferentes regiões

## Considerações de Segurança

- Implemente proteção contra ataques DDoS
- Configure regras de firewall para o banco de dados
- Use Identity and Access Management (IAM) para controlar permissões
- Configure auditoria de acesso para recursos sensíveis

## Estimativa de Custos

Os custos mensais estimados para uma implantação básica:

- Cloud Run: ~$25-50/mês (depende do tráfego)
- Cloud SQL: ~$50-100/mês (instância pequena)
- Cloud Functions: ~$10-20/mês (depende do volume de mensagens)
- Outros serviços: ~$5-10/mês

Total estimado: $90-180/mês para uma instalação de pequeno porte.

Para reduzir custos:
- Use instâncias menores no Cloud SQL
- Configure escala automática agressiva no Cloud Run
- Use a camada gratuita de cada serviço quando possível