#!/usr/bin/env python3
"""
Teste rápido das ferramentas do TarefoAI
"""
import os
import sys
import json
from pathlib import Path

# Adiciona o diretório atual ao PYTHONPATH para importar os módulos
script_dir = Path(__file__).parent
sys.path.append(str(script_dir))

def test_tools():
    """Testa as ferramentas disponíveis de forma isolada"""
    print("🔧 Testando ferramentas individuais...")
    
    # Verifica se o diretório de ferramentas existe
    tools_dir = script_dir / "tools"
    if not tools_dir.exists():
        print(f"❌ Diretório de ferramentas não encontrado: {tools_dir}")
        return False
    
    # Lista as ferramentas disponíveis
    tools_files = list(tools_dir.glob("*.py"))
    print(f"📋 Ferramentas encontradas: {len(tools_files)}")
    for tool_file in tools_files:
        print(f"  - {tool_file.name}")
    
    # Testa a ferramenta de Telegram
    try:
        print("\n🔹 Testando ferramenta do Telegram...")
        from tools.telegram_tool import telegram_tool
        
        is_available = telegram_tool.is_available()
        print(f"  ✓ Disponibilidade: {is_available}")
        print(f"  ✓ Classe inicializada corretamente")
    except Exception as e:
        print(f"  ❌ Erro ao testar ferramenta de Telegram: {e}")
    
    # Testa a ferramenta de WhatsApp
    try:
        print("\n🔹 Testando ferramenta de WhatsApp...")
        from tools.whatsapp_tool import whatsapp_tool
        
        is_available = whatsapp_tool.is_available()
        print(f"  ✓ Disponibilidade: {is_available}")
        print(f"  ✓ Classe inicializada corretamente")
    except Exception as e:
        print(f"  ❌ Erro ao testar ferramenta de WhatsApp: {e}")
    
    # Testa a ferramenta de OCR
    try:
        print("\n🔹 Testando ferramenta de OCR...")
        from tools.ocr_tool import ocr_tool
        
        print(f"  ✓ Formatos suportados: {ocr_tool.supported_formats}")
        print(f"  ✓ Classe inicializada corretamente")
    except Exception as e:
        print(f"  ❌ Erro ao testar ferramenta de OCR: {e}")
    
    # Testa a ferramenta de Compliance
    try:
        print("\n🔹 Testando ferramenta de Compliance...")
        from tools.compliance_checker_tool import compliance_checker
        
        print(f"  ✓ Operações disponíveis: {list(compliance_checker.rules.keys())}")
        print(f"  ✓ Classe inicializada corretamente")
    except Exception as e:
        print(f"  ❌ Erro ao testar ferramenta de Compliance: {e}")
    
    print("\n✅ Teste de ferramentas concluído!")
    return True

def test_config():
    """Testa os arquivos de configuração"""
    print("\n📝 Testando arquivos de configuração...")
    
    config_dir = script_dir / "config"
    if not config_dir.exists():
        print(f"❌ Diretório de configuração não encontrado: {config_dir}")
        return False
    
    # Verifica arquivos de configuração
    config_files = list(config_dir.glob("*.yaml"))
    print(f"📋 Arquivos de configuração encontrados: {len(config_files)}")
    for config_file in config_files:
        print(f"  - {config_file.name}")
    
    # Tenta carregar as configurações
    try:
        import yaml
        
        agents_yaml = config_dir / "agents.yaml"
        if agents_yaml.exists():
            with open(agents_yaml, 'r', encoding='utf-8') as f:
                agents_data = yaml.safe_load(f)
                agent_count = len(agents_data.get('agents', []))
                print(f"  ✓ agents.yaml: {agent_count} agentes configurados")
        else:
            print(f"  ❌ Arquivo agents.yaml não encontrado")
        
        tasks_yaml = config_dir / "tasks.yaml"
        if tasks_yaml.exists():
            with open(tasks_yaml, 'r', encoding='utf-8') as f:
                tasks_data = yaml.safe_load(f)
                task_count = len(tasks_data.get('tasks', []))
                print(f"  ✓ tasks.yaml: {task_count} tarefas configuradas")
        else:
            print(f"  ❌ Arquivo tasks.yaml não encontrado")
            
    except Exception as e:
        print(f"  ❌ Erro ao carregar configurações: {e}")
        return False
    
    print("\n✅ Teste de configuração concluído!")
    return True

def test_main_functions():
    """Testa as funções principais do TarefoAI"""
    print("\n🧪 Testando funções principais...")
    
    # Verifica se o arquivo principal existe
    main_py = script_dir / "main.py"
    if not main_py.exists():
        print(f"❌ Arquivo main.py não encontrado")
        return False
    
    # Verifica se o arquivo crew.py existe
    crew_py = script_dir / "crew.py"
    if not crew_py.exists():
        print(f"❌ Arquivo crew.py não encontrado")
        return False
    
    print("  ✓ Arquivos principais encontrados")
    
    # Tenta importar as funções principais
    try:
        from main import setup_environment
        print("  ✓ setup_environment importada com sucesso")
    except Exception as e:
        print(f"  ❌ Erro ao importar setup_environment: {e}")
    
    try:
        from crew import load_yaml
        print("  ✓ load_yaml importada com sucesso")
    except Exception as e:
        print(f"  ❌ Erro ao importar load_yaml: {e}")
    
    print("\n✅ Teste de funções principais concluído!")
    return True

if __name__ == "__main__":
    print("🚀 Iniciando teste rápido do TarefoAI...")
    
    test_tools()
    test_config()
    test_main_functions()
    
    print("\n🏁 Teste rápido concluído! Verifique os resultados acima.")