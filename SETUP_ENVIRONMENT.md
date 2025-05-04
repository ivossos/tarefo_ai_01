# Configuração do Ambiente

Este documento explica como configurar corretamente o ambiente de desenvolvimento para o Tarefo AI.

## Variáveis de Ambiente

Para garantir a segurança, as credenciais e chaves de API foram removidas do código-fonte. Você precisará configurar essas credenciais através de variáveis de ambiente.

### Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# API da Anthropic (Claude)
ANTHROPIC_API_KEY=sua_chave_api_aqui

# Configurações do Banco de Dados
DATABASE_URL=sua_string_conexao_aqui

# Telegram Bot
TELEGRAM_BOT_TOKEN=token_do_bot_aqui

# Twilio (opcional - para SMS)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_twilio

# Google Cloud (opcional - para deploy)
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/sua/chave.json
```

### Google Cloud Service Account

Para funcionalidades do Google Cloud Platform, você precisa:

1. Criar uma conta de serviço no GCP
2. Gerar uma chave privada
3. Substituir o conteúdo dos arquivos de credenciais:
   - `cloud-run/service-account-key.json`
   - `cloud-run/service-account-key-fixed.json`

## Dependências

Instale as dependências do projeto:

```bash
# Dependências do Node.js
npm install

# Dependências do Python (para CrewAI)
cd tarefo_ai
pip install -r requirements.txt
```

## Execução

Após configurar as variáveis de ambiente e instalar as dependências, você pode iniciar o projeto:

```bash
npm run dev
```

O servidor será iniciado na porta 5000.