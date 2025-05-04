"""
Configurações do framework CrewAI para o TarefoAI
"""
import os
from pathlib import Path

# Configuração de ambiente simplificada para testes
# Em uma implementação completa, usaríamos python-dotenv para carregar .env

# Configurações gerais
BASE_DIR = Path(__file__).parent.parent
CONFIG_DIR = Path(__file__).parent
TOOLS_DIR = BASE_DIR / 'tools'
UPLOAD_DIR = BASE_DIR / 'uploads'

# Cria diretório de uploads se não existir
UPLOAD_DIR.mkdir(exist_ok=True)

# Configurações do modelo LLM
LLM_CONFIG = {
    'model': os.environ.get('CREWAI_MODEL', 'gpt-4o'),
    'temperature': float(os.environ.get('CREWAI_TEMPERATURE', '0.2')),
    'verbose': os.environ.get('CREWAI_VERBOSE', 'true').lower() == 'true',
    'api_key': os.environ.get('OPENAI_API_KEY')
}

# Configurações do Telegram
TELEGRAM_CONFIG = {
    'token': os.environ.get('TELEGRAM_BOT_TOKEN'),
    'timeout': 20  # Timeout em segundos para inicialização do bot
}

# Configurações do WhatsApp/Twilio
WHATSAPP_CONFIG = {
    'account_sid': os.environ.get('TWILIO_ACCOUNT_SID'),
    'auth_token': os.environ.get('TWILIO_AUTH_TOKEN'),
    'phone_number': os.environ.get('TWILIO_PHONE_NUMBER')
}

# Configurações do processo de execução do CrewAI
CREW_CONFIG = {
    'verbose': True,
    'sequential': True,
    'max_iterations': 3,  # Número máximo de iterações entre agentes
    'memory': True        # Manter memória entre execuções
}

# Configurações do OCR
OCR_CONFIG = {
    'supported_formats': ['.jpg', '.jpeg', '.png', '.pdf'],
    'languages': ['por', 'eng']  # Idiomas suportados (Portuguese, English)
}

# Configurações de compliance (LGPD/GDPR)
COMPLIANCE_CONFIG = {
    'log_audits': True,  # Registra todas as verificações de conformidade
    'sensitive_fields': [
        'cpf', 'rg', 'id', 'passport', 'credit_card', 'health', 'religion',
        'political', 'sexual_orientation', 'biometric', 'genetic', 'location'
    ]
}

def get_config(config_name=None):
    """
    Retorna configuração específica ou todas as configurações
    
    Args:
        config_name: Nome da configuração desejada
        
    Returns:
        dict: Configuração solicitada ou todas as configurações
    """
    configs = {
        'llm': LLM_CONFIG,
        'telegram': TELEGRAM_CONFIG,
        'whatsapp': WHATSAPP_CONFIG,
        'crew': CREW_CONFIG,
        'ocr': OCR_CONFIG,
        'compliance': COMPLIANCE_CONFIG,
        'paths': {
            'base_dir': str(BASE_DIR),
            'config_dir': str(CONFIG_DIR),
            'tools_dir': str(TOOLS_DIR),
            'upload_dir': str(UPLOAD_DIR)
        }
    }
    
    if config_name and config_name in configs:
        return configs[config_name]
    
    return configs

if __name__ == "__main__":
    import json
    
    # Exibe todas as configurações quando executado diretamente
    print(json.dumps(get_config(), indent=2, default=str))