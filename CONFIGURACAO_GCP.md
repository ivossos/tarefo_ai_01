# Configuração do Google Cloud Platform para o TarefoAI

Este guia fornece instruções detalhadas para configurar corretamente o projeto Google Cloud Platform (GCP) para o deployment do TarefoAI.

## 1. Acessar o Console do GCP

1. Acesse [https://console.cloud.google.com](https://console.cloud.google.com)
2. Faça login com sua conta Google associada ao projeto `tarefoai`

## 2. Verificar o Projeto

1. Na barra superior do console, verifique se o projeto selecionado é `tarefoai`
2. Caso não esteja, clique no nome do projeto e selecione `tarefoai` na lista de projetos

## 3. Ativar APIs Necessárias

1. No menu de navegação à esquerda, vá para "APIs e Serviços" > "Biblioteca"
2. Pesquise e ative as seguintes APIs (clique em cada uma e depois em "Ativar"):
   - Cloud Resource Manager API
   - Cloud Run Admin API
   - Cloud Build API
   - Container Registry API
   - Secret Manager API
   - Cloud Functions API
   - Identity and Access Management (IAM) API
   - Serverless VPC Access API
   - Cloud Storage API

## 4. Configurar Permissões da Conta de Serviço

1. No menu de navegação à esquerda, vá para "IAM e Administrador" > "Contas de serviço"
2. Localize a conta de serviço `tarefoai@tarefoai.iam.gserviceaccount.com`
3. Clique nos três pontos (menu de ações) à direita desta conta e selecione "Gerenciar permissões"
4. Clique em "Conceder acesso"
5. No campo "Novos principais", já deve estar preenchido com o email da conta de serviço
6. Clique em "Selecionar um papel" e adicione cada um dos seguintes papéis:
   - Cloud Run Admin (`roles/run.admin`)
   - Cloud Build Service Account (`roles/cloudbuild.builds.builder`)
   - Service Account User (`roles/iam.serviceAccountUser`)
   - Storage Admin (`roles/storage.admin`)
   - Secret Manager Admin (`roles/secretmanager.admin`)
   - Cloud Functions Admin (`roles/cloudfunctions.admin`)
7. Após adicionar todos os papéis, clique em "Salvar"

## 5. Verificar Configuração do Bucket do Cloud Storage

1. No menu de navegação à esquerda, vá para "Cloud Storage" > "Buckets"
2. Verifique se existe um bucket com o nome `tarefoai_cloudbuild`
3. Se não existir, crie um novo bucket:
   - Clique em "Criar bucket"
   - Nome: `tarefoai_cloudbuild`
   - Escolha a localização: `southamerica-east1` (São Paulo)
   - Escolha o tipo de armazenamento: "Standard"
   - Clique em "Criar"

## 6. Testar a Configuração

Após realizar todas essas configurações, você pode tentar novamente o deployment usando o script:

```bash
./deploy-gcp-direct.sh
```

## Verificação de Problemas Comuns

Se você ainda encontrar problemas, verifique:

1. **Problema de acesso ao projeto**
   - Verifique se você é o proprietário do projeto ou tem o papel "Editor" ou "Proprietário"
   - Verifique se o projeto `tarefoai` existe e está ativo

2. **Problemas com a conta de serviço**
   - Verifique se a conta de serviço está ativa
   - Verifique se a chave de serviço não foi revogada

3. **Problemas de faturamento**
   - Verifique se o faturamento está ativado para o projeto
   - Vá para "Faturamento" no menu de navegação e confirme que há uma conta de faturamento ativa

## Recursos Adicionais

- [Documentação do Google Cloud Run](https://cloud.google.com/run/docs)
- [Permissões e papéis do IAM](https://cloud.google.com/iam/docs/understanding-roles)
- [Solução de problemas do Cloud Build](https://cloud.google.com/build/docs/troubleshooting)

## Suporte

Se precisar de mais assistência:
- Consulte a [documentação oficial do Google Cloud](https://cloud.google.com/docs)
- Utilize o [Google Cloud Support](https://cloud.google.com/support)
- Ou contate a equipe de suporte do TarefoAI