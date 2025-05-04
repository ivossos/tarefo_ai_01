# Guia de Implantação do Tarefo AI com Terraform

O Terraform é uma ferramenta de infraestrutura como código que permite implantar e gerenciar toda a infraestrutura do Tarefo AI de forma automatizada.

## Pré-requisitos

1. [Instalar o Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
2. [Instalar o Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
3. Configurar a autenticação no Google Cloud: `gcloud auth application-default login`

## Como usar este código Terraform

### 1. Configurar variáveis

Crie um arquivo `terraform.tfvars` (não incluído no git) com seus valores:

```hcl
project_id = "seu-projeto-id" 
region     = "southamerica-east1"
db_password = "senha-segura-para-db"

secret_values = {
  "database-url"          = "postgres://..."
  "twilio-account-sid"    = "AC..."
  "twilio-auth-token"     = "..."
  "twilio-phone-number"   = "+55..."
  "openai-api-key"        = "sk-..."
  "telegram-bot-token"    = "..."
  "google-client-id"      = "..."
  "google-client-secret"  = "..."
  "google-redirect-url"   = "https://..."
  "whatsapp-verify-token" = "..."
  "webhook-internal-secret" = "..."
  "scheduler-secret"      = "..."
}
```

### 2. Inicializar o Terraform

```bash
cd terraform
terraform init
```

### 3. Verificar o plano

```bash
terraform plan
```

Revise as alterações que serão feitas. O Terraform irá mostrar todos os recursos que serão criados.

### 4. Aplicar as mudanças

```bash
terraform apply
```

Digite "yes" quando solicitado para confirmar.

## Implantação da aplicação

O Terraform criará a infraestrutura, mas você ainda precisará fazer o build e upload da imagem Docker:

```bash
# Construir a imagem
gcloud builds submit --tag gcr.io/[PROJECT_ID]/tarefo-ai:latest .

# O Terraform já configurou o Cloud Run para usar esta imagem
```

## Benefícios desta abordagem

1. **Consistência**: Toda a infraestrutura é definida como código e versionada
2. **Reprodutibilidade**: Ambientes de desenvolvimento, teste e produção idênticos
3. **Documentação viva**: O código Terraform serve como documentação da infraestrutura
4. **Previne erros**: Validações automáticas evitam configurações incorretas
5. **Facilita mudanças**: Alterações na infraestrutura são previsíveis e consistentes

## Manutenção e atualizações

Para atualizar a infraestrutura:

1. Modifique os arquivos `.tf` conforme necessário
2. Execute `terraform plan` para ver o impacto das mudanças
3. Execute `terraform apply` para aplicar as mudanças

## Destruir a infraestrutura

Se precisar remover toda a infraestrutura:

```bash
terraform destroy
```

⚠️ **CUIDADO**: Este comando irá excluir *todos* os recursos criados, incluindo o banco de dados e todos os dados. Use apenas em ambientes de teste ou quando realmente necessário.