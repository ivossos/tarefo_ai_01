"""
Este arquivo lista as dependências Python necessárias para o TarefoAI.
Instale com: python -m pip install -r tarefo_ai/requirements.txt
"""

requirements = [
    "crewai",
    "langchain",
    "python-dotenv",
    "pydantic",
    "pillow",
    "pyyaml",
    "python-telegram-bot"
]

# Lista as dependências para referência futura
if __name__ == "__main__":
    print("Dependências necessárias para o TarefoAI:")
    for req in requirements:
        print(f"- {req}")
    
    print("\nInstale com: python -m pip install -r tarefo_ai/requirements.txt")