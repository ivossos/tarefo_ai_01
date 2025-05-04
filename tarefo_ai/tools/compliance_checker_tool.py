"""
Ferramenta de verificação de conformidade com regulamentos de privacidade para o TarefoAI
"""
import os
import json
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class ComplianceCheckerTool:
    """Ferramenta para verificação de conformidade com LGPD/GDPR"""
    
    def __init__(self):
        # Configurações da ferramenta
        self.name = "Compliance Checker Tool"
        self.description = "Verificação de conformidade com regulamentos de privacidade como LGPD e GDPR"
        
        # Registros de verificações
        self.check_history = []
        
        # Regras de verificação
        self.rules = {
            "store": [
                "consent_obtained",
                "necessary_data_only",
                "secure_storage",
                "data_retention_policy"
            ],
            "process": [
                "consent_obtained",
                "legitimate_purpose",
                "necessary_data_only",
                "data_minimization",
                "access_controls"
            ],
            "share": [
                "consent_obtained",
                "explicit_consent_for_sharing",
                "legitimate_purpose",
                "recipient_compliance",
                "data_transfer_agreement"
            ],
            "delete": [
                "identity_verified",
                "complete_erasure",
                "third_party_notification"
            ]
        }
        
        # Verificações sensíveis por tipo de dado
        self.sensitive_data_types = [
            "cpf", "rg", "id", "passport", "credit_card", "health", "religion", 
            "political", "sexual_orientation", "biometric", "genetic", "location"
        ]
    
    def is_sensitive_data_present(self, data):
        """
        Verifica se há dados sensíveis presentes na requisição
        
        Args:
            data: Dicionário com os dados a serem verificados
            
        Returns:
            tuple: (há_dados_sensíveis, lista_de_tipos_sensíveis)
        """
        if not data or not isinstance(data, dict):
            return False, []
        
        sensitive_types_found = []
        
        # Converter o dicionário para string para facilitar a procura
        data_str = json.dumps(data, ensure_ascii=False).lower()
        
        for data_type in self.sensitive_data_types:
            if data_type in data_str:
                sensitive_types_found.append(data_type)
        
        return bool(sensitive_types_found), sensitive_types_found
    
    def check_operation_compliance(self, operation, data):
        """
        Verifica a conformidade de uma operação com as regras de privacidade
        
        Args:
            operation: Tipo de operação (store, process, share, delete)
            data: Dicionário com os dados e configurações da operação
            
        Returns:
            dict: Resultado da verificação de conformidade
        """
        try:
            result = {
                "compliant": False,
                "operation": operation,
                "timestamp": datetime.now().isoformat(),
                "checks": [],
                "sensitive_data": False,
                "sensitive_types": [],
                "recommendations": []
            }
            
            # Verifica se a operação é suportada
            if operation not in self.rules:
                result["reason"] = f"Operação desconhecida: {operation}"
                result["recommendations"].append("Use uma das operações suportadas: store, process, share, delete")
                return result
            
            # Verifica dados sensíveis
            is_sensitive, sensitive_types = self.is_sensitive_data_present(data)
            result["sensitive_data"] = is_sensitive
            result["sensitive_types"] = sensitive_types
            
            # Obtém as regras aplicáveis
            required_checks = self.rules[operation]
            
            # Inicializa verificações
            all_passed = True
            for check in required_checks:
                check_result = {
                    "rule": check,
                    "passed": check in data and data[check] == True,
                    "description": self.get_rule_description(check)
                }
                
                result["checks"].append(check_result)
                
                if not check_result["passed"]:
                    all_passed = False
                    result["recommendations"].append(self.get_recommendation(check))
            
            # Verificações adicionais para dados sensíveis
            if is_sensitive:
                sensitive_check = {
                    "rule": "sensitive_data_handling",
                    "passed": "sensitive_data_handling" in data and data["sensitive_data_handling"] == True,
                    "description": "Dados sensíveis requerem tratamento especial conforme LGPD/GDPR"
                }
                
                result["checks"].append(sensitive_check)
                
                if not sensitive_check["passed"]:
                    all_passed = False
                    result["recommendations"].append(
                        "Implemente tratamento especial para dados sensíveis, "
                        "incluindo consentimento explícito e medidas de segurança reforçadas"
                    )
            
            # Define o resultado final
            result["compliant"] = all_passed
            if not all_passed:
                result["reason"] = "Nem todas as verificações de conformidade foram aprovadas"
            
            # Registra a verificação
            self.check_history.append({
                "operation": operation,
                "timestamp": result["timestamp"],
                "compliant": result["compliant"],
                "sensitive_data": result["sensitive_data"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao verificar conformidade: {str(e)}")
            return {
                "compliant": False,
                "operation": operation,
                "reason": f"Erro ao verificar conformidade: {str(e)}",
                "recommendations": ["Verifique o formato dos dados enviados e tente novamente"]
            }
    
    def get_rule_description(self, rule):
        """Retorna uma descrição para a regra especificada"""
        descriptions = {
            "consent_obtained": "Consentimento explícito do usuário para o tratamento dos dados",
            "necessary_data_only": "Apenas dados necessários para a finalidade declarada",
            "secure_storage": "Armazenamento seguro com criptografia e controles de acesso",
            "data_retention_policy": "Política de retenção de dados definida e aplicada",
            "legitimate_purpose": "Finalidade legítima e declarada para o processamento",
            "data_minimization": "Minimização de dados, processando apenas o necessário",
            "access_controls": "Controles de acesso implementados e auditados",
            "explicit_consent_for_sharing": "Consentimento específico para compartilhamento",
            "recipient_compliance": "Destinatário em conformidade com LGPD/GDPR",
            "data_transfer_agreement": "Acordo de transferência de dados em vigor",
            "identity_verified": "Identidade do titular dos dados verificada",
            "complete_erasure": "Exclusão completa dos dados de todos os sistemas",
            "third_party_notification": "Notificação aos terceiros sobre a exclusão",
            "sensitive_data_handling": "Tratamento especial para dados sensíveis conforme regulamentos"
        }
        
        return descriptions.get(rule, f"Regra: {rule}")
    
    def get_recommendation(self, rule):
        """Retorna uma recomendação para a regra que falhou"""
        recommendations = {
            "consent_obtained": "Implemente um mecanismo de consentimento explícito antes do tratamento dos dados",
            "necessary_data_only": "Revise os dados coletados para garantir que apenas os necessários sejam solicitados",
            "secure_storage": "Implemente criptografia e controles de acesso adequados para armazenamento",
            "data_retention_policy": "Estabeleça uma política clara de retenção de dados e mecanismos de exclusão",
            "legitimate_purpose": "Documente e comunique claramente o propósito do processamento de dados",
            "data_minimization": "Processe apenas os dados necessários para atingir o objetivo declarado",
            "access_controls": "Implemente controles de acesso baseados em papéis e registre todos os acessos",
            "explicit_consent_for_sharing": "Obtenha consentimento específico para compartilhamento antes de transferir dados",
            "recipient_compliance": "Verifique se o destinatário está em conformidade com LGPD/GDPR",
            "data_transfer_agreement": "Estabeleça um acordo formal de transferência de dados",
            "identity_verified": "Implemente um processo robusto de verificação de identidade",
            "complete_erasure": "Garanta que a exclusão seja completa em todos os sistemas e backups",
            "third_party_notification": "Notifique todos os terceiros que receberam os dados sobre a exclusão"
        }
        
        return recommendations.get(rule, f"Implemente a regra: {rule}")
    
    def get_audit_log(self, limit=10):
        """
        Retorna os últimos registros de verificação
        
        Args:
            limit: Número máximo de registros a retornar
            
        Returns:
            list: Lista de verificações recentes
        """
        return sorted(
            self.check_history,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:limit]
    
    def run(self, operation, data, return_recommendations=True):
        """
        Método principal para execução da ferramenta
        
        Args:
            operation: Tipo de operação (store, process, share, delete)
            data: Dicionário com os dados e configurações da operação
            return_recommendations: Se True, inclui recomendações no resultado
            
        Returns:
            dict: Resultado da verificação
        """
        try:
            # Executa a verificação
            result = self.check_operation_compliance(operation, data)
            
            # Remove recomendações se não solicitadas
            if not return_recommendations:
                result.pop("recommendations", None)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao executar verificação de conformidade: {str(e)}")
            return {
                "compliant": False,
                "error": str(e),
                "recommendations": ["Consulte um especialista em conformidade para avaliar esta operação"]
            }

# Cria uma instância da ferramenta para uso
compliance_checker = ComplianceCheckerTool()

# Função auxiliar para interface com o CrewAI
def check_compliance(operation, data, return_recommendations=True):
    """
    Verifica a conformidade de uma operação
    
    Args:
        operation: Tipo de operação (store, process, share, delete)
        data: Dicionário com os dados e configurações da operação
        return_recommendations: Se True, inclui recomendações no resultado
        
    Returns:
        str: Resultado em formato JSON
    """
    result = compliance_checker.run(operation, data, return_recommendations)
    return json.dumps(result)

# Teste simples se executado diretamente
if __name__ == "__main__":
    # Exemplo de verificação para armazenamento de dados
    test_data = {
        "consent_obtained": True,
        "necessary_data_only": True,
        "secure_storage": True,
        "data_retention_policy": False,
        "name": "João Silva",
        "email": "joao@example.com",
        "cpf": "123.456.789-00"  # Dado sensível
    }
    
    print("🔍 Verificando conformidade para operação de armazenamento...")
    result = compliance_checker.run("store", test_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))