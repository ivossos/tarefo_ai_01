"""
Ferramentas para os agentes do TarefoAI
"""

# Importa as ferramentas para facilitar o acesso
from .ocr_tool import ocr_tool, process_image
from .telegram_tool import telegram_tool, telegram_action
from .whatsapp_tool import whatsapp_tool, whatsapp_action
from .compliance_checker_tool import compliance_checker, check_compliance

# Exporta as ferramentas principais
__all__ = [
    'ocr_tool', 'process_image',
    'telegram_tool', 'telegram_action',
    'whatsapp_tool', 'whatsapp_action',
    'compliance_checker', 'check_compliance'
]