# Configuração de LLM Local para TarefoAI

Este documento explica como configurar o TarefoAI para usar um modelo de linguagem local (executado em sua própria máquina) em vez de depender de APIs de terceiros como OpenAI ou Anthropic.

## Benefícios do LLM Local

1. **Privacidade**: Seus dados nunca saem do seu computador
2. **Sem custos por requisição**: Use quantas vezes quiser sem preocupação com cobranças
3. **Sem limites de requisições (rate limits)**: Evite problemas de cotas ou timeouts
4. **Funciona offline**: Continue usando o TarefoAI mesmo sem conexão à internet
5. **Controle total**: Escolha o modelo e ajuste parâmetros como desejar

## Requisitos

- Computador com pelo menos 16GB de RAM (recomendado 32GB+ para modelos maiores)
- Aproximadamente 5-15GB de espaço em disco para o modelo escolhido
- [Ollama](https://ollama.ai/) instalado em sua máquina local ou servidor

## Guia de Instalação

### 1. Instale o Ollama

Visite [ollama.ai/download](https://ollama.ai/download) e instale o Ollama para seu sistema operacional.

### 2. Instale um Modelo Compatível

Abra o terminal ou prompt de comando e instale o modelo Qwen3:

```bash
# Para modelos menores (~4-7B parâmetros) - bom para laptops
ollama pull qwen:7b-q4_0

# Para melhor qualidade (~15B parâmetros) - requer mais RAM
ollama pull qwen3
```

### 3. Ou Configure Modelo Personalizado (Qwen3-32B-Q3_K_L.gguf)

Para configurar o modelo Qwen3-32B quantizado (melhor relação qualidade/desempenho):

1. Baixe o arquivo `Qwen3-32B-Q3_K_L.gguf` (disponível em plataformas como Hugging Face)
2. Crie um arquivo `Modelfile` com o seguinte conteúdo:
   ```
   FROM Qwen3-32B-Q3_K_L.gguf
   PARAMETER temperature 0.7
   PARAMETER context_length 8192
   ```
3. Execute no terminal (na pasta onde estão os arquivos):
   ```bash
   ollama create qwen3-32b-custom -f Modelfile
   ```

### 4. Execute o Modelo

Inicie o Ollama e o modelo com:

```bash
ollama run qwen3  # ou o nome do modelo que você configurou
```

Mantenha esta janela do terminal aberta enquanto estiver usando o TarefoAI.

### 5. Configure o TarefoAI

Edite o arquivo `.env` na raiz do projeto TarefoAI e adicione as seguintes variáveis:

```
LOCAL_LLM_URL=http://localhost:11434/v1
LOCAL_LLM_MODEL=qwen3  # ou o nome do seu modelo personalizado
```

Se você estiver utilizando LM Studio, RunPod, ou outro serviço compatível com a API OpenAI, ajuste a URL de acordo.

### 6. Teste a Conexão

Execute o script de teste para verificar se tudo está funcionando corretamente:

```bash
npx tsx server/test-local-llm.ts
```

## Executando em Ambiente de Produção com Replit

Para conectar o Replit ao seu LLM local:

1. Configure um túnel SSH usando ngrok:
   ```bash
   ngrok http 11434
   ```

2. Copie o URL fornecido pelo ngrok (ex: `https://a1b2c3d4.ngrok.io`)

3. No Replit, configure a variável de ambiente:
   ```
   LOCAL_LLM_URL=https://a1b2c3d4.ngrok.io/v1
   ```

4. Reinicie a aplicação no Replit

## Solução de Problemas

- **Erro de Conexão Recusada**: Verifique se o Ollama está em execução
- **Modelo não encontrado**: Verifique se o nome do modelo está correto e se foi instalado
- **Memória Insuficiente**: Tente um modelo menor ou aumente o swap do sistema
- **Resposta muito lenta**: Considere usar um modelo quantizado (como os modelos Q4 ou Q5)

## Modelos Recomendados para Português

- **Qwen3**: Excelente suporte para português, ótima qualidade de resposta
- **Llama3**: Boa qualidade e desempenho equilibrado
- **Mistral**: Bom para hardware mais limitado com respostas de qualidade
- **Gemma**: Opção leve da Google com suporte decente para português

Para mais informações, consulte a [documentação do Ollama](https://github.com/ollama/ollama/blob/main/docs/api.md).