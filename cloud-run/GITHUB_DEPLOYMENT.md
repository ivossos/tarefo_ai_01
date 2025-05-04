# Deployment do Tarefo AI via GitHub Actions e Cloud Build

Este documento explica como configurar o deployment automatizado do Tarefo AI usando GitHub Actions e Google Cloud Build.

## Pré-requisitos

1. Repositório no GitHub com o código do Tarefo AI
2. Projeto configurado no Google Cloud Platform (tarefoai)
3. APIs necessárias habilitadas no GCP
4. Banco de dados PostgreSQL configurado

## Configuração do Workload Identity Federation

Para permitir que o GitHub Actions interaja com o Google Cloud Platform de forma segura, você precisa configurar o Workload Identity Federation:

```bash
# Criar pool de identidade de workload
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --description="GitHub Actions pool" \
  --display-name="GitHub Actions pool"

# Criar um provedor de identidade no pool
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Obtenha o nome completo do pool
WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
  --location="global" \
  --format="value(name)")

# Criar uma conta de serviço para o GitHub Actions
gcloud iam service-accounts create "github-actions-sa" \
  --description="Service Account for GitHub Actions" \
  --display-name="GitHub Actions Service Account"

# Dar à conta de serviço as permissões necessárias
gcloud projects add-iam-policy-binding tarefoai \
  --member="serviceAccount:github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding tarefoai \
  --member="serviceAccount:github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding tarefoai \
  --member="serviceAccount:github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding tarefoai \
  --member="serviceAccount:github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding tarefoai \
  --member="serviceAccount:github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Conceder permissão para a identidade do GitHub usar a conta de serviço
gcloud iam service-accounts add-iam-policy-binding "github-actions-sa@tarefoai.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/seu-usuario/seu-repositorio"
```

## Configuração dos Secrets no GitHub

Adicione os seguintes secrets no seu repositório GitHub:

1. `WIF_PROVIDER`: O nome completo do provedor de identidade
   Exemplo: `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

2. `WIF_SERVICE_ACCOUNT`: O email da conta de serviço
   Exemplo: `github-actions-sa@tarefoai.iam.gserviceaccount.com`

## Deployment Manual

Se você precisar acionar o deployment manualmente:

1. Vá para a aba "Actions" no seu repositório no GitHub
2. Selecione o workflow "Deploy Tarefo AI to Cloud Run"
3. Clique em "Run workflow"
4. Selecione a branch desejada (normalmente 'main')
5. Clique em "Run workflow"

## Verificação do Deployment

Após o deployment, o serviço estará disponível em:

- Cloud Run: https://tarefo-ai-tarefoai.southamerica-east1.run.app
- Webhook Function: https://southamerica-east1-tarefoai.cloudfunctions.net/tarefo-ai-webhook

Para verificar o status do deployment:

```bash
gcloud run services describe tarefo-ai --region=southamerica-east1 --format="value(status.url)"
```

## Solução de Problemas

Se encontrar problemas durante o deployment:

1. Verifique os logs da execução do GitHub Actions
2. Verifique os logs do Cloud Build:
   ```bash
   gcloud builds list --filter="status=FAILURE" --limit=1
   BUILD_ID=$(gcloud builds list --filter="status=FAILURE" --limit=1 --format="value(id)")
   gcloud builds log $BUILD_ID
   ```
3. Verifique os logs do Cloud Run:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=tarefo-ai AND severity>=ERROR"
   ```
