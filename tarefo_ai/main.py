"""
TarefoAI - Aplicação principal
"""
import os
import sys
from pathlib import Path
import json
import yaml

# Importa as funções reais do framework CrewAI
from crew import initialize_crew, run_crew

# Configuração do ambiente
def setup_environment():
    """Configura variáveis de ambiente e dependências"""
    # Verifica configuração de LLM (OpenAI, Anthropic ou local)
    llm_provider = None
    
    # Primeiro verifica Anthropic
    if os.environ.get("ANTHROPIC_API_KEY"):
        llm_provider = "Anthropic"
        print(f"✅ ANTHROPIC_API_KEY encontrada, usando Anthropic como provedor LLM")
    # Depois verifica OpenAI
    elif os.environ.get("OPENAI_API_KEY"):
        llm_provider = "OpenAI"
        print(f"✅ OPENAI_API_KEY encontrada, usando OpenAI como provedor LLM")
    # Por fim verifica LLM local
    elif os.environ.get("LOCAL_LLM_URL"):
        llm_provider = "Local"
        print(f"✅ LOCAL_LLM_URL encontrada, usando API local como provedor LLM")
    else:
        print("⚠️ Nenhuma configuração de LLM encontrada (ANTHROPIC_API_KEY, OPENAI_API_KEY, LOCAL_LLM_URL)")
        print("🔍 Tentando usar a configuração padrão do sistema...")
    
    # Verifica configuração do Telegram (se disponível)
    if not os.environ.get("TELEGRAM_BOT_TOKEN"):
        print("⚠️ TELEGRAM_BOT_TOKEN não encontrada no ambiente")
    else:
        print("✅ TELEGRAM_BOT_TOKEN encontrado")
    
    # Verifica configuração do Twilio (se disponível)
    if not (os.environ.get("TWILIO_ACCOUNT_SID") and 
            os.environ.get("TWILIO_AUTH_TOKEN") and 
            os.environ.get("TWILIO_PHONE_NUMBER")):
        print("⚠️ Configurações do Twilio incompletas")
    else:
        print("✅ Configurações do Twilio encontradas")
    
    # Reporta o provedor LLM selecionado
    if llm_provider:
        print(f"🤖 Provedor LLM ativo: {llm_provider}")

def process_user_message(user_id, message, platform="app"):
    """
    Processa uma mensagem do usuário usando o framework CrewAI
    
    Args:
        user_id (int): ID do usuário
        message (str): Texto da mensagem
        platform (str): Plataforma de origem (app, telegram, whatsapp)
        
    Returns:
        str: Resposta processada
    """
    try:
        # Inicializa o CrewAI (se ainda não estiver inicializado)
        crew = initialize_crew()
        
        # Contexto inicial para a execução
        context = {
            "user_id": user_id,
            "message": message,
            "platform": platform,
            "timestamp": ""  # Poderia ser preenchido com datetime.now().isoformat()
        }
        
        # Executa o processamento com o CrewAI
        result = run_crew(crew, context)
        
        # Se não houver resultado, fornece uma resposta genérica
        if not result:
            return "Desculpe, não consegui processar sua mensagem. Por favor, tente novamente mais tarde."
        
        return result
    
    except Exception as e:
        print(f"❌ Erro ao processar mensagem: {e}")
        return f"Erro no processamento: {str(e)}"

def process_image(user_id, image_path, extract_type="full"):
    """
    Processa uma imagem enviada pelo usuário
    
    Args:
        user_id (int): ID do usuário
        image_path (str): Caminho para a imagem
        extract_type (str): Tipo de extração (full, receipt, invoice)
        
    Returns:
        dict: Dados extraídos da imagem
    """
    try:
        # Inicializa o CrewAI
        crew = initialize_crew()
        
        # Contexto inicial para a execução
        context = {
            "user_id": user_id,
            "image_path": image_path,
            "extract_type": extract_type
        }
        
        # Executa o processamento com o CrewAI
        result = run_crew(crew, context)
        
        # Tenta converter o resultado para um formato estruturado
        try:
            if isinstance(result, str):
                return json.loads(result)
            return result
        except:
            return {"text": result}
    
    except Exception as e:
        print(f"❌ Erro ao processar imagem: {e}")
        return {"error": str(e)}

def check_compliance(operation, data):
    """
    Verifica conformidade com regulamentos como LGPD/GDPR
    
    Args:
        operation (str): Tipo de operação (store, process, share)
        data (dict): Dados relacionados à operação
        
    Returns:
        dict: Resultado da verificação
    """
    try:
        # Inicializa o CrewAI
        crew = initialize_crew()
        
        # Contexto inicial para a execução
        context = {
            "operation": operation,
            "data": data
        }
        
        # Executa o processamento com o CrewAI
        result = run_crew(crew, context)
        
        # Tenta converter o resultado para um formato estruturado
        try:
            if isinstance(result, str):
                return json.loads(result)
            return result
        except:
            return {"compliant": False, "reason": "Erro ao processar verificação", "details": result}
    
    except Exception as e:
        print(f"❌ Erro ao verificar conformidade: {e}")
        return {"compliant": False, "reason": str(e)}

if __name__ == "__main__":
    # Configuração inicial
    setup_environment()
    
    # Teste simples
    if len(sys.argv) > 1:
        # Modo de teste: python main.py "sua mensagem aqui"
        result = process_user_message(1, sys.argv[1])
        print(f"\nResposta: {result}")
    else:
        print("\n🚀 TarefoAI inicializado com sucesso!")
        print("Para testar, execute: python main.py \"sua mensagem aqui\"")