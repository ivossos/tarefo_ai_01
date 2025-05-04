variable "project_id" {
  description = "ID do projeto do Google Cloud"
  type        = string
  default     = "tarefo-ai-prod"
}

variable "region" {
  description = "Região do Google Cloud"
  type        = string
  default     = "southamerica-east1"
}

variable "db_password" {
  description = "Senha para o usuário do banco de dados"
  type        = string
  sensitive   = true
}

variable "secret_values" {
  description = "Valores para os segredos (não armazene em código)"
  type        = map(string)
  sensitive   = true
  default     = {}
}