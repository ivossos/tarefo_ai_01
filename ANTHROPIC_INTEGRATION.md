# Integração com Anthropic API

## Visão Geral

O TarefoAI foi atualizado para suportar múltiplos provedores de LLM, incluindo a Anthropic API. Esta integração permite o uso do modelo Claude-3-7-Sonnet, que oferece alto desempenho e pode servir como alternativa à OpenAI quando necessário.

## Configuração

### 1. Variáveis de Ambiente

A integração com a Anthropic requer a seguinte variável de ambiente:

```
ANTHROPIC_API_KEY=sua_chave_api_aqui
```

### 2. Configuração Automática

O sistema verificará automaticamente a disponibilidade de provedores LLM na seguinte ordem:

1. Anthropic API (ANTHROPIC_API_KEY)
2. OpenAI API (OPENAI_API_KEY) 
3. LLM Local (LOCAL_LLM_URL)

### 3. Arquivos de Configuração

Os seguintes arquivos foram criados/modificados para suportar a integração com a Anthropic:

- **tarefo_ai/config.py**: Configuração centralizada para adaptador LLM
- **tarefo_ai/config/config.yaml**: Configuração em formato YAML para o CrewAI

## Componentes Modificados

### Adaptador LLM

O adaptador LLM (`server/llm-adapter.ts`) foi atualizado para detectar automaticamente e usar o provedor Anthropic quando disponível. Ele implementa:

- Detecção automática de provedores disponíveis
- Fallback gracioso entre diferentes provedores
- Tratamento de erros específicos para cada provedor

### Adaptador CrewAI

O adaptador CrewAI (`tarefo_ai/crew.py`) foi atualizado para:

- Integrar com o LangChain + Anthropic
- Configurar os agentes com o provedor adequado
- Usar o modelo Claude-3-7-Sonnet quando disponível

## Testes

Vários scripts de teste foram implementados para verificar a integração:

- **scripts/test-with-anthropic.ts**: Testa a conexão direta com a API da Anthropic
- **scripts/update-llm-adapter.ts**: Atualiza a configuração do adaptador LLM
- Scripts de teste para cada agente (Message, Calendar, Reminders, OCR, Compliance)

## Benefícios

- **Flexibilidade**: Permite alternar facilmente entre provedores LLM
- **Resiliência**: Evita falhas quando um provedor específico atinge limites de cota
- **Desempenho**: O modelo Claude-3-7-Sonnet oferece excelente qualidade de resposta

## Resolução de Problemas

Se você encontrar problemas com a integração da Anthropic:

1. Verifique se a variável de ambiente ANTHROPIC_API_KEY está definida corretamente
2. Execute o script de teste `npx tsx scripts/test-with-anthropic.ts` para verificar a conectividade
3. Verifique os logs do servidor para mensagens de erro específicas