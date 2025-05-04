import os
import sys
import yaml
from pathlib import Path

# Importa a configuração personalizada
try:
    from config import get_llm_config
    LLM_CONFIG = get_llm_config()
    print(f"✅ Configuração LLM carregada: provider={LLM_CONFIG['provider']}, model={LLM_CONFIG['model']}")
except ImportError:
    print("⚠️ Arquivo config.py não encontrado, usando configuração padrão")
    LLM_CONFIG = {
        "provider": "anthropic",
        "api_key": os.environ.get("ANTHROPIC_API_KEY"),
        "model": "claude-3-7-sonnet-20250219",
        "temperature": 0.7
    }

# Tenta importar o crewai, mas cria stubs se falhar
try:
    from crewai import Crew, Process
    from crewai import Agent, Task
    # Configura o LLM para o CrewAI
    if LLM_CONFIG["provider"] == "anthropic":
        from langchain_anthropic import ChatAnthropic
        try:
            llm = ChatAnthropic(
                anthropic_api_key=LLM_CONFIG["api_key"],
                model_name=LLM_CONFIG["model"],
                temperature=LLM_CONFIG["temperature"]
            )
            print(f"✅ LLM configurado: Anthropic {LLM_CONFIG['model']}")
        except Exception as e:
            print(f"❌ Erro ao configurar Anthropic LLM: {e}")
            llm = None
    else:
        llm = None
        print("⚠️ Provedor LLM não suportado ou não configurado")
    
    CREWAI_AVAILABLE = True
except ImportError:
    # Definições de fallback para desenvolvimento/teste
    print("⚠️ Módulo crewai não encontrado, usando stubs para desenvolvimento")
    CREWAI_AVAILABLE = False
    llm = None
    
    class Agent:
        def __init__(self, role="", goal="", backstory="", verbose=False, memory=False):
            self.role = role
            self.goal = goal
            self.backstory = backstory
            self.verbose = verbose
            self.memory = memory
    
    class Task:
        def __init__(self, description="", expected_output="", agent=None):
            self.description = description
            self.expected_output = expected_output
            self.agent = agent
    
    class Process:
        sequential = "sequential"
        hierarchical = "hierarchical"
    
    class Crew:
        def __init__(self, agents=None, tasks=None, process=None, verbose=False):
            self.agents = agents or []
            self.tasks = tasks or []
            self.process = process
            self.verbose = verbose
        
        def kickoff(self, inputs=None):
            print(f"🚀 Simulação de execução do CrewAI com {len(self.agents)} agentes e {len(self.tasks)} tarefas")
            print(f"📝 Contexto: {inputs}")
            return "Esta é uma resposta simulada do CrewAI para desenvolvimento"

def load_yaml(file_path):
    """Carrega um arquivo YAML com tratamento de erros"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Erro ao carregar arquivo {file_path}: {e}")
        return {}

# Caminhos para os arquivos de configuração
config_dir = Path(__file__).parent / "config"
agents_yaml = config_dir / "agents.yaml"
tasks_yaml = config_dir / "tasks.yaml"

# Carrega as configurações dos agentes e tarefas
agents_data = load_yaml(agents_yaml)
tasks_data = load_yaml(tasks_yaml)

def create_agents():
    """Cria os agentes a partir das configurações YAML"""
    agents = []
    
    if not agents_data or 'agents' not in agents_data:
        print("⚠️ Configuração de agentes não encontrada ou vazia")
        return agents
    
    for agent_config in agents_data['agents']:
        try:
            # Cria o agente com o LLM configurado
            agent_params = {
                'role': agent_config.get('role', 'Assistente'),
                'goal': agent_config.get('goal', 'Ajudar o usuário'),
                'backstory': agent_config.get('backstory', 'Um assistente digital'),
                'verbose': True,
                'memory': True
            }
            
            # Adiciona o LLM se estiver disponível
            if llm is not None:
                agent_params['llm'] = llm
                
            agent = Agent(**agent_params)
            agents.append(agent)
            print(f"✅ Agente criado: {agent.role}")
        except Exception as e:
            print(f"❌ Erro ao criar agente: {e}")
    
    return agents

def create_tasks(agents):
    """Cria tarefas e as atribui aos agentes apropriados"""
    tasks = []
    
    if not tasks_data or 'tasks' not in tasks_data:
        print("⚠️ Configuração de tarefas não encontrada ou vazia")
        return tasks
    
    # Cria um dicionário para busca rápida dos agentes por função
    agent_by_role = {agent.role: agent for agent in agents}
    
    for task_config in tasks_data['tasks']:
        try:
            agent_role = task_config.get('agent')
            if agent_role in agent_by_role:
                agent = agent_by_role[agent_role]
            else:
                # Usa o primeiro agente como fallback
                print(f"⚠️ Agente '{agent_role}' não encontrado para tarefa '{task_config.get('description')}'")
                if not agents:
                    continue
                agent = agents[0]
            
            task = Task(
                description=task_config.get('description', 'Tarefa sem descrição'),
                expected_output=task_config.get('expected_output', 'Resultado da tarefa'),
                agent=agent
            )
            tasks.append(task)
            print(f"✅ Tarefa criada: {task.description} (Agente: {agent.role})")
        except Exception as e:
            print(f"❌ Erro ao criar tarefa: {e}")
    
    return tasks

def initialize_crew():
    """Inicializa a tripulação (crew) com os agentes e tarefas configurados"""
    try:
        print("🚀 Inicializando TarefoAI CrewAI...")
        
        # Cria os agentes
        agents = create_agents()
        if not agents:
            print("❌ Nenhum agente disponível para criar a crew")
            return None
        
        # Cria as tarefas
        tasks = create_tasks(agents)
        if not tasks:
            print("❌ Nenhuma tarefa disponível para criar a crew")
            return None
        
        # Define a Crew com processo sequencial
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )
        
        print(f"✅ TarefoAI CrewAI inicializado com {len(agents)} agentes e {len(tasks)} tarefas")
        return crew
    
    except Exception as e:
        print(f"❌ Erro ao inicializar CrewAI: {e}")
        return None

# Função para executar a crew e obter resultados
def run_crew(crew, initial_context=None):
    """Executa a crew com um contexto inicial opcional"""
    try:
        if not crew:
            print("❌ CrewAI não inicializado. Impossível executar.")
            return "Erro: sistema não inicializado corretamente"
        
        print("🔄 Executando CrewAI...")
        result = crew.kickoff(inputs=initial_context)
        print("✅ Execução do CrewAI concluída")
        return result
    
    except Exception as e:
        print(f"❌ Erro ao executar CrewAI: {e}")
        return f"Erro durante o processamento: {str(e)}"

# Exporta as funções principais para uso em outros módulos
__all__ = ['initialize_crew', 'run_crew']