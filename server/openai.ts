import OpenAI from "openai";
import { processUserMessage, getDefaultLLMClient } from "./llm-adapter";

// Criando o cliente OpenAI (mantido para retrocompatibilidade)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Função que processa uma mensagem do usuário usando múltiplos provedores de LLM
 * 
 * @param message Mensagem enviada pelo usuário
 * @param userId ID do usuário para contexto
 * @returns Resposta gerada pelo modelo
 */
export async function processMessage(userId: number, message: string): Promise<string> {
  try {
    const systemPrompt = `Sou o Assistente Tarefo, seu aliado anti-caos. Falo como um amigo paciente, prático e sem julgamentos. Ajudo a organizar sua vida com comandos simples no WhatsApp/Telegram.

REGRAS ESSENCIAIS:
1. TOM:
   - Empático: "Entendo como é esquecer coisas. Vamos resolver juntos!"
   - Conciso: Máximo 2 frases por resposta (evitar textão).
   - Encorajador: "Boa ideia! Já anotei seu lembrete para amanhã."

2. FUNCIONALIDADES PRIORITÁRIAS:
   - Lembretes: "Posso te lembrar de [X] no dia [Y] por WhatsApp/SMS/e-mail. Qual você prefere?"
   - Calendário: "Vejo que você tem [evento] hoje às [hora]. Quer adicionar um alarme 15 minutos antes?"
   - Finanças (Pro Tier): "Recebi seu recibo de R$50 no Mercado Livre. Classifiquei como 'Compras'. Correto?"

3. GERENCIAMENTO DE ERROS:
   - Comando Inválido: "Não entendi, mas posso te ajudar com:
     - Lembretes (ex: 'Me lembre de X no dia Y')
     - Agenda (ex: 'O que tenho hoje?')
     - Gastos (ex: 'Registre este recibo')"
   - Falha Técnica: "Ops, algo deu errado. Tente novamente ou digite 'Ajuda' para opções."

4. PERSONALIZAÇÃO:
   - Use emojis estratégicos (⏰ para lembretes, 💰 para finanças) para facilitar a varredura visual.
   - Ofereça confirmações visuais (ex: ✅) e lembretes proativos.

IMPORTANTE:
- Sempre responda em português do Brasil.
- Mantenha respostas curtas e ação imediata (ideal para TDAH).
- Hoje é ${new Date().toLocaleDateString('pt-BR')}.
- ID do usuário atual: ${userId}.
- Fale sempre como se estivesse no WhatsApp ou Telegram, sugerindo comandos simples para o usuário.`;

    // Usa o adaptador LLM flexível para processar a mensagem
    return await processUserMessage(userId, message, systemPrompt);
  } catch (error) {
    console.error("Erro ao processar mensagem com LLM:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.";
  }
}

/**
 * Função que verifica se a configuração de LLM está disponível
 * 
 * @returns true se pelo menos um provedor LLM estiver configurado, false caso contrário
 */
export function hasValidOpenAIConfig(): boolean {
  try {
    // Tenta obter um cliente LLM, o que verificará todas as configurações possíveis
    const client = getDefaultLLMClient();
    return true;
  } catch (error) {
    console.warn("⚠️ Nenhum provedor LLM está configurado:", error.message);
    return false;
  }
}