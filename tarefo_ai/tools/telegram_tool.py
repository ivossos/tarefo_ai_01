"""
Ferramenta de integração com Telegram para o TarefoAI
"""
import os
import json
import asyncio
import logging
from pathlib import Path
import time

# Configuração de logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class TelegramTool:
    """Ferramenta para integração com o Telegram"""
    
    def __init__(self):
        # Configurações da ferramenta
        self.name = "Telegram Tool"
        self.description = "Integração com a API do Telegram para envio e recebimento de mensagens"
        self.token = os.environ.get("TELEGRAM_BOT_TOKEN")
        self.initialized = False
        self.bot = None
        self.update_queue = []
        self.chat_ids = {}  # Mapeamento de user_id para chat_id
    
    def is_available(self):
        """Verifica se o token do Telegram está disponível"""
        return bool(self.token)
    
    def initialize(self):
        """Inicializa o bot do Telegram se possível"""
        if not self.is_available():
            logger.warning("⚠️ Token do Telegram não configurado")
            return False
        
        try:
            # Em um ambiente real, usaríamos algo como:
            # from telegram import Bot
            # self.bot = Bot(token=self.token)
            
            logger.info("🤖 Inicializando bot do Telegram...")
            
            # Simulamos a inicialização
            time.sleep(0.5)  # Simula tempo de inicialização
            
            self.initialized = True
            logger.info("✅ Bot do Telegram inicializado com sucesso")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar bot do Telegram: {str(e)}")
            return False
    
    def send_message(self, user_id, text, **kwargs):
        """
        Envia uma mensagem para um usuário via Telegram
        
        Args:
            user_id: ID do usuário no sistema
            text: Texto da mensagem
            **kwargs: Argumentos adicionais (parse_mode, reply_markup, etc.)
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        if not self.initialized and not self.initialize():
            logger.error("❌ Bot não inicializado. Impossível enviar mensagem.")
            return False
        
        try:
            # Verifica se temos o chat_id para este user_id
            chat_id = self.chat_ids.get(user_id)
            if not chat_id:
                logger.warning(f"⚠️ Chat ID não encontrado para o usuário {user_id}")
                return False
            
            logger.info(f"📤 Enviando mensagem para usuário {user_id} (chat_id: {chat_id})")
            logger.info(f"📝 Mensagem: {text[:50]}...")
            
            # Em um ambiente real, usaríamos:
            # message = self.bot.send_message(chat_id=chat_id, text=text, **kwargs)
            # return message is not None
            
            # Simulação para desenvolvimento
            success = True  # Simulando sucesso no envio
            
            if success:
                logger.info("✅ Mensagem enviada com sucesso!")
            else:
                logger.error("❌ Falha ao enviar mensagem")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem: {str(e)}")
            return False
    
    def send_photo(self, user_id, photo_path, caption=None, **kwargs):
        """
        Envia uma foto para um usuário via Telegram
        
        Args:
            user_id: ID do usuário no sistema
            photo_path: Caminho para o arquivo de imagem
            caption: Legenda da foto (opcional)
            **kwargs: Argumentos adicionais
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        if not self.initialized and not self.initialize():
            logger.error("❌ Bot não inicializado. Impossível enviar foto.")
            return False
        
        try:
            # Verifica se temos o chat_id para este user_id
            chat_id = self.chat_ids.get(user_id)
            if not chat_id:
                logger.warning(f"⚠️ Chat ID não encontrado para o usuário {user_id}")
                return False
            
            # Verifica se o arquivo existe
            if not os.path.exists(photo_path):
                logger.error(f"❌ Arquivo não encontrado: {photo_path}")
                return False
            
            logger.info(f"📤 Enviando foto para usuário {user_id} (chat_id: {chat_id})")
            
            # Em um ambiente real, usaríamos:
            # with open(photo_path, 'rb') as photo_file:
            #     message = self.bot.send_photo(
            #         chat_id=chat_id,
            #         photo=photo_file,
            #         caption=caption,
            #         **kwargs
            #     )
            # return message is not None
            
            # Simulação para desenvolvimento
            success = True  # Simulando sucesso no envio
            
            if success:
                logger.info("✅ Foto enviada com sucesso!")
            else:
                logger.error("❌ Falha ao enviar foto")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar foto: {str(e)}")
            return False
    
    def register_chat_id(self, user_id, chat_id):
        """
        Registra o chat_id de um usuário para envio de mensagens
        
        Args:
            user_id: ID do usuário no sistema
            chat_id: ID do chat no Telegram
        """
        self.chat_ids[user_id] = chat_id
        logger.info(f"✅ Chat ID {chat_id} registrado para o usuário {user_id}")
        return True
    
    def run(self, action, **kwargs):
        """
        Executa uma ação na API do Telegram
        
        Args:
            action: Ação a ser executada (send_message, send_photo, register_chat)
            **kwargs: Parâmetros específicos para cada ação
            
        Returns:
            dict: Resultado da operação
        """
        try:
            result = {"success": False, "action": action}
            
            if action == "send_message":
                user_id = kwargs.get("user_id")
                text = kwargs.get("text")
                
                if not user_id or not text:
                    result["error"] = "Parâmetros obrigatórios: user_id, text"
                    return result
                
                success = self.send_message(user_id, text)
                result["success"] = success
                
            elif action == "send_photo":
                user_id = kwargs.get("user_id")
                photo_path = kwargs.get("photo_path")
                caption = kwargs.get("caption")
                
                if not user_id or not photo_path:
                    result["error"] = "Parâmetros obrigatórios: user_id, photo_path"
                    return result
                
                success = self.send_photo(user_id, photo_path, caption)
                result["success"] = success
                
            elif action == "register_chat":
                user_id = kwargs.get("user_id")
                chat_id = kwargs.get("chat_id")
                
                if not user_id or not chat_id:
                    result["error"] = "Parâmetros obrigatórios: user_id, chat_id"
                    return result
                
                success = self.register_chat_id(user_id, chat_id)
                result["success"] = success
                
            else:
                result["error"] = f"Ação desconhecida: {action}"
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao executar ação {action}: {str(e)}")
            return {"success": False, "action": action, "error": str(e)}

# Cria uma instância da ferramenta para uso
telegram_tool = TelegramTool()

# Função auxiliar para interface com o CrewAI
def telegram_action(action, **kwargs):
    """
    Executa uma ação no Telegram
    
    Args:
        action: Ação a ser executada
        **kwargs: Parâmetros específicos para cada ação
        
    Returns:
        str: Resultado em formato JSON
    """
    result = telegram_tool.run(action, **kwargs)
    return json.dumps(result)

# Teste simples se executado diretamente
if __name__ == "__main__":
    # Verificação básica do ambiente
    if not telegram_tool.is_available():
        print("⚠️ Token do Telegram não configurado")
    else:
        print("🔑 Token do Telegram configurado")
    
    # Inicializa o bot
    if telegram_tool.initialize():
        print("🚀 Bot inicializado com sucesso!")
        
        # Exemplo de registro de chat_id
        telegram_tool.register_chat_id(1, 12345678)
        
        # Exemplo de envio de mensagem
        result = telegram_tool.run("send_message", user_id=1, text="Olá do TarefoAI!")
        print(json.dumps(result, indent=2))