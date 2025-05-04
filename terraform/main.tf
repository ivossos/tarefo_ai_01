provider "google" {
  project = var.project_id
  region  = var.region
}

# Habilitar APIs necessárias
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudfunctions.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_on_destroy = false
}

# Instância do Cloud SQL
resource "google_sql_database_instance" "tarefo_db" {
  name             = "tarefo-ai-db"
  database_version = "POSTGRES_13"
  region           = var.region
  
  settings {
    tier              = "db-f1-micro"  # Menor instância para economizar
    availability_type = "ZONAL"        # Instância única para economizar
    
    backup_configuration {
      enabled = true
    }
  }
  
  depends_on = [google_project_service.services]
}

# Banco de dados
resource "google_sql_database" "database" {
  name     = "tarefo_ai"
  instance = google_sql_database_instance.tarefo_db.name
}

# Usuário do banco de dados
resource "google_sql_user" "user" {
  name     = "tarefo_app"
  instance = google_sql_database_instance.tarefo_db.name
  password = var.db_password
}

# Segredos no Secret Manager
resource "google_secret_manager_secret" "secrets" {
  for_each = toset([
    "database-url",
    "twilio-account-sid",
    "twilio-auth-token",
    "twilio-phone-number",
    "openai-api-key",
    "telegram-bot-token",
    "google-client-id",
    "google-client-secret",
    "google-redirect-url",
    "whatsapp-verify-token",
    "webhook-internal-secret",
    "scheduler-secret"
  ])
  
  secret_id = each.value
  
  replication {
    automatic = true
  }
  
  depends_on = [google_project_service.services]
}

# Serviço Cloud Run para a aplicação principal
resource "google_cloud_run_service" "tarefo_app" {
  name     = "tarefo-ai"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/tarefo-ai:latest"
        
        resources {
          limits = {
            cpu    = "1"
            memory = "2Gi"
          }
        }
        
        # Configurar variáveis de ambiente
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        # Adicionar secrets como variáveis de ambiente
        dynamic "env" {
          for_each = toset([
            "database-url",
            "twilio-account-sid",
            "twilio-auth-token",
            "twilio-phone-number",
            "openai-api-key",
            "telegram-bot-token",
            "google-client-id",
            "google-client-secret",
            "google-redirect-url"
          ])
          
          content {
            name = upper(replace(env.value, "-", "_"))
            value_from {
              secret_manager_key {
                name    = google_secret_manager_secret.secrets[env.value].id
                version = "latest"
              }
            }
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.services,
    google_sql_database_instance.tarefo_db
  ]
}

# Configurar acesso não autenticado ao Cloud Run
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.tarefo_app.name
  location = google_cloud_run_service.tarefo_app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Function para webhook do WhatsApp
resource "google_cloudfunctions2_function" "whatsapp_webhook" {
  name     = "whatsappWebhook"
  location = var.region
  
  build_config {
    runtime     = "nodejs20"
    entry_point = "whatsappWebhook"
    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }
  
  service_config {
    max_instance_count = 10
    available_memory   = "256M"
    timeout_seconds    = 60
    
    environment_variables = {
      APP_URL    = google_cloud_run_service.tarefo_app.status[0].url,
      PROJECT_ID = var.project_id
    }
    
    secret_environment_variables {
      key        = "WHATSAPP_VERIFY_TOKEN"
      project_id = var.project_id
      secret     = google_secret_manager_secret.secrets["whatsapp-verify-token"].secret_id
      version    = "latest"
    }
    
    secret_environment_variables {
      key        = "WEBHOOK_INTERNAL_SECRET"
      project_id = var.project_id
      secret     = google_secret_manager_secret.secrets["webhook-internal-secret"].secret_id
      version    = "latest"
    }
  }
  
  depends_on = [
    google_project_service.services,
    google_cloud_run_service.tarefo_app
  ]
}