# Capturas de Tela do Assistente de Configuração

Este documento mostra exemplos de como a interface do Assistente de Configuração do Tarefo AI se parece em cada etapa.

## Tela de Boas-vindas

```
┌────────────────────[ Assistente de Configuração do Tarefo AI ]─────────────────────┐
│                                                                                    │
│ Bem-vindo ao Assistente de Configuração do Tarefo AI!                              │
│                                                                                    │
│ Este assistente irá guiá-lo através do processo de configuração para deployment    │
│ no Google Cloud Platform. Cada etapa incluirá explicações detalhadas sobre as      │
│ opções disponíveis.                                                                │
│                                                                                    │
│ Pressione OK para começar.                                                         │
│                                                                                    │
│                                                                                    │
│                                                                                    │
│                                                                                    │
│                                    <OK>                                            │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 1: Configuração do Projeto GCP

```
┌────────────────────[ Etapa 1/9: Configuração do Projeto GCP ]─────────────────────┐
│                                                                                    │
│ Digite o ID do seu projeto no Google Cloud Platform:                               │
│                                                                                    │
│ [ℹ️ Dica: O ID do Projeto GCP é um identificador único para seu projeto no         │
│ Google Cloud Platform.                                                             │
│                                                                                    │
│ Formato válido: letras minúsculas, números, e hífens. Ex: tarefo-ai-prod          │
│                                                                                    │
│ Se você ainda não tem um projeto, vá ao Console do Google Cloud para criar um.]    │
│                                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────┐        │
│ │tarefo-ai-prod                                                           │        │
│ └─────────────────────────────────────────────────────────────────────────┘        │
│                                                                                    │
│                                <OK>        <Cancelar>                              │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 2: Seleção de Região

```
┌─────────────────────────[ Etapa 2/9: Seleção de Região ]──────────────────────────┐
│                                                                                    │
│ Selecione a região para deployment:                                                │
│                                                                                    │
│ [ℹ️ Dica: A região determina onde seus recursos serão hospedados fisicamente.      │
│                                                                                    │
│ Escolha a mais próxima dos seus usuários para obter menor latência.               │
│                                                                                    │
│ Para usuários no Brasil, recomendamos southamerica-east1 (São Paulo).]            │
│                                                                                    │
│   (*)  1  southamerica-east1 (São Paulo, Brasil (recomendado))                    │
│   ( )  2  us-central1 (Iowa, Estados Unidos)                                       │
│   ( )  3  us-east1 (Carolina do Sul, Estados Unidos)                              │
│   ( )  4  europe-west1 (Bélgica, Europa)                                          │
│   ( )  5  asia-east1 (Taiwan, Ásia)                                               │
│                                                                                    │
│                                <OK>        <Cancelar>                              │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 3: Nome do Serviço

```
┌──────────────────────────[ Etapa 3/9: Nome do Serviço ]──────────────────────────┐
│                                                                                   │
│ Digite o nome do serviço para o Cloud Run:                                        │
│                                                                                   │
│ [ℹ️ Dica: O nome do serviço é usado para identificar seu aplicativo no Cloud Run. │
│                                                                                   │
│ Recomendação: Use apenas letras minúsculas, números e hífens.                     │
│                                                                                   │
│ Exemplo: tarefo-ai]                                                               │
│                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐       │
│ │tarefo-ai                                                                │       │
│ └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                   │
│                                <OK>        <Cancelar>                             │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 4: Configuração do Banco de Dados

```
┌─────────────────────[ Etapa 4/9: Configuração do Banco de Dados ]─────────────────┐
│                                                                                    │
│ Digite o nome da instância do Cloud SQL:                                           │
│                                                                                    │
│ [ℹ️ Dica: Nome da instância do Cloud SQL (PostgreSQL).                              │
│                                                                                    │
│ Recomendação: Use apenas letras minúsculas, números e hífens.                      │
│                                                                                    │
│ Exemplo: tarefo-ai-db]                                                             │
│                                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────┐        │
│ │tarefo-ai-db                                                             │        │
│ └─────────────────────────────────────────────────────────────────────────┘        │
│                                                                                    │
│                                <OK>        <Cancelar>                              │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 5: URL do Webhook

```
┌────────────────────────────[ Etapa 5/9: URL do Webhook ]─────────────────────────┐
│                                                                                   │
│ Digite a URL base para webhooks (opcional):                                       │
│                                                                                   │
│ [ℹ️ Dica: URL base para webhooks (sem barras finais).                             │
│                                                                                   │
│ Exemplo: https://tarefo-ai-[unique-id].a.run.app                                 │
│                                                                                   │
│ Esta URL será usada para configurar webhooks do WhatsApp, Telegram e outros      │
│ serviços. Deixe em branco para configurar mais tarde.]                           │
│                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐       │
│ │https://tarefo-ai-prod.a.run.app                                         │       │
│ └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                   │
│                                <OK>        <Cancelar>                             │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Etapa 9: Resumo e Confirmação

```
┌───────────────────────[ Etapa 9/9: Resumo e Confirmação ]────────────────────────┐
│                                                                                   │
│ Resumo da Configuração:                                                           │
│                                                                                   │
│ • Projeto GCP: tarefo-ai-prod                                                     │
│ • Região: southamerica-east1                                                      │
│ • Nome do Serviço: tarefo-ai                                                      │
│ • Instância DB: tarefo-ai-db                                                      │
│ • URL Webhook: https://tarefo-ai-prod.a.run.app                                   │
│ • Prefixo Segredos: tarefo-ai                                                     │
│ • Monitoramento: Ativado                                                          │
│ • Alertas: Ativados                                                               │
│ • Escala Automática: Mín=1, Máx=10                                                │
│                                                                                   │
│ Deseja salvar esta configuração?                                                  │
│                                                                                   │
│                                                                                   │
│                                <Sim>        <Não>                                 │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Configuração Concluída

```
┌──────────────────────────[ Configuração Concluída ]───────────────────────────────┐
│                                                                                   │
│ A configuração foi salva com sucesso!                                             │
│                                                                                   │
│ Agora você pode usar o Deployment Manager para implantar o Tarefo AI usando       │
│ estas configurações.                                                              │
│                                                                                   │
│ Arquivo de configuração: deployment-config.json                                   │
│                                                                                   │
│                                                                                   │
│                                                                                   │
│                                    <OK>                                           │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Mensagem de Erro (Exemplo)

```
┌──────────────────────────────[ Erro de Validação ]───────────────────────────────┐
│                                                                                  │
│ O ID do projeto 'Tarefo AI' parece inválido.                                     │
│                                                                                  │
│ O ID do projeto deve conter apenas letras minúsculas, números e hífens, e não    │
│ pode começar ou terminar com hífen.                                              │
│                                                                                  │
│                                                                                  │
│                                                                                  │
│                                                                                  │
│                                    <OK>                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```