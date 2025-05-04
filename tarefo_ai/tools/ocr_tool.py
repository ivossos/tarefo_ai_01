"""
Ferramenta de OCR para o TarefoAI
"""
import os
import json
from pathlib import Path
from PIL import Image
import base64

# Esta ferramenta simula funcionalidade OCR sem dependências externas
# Em um ambiente de produção, usaríamos bibliotecas como OpenCV, Tesseract, etc.

class OCRTool:
    """Ferramenta para extrair texto de imagens"""
    
    def __init__(self):
        # Configurações da ferramenta
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.pdf']
        self.name = "OCR Tool"
        self.description = "Extração de texto e dados de imagens e documentos"
    
    def _check_image_file(self, image_path):
        """Valida se o arquivo é uma imagem em formato suportado"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {image_path}")
        
        file_ext = os.path.splitext(image_path)[1].lower()
        if file_ext not in self.supported_formats:
            raise ValueError(f"Formato não suportado: {file_ext}. Use: {', '.join(self.supported_formats)}")
        
        return True
    
    def extract_text(self, image_path):
        """
        Extrai texto de uma imagem
        
        Args:
            image_path: Caminho para o arquivo de imagem
            
        Returns:
            str: Texto extraído da imagem
        """
        try:
            self._check_image_file(image_path)
            
            # Em produção, usaríamos algo como:
            # return pytesseract.image_to_string(Image.open(image_path), lang='por')
            
            # Simulação para desenvolvimento
            print(f"🔍 Processando OCR na imagem: {image_path}")
            
            # Retornamos um placeholder para desenvolvimento
            return "[Texto extraído da imagem seria mostrado aqui]"
            
        except Exception as e:
            print(f"❌ Erro ao extrair texto: {str(e)}")
            return f"Erro na extração de texto: {str(e)}"
    
    def process_receipt(self, image_path):
        """
        Processa um recibo para extrair informações estruturadas
        
        Args:
            image_path: Caminho para o arquivo de imagem do recibo
            
        Returns:
            dict: Dados estruturados do recibo
        """
        try:
            self._check_image_file(image_path)
            
            # Em produção, usaríamos algoritmos específicos para recibos
            print(f"🧾 Processando recibo na imagem: {image_path}")
            
            # Retornamos dados estruturados para desenvolvimento
            receipt_data = {
                "establishment": "",
                "date": "",
                "time": "",
                "total": 0.0,
                "items": [],
                "payment_method": "",
                "tax": 0.0
            }
            
            # TODO: Implementar extração real dos dados
            # receipt_data = extract_receipt_data(image_path)
            
            return receipt_data
            
        except Exception as e:
            print(f"❌ Erro ao processar recibo: {str(e)}")
            return {"error": str(e)}
    
    def extract_data_by_type(self, image_path, extract_type="full"):
        """
        Extrai dados de uma imagem com base no tipo de extração
        
        Args:
            image_path: Caminho para o arquivo de imagem
            extract_type: Tipo de extração (full, receipt, invoice)
            
        Returns:
            dict: Dados extraídos da imagem
        """
        try:
            if extract_type == "receipt":
                return self.process_receipt(image_path)
            elif extract_type == "invoice":
                # TODO: Implementar processamento específico para faturas
                return {"message": "Processamento de faturas não implementado ainda"}
            else:  # full
                # Extração de texto completa
                text = self.extract_text(image_path)
                return {"text": text}
                
        except Exception as e:
            print(f"❌ Erro na extração de dados: {str(e)}")
            return {"error": str(e)}
    
    def save_image_from_base64(self, base64_data, output_dir="uploads"):
        """
        Salva uma imagem a partir de dados base64
        
        Args:
            base64_data: String base64 da imagem
            output_dir: Diretório para salvar a imagem
            
        Returns:
            str: Caminho do arquivo salvo
        """
        try:
            # Cria o diretório se não existir
            os.makedirs(output_dir, exist_ok=True)
            
            # Remove o cabeçalho se houver (data:image/jpeg;base64,)
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            # Decodifica o base64
            image_data = base64.b64decode(base64_data)
            
            # Gera um nome de arquivo único
            file_path = os.path.join(output_dir, f"image_{os.urandom(8).hex()}.jpg")
            
            # Salva o arquivo
            with open(file_path, 'wb') as f:
                f.write(image_data)
            
            print(f"✅ Imagem salva em: {file_path}")
            return file_path
            
        except Exception as e:
            print(f"❌ Erro ao salvar imagem: {str(e)}")
            return None
    
    def run(self, image_path, extract_type="full"):
        """
        Método principal para execução da ferramenta
        
        Args:
            image_path: Caminho para o arquivo de imagem ou dados base64
            extract_type: Tipo de extração (full, receipt, invoice)
            
        Returns:
            dict: Resultados da extração
        """
        try:
            # Verifica se é uma string base64
            if isinstance(image_path, str) and image_path.startswith(('data:image', 'data:application')):
                image_path = self.save_image_from_base64(image_path)
                if not image_path:
                    return {"error": "Falha ao processar dados da imagem"}
            
            # Executa a extração apropriada
            result = self.extract_data_by_type(image_path, extract_type)
            
            # Adiciona metadados
            result["processed_by"] = self.name
            result["extract_type"] = extract_type
            
            return result
            
        except Exception as e:
            print(f"❌ Erro ao executar ferramenta OCR: {str(e)}")
            return {"error": str(e), "processed_by": self.name}

# Cria uma instância da ferramenta para uso
ocr_tool = OCRTool()

# Função auxiliar para interface com o CrewAI
def process_image(image_path, extract_type="full"):
    """
    Processa uma imagem usando a ferramenta OCR
    
    Args:
        image_path: Caminho ou dados base64 da imagem
        extract_type: Tipo de extração (full, receipt, invoice)
        
    Returns:
        str: Resultado em formato JSON
    """
    result = ocr_tool.run(image_path, extract_type)
    return json.dumps(result)

# Teste simples se executado diretamente
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        extract_type = sys.argv[2] if len(sys.argv) > 2 else "full"
        
        print(f"Processando imagem: {image_path} (tipo: {extract_type})")
        result = ocr_tool.run(image_path, extract_type)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("Uso: python ocr_tool.py <caminho_da_imagem> [tipo_de_extração]")
        print("Tipos de extração: full, receipt, invoice")