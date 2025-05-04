# Guia do Assistente de Implementação (Implementation Wizard)

O Assistente de Implementação do Tarefo AI é uma ferramenta completa projetada para guiar você pelo processo de configuração e deployment do Tarefo AI no Google Cloud Platform, simplificando cada etapa e garantindo uma implementação correta.

## Visão Geral

O Implementation Wizard automatiza e simplifica o processo de:
- Configuração do projeto GCP
- Instalação do banco de dados PostgreSQL
- Configuração do serviço Cloud Run
- Deployment das Cloud Functions
- Integração com serviços externos
- Configuração dos modelos de IA
- Geração de infraestrutura como código (Terraform)

## Pré-requisitos

- Google Cloud SDK (`gcloud`) instalado e configurado
- Utilitário `jq` para processamento de JSON
- Acesso de administrador ao projeto GCP
- Terminal Bash (Linux, macOS) ou Git Bash/WSL (Windows)

## Como Usar

### Executando o Assistente

1. Navegue até o diretório do assistente:
   ```bash
   cd cloud-run/deployment-ui
   ```

2. Torne o script executável:
   ```bash
   chmod +x implementation-wizard.sh
   ```

3. Execute o assistente:
   ```bash
   ./implementation-wizard.sh
   ```

### Etapas do Assistente

O assistente guiará você por sete etapas principais:

1. **Configuração do Projeto GCP**
   - Definição do ID do projeto
   - Seleção de região para deployment

2. **Configuração do Banco de Dados**
   - Escolha do tipo e tamanho da instância PostgreSQL
   - Configuração de versão e parâmetros do banco de dados

3. **Configuração do Cloud Run**
   - Definição de recursos (memória, CPU)
   - Configuração de escalabilidade automática

4. **Configuração das Cloud Functions**
   - Configuração de funções para webhooks
   - Configuração de funções para tarefas agendadas

5. **Configuração das Integrações**
   - Integração com Telegram, WhatsApp e SMS
   - Integração com Google Calendar e Apple Calendar
   - Integração com APIs bancárias (Open Banking)

6. **Configuração dos Modelos de IA**
   - Seleção do provedor principal (OpenAI, Anthropic, Google)
   - Configuração de modelo de fallback para alta disponibilidade

7. **Resumo e Implementação**
   - Revisão de todas as configurações
   - Opções para deployment:
     - Implementar com visualizador de progresso
     - Gerar configuração Terraform
     - Gerar script de implementação
     - Salvar configuração para uso posterior

## Arquivos Gerados

- **implementation-config.json**: Armazena todas as configurações escolhidas
- **terraform_config/main.tf**: Configuração de infraestrutura Terraform (quando selecionado)
- **implement-tarefo-ai.sh**: Script de implementação (quando selecionado)
- **implementation-wizard.log**: Registro de todas as ações realizadas

## Opções de Implementação

### 1. Implementar com Visualizador de Progresso

Utiliza o Visualizador de Progresso Animado para mostrar cada etapa do processo de deployment com animações em tempo real. Esta opção oferece feedback visual contínuo durante a implementação.

### 2. Implementar com Terraform

Gera arquivos de configuração Terraform que definem toda a infraestrutura como código. Ideal para ambientes que seguem práticas DevOps e IaC (Infraestrutura como Código).

### 3. Gerar Script de Implementação

Cria um script Bash que contém todos os comandos `gcloud` necessários para implementar a infraestrutura. Útil quando você deseja revisar, modificar ou agendar a implementação para um momento posterior.

### 4. Salvar Configuração e Sair

Salva todas as configurações no arquivo JSON para uso posterior sem realizar nenhuma ação imediata.

## Configurações Avançadas

O assistente permite personalizar componentes-chave:

- **Tipos de Máquina**: De instâncias pequenas para desenvolvimento até grandes para produção
- **Escalabilidade**: Configuração de instâncias mínimas e máximas para gerenciar carga
- **Modelos de IA**: Seleção entre diversos modelos com diferentes capacidades e custos
- **Integrações**: Ativação apenas das integrações necessárias para o seu caso de uso

## Dicas de Uso

- **Projeto Novo vs. Existente**: Se usar um projeto existente, verifique se as APIs necessárias estão habilitadas
- **Custos**: Utilize a ferramenta Cost Estimator para estimar os custos antes da implementação
- **Segurança**: Para produção, considere habilitar VPC e Identity-Aware Proxy nas configurações avançadas
- **Rollback**: Anote o ID do projeto e os nomes dos recursos para facilitar a limpeza, se necessário

## Solução de Problemas

- **Erro de Permissão**: Verifique se sua conta tem permissões de administrador no projeto GCP
- **APIs Desabilitadas**: O assistente tentará habilitar as APIs necessárias, mas algumas podem requerer ativação manual
- **Falha na Implementação**: Consulte os arquivos de log para diagnóstico detalhado
- **Erro de Quota**: Se encontrar limites de quota, solicite aumento no console do GCP