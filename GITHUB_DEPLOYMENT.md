# Deployment do TarefoAI via GitHub Actions

Este guia fornece instruções detalhadas para realizar o deployment do TarefoAI no Google Cloud Platform usando o GitHub Actions.

## Pré-requisitos

1. Uma conta no GitHub
2. Uma conta no Google Cloud Platform com o projeto "tarefoai" já criado
3. A conta de serviço do Google Cloud com as permissões adequadas

## Passos para Deployment

### 1. Preparar o repositório no GitHub

1. Crie um novo repositório no GitHub (público ou privado)
2. Faça o upload do código do TarefoAI para este repositório

```bash
git init
git add .
git commit -m "Versão inicial do TarefoAI"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/tarefoai.git
git push -u origin main
```

### 2. Configurar as credenciais e secrets no GitHub

1. No seu repositório GitHub, acesse "Settings" > "Secrets and variables" > "Actions"
2. Clique em "New repository secret"
3. Adicione os seguintes secrets:

| Nome do Secret | Descrição |
|----------------|-----------|
| `GOOGLE_CREDENTIALS` | Conteúdo completo do arquivo de chave JSON da conta de serviço |
| `POSTGRES_URL` | URL de conexão do PostgreSQL |
| `OPENAI_API_KEY` | Chave da API do OpenAI |
| `TELEGRAM_BOT_TOKEN` | Token do bot do Telegram |
| `TWILIO_ACCOUNT_SID` | SID da conta do Twilio |
| `TWILIO_AUTH_TOKEN` | Token de autenticação do Twilio |
| `TWILIO_PHONE_NUMBER` | Número de telefone do Twilio |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do Google |
| `GOOGLE_CLIENT_SECRET` | Secret do cliente OAuth do Google |
| `GOOGLE_REDIRECT_URL` | URL de redirecionamento do OAuth do Google |
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic |

### 3. Iniciar o deployment

#### Opção 1: Automático (ao dar push no repositório)
O workflow está configurado para iniciar automaticamente quando você faz push para a branch `main`. Portanto, qualquer mudança que você enviar para o GitHub acionará o deployment.

#### Opção 2: Manual
1. No seu repositório GitHub, acesse a aba "Actions"
2. Selecione o workflow "Deploy TarefoAI to Cloud Run" na barra lateral
3. Clique no botão "Run workflow" > "Run workflow"

### 4. Monitorar o processo de deployment

1. Acesse a aba "Actions" no seu repositório GitHub
2. Clique no workflow em execução "Deploy TarefoAI to Cloud Run"
3. Acompanhe em tempo real o progresso do deployment

### 5. Verificar o deployment

Após a conclusão bem-sucedida do deployment:

1. O URL do serviço será exibido nos logs de saída do workflow
2. Acesse o serviço implantado através do URL fornecido
3. Verifique se o webhook do Telegram foi configurado corretamente

## Solução de problemas

### Erros comuns e soluções:

1. **Permissões insuficientes**
   - Verifique se a conta de serviço tem as seguintes permissões:
     - Cloud Run Admin
     - Cloud Build Service Account
     - Storage Admin
     - Service Account User

2. **Falha na construção da imagem**
   - Verifique o Dockerfile para garantir que está configurado corretamente
   - Verifique os logs no Cloud Build Console

3. **Falha no deployment no Cloud Run**
   - Verifique se as APIs necessárias estão habilitadas
   - Confirme os limites de recursos especificados (1Gi de memória, 4 CPUs)

4. **Erro de configuração de webhook do Telegram**
   - Garanta que o token do bot do Telegram está correto
   - Verifique se o endpoint do webhook está acessível publicamente

## Recursos adicionais

- [Documentação do Google Cloud Run](https://cloud.google.com/run/docs)
- [Documentação do GitHub Actions](https://docs.github.com/en/actions)
- [Guia de autenticação do Google Cloud](https://cloud.google.com/docs/authentication/getting-started)

## Suporte

Em caso de dúvidas ou problemas durante o processo de deployment, consulte:

1. Os logs detalhados na aba "Actions" do GitHub
2. O console do Google Cloud Platform para verificar logs de build e execução
3. A documentação oficial do TarefoAI para referência específica da aplicação