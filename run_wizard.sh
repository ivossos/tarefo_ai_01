#!/bin/bash

# Script para executar o assistente de implementação com entradas automáticas
cd cloud-run/deployment-ui

# Criar um arquivo de respostas
cat > answers.txt << 'ANSWERS'
s
tarefoai
5
1
tarefo-ai-db
1
1
1
2
1
1
tarefo-ai-webhook
tarefo-ai-scheduler
2
2
s
s
s
s
s
s
1
1
1
2
ANSWERS

# Executar o assistente usando as respostas pré-definidas
cat answers.txt | ./implementation-wizard-simple.sh
