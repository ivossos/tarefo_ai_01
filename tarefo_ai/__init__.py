"""
TarefoAI com CrewAI
===================

Framework de agentes inteligentes especializados para o TarefoAI,
baseado em CrewAI.

Este pacote implementa cinco agentes especializados:
1. Messaging Integration Specialist: Gerencia comunicações via Telegram e WhatsApp
2. Calendar Integration Engineer: Integra com Google Calendar e Apple Calendar
3. Reminder and Notification Coordinator: Gerencia lembretes e notificações
4. Document Processing Specialist: Processa documentos e imagens usando OCR
5. Privacy and Security Officer: Garante conformidade com leis de proteção de dados

Uso básico:
-----------

```python
from tarefo_ai import crew
from tarefo_ai.main import process_user_message

# Processar uma mensagem
resposta = process_user_message(
    user_id=1, 
    message="Lembretes para hoje", 
    platform="telegram"
)

# Verificar conformidade
resultado = check_compliance(
    operation="store",
    data={"name": "João", "cpf": "123.456.789-00"}
)
```

Compatibilidade:
---------------
- Python 3.8+
- CrewAI 0.1.0+
- LangChain 0.1.0+
"""

__version__ = '0.1.0'
__author__ = 'TarefoAI'