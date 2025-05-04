# Guia de CI/CD com Cloud Build para o Tarefo AI

O Google Cloud Build permite configurar um pipeline de CI/CD (Integração Contínua/Entrega Contínua) para automatizar o processo de build e deployment do Tarefo AI.

## Benefícios

1. **Automatização completa**: O código é testado, construído e implantado automaticamente
2. **Consistência**: Cada build segue o mesmo processo padronizado
3. **Integração com GitHub/GitLab**: Triggers automáticos quando código é enviado para o repositório
4. **Histórico de builds**: Rastreabilidade completa de todas as versões implantadas

## Como usar o Cloud Build

### 1. Configuração Inicial (única vez)

```bash
# Habilitar a API do Cloud Build
gcloud services enable cloudbuild.googleapis.com

# Conceder permissões necessárias ao Cloud Build
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding \
    [PROJECT_NUMBER]-compute@developer.gserviceaccount.com \
    --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

### 2. Configuração do Repositório

1. Conecte seu repositório Git (GitHub, GitLab, Bitbucket) no console do Cloud Build
2. Configure um trigger para iniciar builds automaticamente quando há push para determinadas branches

### 3. Build Manual

Se preferir executar o build manualmente:

```bash
gcloud builds submit --config=cloud-run/cloudbuild.yaml
```

### 4. Monitoramento

Acesse o histórico de builds em:
- Console GCP > Cloud Build > History
- Ou via CLI: `gcloud builds list`

## Opções de Trigger

### Build automático quando código é enviado para o repositório

No console do Cloud Build:
1. Vá para "Triggers"
2. Clique em "Create Trigger"
3. Selecione seu repositório
4. Configure para disparar em push para branch "main" ou "master"
5. Em Configuration, selecione "Cloud Build configuration file" e aponte para `cloud-run/cloudbuild.yaml`

### Build programado

Para fazer build regularmente (ex: semanalmente):

1. No console do Cloud Build, crie um novo trigger
2. Em "Trigger Type", selecione "Scheduled"
3. Configure a expressão cron (ex: `0 2 * * 1` para toda segunda às 2h da manhã)
4. Em Configuration, selecione "Cloud Build configuration file"

## Extensão para Múltiplos Ambientes

Para configurar builds para diferentes ambientes (dev, staging, prod):

1. Crie arquivos de configuração separados (ex: `cloudbuild-dev.yaml`, `cloudbuild-prod.yaml`)
2. Configure triggers diferentes para cada ambiente

Exemplo para ambiente de desenvolvimento:
- Trigger em push para branch "develop"
- Usa `cloudbuild-dev.yaml` que implanta no serviço "tarefo-ai-dev"

## Próximos Passos

1. Adicione testes automatizados antes do build
2. Configure notificações de build via Slack ou email
3. Implemente revisão manual antes do deployment para ambiente de produção