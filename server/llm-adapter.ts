/**
 * LLM Adapter - Adaptador flexível para diferentes provedores de LLM
 * 
 * Este módulo fornece uma interface unificada para trabalhar com diferentes
 * modelos de linguagem, incluindo:
 * - OpenAI API (gpt-4o)
 * - Anthropic API (claude-3)
 * - xAI API (grok)
 * - API Local (via API compatível com OpenAI)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Tipos de provedores LLM suportados
export type LLMProvider = 'openai' | 'anthropic' | 'xai' | 'local';

// Interface para configuração de LLM
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string; // Para provedores locais ou personalizados
  model?: string;   // Modelo específico a ser usado
}

// Interface para mensagem
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Interface para opções de geração
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Classe principal do adaptador LLM
 */
export class LLMAdapter {
  private config: LLMConfig;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Inicializa o cliente apropriado com base no provedor escolhido
   */
  private initialize() {
    switch(this.config.provider) {
      case 'openai':
        if (!this.config.apiKey) {
          throw new Error('API Key é necessária para o provedor OpenAI');
        }
        this.openai = new OpenAI({ 
          apiKey: this.config.apiKey,
          baseURL: this.config.baseUrl
        });
        break;
        
      case 'anthropic':
        if (!this.config.apiKey) {
          throw new Error('API Key é necessária para o provedor Anthropic');
        }
        this.anthropic = new Anthropic({
          apiKey: this.config.apiKey
        });
        break;
        
      case 'xai':
        if (!this.config.apiKey) {
          throw new Error('API Key é necessária para o provedor xAI');
        }
        this.openai = new OpenAI({ 
          apiKey: this.config.apiKey,
          baseURL: 'https://api.x.ai/v1'
        });
        break;
        
      case 'local':
        if (!this.config.baseUrl) {
          throw new Error('URL base é necessária para o provedor local');
        }
        this.openai = new OpenAI({ 
          apiKey: this.config.apiKey || 'sk-no-key-required',
          baseURL: this.config.baseUrl
        });
        break;
        
      default:
        throw new Error(`Provedor LLM não suportado: ${this.config.provider}`);
    }
  }

  /**
   * Obtem o modelo padrão para o provedor atual
   */
  private getDefaultModel(): string {
    switch(this.config.provider) {
      case 'openai':
        return 'gpt-4o'; // o modelo mais recente da OpenAI
      case 'anthropic':
        return 'claude-3-7-sonnet-20250219'; // o modelo mais recente da Anthropic
      case 'xai':
        return 'grok-2-1212';
      case 'local':
        // Retorna o modelo especificado nas variáveis de ambiente ou um padrão
        return process.env.LOCAL_LLM_MODEL || 'Qwen3-32B-Q3_K_L.gguf';
      default:
        return 'gpt-4o';
    }
  }

  /**
   * Gera uma resposta para uma série de mensagens
   */
  async generateResponse(
    messages: Message[], 
    options: GenerationOptions = {}
  ): Promise<string> {
    try {
      const model = this.config.model || this.getDefaultModel();
      
      // Define opções padrão se não fornecidas
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 1000;
      
      switch(this.config.provider) {
        case 'openai':
        case 'xai':
        case 'local':
          if (!this.openai) {
            throw new Error('Cliente OpenAI não inicializado');
          }
          
          const openaiResponse = await this.openai.chat.completions.create({
            model,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            temperature,
            max_tokens: maxTokens
          });
          
          return openaiResponse.choices[0].message.content || '';
          
        case 'anthropic':
          if (!this.anthropic) {
            throw new Error('Cliente Anthropic não inicializado');
          }
          
          // Converte mensagens para o formato esperado pelo Anthropic
          const systemMessage = messages.find(m => m.role === 'system');
          const conversationMessages = messages.filter(m => m.role !== 'system');
          
          const anthropicResponse = await this.anthropic.messages.create({
            model,
            system: systemMessage?.content,
            messages: conversationMessages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user', // Garantir compatibilidade
              content: m.content
            })),
            temperature,
            max_tokens: maxTokens
          });
          
          // Anthropic atualiza constantemente suas interfaces, vamos tratar todos os casos
          if (anthropicResponse.content && anthropicResponse.content.length > 0) {
            const firstContent = anthropicResponse.content[0];
            if (typeof firstContent === 'string') {
              return firstContent;
            } else if ('type' in firstContent && firstContent.type === 'text' && 'text' in firstContent) {
              return String(firstContent.text);
            }
          }
          
          // Fallback para qualquer formato de resposta
          return JSON.stringify(anthropicResponse.content) || "Não foi possível obter uma resposta clara";
          
        default:
          throw new Error(`Provedor LLM não suportado: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao gerar resposta com ${this.config.provider}:`, error);
      throw error;
    }
  }
}

/**
 * Factory para criar um cliente LLM baseado na configuração do ambiente
 */
export function createDefaultLLMClient(): LLMAdapter {
  // Verifica se temos credenciais Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return new LLMAdapter({
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  // Verifica se temos credenciais xAI
  if (process.env.XAI_API_KEY) {
    return new LLMAdapter({
      provider: 'xai',
      apiKey: process.env.XAI_API_KEY
    });
  }
  
  // Verifica se temos uma configuração para API local
  if (process.env.LOCAL_LLM_URL) {
    return new LLMAdapter({
      provider: 'local',
      baseUrl: process.env.LOCAL_LLM_URL,
      apiKey: process.env.LOCAL_LLM_KEY
    });
  }
  
  // Cai para OpenAI como padrão
  if (process.env.OPENAI_API_KEY) {
    return new LLMAdapter({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  throw new Error('Nenhuma configuração LLM válida encontrada no ambiente');
}

// Instância singleton para uso em toda a aplicação
let defaultLLMClient: LLMAdapter | null = null;

export function getDefaultLLMClient(): LLMAdapter {
  if (!defaultLLMClient) {
    try {
      defaultLLMClient = createDefaultLLMClient();
    } catch (error) {
      console.error('❌ Erro ao criar cliente LLM padrão:', error);
      throw error;
    }
  }
  return defaultLLMClient;
}

/**
 * Processa texto usando o LLM padrão configurado
 */
export async function processText(
  prompt: string, 
  systemPrompt?: string
): Promise<string> {
  try {
    const llm = getDefaultLLMClient();
    
    const messages: Message[] = [];
    
    // Adiciona o prompt do sistema se fornecido
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Adiciona a mensagem do usuário
    messages.push({
      role: 'user',
      content: prompt
    });
    
    return await llm.generateResponse(messages);
  } catch (error) {
    console.error('❌ Erro ao processar texto com LLM:', error);
    throw error;
  }
}

/**
 * Função principal que pode substituir processMessage do OpenAI
 */
export async function processUserMessage(
  userId: number, 
  message: string, 
  systemPrompt?: string
): Promise<string> {
  try {
    // Aqui podemos adicionar lógica para carregar o histórico do usuário,
    // personalizar o prompt do sistema, etc.
    
    const defaultSystemPrompt = systemPrompt || 
      `Você é o TarefoAI, um assistente pessoal focado em produtividade.
       Você está conversando com o usuário ID: ${userId}.
       Seja útil, conciso e respeitoso. Evite respostas extremamente longas.
       Sempre comunique-se em português (Brasil).`;
    
    return await processText(message, defaultSystemPrompt);
  } catch (error) {
    console.error(`❌ Erro ao processar mensagem do usuário ${userId}:`, error);
    // Retorna uma mensagem amigável de erro
    return "Desculpe, estou com dificuldades para processar sua mensagem neste momento. Por favor, tente novamente em alguns instantes.";
  }
}