# Guia de Usuário Avançado - TarefoAI

## Introdução

Bem-vindo ao guia de usuário avançado do TarefoAI! Este documento foi criado para ajudar usuários experientes a testar e aproveitar ao máximo todas as funcionalidades do sistema, incluindo recursos avançados como integração de calendário, assistente de voz e muito mais.

## Funcionalidades Principais

### 1. Assistente de Voz

O TarefoAI agora conta com um assistente de voz totalmente integrado que permite controlar a aplicação e obter informações por comandos de voz.

#### Como acessar:
- Navegue até `/voice-assistant` após fazer login
- Ou use o botão flutuante de microfone disponível em qualquer página

#### Comandos de voz disponíveis:
- "Quais são minhas tarefas para hoje?" - Lista seus eventos do dia
- "Agendar reunião" - Inicia o processo de criação de evento
- "Criar lembrete" - Adiciona um novo lembrete
- "Ligar para [contato]" - Realiza uma chamada telefônica (requer integração com Twilio)
- "Resumir mensagens" - Fornece um resumo de mensagens recentes

#### Dicas para teste:
- O assistente funciona melhor em navegadores modernos (Chrome, Edge, Safari)
- Fale de forma clara e natural, evitando ruídos de fundo
- Para testes, verifique se seu microfone está funcionando corretamente
- Na página de configurações, você pode personalizar a voz do assistente

### 2. Integração de Calendário

O TarefoAI oferece sincronização bidirecional com Google Calendar e Apple Calendar.

#### Para testar:
1. Navegue até `/calendar-integration`
2. Conecte sua conta do Google e/ou Apple
3. Teste a sincronização manual ou automática
4. Verifique se eventos criados no TarefoAI aparecem no seu calendário externo
5. Confirme se eventos do calendário externo são importados para o TarefoAI

#### Comandos de API úteis para desenvolvedores:
- `GET /api/calendar/status` - Verifica status da integração
- `POST /api/calendar/google/sync` - Força sincronização com Google Calendar
- `POST /api/calendar/apple/sync` - Força sincronização com Apple Calendar

### 3. Notificações e Mensagens

O TarefoAI possui um sistema robusto de notificações e mensagens que funciona através de múltiplos canais.

#### Canais de mensagens disponíveis:
- Chat interno da aplicação
- Telegram (@TarefoAI_bot)
- WhatsApp (via número registrado)
- SMS (via Twilio)

#### Para testar integração com Telegram:
1. Procure por @TarefoAI_bot no Telegram
2. Inicie uma conversa com o bot
3. Verifique a página `/message-integration` para finalizar a conexão
4. Teste comandos como "Quais são meus eventos hoje?" ou "Lembre-me de comprar leite amanhã"

### 4. Ferramenta de Teste de Agentes

O TarefoAI utiliza uma arquitetura multi-agente baseada no framework CrewAI.

#### Agentes disponíveis:
- **Message Agent**: Processa e responde a mensagens de usuários
- **Calendar Agent**: Gerencia eventos e compromissos
- **Reminders Agent**: Cria e gerencia lembretes
- **OCR Agent**: Processa imagens e extrai texto
- **Compliance Agent**: Verifica conformidade das mensagens

#### Como testar os agentes individualmente:
1. Acesse `/bot-tester` (usuários avançados)
2. Selecione o agente que deseja testar
3. Envie mensagens de teste para verificar o comportamento

## Login de Administrador

O TarefoAI possui um painel de administração com funcionalidades exclusivas para gerenciamento do sistema.

### Acesso ao Painel Admin:
- URL: `/admin-login` ou `/admin` (redireciona para login se não autenticado)
- Credenciais de administrador:
  - Usuário: `system_admin`
  - Senha: `808120`

### Funcionalidades do Painel Admin:
- Visualização e gerenciamento de todos os usuários
- Monitoramento de uso do sistema
- Configuração de parâmetros do LLM (seleção de modelo, configurações)
- Logs do sistema e estatísticas
- Reset e manutenção do banco de dados

> **IMPORTANTE**: Utilize o acesso de administrador apenas para testes e configurações. Não compartilhe as credenciais.

## Recursos para Desenvolvedores

### Rotas de API principais:

#### Eventos:
- `GET /api/events` - Lista todos eventos do usuário
- `GET /api/events/date?date=YYYY-MM-DD` - Eventos de uma data específica
- `POST /api/events` - Cria um novo evento
- `PUT /api/events/:id` - Atualiza um evento existente
- `DELETE /api/events/:id` - Remove um evento

#### Lembretes:
- `GET /api/reminders/upcoming` - Próximos lembretes
- `POST /api/reminders` - Cria um novo lembrete
- `PUT /api/reminders/:id` - Atualiza um lembrete
- `DELETE /api/reminders/:id` - Remove um lembrete

#### Voz:
- `GET /api/voice/status` - Verifica status do serviço de voz
- `POST /api/voice/twiml` - Endpoint TwiML para chamadas telefônicas

### WebSockets:

O TarefoAI utiliza WebSockets para comunicação em tempo real:

- Conexão de voz: `ws://[servidor]/ws/voice`
- Protocolo: Primeira mensagem deve ser um JSON com `{userId: number}`
- Tipos de mensagens: `transcription`, `ai_response`, `connection`, `status`, `error`, `call_status`

## Resolução de Problemas

### Assistente de Voz:
- **Problema**: Microfone não funciona
  **Solução**: Verifique permissões do navegador e configure o microfone correto

- **Problema**: Transcrição incorreta
  **Solução**: Fale mais devagar e claramente, em ambiente sem ruído

### Integração de Calendário:
- **Problema**: Eventos não sincronizam
  **Solução**: Verifique status da conexão em `/calendar-integration` e reconecte se necessário

### Notificações:
- **Problema**: Não recebe mensagens no Telegram/WhatsApp
  **Solução**: Verifique status da conexão em `/message-integration` e reconecte

## Feedback e Contato

Caso encontre qualquer problema ou tenha sugestões, por favor:
- Use a seção de Ajuda dentro do aplicativo
- Envie um e-mail para suporte@tarefoai.com
- Reporte bugs detalhados incluindo passos para reproduzir

---

*Este documento é destinado apenas para usuários avançados e testadores. Algumas funcionalidades podem estar em fase beta.*