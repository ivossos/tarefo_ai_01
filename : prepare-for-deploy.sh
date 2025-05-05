#!/bin/bash

# Script para preparar o projeto para deploy
# Este script garante que o arquivo cloudbuild.yaml sempre esteja correto
# (sem etapa de testes) antes do deployment

echo "Preparando projeto para deployment..."

# Verifica se o arquivo cloudbuild-new.yaml existe
if [ -f cloudbuild-new.yaml ]; then
  echo "✅ Arquivo cloudbuild-new.yaml encontrado"
  
  # Faz backup do arquivo original, se necessário
  if [ -f cloudbuild.yaml ] && [ ! -f cloudbuild.yaml.bak ]; then
    echo "📦 Criando backup do arquivo cloudbuild.yaml original"
    cp cloudbuild.yaml cloudbuild.yaml.bak
  fi
  
  # Copia o arquivo sem testes para cloudbuild.yaml
  echo "🔄 Atualizando cloudbuild.yaml com versão sem testes"
  cp cloudbuild-new.yaml cloudbuild.yaml
  
  echo "✅ Projeto preparado para deployment!"
  echo "Você pode agora executar o workflow do GitHub Actions ou usar o comando:"
  echo "  gcloud builds submit --config cloudbuild.yaml"
else
  echo "❌ Erro: Arquivo cloudbuild-new.yaml não encontrado!"
  echo "Por favor, verifique se você está no diretório raiz do projeto."
  exit 1
fi
