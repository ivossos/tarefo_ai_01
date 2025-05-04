# Guia do Visualizador de Progresso de Deployment Animado

O Visualizador de Progresso de Deployment Animado é uma ferramenta interativa que exibe visualmente o processo de deployment do Tarefo AI com animações no terminal, fornecendo feedback em tempo real e uma representação visual atraente do progresso.

## Visão Geral

Esta ferramenta cria uma experiência visual envolvente durante o deployment, mostrando:

- Progresso geral com barras de progresso animadas
- Passos individuais com spinners animados
- Logs em tempo real
- Detalhes de cada etapa com efeito de digitação
- Resumo completo ao final do processo

## Características Principais

- **Animações no terminal**: Spinners, barras de progresso e efeitos visuais
- **Interface colorida**: Uso de cores para destacar diferentes elementos
- **Logs em tempo real**: Visualização dos logs durante o processo
- **Modos detalhados**: Opção para mostrar mais ou menos informações
- **Múltiplos tipos de deployment**: Cloud Run, Cloud Functions, Terraform, etc.

## Pré-requisitos

- Terminal que suporte controle de cursor e cores ANSI
- bash (versão 3.2 ou superior)
- Terminal com pelo menos 30 linhas e 80 colunas (recomendado)

## Como Usar

### Pelo Deployment Manager
1. Execute o `deployment-manager.sh`
2. Selecione a opção "2" (Implantar aplicação completa)
3. No submenu, selecione "1" (Deployment com visualizador animado)

### Diretamente
1. Torne o script executável:
   ```bash
   chmod +x cloud-run/deployment-ui/progress-visualizer.sh
   ```
2. Execute o script:
   ```bash
   ./cloud-run/deployment-ui/progress-visualizer.sh
   ```

## Fluxo de Uso

### 1. Menu Principal
Ao iniciar a ferramenta, você verá um menu com estas opções:

- **Tipo de deployment**: Escolha entre Cloud Run, Cloud Functions, Terraform, etc.
- **Configurações**: Opções para mostrar detalhes e logs verbosos
- **Sair**: Encerra a ferramenta

### 2. Configuração do Deployment
Após selecionar o tipo, você pode definir parâmetros como:

- Nome do serviço (para Cloud Run)
- Nome da função (para Cloud Functions)
- Nome do projeto (para Terraform)
- Nome da instância (para Cloud SQL)

### 3. Visualização Animada
Durante o processo de deployment, você verá:

- **Cabeçalho**: Logo do Tarefo AI e informações básicas sobre o deployment
- **Barra de progresso geral**: Mostra o progresso total do deployment
- **Etapas individuais**: Cada etapa com seu próprio spinner animado
- **Detalhes** (opcional): Informações adicionais sobre cada etapa
- **Logs em tempo real** (opcional): Exibição dos logs durante o processo

### 4. Resumo Final
Ao final do deployment, um resumo é exibido, mostrando:

- Status geral do deployment
- Tempo total de execução
- URL do serviço (para Cloud Run)
- Localização dos logs completos
- Links em tempo real para monitoramento no Google Cloud Console:
  - Para Cloud Run: Console, Logs e Revisions
  - Para Cloud Functions: Console e Logs
  - Para Cloud SQL: Console e Monitoramento
  - Para Terraform: Dashboard do projeto

## Elementos Visuais

### Spinners Animados
Os spinners mostram operações em andamento com caracteres que giram:
```
⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
```

### Barras de Progresso
As barras de progresso mostram o avanço percentual do deployment:
```
[===========>                     ] 35%
```

### Indicadores de Status
Ícones para indicar o status de cada operação:
- ✓ (verde): Operação concluída com sucesso
- ✗ (vermelho): Operação falhou
- -> (azul): Informação ou operação em andamento

### Efeitos de Digitação
Texto que aparece gradualmente, simulando digitação em tempo real.

## Opções de Configuração

### Mostrar Detalhes
Quando ativado, exibe informações adicionais para cada etapa do deployment.

### Logs Verbosos
Quando ativado, exibe os logs em tempo real durante o processo de deployment.

## Limitações

- Requer um terminal que suporte controle de cursor ANSI
- As animações podem não funcionar corretamente em alguns emuladores de terminal
- Terminal pequeno pode causar problemas de formatação (recomendado mínimo de 30 linhas por 80 colunas)

## Dicas

- Use um terminal moderno como iTerm2 (macOS), Windows Terminal (Windows) ou GNOME Terminal (Linux)
- Aumente o tamanho da janela do terminal para melhor visualização
- Se encontrar problemas com as animações, tente desativar os detalhes e logs verbosos