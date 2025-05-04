/**
 * Adaptador para APIs bancárias - Integração Open Banking
 * 
 * Este módulo fornece uma interface unificada para trabalhar com diferentes
 * APIs bancárias, incluindo Open Banking Brasil (Open Finance)
 */
import axios, { AxiosInstance } from 'axios';
import { BankAccount, Bank, Transaction, InsertTransaction } from '../shared/schema';
import { storage } from './storage';

interface BankApiConfig {
  baseUrl: string;
  apiType: string;  // open_banking, direct_api
  accessToken?: string;
  refreshToken?: string;
}

// Interface para informações da conta bancária
interface AccountInfo {
  accountId: string;
  accountType: string;
  accountNumber: string;
  agency?: string;
  balance: number;
  currencyCode: string;
}

// Interface para transação bancária da API
interface BankTransaction {
  id: string;
  date: string;
  datetime: string;
  description: string;
  amount: number;
  balance?: number;
  category?: string;
  subcategory?: string;
  type: string;
  status: string;
  payee?: string;
  metadata?: any;
}

/**
 * Classe principal do adaptador para APIs bancárias
 */
export class BankAdapter {
  private config: BankApiConfig;
  private api: AxiosInstance;
  private bankAccount?: BankAccount;
  private bank?: Bank;

