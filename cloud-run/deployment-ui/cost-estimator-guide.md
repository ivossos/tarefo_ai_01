# Guia do Estimador de Custos do Tarefo AI

O Estimador de Custos é uma ferramenta que ajuda a prever os custos mensais de execução do Tarefo AI no Google Cloud Platform com base nas configurações de deployment e no volume de uso esperado.

## Visão Geral

Esta ferramenta realiza cálculos detalhados para estimar os custos dos vários componentes de infraestrutura do Tarefo AI, incluindo:

- Cloud Run (aplicação principal)
- Cloud SQL (banco de dados PostgreSQL)
- Cloud Functions (webhooks)
- Cloud Storage (armazenamento)
- Secret Manager (segredos)
- Network Transfer (transferência de dados)
- Cloud Monitoring (monitoramento)

## Características Principais

- **Interface interativa**: Menu de texto usando whiptail
- **Cálculos precisos**: Baseados nas taxas atuais do Google Cloud
- **Estimativas personalizadas**: Ajuste os parâmetros para diferentes cenários
- **Exportação de resultados**: Salve as estimativas em formato JSON
- **Diferentes perfis de uso**: Pequeno, médio, grande e muito grande

## Pré-requisitos

- bash (versão 3.2 ou superior)
- whiptail (para interface interativa)
- bc (para cálculos)
- jq (opcional, para formatação de saída)

## Como Usar

### Pelo Deployment Manager
1. Execute o `deployment-manager.sh`
2. Selecione a opção "1" (Configurar ambiente de implantação)
3. No submenu, selecione "2" (Estimador de Custos)

### Diretamente
1. Torne o script executável:
   ```bash
   chmod +x cloud-run/deployment-ui/cost-estimator.sh
   ```
2. Execute o script:
   ```bash
   ./cloud-run/deployment-ui/cost-estimator.sh
   ```

## Fluxo de Uso

### 1. Tela de Boas-vindas
Introdução à ferramenta e seus objetivos.

### 2. Menu Principal
- **Criar nova estimativa**: Inicia o processo de estimativa de custos
- **Mostrar última estimativa**: Exibe novamente a última estimativa calculada
- **Exportar estimativa (JSON)**: Salva a estimativa em um arquivo JSON
- **Sair**: Encerra a ferramenta

### 3. Coleta de Informações
Quando você cria uma nova estimativa, a ferramenta solicitará informações sobre:

#### a) Usuários Diários
Escolha entre:
- Até 50 usuários por dia (pequeno)
- Até 200 usuários por dia (médio)
- Até 1.000 usuários por dia (grande)
- Até 5.000 usuários por dia (muito grande)

#### b) Tipo de Instância do Cloud SQL
Escolha entre:
- db-f1-micro: Shared-core, 1 vCPU, 614MB (pequeno, ~$8/mês)
- db-g1-small: Shared-core, 1 vCPU, 1.7GB (médio, ~$28/mês)
- db-custom-1-3840: 1 vCPU, 3.75GB (dedicado, ~$52/mês)
- db-custom-2-7680: 2 vCPU, 7.5GB (grande, ~$105/mês)

#### c) Armazenamento do Banco de Dados
Escolha entre:
- 10 GB (pequeno, ~$1,70/mês)
- 20 GB (médio, ~$3,40/mês)
- 50 GB (grande, ~$8,50/mês)
- 100 GB (muito grande, ~$17/mês)

#### d) Transferência de Dados Mensal
Escolha entre:
- Até 10 GB/mês (pequeno, gratuito)
- Até 50 GB/mês (médio, ~$5/mês)
- Até 100 GB/mês (grande, ~$11/mês)
- Até 500 GB/mês (muito grande, ~$59/mês)

### 4. Resultados da Estimativa
A ferramenta apresenta um detalhamento dos custos estimados:

- Cloud Run (App principal)
- Cloud SQL (PostgreSQL)
- Transferência de rede
- Cloud Functions (Webhooks)
- Monitoramento e alertas
- Secret Manager
- Outros (10% buffer)
- **Total estimado mensal**

O resultado também inclui informações sobre a configuração utilizada para a estimativa.

### 5. Exportação
Você pode exportar a estimativa para um arquivo JSON que inclui:
- Data da estimativa
- Detalhamento dos custos
- Configuração utilizada para os cálculos

## Entendendo os Resultados

### Fatores que Afetam o Custo

- **Número de usuários**: Mais usuários geram mais requisições e tráfego
- **Tipo da instância DB**: Instâncias mais potentes custam mais
- **Armazenamento**: Custos de armazenamento são proporcionais ao volume
- **Configuração de auto-scaling**: Mínimo de instâncias sempre ativas aumenta o custo básico
- **Transferência de dados**: Tráfego de saída acima de 10GB é cobrado

### Considerações Importantes

- **Cold Starts**: Se o mínimo de instâncias for 0, há economia, mas ao custo de "cold starts" (tempo de inicialização)
- **Tier Gratuito**: O Google Cloud oferece limites gratuitos para vários serviços, que são considerados nos cálculos
- **Variabilidade**: Os custos reais podem variar com base na utilização exata

## Dicas para Otimização de Custos

- **Escala a zero**: Para ambientes de desenvolvimento ou com pouco uso
- **Instância DB mínima**: Use db-f1-micro para ambientes com pouco tráfego
- **Reduza transferência**: Implemente caching eficiente para reduzir tráfego de saída
- **Configure alertas de orçamento**: No Google Cloud para evitar surpresas
- **Monitore uso**: Verifique regularmente os custos reais no console do Google Cloud

## Limitações

- Estimativas são aproximadas e podem variar dos custos reais
- Preços do Google Cloud podem mudar
- Não considera necessidades específicas de recursos da sua aplicação
- Baseado em padrões típicos de uso, mas cada aplicação é única