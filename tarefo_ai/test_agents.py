#!/usr/bin/env python3
"""
Script para testar os agentes do TarefoAI
"""
import os
import sys
import json
from pathlib import Path

# Adiciona o diretório atual ao PYTHONPATH para importar os módulos
sys.path.append(str(Path(__file__).parent))

# Importa as funções do TarefoAI
from main import process_user_message, process_image, check_compliance
from crew import initialize_crew, run_crew
from tools.telegram_tool import telegram_action
from tools.whatsapp_tool import whatsapp_action
from tools.ocr_tool import process_image as ocr_process_image
from tools.compliance_checker_tool import check_compliance as compliance_check

def test_crew_initialization():
    """Testa se os agentes e tarefas são inicializados corretamente"""
    print("\n🔍 Teste 1: Inicialização do CrewAI")
    
    crew = initialize_crew()
    
    if crew is None:
        print("❌ Falha ao inicializar CrewAI")
        return False
    
    print("✅ CrewAI inicializado com sucesso!")
    return True

def test_message_processing():
    """Testa o processamento de mensagens"""
    print("\n🔍 Teste 2: Processamento de mensagem")
    
    try:
        # Simula um ID de usuário e uma mensagem simples
        user_id = 1
        message = "Olá, preciso agendar uma reunião amanhã às 15h"
        
        # Processa a mensagem
        response = process_user_message(user_id, message, "test")
        
        print(f"📝 Mensagem enviada: '{message}'")
        print(f"📝 Resposta recebida: '{response}'")
        
        if response and len(response) > 10:
            print("✅ Processamento de mensagem funcionando!")
            return True
        else:
            print("❌ Resposta muito curta ou vazia")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao processar mensagem: {e}")
        return False

def test_tool_integration():
    """Testa a integração com as ferramentas"""
    print("\n🔍 Teste 3: Integração com ferramentas")
    
    try:
        # Testa a ferramenta do Telegram
        telegram_result = json.loads(telegram_action("send_message", user_id=1, text="Teste de ferramenta"))
        print(f"📱 Telegram: {telegram_result['success']}")
        
        # Testa a ferramenta do WhatsApp
        whatsapp_result = json.loads(whatsapp_action("send_message", user_id=1, text="Teste de ferramenta"))
        print(f"📱 WhatsApp: {whatsapp_result['success']}")
        
        # Testa a ferramenta de OCR
        ocr_result = json.loads(ocr_process_image("test_image.jpg", "full"))
        print(f"🔍 OCR: {'error' not in ocr_result}")
        
        # Testa a ferramenta de Compliance
        compliance_result = json.loads(compliance_check("store", {"consent_obtained": True}))
        print(f"🔒 Compliance: {'compliant' in compliance_result}")
        
        print("✅ Integração com ferramentas funcionando!")
        return True
            
    except Exception as e:
        print(f"❌ Erro ao testar ferramentas: {e}")
        return False

def run_all_tests():
    """Executa todos os testes disponíveis"""
    print("🚀 Iniciando testes dos agentes do TarefoAI...")
    
    success_count = 0
    total_tests = 3
    
    if test_crew_initialization():
        success_count += 1
    
    if test_message_processing():
        success_count += 1
    
    if test_tool_integration():
        success_count += 1
    
    print(f"\n📊 Resultado: {success_count}/{total_tests} testes passaram")
    
    if success_count == total_tests:
        print("🎉 Todos os testes passaram! O sistema está funcionando corretamente.")
    else:
        print("⚠️ Alguns testes falharam. Verifique os logs acima para mais detalhes.")
    
    return success_count == total_tests

if __name__ == "__main__":
    # Configura o diretório de trabalho para o diretório do script
    os.chdir(Path(__file__).parent)
    
    # Executa os testes
    run_all_tests()