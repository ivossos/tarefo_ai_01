# Capturas de Tela do Estimador de Custos

Este documento mostra exemplos de como a interface do Estimador de Custos do Tarefo AI se parece em cada etapa.

## Tela de Boas-vindas

```
┌─────────────────────[ Estimador de Custos do Tarefo AI ]─────────────────────┐
│                                                                               │
│ Bem-vindo ao Estimador de Custos do Tarefo AI!                               │
│                                                                               │
│ Esta ferramenta irá ajudá-lo a estimar os custos mensais de execução do      │
│ Tarefo AI no Google Cloud Platform, com base nas configurações de deployment  │
│ e no volume de uso esperado.                                                  │
│                                                                               │
│ Pressione OK para começar.                                                    │
│                                                                               │
│                                                                               │
│                                                                               │
│                                  <OK>                                         │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Menu Principal

```
┌─────────────────────[ Estimador de Custos do Tarefo AI ]─────────────────────┐
│                                                                               │
│ Escolha uma opção:                                                            │
│                                                                               │
│    1  Criar nova estimativa de custos                                         │
│    2  Mostrar última estimativa                                               │
│    3  Exportar estimativa (JSON)                                              │
│    0  Sair                                                                    │
│                                                                               │
│                                                                               │
│                                                                               │
│                                                                               │
│                              <OK>        <Cancelar>                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Seleção de Usuários

```
┌────────────────────────[ Estimador de Custos - Usuários ]────────────────────────┐
│                                                                                   │
│ Selecione a quantidade aproximada de usuários DIÁRIOS:                            │
│                                                                                   │
│    50  Até 50 usuários por dia (pequeno)                                          │
│    200  Até 200 usuários por dia (médio)                                          │
│    1000  Até 1.000 usuários por dia (grande)                                      │
│    5000  Até 5.000 usuários por dia (muito grande)                                │
│                                                                                   │
│                                                                                   │
│                                                                                   │
│                                                                                   │
│                                                                                   │
│                              <OK>        <Cancelar>                               │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Seleção do Banco de Dados

```
┌──────────────────────[ Estimador de Custos - Banco de Dados ]──────────────────────┐
│                                                                                     │
│ Selecione o tipo de instância do Cloud SQL:                                         │
│                                                                                     │
│    db-f1-micro  Shared-core, 1 vCPU, 614MB (pequeno, ~$8/mês)                       │
│    db-g1-small  Shared-core, 1 vCPU, 1.7GB (médio, ~$28/mês)                        │
│    db-custom-1-3840  1 vCPU, 3.75GB (dedicado, ~$52/mês)                            │
│    db-custom-2-7680  2 vCPU, 7.5GB (grande, ~$105/mês)                              │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                <OK>        <Cancelar>                               │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Seleção de Armazenamento

```
┌───────────────────[ Estimador de Custos - Armazenamento ]────────────────────┐
│                                                                               │
│ Selecione o armazenamento do banco de dados:                                  │
│                                                                               │
│    10  10 GB (pequeno, ~$1,70/mês)                                            │
│    20  20 GB (médio, ~$3,40/mês)                                              │
│    50  50 GB (grande, ~$8,50/mês)                                             │
│    100  100 GB (muito grande, ~$17/mês)                                       │
│                                                                               │
│                                                                               │
│                                                                               │
│                                                                               │
│                              <OK>        <Cancelar>                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Seleção de Transferência de Rede

```
┌──────────────────[ Estimador de Custos - Transferência de Rede ]───────────────────┐
│                                                                                     │
│ Selecione a transferência de dados mensal estimada:                                 │
│                                                                                     │
│    10  Até 10 GB/mês (pequeno, gratuito)                                            │
│    50  Até 50 GB/mês (médio, ~$5/mês)                                               │
│    100  Até 100 GB/mês (grande, ~$11/mês)                                           │
│    500  Até 500 GB/mês (muito grande, ~$59/mês)                                     │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                                                                     │
│                                <OK>        <Cancelar>                               │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Resultado da Estimativa

```
┌─────────────────────[ Resultado da Estimativa de Custos ]──────────────────────┐
│                                                                                │
│ Estimativa de Custo Mensal (USD):                                              │
│                                                                                │
│ • Cloud Run (App principal): $25.45                                            │
│ • Cloud SQL (PostgreSQL): $9.75                                                │
│ • Transferência de rede: $4.80                                                 │
│ • Cloud Functions (Webhooks): $0.00                                            │
│ • Monitoramento e alertas: $5.00                                               │
│ • Secret Manager: $0.60                                                        │
│ • Outros (10% buffer): $4.56                                                   │
│                                                                                │
│ Total estimado: $50.16 por mês                                                 │
│                                                                                │
│ Este valor é uma estimativa baseada em:                                        │
│ - 200 usuários diários                                                         │
│ - 2000 requisições diárias                                                     │
│ - Instância Cloud SQL: db-f1-micro                                             │
│ - Armazenamento: 20 GB                                                         │
│ - Transferência de dados: 50 GB/mês                                            │
│ - Auto-scaling: min=1, max=10                                                  │
│                                                                                │
│                                  <OK>                                          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Exportação Concluída

```
┌───────────────────────────[ Exportação Concluída ]───────────────────────────┐
│                                                                              │
│ A estimativa de custos foi exportada com sucesso para:                       │
│ tarefo-ai-cost-estimate-20250503-203145.json                                 │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                 <OK>                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Exemplo de JSON Exportado

```json
{
  "estimate_date": "2025-05-03",
  "project_id": "tarefo-ai-prod",
  "region": "southamerica-east1",
  "costs": {
    "cloud_run": 25.45,
    "cloud_sql": 9.75,
    "network": 4.80,
    "functions": 0.00,
    "monitoring": 5.00,
    "secrets": 0.60,
    "others": 4.56,
    "total": 50.16
  },
  "configuration": {
    "users_per_day": 200,
    "requests_per_day": 2000,
    "db_tier": "db-f1-micro",
    "storage_gb": 20,
    "network_egress_gb": 50,
    "auto_scaling_min": 1,
    "auto_scaling_max": 10,
    "enable_monitoring": true
  }
}
```