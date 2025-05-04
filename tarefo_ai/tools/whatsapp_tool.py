"""
Ferramenta de integração com WhatsApp para o TarefoAI
"""
import os
import json
import logging
from pathlib import Path
import time
import base64

# Configuração de logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class WhatsAppTool:
    """Ferramenta para integração com o WhatsApp via Twilio"""
    
    def __init__(self):
        # Configurações da ferramenta
        self.name = "WhatsApp Tool"
        self.description = "Integração com a API do WhatsApp via Twilio para envio e recebimento de mensagens"
        self.account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        self.auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        self.phone_number = os.environ.get("TWILIO_PHONE_NUMBER")
        self.initialized = False
        self.client = None
        self.phone_numbers = {}  # Mapeamento de user_id para número de telefone
    
    def is_available(self):
        """Verifica se as credenciais do Twilio estão disponíveis"""
        return bool(self.account_sid and self.auth_token and self.phone_number)
    
    def initialize(self):
        """Inicializa o cliente do Twilio se possível"""
        if not self.is_available():
            logger.warning("⚠️ Credenciais do Twilio não configuradas completamente")
            return False
        
        try:
            # Em um ambiente real, usaríamos algo como:
            # from twilio.rest import Client
            # self.client = Client(self.account_sid, self.auth_token)
            
            logger.info("🔄 Inicializando cliente do Twilio para WhatsApp...")
            
            # Simulamos a inicialização
            time.sleep(0.5)  # Simula tempo de inicialização
            
            self.initialized = True
            logger.info(f"✅ Cliente Twilio inicializado com sucesso para o número {self.phone_number}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar cliente do Twilio: {str(e)}")
            return False
    
    def send_message(self, user_id, text, **kwargs):
        """
        Envia uma mensagem para um usuário via WhatsApp
        
        Args:
            user_id: ID do usuário no sistema
            text: Texto da mensagem
            **kwargs: Argumentos adicionais
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        if not self.initialized and not self.initialize():
            logger.error("❌ Cliente Twilio não inicializado. Impossível enviar mensagem.")
            return False
        
        try:
            # Verifica se temos o número de telefone para este user_id
            to_phone = self.phone_numbers.get(user_id)
            if not to_phone:
                logger.warning(f"⚠️ Número de telefone não encontrado para o usuário {user_id}")
                return False
            
            logger.info(f"📤 Enviando mensagem WhatsApp para usuário {user_id} ({to_phone})")
            logger.info(f"📝 Mensagem: {text[:50]}...")
            
            # Em um ambiente real, usaríamos:
            # message = self.client.messages.create(
            #     body=text,
            #     from_=f'whatsapp:{self.phone_number}',
            #     to=f'whatsapp:{to_phone}'
            # )
            # return message.sid is not None
            
            # Simulação para desenvolvimento
            success = True  # Simulando sucesso no envio
            
            if success:
                logger.info("✅ Mensagem WhatsApp enviada com sucesso!")
            else:
                logger.error("❌ Falha ao enviar mensagem WhatsApp")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem WhatsApp: {str(e)}")
            return False
    
    def send_media(self, user_id, media_path, caption=None, **kwargs):
        """
        Envia uma mídia para um usuário via WhatsApp
        
        Args:
            user_id: ID do usuário no sistema
            media_path: Caminho para o arquivo de mídia
            caption: Legenda da mídia (opcional)
            **kwargs: Argumentos adicionais
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        if not self.initialized and not self.initialize():
            logger.error("❌ Cliente Twilio não inicializado. Impossível enviar mídia.")
            return False
        
        try:
            # Verifica se temos o número de telefone para este user_id
            to_phone = self.phone_numbers.get(user_id)
            if not to_phone:
                logger.warning(f"⚠️ Número de telefone não encontrado para o usuário {user_id}")
                return False
            
            # Verifica se o arquivo existe
            if not os.path.exists(media_path):
                logger.error(f"❌ Arquivo não encontrado: {media_path}")
                return False
            
            logger.info(f"📤 Enviando mídia por WhatsApp para usuário {user_id} ({to_phone})")
            
            # Determina o tipo de mídia pelo nome do arquivo
            media_type = media_path.split('.')[-1].lower()
            if media_type in ['jpg', 'jpeg', 'png', 'gif']:
                media_type = 'image'
            elif media_type in ['mp3', 'wav', 'ogg']:
                media_type = 'audio'
            elif media_type in ['mp4', 'mov', '3gp']:
                media_type = 'video'
            else:
                media_type = 'document'
            
            logger.info(f"📎 Tipo de mídia: {media_type}")
            
            # Em um ambiente real, usaríamos:
            # media_url = f'{some_url_here}/{media_path}'
            # message = self.client.messages.create(
            #     media_url=[media_url],
            #     body=caption if caption else '',
            #     from_=f'whatsapp:{self.phone_number}',
            #     to=f'whatsapp:{to_phone}'
            # )
            # return message.sid is not None
            
            # Simulação para desenvolvimento
            success = True  # Simulando sucesso no envio
            
            if success:
                logger.info(f"✅ {media_type.capitalize()} enviado com sucesso por WhatsApp!")
            else:
                logger.error(f"❌ Falha ao enviar {media_type} por WhatsApp")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mídia por WhatsApp: {str(e)}")
            return False
    
    def register_phone(self, user_id, phone_number):
        """
        Registra o número de telefone de um usuário para envio de mensagens
        
        Args:
            user_id: ID do usuário no sistema
            phone_number: Número de telefone no formato E.164 (ex: +5511999998888)
        """
        # Faz uma validação básica do formato do número
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
            
        self.phone_numbers[user_id] = phone_number
        logger.info(f"✅ Número {phone_number} registrado para o usuário {user_id}")
        return True
    
    def run(self, action, **kwargs):
        """
        Executa uma ação na API do WhatsApp
        
        Args:
            action: Ação a ser executada (send_message, send_media, register_phone)
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
                
            elif action == "send_media":
                user_id = kwargs.get("user_id")
                media_path = kwargs.get("media_path")
                caption = kwargs.get("caption")
                
                if not user_id or not media_path:
                    result["error"] = "Parâmetros obrigatórios: user_id, media_path"
                    return result
                
                success = self.send_media(user_id, media_path, caption)
                result["success"] = success
                
            elif action == "register_phone":
                user_id = kwargs.get("user_id")
                phone_number = kwargs.get("phone_number")
                
                if not user_id or not phone_number:
                    result["error"] = "Parâmetros obrigatórios: user_id, phone_number"
                    return result
                
                success = self.register_phone(user_id, phone_number)
                result["success"] = success
                
            else:
                result["error"] = f"Ação desconhecida: {action}"
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao executar ação {action}: {str(e)}")
            return {"success": False, "action": action, "error": str(e)}

# Cria uma instância da ferramenta para uso
whatsapp_tool = WhatsAppTool()

# Função auxiliar para interface com o CrewAI
def whatsapp_action(action, **kwargs):
    """
    Executa uma ação no WhatsApp
    
    Args:
        action: Ação a ser executada
        **kwargs: Parâmetros específicos para cada ação
        
    Returns:
        str: Resultado em formato JSON
    """
    result = whatsapp_tool.run(action, **kwargs)
    return json.dumps(result)

# Teste simples se executado diretamente
if __name__ == "__main__":
    # Verificação básica do ambiente
    if not whatsapp_tool.is_available():
        print("⚠️ Credenciais do Twilio não configuradas completamente")
    else:
        print(f"🔑 Credenciais do Twilio configuradas para o número {whatsapp_tool.phone_number}")
    
    # Inicializa o cliente
    if whatsapp_tool.initialize():
        print("🚀 Cliente Twilio inicializado com sucesso!")
        
        # Exemplo de registro de número de telefone
        whatsapp_tool.register_phone(1, "+5511999998888")
        
        # Exemplo de envio de mensagem
        result = whatsapp_tool.run("send_message", user_id=1, text="Olá do TarefoAI via WhatsApp!")
        print(json.dumps(result, indent=2))