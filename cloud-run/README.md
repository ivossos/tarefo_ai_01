# Tarefo AI - Ferramentas de Deployment

Este diretório contém scripts e configurações para implantar o Tarefo AI no Google Cloud Platform.

## Visão Geral das Ferramentas

### Deployment Manager UI

O Tarefo AI inclui uma interface interativa para gerenciar todos os aspectos do deployment:

- **Interface interativa:** Menu de texto ou TUI (Text User Interface)
- **Configuração guiada:** Assistente de configuração com explicações detalhadas
- **Automação completa:** Scripts para facilitar o deployment e manutenção

### Configuration Wizard (Novo!)

O `config-wizard.sh` é um assistente interativo que guia você por todas as etapas necessárias para configurar o ambiente de deployment:

- Configuração passo-a-passo com 9 etapas
- Tooltips explicativos para cada opção
- Interface amigável baseada em texto
- Validação em tempo real das entradas

### Cost Estimator (Novo!)

O `cost-estimator.sh` é uma ferramenta que calcula os custos mensais estimados do Tarefo AI no Google Cloud:

- Estimativas detalhadas para cada componente de infraestrutura
- Opções para diferentes perfis de uso (pequeno a muito grande)
- Exportação de estimativas em formato JSON
- Cálculos precisos baseados nas taxas atuais do Google Cloud

### Progress Visualizer (Novo!)

O `progress-visualizer.sh` é uma ferramenta que exibe visualmente o progresso do deployment em tempo real:

- Animações interativas no terminal (spinners, barras de progresso)
- Visualização em tempo real de cada etapa do deployment
- Suporte para diferentes tipos de deployment (Cloud Run, Functions, etc.)
- Interface detalhada com opção de logs e resumo completo
- Links em tempo real para monitoramento no Google Cloud Console

### Implementation Wizard (Novo!)

O `implementation-wizard.sh` é um assistente completo para guiar todo o processo de implementação:

- Configuração passo a passo de todos os componentes
- Opções para implementação no Google Cloud Platform
- Suporte a múltiplas integrações (Telegram, WhatsApp, calendários)
- Geração de scripts ou configurações Terraform
- Personalização dos modelos de IA e recursos de infraestrutura

### Scripts de Deployment

- **`script-deploy.sh`**: Deploy principal usando Docker localmente
- **`deploy-without-docker.sh`**: Deploy usando Cloud Build (não precisa de Docker local)
- **`deploy-function.sh`**: Deploy de Cloud Functions para webhooks
- **`deploy-manager.sh`**: Interface unificada para todas as operações de deployment

### Scripts de Configuração

- **`setup-secrets.sh`**: Configura segredos no Secret Manager
- **`setup-database.sh`**: Configura o banco de dados PostgreSQL
- **`setup-scheduler.sh`**: Configura tarefas agendadas
- **`setup-monitoring.sh`**: Configura monitoramento e alertas

### Configurações CI/CD

- **`cloudbuild.yaml`**: Configuração para Google Cloud Build
- **`.github/workflows/deploy-to-cloud-run.yml`**: Configuração para GitHub Actions

### Infraestrutura como Código

- **`terraform/main.tf`**: Definição de infraestrutura com Terraform
- **`terraform/variables.tf`**: Variáveis para configuração do Terraform

## Como Começar

### Usando o Deployment Manager (Recomendado)

1. Navegue até o diretório principal:
   ```bash
   cd cloud-run
   ```

2. Torne o script executável:
   ```bash
   chmod +x deployment-ui/deployment-manager.sh
   ```

3. Execute o Deployment Manager:
   ```bash
   ./deployment-ui/deployment-manager.sh
   ```

4. Siga as instruções no menu interativo:
   - Selecione "1" para configurar o ambiente (inicia o assistente de configuração)
   - Selecione "2" para implantar a aplicação completa

### Usando o Configuration Wizard Diretamente

1. Torne o script executável:
   ```bash
   chmod +x deployment-ui/config-wizard.sh
   ```

2. Execute o assistente:
   ```bash
   ./deployment-ui/config-wizard.sh
   ```

3. Siga as etapas do assistente para configurar o ambiente.

### Usando Scripts Individuais

1. Configure o ambiente:
   ```bash
   # Com Docker localmente:
   ./script-deploy.sh
   
   # Sem Docker localmente (usando Cloud Build):
   ./deploy-without-docker.sh
   ```

2. Implante a Cloud Function:
   ```bash
   ./deploy-function.sh
   ```

## Requisitos

- Google Cloud SDK (gcloud) instalado
- Acesso a um projeto Google Cloud
- bash 3.2 ou superior
- whiptail (recomendado para interface interativa)

## Documentação Adicional

- **[config-wizard-guide.md](deployment-ui/config-wizard-guide.md)**: Guia detalhado do assistente de configuração
- **[screenshots.md](deployment-ui/screenshots.md)**: Exemplos visuais da interface do assistente
- **[cost-estimator-guide.md](deployment-ui/cost-estimator-guide.md)**: Guia para o estimador de custos
- **[cost-estimator-screenshots.md](deployment-ui/cost-estimator-screenshots.md)**: Exemplos visuais do estimador
- **[progress-visualizer-guide.md](deployment-ui/progress-visualizer-guide.md)**: Guia para o visualizador de progresso
- **[progress-visualizer-screenshots.md](deployment-ui/progress-visualizer-screenshots.md)**: Exemplos visuais do visualizador
- **[terraform-guide.md](terraform/terraform-guide.md)**: Guia para uso do Terraform
- **[cloud-build-guide.md](cloud-build-guide.md)**: Guia para uso do Cloud Build
- **[github-actions-guide.md](../.github/github-actions-guide.md)**: Guia para uso do GitHub Actions