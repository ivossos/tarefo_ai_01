# Capturas de Tela do Visualizador de Progresso Animado

Este documento mostra exemplos de como a interface do Visualizador de Progresso de Deployment Animado do Tarefo AI se parece em cada etapa.

## Menu Principal

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    
                                                 
Visualizador de Progresso de Deployment - v1.0

Selecione o tipo de deployment a ser visualizado:

1) Cloud Run (Padrão)
2) Cloud Functions
3) Infraestrutura completa (Terraform)
4) Banco de dados

Configurações:

5) Alternar detalhes: OFF
6) Alternar logs verbosos: OFF

0) Sair

Digite sua escolha: 
```

## Tela de Entrada de Serviço

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    
                                                 
Visualizador de Progresso de Deployment - v1.0

Selecione o tipo de deployment a ser visualizado:

1) Cloud Run (Padrão)
2) Cloud Functions
3) Infraestrutura completa (Terraform)
4) Banco de dados

Configurações:

5) Alternar detalhes: OFF
6) Alternar logs verbosos: OFF

0) Sair

Digite sua escolha: 1
Nome do serviço [tarefo-ai]: 
```

## Cabeçalho e Progresso Geral

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    

Visualizador de Progresso de Deployment - Implantando no ☁️ tarefo-ai

Tipo de deployment: Cloud Run
Alvo: tarefo-ai
Data e hora: 03/05/2025 20:45:12

================================================================================

Progresso total: [===========>                              ] 30%

Validando ambiente ✓     
Inicializando infraestrutura ⠹   
```

## Visualização com Detalhes

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    

Visualizador de Progresso de Deployment - Implantando no ☁️ tarefo-ai

Tipo de deployment: Cloud Run
Alvo: tarefo-ai
Data e hora: 03/05/2025 20:45:32

================================================================================

Progresso total: [======================>                   ] 50%

Validando ambiente ✓     
Inicializando infraestrutura ✓
  → Inicializando infraestrutura no Cloud Run...
Preparando banco de dados ✓
  → Preparando banco de dados PostgreSQL...
Configurando segredos ✓
  → Configurando segredos no Secret Manager...
Construindo imagem ⠼  
  → Construindo imagem Docker do Tarefo AI...
```

## Visualização com Logs Verbosos

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    

Visualizador de Progresso de Deployment - Implantando no ☁️ tarefo-ai

Tipo de deployment: Cloud Run
Alvo: tarefo-ai
Data e hora: 03/05/2025 20:45:52

================================================================================

Progresso total: [===============================>          ] 70%

Validando ambiente ✓     
Inicializando infraestrutura ✓
Preparando banco de dados ✓
Configurando segredos ✓
Construindo imagem ✓
Enviando imagem ✓
Implantando serviço ⠏  

Logs recentes:
  > [20:45:46] Iniciando: Enviando imagem
  > [20:45:47] Detalhe: Enviando imagem para Container Registry...
  > [20:45:49] Concluído: Enviando imagem
  > [20:45:50] Iniciando: Implantando serviço
  > [20:45:51] Detalhe: Implantando serviço no Cloud Run...
```

## Tela de Conclusão do Deployment

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    

Visualizador de Progresso de Deployment - Implantando no ☁️ tarefo-ai

Tipo de deployment: Cloud Run
Alvo: tarefo-ai
Data e hora: 03/05/2025 20:46:15

================================================================================

Progresso total: [==============================================] 100%

Validando ambiente ✓     
Inicializando infraestrutura ✓
Preparando banco de dados ✓
Configurando segredos ✓
Construindo imagem ✓
Enviando imagem ✓
Implantando serviço ✓
Configurando webhooks ✓
Configurando agendamento ✓
Verificando deployment ✓

Resumo do Deployment:
✓ Deployment concluído com sucesso!
Tempo total: 28 segundos
URL do serviço: https://tarefo-ai.a.run.app
Logs completos: /tmp/deployment-progress-4321.log

Links em Tempo Real:
Console: https://console.cloud.google.com/run/detail/us-central1/tarefo-ai/metrics
Logs: https://console.cloud.google.com/run/detail/us-central1/tarefo-ai/logs
Revisions: https://console.cloud.google.com/run/detail/us-central1/tarefo-ai/revisions

🚀 Deployment concluído. Seu aplicativo Tarefo AI está pronto para uso!

Pressione Enter para voltar ao menu principal...
```

## Menu após Ativar Opções

```
  ______                  __          ___    ___ 
 /_  __/___ ______  ____/ /___     _/_/    /  _/ 
  / / / __ `/ ___/ / __  / __ \   / /     / /   
 / / / /_/ / /  / / /_/ / /_/ /  / /    _/ /    
/_/  \__,_/_/  /_/\__,_/\____/  /_/    /___/    
                                                 
Visualizador de Progresso de Deployment - v1.0

Selecione o tipo de deployment a ser visualizado:

1) Cloud Run (Padrão)
2) Cloud Functions
3) Infraestrutura completa (Terraform)
4) Banco de dados

Configurações:

5) Alternar detalhes: ON
6) Alternar logs verbosos: ON

0) Sair

Digite sua escolha: 
```

## Aviso de Terminal Pequeno

```
Aviso: Terminal pequeno detectado (24x80).
Para melhor visualização, use um terminal com pelo menos 30 linhas e 80 colunas.

Pressione Enter para continuar ou Ctrl+C para sair...
```

## Exemplo de Terminal com Funcionalidades Incompatíveis

```
Erro: Este script requer um terminal interativo.
```