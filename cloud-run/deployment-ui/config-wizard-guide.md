# Guia do Assistente de Configuração do Tarefo AI

O Assistente de Configuração (Configuration Wizard) do Tarefo AI é uma ferramenta interativa que guia você passo a passo no processo de configuração para deployment no Google Cloud Platform.

## Visão Geral

Este assistente utiliza uma interface de texto interativa com explicações detalhadas (tooltips) para cada opção, tornando o processo de configuração simples mesmo para usuários sem experiência prévia com Google Cloud.

## Características Principais

- **Interface interativa baseada em texto** usando whiptail
- **Explicações detalhadas** para cada opção
- **Validação em tempo real** das entradas
- **Configuração em etapas** para não sobrecarregar o usuário
- **Possibilidade de voltar** e corrigir configurações
- **Resumo detalhado** antes da confirmação final
- **Salva o progresso** permitindo continuar de onde parou

## Pré-requisitos

- bash (versão 3.2 ou superior)
- whiptail (para interface interativa)
- Google Cloud SDK (gcloud) instalado

## Etapas do Assistente

O assistente guia você por 9 etapas de configuração:

### 1. Configuração do Projeto GCP
- Defina o ID do projeto do Google Cloud
- Receba dicas sobre formato válido e como criar um projeto

### 2. Seleção de Região
- Escolha a região do Google Cloud para hospedar a aplicação
- Veja explicações sobre latência e proximidade aos usuários

### 3. Nome do Serviço
- Configure o nome do serviço para o Cloud Run
- Receba orientações sobre nomenclatura e padrões

### 4. Configuração do Banco de Dados
- Defina o nome da instância do Cloud SQL (PostgreSQL)
- Entenda as opções de configuração e recomendações

### 5. URL do Webhook
- Configure a URL base para webhooks do WhatsApp e Telegram
- Opcional: pode ser configurado posteriormente

### 6. Prefixo para Segredos
- Defina um prefixo para organizar segredos no Secret Manager
- Melhore a organização e segurança de credenciais

### 7. Monitoramento e Alertas
- Ative ou desative o monitoramento e alertas
- Entenda as vantagens de cada opção

### 8. Configuração de Escala Automática
- Configure o número mínimo e máximo de instâncias
- Entenda o impacto no desempenho e nos custos

### 9. Resumo e Confirmação
- Veja um resumo completo de todas as configurações
- Confirme para salvar ou volte para fazer ajustes

## Como Usar

Existem duas formas de acessar o assistente:

### Pelo Deployment Manager
1. Execute o `deployment-manager.sh`
2. Selecione a opção "1" (Configurar ambiente de implantação)
3. O assistente será iniciado automaticamente

### Diretamente
1. Torne o script executável:
   ```bash
   chmod +x cloud-run/deployment-ui/config-wizard.sh
   ```
2. Execute o script:
   ```bash
   ./cloud-run/deployment-ui/config-wizard.sh
   ```

## Salvamento da Configuração

Ao concluir o assistente, a configuração será salva em um arquivo JSON chamado `deployment-config.json`. Este arquivo será utilizado por todas as ferramentas de deployment do Tarefo AI.

## Voltar e Corrigir Configurações

Em qualquer etapa do assistente, você pode:
- Pressionar `<Cancelar>` para voltar à etapa anterior
- Continuar pressionando `<Cancelar>` em cada etapa para voltar quantas etapas precisar
- Se pressionar `<Cancelar>` na primeira etapa, o assistente será encerrado sem salvar

## Continuar de Onde Parou

O assistente salva seu progresso automaticamente. Se sair no meio do processo, ao iniciar novamente, ele continuará da última etapa em que estava.

## Dicas de Uso

- **Projeto GCP**: Tenha um projeto criado no Google Cloud Console antes de começar
- **Região**: Escolha a região mais próxima dos seus usuários para reduzir latência
- **Escala Automática**: Para ambiente de produção, recomendamos manter pelo menos 1 instância sempre ativa
- **Monitoramento**: Recomendamos ativar para ambientes de produção

## Solução de Problemas

- **Erro com whiptail**: Instale-o com `sudo apt-get install whiptail` (Linux) ou `brew install newt` (macOS)
- **Configuração não salva**: Verifique permissões de escrita no diretório atual
- **Valores incorretos após configuração**: Edite manualmente o arquivo `deployment-config.json`