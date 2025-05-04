# TarefoAI

TarefoAI é um assistente pessoal inteligente desenvolvido para otimizar sua produtividade, especialmente útil para pessoas com TDAH. 

## Visão Geral

O TarefoAI funciona como um assistente conversacional que ajuda a gerenciar:
- Eventos e compromissos de calendário
- Lembretes e notificações
- Processamento de documentos e recibos
- Comunicação através de múltiplos canais (App, Telegram, WhatsApp)

A aplicação foi projetada com foco em acessibilidade, facilidade de uso e compatibilidade com dispositivos móveis.

## Arquitetura

O sistema utiliza uma arquitetura de agentes inteligentes distribuídos, alimentados por modelos de linguagem avançados:

### Framework CrewAI

A aplicação implementa o framework CrewAI para gerenciar cinco agentes especializados:

1. **Messaging Integration Specialist**: Gerencia comunicações via Telegram e WhatsApp
2. **Calendar Integration Engineer**: Integra com Google Calendar e Apple Calendar
3. **Reminder and Notification Coordinator**: Gerencia lembretes e notificações
4. **Document Processing Specialist**: Processa documentos e imagens usando OCR
5. **Privacy and Security Officer**: Garante conformidade com leis de proteção de dados

### Stack Tecnológico

**Frontend:**
- React com TypeScript
- TailwindCSS e Shadcn/UI para componentes
- React Query para gerenciamento de estado

**Backend:**
- Node.js com Express
- TanStack Query para comunicação API
- PostgreSQL com Drizzle ORM
- Múltiplas opções de LLM:
  - OpenAI (gpt-4o)
  - Anthropic (claude-3-7-sonnet)
  - xAI (grok-2)
  - Modelos locais (Qwen3, Llama3, etc)

**Integração de Serviços:**
- Telegram Bot API
- Twilio WhatsApp API
- Google Calendar API
- OpenAI API para LLM e processamento de voz

## Começando

### Pré-requisitos

- Node.js 18+
- Python 3.8+
- PostgreSQL
- Pelo menos UMA destas opções:
  - OpenAI API Key
  - Anthropic API Key
  - xAI/Grok API Key
  - Servidor LLM local (via Ollama, LM Studio, etc)
- Opcionalmente:
  - Telegram Bot Token (para integração com Telegram)
  - Twilio API (para integração com WhatsApp)

### Instalação

1. Clone o repositório
2. Instale as dependências do Node.js:
   ```
   npm install
   ```
3. Instale as dependências Python para o CrewAI:
   ```
   python -m pip install -r tarefo_ai/requirements.txt
   ```
4. Configure as variáveis de ambiente (crie um arquivo .env na raiz do projeto):
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/tarefo_ai
   
   # Escolha pelo menos uma destas opções de LLM:
   OPENAI_API_KEY=sua-chave-api-openai
   # ANTHROPIC_API_KEY=sua-chave-api-anthropic
   # XAI_API_KEY=sua-chave-api-xai
   # LOCAL_LLM_URL=http://localhost:11434/v1
   # LOCAL_LLM_MODEL=qwen3
   
   # Integrações de mensageria (opcionais):
   TELEGRAM_BOT_TOKEN=seu-token-telegram-bot
   TWILIO_ACCOUNT_SID=seu-account-sid-twilio
   TWILIO_AUTH_TOKEN=seu-auth-token-twilio
   TWILIO_PHONE_NUMBER=seu-numero-twilio
   ```
   
   Para configurar um LLM local (sem depender de APIs externas), consulte [docs/CONFIGURAR_LLM_LOCAL.md](docs/CONFIGURAR_LLM_LOCAL.md)
   
### Execução

Para iniciar a aplicação em modo de desenvolvimento:

```
npm run dev
```

### Testes de Agentes

O TarefoAI possui scripts de teste para verificar o funcionamento dos agentes especializados:

```bash
# Testar todos os agentes de uma vez
npx tsx scripts/test-all-agents.ts

# Ou testar agentes individualmente:
npx tsx scripts/test-message-agent.ts    # Testa o agente de mensagens
npx tsx scripts/test-calendar-agent.ts   # Testa o agente de calendário
npx tsx scripts/test-reminders-agent.ts  # Testa o agente de lembretes
npx tsx scripts/test-ocr-agent.ts        # Testa o agente de OCR
npx tsx scripts/test-compliance-agent.ts # Testa o agente de conformidade
```

Os testes verificam a comunicação com o sistema CrewAI e a correta execução de cada um dos agentes especializados.

## Funcionalidades

- **Acompanhamento e Gestão de Tarefas:** O TarefoAI monitora suas tarefas e ajuda a priorizá-las, enviando lembretes oportunos.
- **Integração Multi-Canal:** Interaja com o assistente via aplicativo web, Telegram ou WhatsApp.
- **Processamento de Imagens:** Extraia informações de recibos e documentos através de OCR.
- **Conformidade LGPD/GDPR:** Validação automática de conformidade para operações de dados.
- **Gestão de Calendário:** Sincronize e gerencie eventos entre Google Calendar e calendário local.

## Segurança e Privacidade

O TarefoAI foi desenvolvido seguindo rigorosos padrões de segurança e privacidade:

- Criptografia de dados em trânsito e em repouso
- Autenticação de dois fatores para acesso
- Validação de conformidade com LGPD/GDPR
- Permissões granulares baseadas em funções
- Logs de auditoria para acesso a dados sensíveis

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit de suas mudanças (`git commit -m 'Adiciona funcionalidade X'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.