  constructor(config: BankApiConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: config.accessToken ? {
        'Authorization': `Bearer ${config.accessToken}`
      } : {},
    });
  }

  /**
   * Configura o adaptador para uma conta bancária específica
   */
  async setupForAccount(bankAccountId: number): Promise<boolean> {
    try {
      // Busca dados da conta bancária
      const bankAccount = await storage.getBankAccount(bankAccountId);
      if (!bankAccount) {
        console.error(`Conta bancária com ID ${bankAccountId} não encontrada`);
        return false;
      }

      // Busca dados do banco
      const bank = await storage.getBank(bankAccount.bankId);
      if (!bank) {
        console.error(`Banco com ID ${bankAccount.bankId} não encontrado`);
        return false;
      }

      this.bankAccount = bankAccount;
      this.bank = bank;

      // Configura API com tokens da conta
      this.api = axios.create({
        baseURL: bank.apiBaseUrl,
        headers: bankAccount.accessToken ? {
          'Authorization': `Bearer ${bankAccount.accessToken}`
        } : {},
      });

      // Verifica se o token precisa ser renovado
      if (bankAccount.tokenExpiry && new Date(bankAccount.tokenExpiry) < new Date()) {
        await this.refreshAccessToken();
      }

      return true;
    } catch (error) {
      console.error('Erro ao configurar adaptador para conta bancária:', error);
      return false;
    }
  }

  /**
   * Renova o token de acesso usando o refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.bankAccount || !this.bank || !this.bankAccount.refreshToken) {
      console.error('Dados insuficientes para renovar token de acesso');
      return false;
    }

    try {
      let response;
      
      if (this.bank.apiType === 'open_banking') {
        // Implementação para Open Banking Brasil
        response = await axios.post(`${this.bank.apiBaseUrl}/oauth/token`, {
          grant_type: 'refresh_token',
          refresh_token: this.bankAccount.refreshToken,
        });
      } else {
        // Implementação para APIs diretas (pode variar por banco)
        response = await axios.post(`${this.bank.apiBaseUrl}/auth/refresh`, {
          refresh_token: this.bankAccount.refreshToken,
        });
      }

      // Atualiza os tokens na conta bancária
      if (response.data.access_token) {
        await storage.updateBankAccountTokens(this.bankAccount.id, {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || this.bankAccount.refreshToken,
          tokenExpiry: response.data.expires_in ? 
            new Date(Date.now() + (response.data.expires_in * 1000)) : 
            null,
        });

        // Atualiza a instância da API com o novo token
        this.api = axios.create({
          baseURL: this.bank.apiBaseUrl,
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          },
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao renovar token de acesso:', error);
      return false;
    }
  }

  /**
   * Obtém informações da conta
   */
  async getAccountInfo(): Promise<AccountInfo | null> {
    if (!this.bankAccount || !this.bank) {
      console.error('Adaptador não configurado para conta bancária');
      return null;
    }

    try {
      let response;
      
      if (this.bank.apiType === 'open_banking') {
        // Open Banking Brasil
        response = await this.api.get('/accounts/v1/accounts');
        
        // Formata a resposta para o padrão da aplicação
        const account = response.data.data.account[0];
        return {
          accountId: account.accountId,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          agency: account.branch,
          balance: parseFloat(account.availableAmount.amount),
          currencyCode: account.availableAmount.currency,
        };
      } else {
        // APIs diretas - implementação específica por banco
        response = await this.api.get('/accounts');
        
        // Ajuste para o formato da API específica
        return {
          accountId: response.data.id,
          accountType: response.data.type,
          accountNumber: response.data.number,
          agency: response.data.agency,
          balance: parseFloat(response.data.balance),
          currencyCode: response.data.currency || 'BRL',
        };
      }
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error);
      return null;
    }
  }

  /**
   * Obtém transações da conta
   */
  async getTransactions(startDate?: Date, endDate?: Date): Promise<BankTransaction[]> {
    if (!this.bankAccount || !this.bank) {
      console.error('Adaptador não configurado para conta bancária');
      return [];
    }

    try {
      let response;
      const today = new Date();
      const defaultEndDate = endDate || today;
      const defaultStartDate = startDate || new Date(today.setMonth(today.getMonth() - 1));
      
      // Formato de data: YYYY-MM-DD
      const fromDate = defaultStartDate.toISOString().split('T')[0];
      const toDate = defaultEndDate.toISOString().split('T')[0];
      
      if (this.bank.apiType === 'open_banking') {
        // Open Banking Brasil
        response = await this.api.get(`/transactions/v1/accounts/${this.bankAccount.accountNumber}/transactions`, {
          params: {
            fromBookingDate: fromDate,
            toBookingDate: toDate
          }
        });
        
        // Converte do formato Open Banking para o nosso formato interno
        return response.data.data.transaction.map((transaction: any) => ({
          id: transaction.transactionId,
          date: transaction.bookingDate,
          datetime: transaction.bookingDate + 'T12:00:00Z', // Aproximação, já que Open Banking não tem hora
          description: transaction.transactionName || transaction.creditDebitType,
          amount: parseFloat(transaction.amount.amount) * (transaction.creditDebitType === 'DEBIT' ? -1 : 1),
          balance: null, // Muitas vezes não está disponível na API
          type: transaction.creditDebitType === 'DEBIT' ? 'debit' : 'credit',
          status: 'completed', // Assume que transações reportadas já estão concluídas
          payee: transaction.counterpartyName || null,
          category: null, // Open Banking não fornece categorização
          metadata: {
            completionDate: transaction.completionDate,
            currencyCode: transaction.amount.currency,
            paymentType: transaction.paymentType
          }
        }));
      } else {
        // APIs diretas - implementação específica por banco
        response = await this.api.get('/transactions', {
          params: {
            from: fromDate,
            to: toDate
          }
        });
        
        // Converte do formato específico para o nosso formato interno
        return response.data.transactions.map((transaction: any) => ({
          id: transaction.id,
          date: transaction.date,
          datetime: transaction.datetime || transaction.date + 'T00:00:00Z',
          description: transaction.description,
          amount: parseFloat(transaction.amount),
          balance: transaction.balance ? parseFloat(transaction.balance) : null,
          type: transaction.amount < 0 ? 'debit' : 'credit',
          status: transaction.status || 'completed',
          payee: transaction.payee,
          category: transaction.category,
          subcategory: transaction.subcategory,
          metadata: transaction.metadata || {}
        }));
      }
    } catch (error) {
      console.error('Erro ao obter transações:', error);
      return [];
    }
  }

  /**
   * Sincroniza as transações com o banco de dados
   */
  async syncTransactions(startDate?: Date, endDate?: Date): Promise<number> {
    if (!this.bankAccount) {
      console.error('Adaptador não configurado para conta bancária');
      return 0;
    }

    try {
      // Busca transações da API do banco
      const apiTransactions = await this.getTransactions(startDate, endDate);
      if (!apiTransactions.length) {
        console.log('Nenhuma transação encontrada para sincronização');
        return 0;
      }

      // Busca transações existentes do banco de dados para o período
      const existingTransactions = await storage.getTransactionsByBankAccountId(
        this.bankAccount.id, 
        startDate, 
        endDate
      );

      // Identifica quais transações precisam ser inseridas
      const existingExternalIds = new Set(
        existingTransactions
          .filter(t => t.externalId)
          .map(t => t.externalId)
      );

      // Prepara transações para inserção
      const transactionsToInsert: InsertTransaction[] = apiTransactions
        .filter(apiTx => !existingExternalIds.has(apiTx.id))
        .map(apiTx => ({
          bankAccountId: this.bankAccount!.id,
          externalId: apiTx.id,
          date: new Date(apiTx.date),
          datetime: new Date(apiTx.datetime),
          description: apiTx.description,
          amount: apiTx.amount.toString(),
          balance: apiTx.balance ? apiTx.balance.toString() : null,
          category: apiTx.category || null,
          subcategory: apiTx.subcategory || null,
          payee: apiTx.payee || null,
          status: apiTx.status,
          type: apiTx.type,
          notes: null,
          isRecurring: false,
          recurringId: null,
          metadata: apiTx.metadata || null
        }));

      // Insere novas transações
      if (transactionsToInsert.length > 0) {
        await storage.createTransactions(transactionsToInsert);
        
        // Atualiza timestamp de última sincronização
        await storage.updateBankAccountLastSynced(this.bankAccount.id);
        
        console.log(`${transactionsToInsert.length} novas transações sincronizadas`);
        return transactionsToInsert.length;
      }
      
      console.log('Todas as transações já estão sincronizadas');
      return 0;
    } catch (error) {
      console.error('Erro ao sincronizar transações:', error);
      return 0;
    }
  }

  /**
   * Atualiza o saldo da conta bancária
   */
  async updateAccountBalance(): Promise<boolean> {
    if (!this.bankAccount) {
      console.error('Adaptador não configurado para conta bancária');
      return false;
    }

    try {
      const accountInfo = await this.getAccountInfo();
      if (!accountInfo) {
        console.error('Não foi possível obter informações da conta');
        return false;
      }

      // Atualiza o saldo no banco de dados
      await storage.updateBankAccountBalance(
        this.bankAccount.id, 
        accountInfo.balance.toString()
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar saldo da conta:', error);
      return false;
    }
  }
}

/**
 * Factory para criar um adaptador bancário
 */
export async function createBankAdapter(bankId: number): Promise<BankAdapter | null> {
  try {
    const bank = await storage.getBank(bankId);
    if (!bank) {
      console.error(`Banco com ID ${bankId} não encontrado`);
      return null;
    }

    return new BankAdapter({
      baseUrl: bank.apiBaseUrl,
      apiType: bank.apiType,
    });
  } catch (error) {
    console.error('Erro ao criar adaptador bancário:', error);
    return null;
  }
}

/**
 * Função para autorizar uma conta bancária (inicia o fluxo OAuth)
 */
export function getOAuthUrl(bankId: number): string | null {
  // Esta função seria específica para cada banco, usando Open Banking Brasil
  // ou APIs proprietárias para gerar URLs de autorização
  return null;
}

/**
 * Processa o callback OAuth de um banco
 */
export async function handleOAuthCallback(bankId: number, userId: number, code: string): Promise<boolean> {
  // Implementação específica para cada banco
  return false;
}