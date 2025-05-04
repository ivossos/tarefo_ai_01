# Deployment do TarefoAI via GitHub Actions

Este arquivo contém instruções detalhadas para realizar o deployment do TarefoAI no Google Cloud Platform usando GitHub Actions.

## Pré-requisitos

1. Um repositório GitHub (público ou privado)
2. Uma conta no Google Cloud Platform com o projeto "tarefoai" criado
3. A conta de serviço com as permissões adequadas

## Configuração do GitHub

1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione um novo secret com o nome `GOOGLE_CREDENTIALS`
5. Cole o conteúdo do arquivo JSON da chave de serviço (`tarefoai-0566d678ba75.json`) no valor do secret
6. Clique em "Add secret"

## Iniciar o Deployment

Para iniciar o deployment, você tem duas opções:

### Opção 1: Push para a branch main
Simplesmente faça push das suas alterações para a branch `main`. O workflow será acionado automaticamente.

```bash
git add .
git commit -m "Iniciar deployment do TarefoAI"
git push origin main
```

### Opção 2: Execução manual
1. Acesse seu repositório no GitHub
2. Vá para a aba "Actions"
3. Selecione o workflow "Deploy TarefoAI to Cloud Run"
4. Clique em "Run workflow"

## Monitoramento

Você pode monitorar o progresso do deployment na aba "Actions" do GitHub.

Após a conclusão do deployment, o TarefoAI estará disponível em:
`https://tarefo-ai-[hash].southamerica-east1.run.app`

## Suporte

Se você encontrar algum problema durante o deployment, consulte os logs na aba "Actions" do GitHub ou no Cloud Build no Google Cloud Console.
