# TarefoAI com CrewAI

Esta é a implementação da arquitetura de agentes inteligentes do TarefoAI, utilizando o framework CrewAI.

## Visão Geral

O TarefoAI agora é composto por cinco agentes especializados, cada um responsável por uma área específica:

1. **Messaging Integration Specialist**: Gerencia comunicações via Telegram e WhatsApp
2. **Calendar Integration Engineer**: Integra com Google Calendar e Apple Calendar
3. **Reminder and Notification Coordinator**: Gerencia lembretes e notificações
4. **Document Processing Specialist**: Processa documentos e imagens usando OCR
5. **Privacy and Security Officer**: Garante conformidade com leis de proteção de dados

## Estrutura de Arquivos

```
tarefo_ai/
├── config/
│   ├── agents.yaml     # Configuração dos agentes
│   └── tasks.yaml      # Definição das tarefas
├── tools/
│   ├── ocr_tool.py     # Ferramenta para OCR
│   ├── telegram_tool.py # Ferramenta para Telegram
│   ├── whatsapp_tool.py # Ferramenta para WhatsApp
│   └── compliance_checker_tool.py # Ferramenta para conformidade
├── crew.py             # Implementação do CrewAI
├── main.py             # Ponto de entrada
├── requirements.txt    # Dependências Python
└── README.md           # Este arquivo
```

## Instalação

Para instalar as dependências necessárias:

```bash
python -m pip install -r tarefo_ai/requirements.txt
```

## Uso

O framework CrewAI é integrado ao sistema existente através do adaptador em `server/tarefo-ai-adapter.ts`.

## Tecnologias Utilizadas

- **CrewAI**: Framework para coordenação de agentes inteligentes
- **LangChain**: Biblioteca para construção de aplicações com LLMs
- **OpenAI**: Modelo de linguagem utilizado para os agentes (gpt-4o)
- **Telegram Bot API**: Para integração com Telegram
- **Twilio WhatsApp API**: Para integração com WhatsApp

## Status

Esta implementação está atualmente em desenvolvimento e sendo integrada ao sistema existente do TarefoAI.