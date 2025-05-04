/**
 * Rotas para recursos de finanças
 * 
 * Este módulo contém todas as rotas relacionadas a bancos, contas, transações,
 * metas financeiras, etc.
 */
import express from 'express';
import { storage } from './storage';
import { 
  insertBankSchema, 
  insertBankAccountSchema, 
  insertTransactionSchema,
  insertCategorySchema,
  insertFinancialGoalSchema,
  insertRecurringTransactionSchema
} from '@shared/schema';
import { createBankAdapter, handleOAuthCallback, getOAuthUrl } from './bank-adapter';
import { addDays, addMonths, addWeeks, parseISO } from 'date-fns';

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  next();
}

// Middleware para verificar se o usuário é administrador
function isAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  
  next();
}

export function registerFinanceRoutes(app: express.Express) {
  const router = express.Router();
  
  // Rotas de bancos
  router.get('/banks', async (req, res) => {
    try {
      const banks = await storage.getAllBanks();
      res.json(banks);
    } catch (error) {
      console.error('Erro ao buscar bancos:', error);
      res.status(500).json({ error: 'Erro ao buscar bancos' });
    }
  });
  
  router.get('/banks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bank = await storage.getBank(id);
      
      if (!bank) {
        return res.status(404).json({ error: 'Banco não encontrado' });
      }
      
      res.json(bank);
    } catch (error) {
      console.error('Erro ao buscar banco:', error);
      res.status(500).json({ error: 'Erro ao buscar banco' });
    }
  });
  
  router.post('/banks', isAdmin, async (req, res) => {
    try {
      const bankData = insertBankSchema.parse(req.body);
      const bank = await storage.createBank(bankData);
      res.status(201).json(bank);
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de banco' });
    }
  });
  
  router.put('/banks/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bankData = insertBankSchema.partial().parse(req.body);
      const bank = await storage.updateBank(id, bankData);
      
      if (!bank) {
        return res.status(404).json({ error: 'Banco não encontrado' });
      }
      
      res.json(bank);
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de banco' });
    }
  });
  
  router.delete('/banks/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBank(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Banco não encontrado' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
      res.status(500).json({ error: 'Erro ao excluir banco' });
    }
  });
  
  // Rotas de contas bancárias
  router.get('/accounts', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const accounts = await storage.getBankAccountsByUserId(req.session.userId);
      res.json(accounts);
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      res.status(500).json({ error: 'Erro ao buscar contas bancárias' });
    }
  });
  
  router.get('/accounts/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getBankAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta bancária não encontrada' });
      }
      
      // Verificar se a conta pertence ao usuário logado
      if (!req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta' });
      }
      
      res.json(account);
    } catch (error) {
      console.error('Erro ao buscar conta bancária:', error);
      res.status(500).json({ error: 'Erro ao buscar conta bancária' });
    }
  });
  
  router.post('/accounts', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const accountData = insertBankAccountSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const account = await storage.createBankAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de conta bancária' });
    }
  });
  
  router.put('/accounts/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getBankAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta bancária não encontrada' });
      }
      
      // Verificar se a conta pertence ao usuário logado
      if (!req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta' });
      }
      
      const accountData = insertBankAccountSchema.partial().parse(req.body);
      // Não permitir atualizar o usuário da conta
      delete accountData.userId;
      
      const updatedAccount = await storage.updateBankAccount(id, accountData);
      res.json(updatedAccount);
    } catch (error) {
      console.error('Erro ao atualizar conta bancária:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de conta bancária' });
    }
  });
  
  router.delete('/accounts/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getBankAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta bancária não encontrada' });
      }
      
      // Verificar se a conta pertence ao usuário logado
      if (!req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta' });
      }
      
      const success = await storage.deleteBankAccount(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir conta bancária:', error);
      res.status(500).json({ error: 'Erro ao excluir conta bancária' });
    }
  });
  
  // Rotas de autorização bancária (OAuth)
  router.get('/auth/:bankId', isAuthenticated, (req, res) => {
    try {
      const bankId = parseInt(req.params.bankId);
      const redirectUrl = getOAuthUrl(bankId);
      
      if (!redirectUrl) {
        return res.status(400).json({ error: 'Falha ao gerar URL de autorização' });
      }
      
      res.json({ url: redirectUrl });
    } catch (error) {
      console.error('Erro ao gerar URL de autorização:', error);
      res.status(500).json({ error: 'Erro ao gerar URL de autorização' });
    }
  });
  
  router.get('/auth/callback/:bankId', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const bankId = parseInt(req.params.bankId);
      const authCode = req.query.code as string;
      
      if (!authCode) {
        return res.status(400).json({ error: 'Código de autorização não fornecido' });
      }
      
      const success = await handleOAuthCallback(bankId, req.session.userId, authCode);
      
      if (success) {
        res.json({ success: true, message: 'Conta bancária conectada com sucesso' });
      } else {
        res.status(400).json({ error: 'Falha ao conectar conta bancária' });
      }
    } catch (error) {
      console.error('Erro ao processar callback OAuth:', error);
      res.status(500).json({ error: 'Erro ao processar callback OAuth' });
    }
  });
  
  // Rotas de sincronização
  router.post('/accounts/:id/sync', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getBankAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta bancária não encontrada' });
      }
      
      // Verificar se a conta pertence ao usuário logado
      if (!req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta' });
      }
      
      // Criar adaptador e configurar para a conta
      const adapter = await createBankAdapter(account.bankId);
      
      if (!adapter) {
        return res.status(400).json({ error: 'Falha ao criar adaptador bancário' });
      }
      
      const setupSuccess = await adapter.setupForAccount(id);
      
      if (!setupSuccess) {
        return res.status(400).json({ error: 'Falha ao configurar adaptador para conta' });
      }
      
      // Sincronizar transações
      let startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Último mês por padrão
      
      if (req.query.startDate) {
        startDate = parseISO(req.query.startDate as string);
      }
      
      let endDate = new Date();
      
      if (req.query.endDate) {
        endDate = parseISO(req.query.endDate as string);
      }
      
      const transactionCount = await adapter.syncTransactions(startDate, endDate);
      
      // Atualizar saldo
      const balanceUpdated = await adapter.updateAccountBalance();
      
      res.json({ 
        success: true, 
        transactionsSynced: transactionCount,
        balanceUpdated
      });
    } catch (error) {
      console.error('Erro ao sincronizar conta:', error);
      res.status(500).json({ error: 'Erro ao sincronizar conta' });
    }
  });
  
  // Rotas de transações
  router.get('/transactions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      // Parâmetros de paginação e filtragem
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = parseISO(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = parseISO(req.query.endDate as string);
      }
      
      const transactions = await storage.getTransactionsByUserId(
        req.session.userId,
        startDate,
        endDate,
        limit,
        offset
      );
      
      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  });
  
  router.get('/accounts/:accountId/transactions', isAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const account = await storage.getBankAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta bancária não encontrada' });
      }
      
      // Verificar se a conta pertence ao usuário logado
      if (!req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta' });
      }
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = parseISO(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = parseISO(req.query.endDate as string);
      }
      
      const transactions = await storage.getTransactionsByBankAccountId(
        accountId,
        startDate,
        endDate
      );
      
      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações da conta:', error);
      res.status(500).json({ error: 'Erro ao buscar transações da conta' });
    }
  });
  
  router.post('/transactions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Verificar se a conta bancária pertence ao usuário
      const account = await storage.getBankAccount(transactionData.bankAccountId);
      
      if (!account || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta conta bancária' });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de transação' });
    }
  });
  
  router.put('/transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      
      // Verificar se a conta bancária da transação pertence ao usuário
      const account = await storage.getBankAccount(transaction.bankAccountId);
      
      if (!account || !req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta transação' });
      }
      
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      
      // Não permitir alterar a conta bancária
      delete transactionData.bankAccountId;
      
      const updatedTransaction = await storage.updateTransaction(id, transactionData);
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de transação' });
    }
  });
  
  router.delete('/transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      
      // Verificar se a conta bancária da transação pertence ao usuário
      const account = await storage.getBankAccount(transaction.bankAccountId);
      
      if (!account || !req.session.userId || account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta transação' });
      }
      
      const success = await storage.deleteTransaction(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  });
  
  // Rotas de categorias
  router.get('/categories', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      // Buscar categorias do sistema e do usuário
      const systemCategories = await storage.getSystemCategories();
      const userCategories = await storage.getUserCategories(req.session.userId);
      
      // Combinar os resultados
      const allCategories = [...systemCategories, ...userCategories];
      
      res.json(allCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  });
  
  router.post('/categories', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: req.session.userId,
        isSystem: false // Usuários só podem criar categorias personalizadas
      });
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de categoria' });
    }
  });
  
  router.put('/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      // Verificar se é uma categoria do sistema
      if (category.isSystem) {
        return res.status(403).json({ error: 'Categorias do sistema não podem ser alteradas' });
      }
      
      // Verificar se a categoria pertence ao usuário
      if (!req.session.userId || category.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta categoria' });
      }
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      
      // Não permitir alterar o usuário ou o status de sistema
      delete categoryData.userId;
      delete categoryData.isSystem;
      
      const updatedCategory = await storage.updateCategory(id, categoryData);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de categoria' });
    }
  });
  
  router.delete('/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      // Verificar se é uma categoria do sistema
      if (category.isSystem) {
        return res.status(403).json({ error: 'Categorias do sistema não podem ser excluídas' });
      }
      
      // Verificar se a categoria pertence ao usuário
      if (!req.session.userId || category.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta categoria' });
      }
      
      const success = await storage.deleteCategory(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  });
  
  // Rotas para metas financeiras
  router.get('/goals', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const goals = await storage.getFinancialGoalsByUserId(req.session.userId);
      res.json(goals);
    } catch (error) {
      console.error('Erro ao buscar metas financeiras:', error);
      res.status(500).json({ error: 'Erro ao buscar metas financeiras' });
    }
  });
  
  router.post('/goals', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const goalData = insertFinancialGoalSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const goal = await storage.createFinancialGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      console.error('Erro ao criar meta financeira:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de meta financeira' });
    }
  });
  
  router.put('/goals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getFinancialGoal(id);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta financeira não encontrada' });
      }
      
      // Verificar se a meta pertence ao usuário
      if (!req.session.userId || goal.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta meta financeira' });
      }
      
      const goalData = insertFinancialGoalSchema.partial().parse(req.body);
      
      // Não permitir alterar o usuário
      delete goalData.userId;
      
      const updatedGoal = await storage.updateFinancialGoal(id, goalData);
      res.json(updatedGoal);
    } catch (error) {
      console.error('Erro ao atualizar meta financeira:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de meta financeira' });
    }
  });
  
  router.delete('/goals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getFinancialGoal(id);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta financeira não encontrada' });
      }
      
      // Verificar se a meta pertence ao usuário
      if (!req.session.userId || goal.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta meta financeira' });
      }
      
      const success = await storage.deleteFinancialGoal(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir meta financeira:', error);
      res.status(500).json({ error: 'Erro ao excluir meta financeira' });
    }
  });
  
  // Rotas para transações recorrentes
  router.get('/recurring-transactions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const recurringTransactions = await storage.getRecurringTransactionsByUserId(req.session.userId);
      res.json(recurringTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações recorrentes:', error);
      res.status(500).json({ error: 'Erro ao buscar transações recorrentes' });
    }
  });
  
  router.post('/recurring-transactions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não identificado' });
      }
      
      const recurringData = insertRecurringTransactionSchema.parse({
        ...req.body,
        userId: req.session.userId,
        isActive: true,
        lastProcessedDate: null,
        // Calcular próxima ocorrência com base na frequência
        nextOccurrence: calculateNextOccurrence(req.body.frequency, req.body.startDate)
      });
      
      // Verificar se a conta bancária pertence ao usuário
      if (recurringData.bankAccountId) {
        const account = await storage.getBankAccount(recurringData.bankAccountId);
        
        if (!account || account.userId !== req.session.userId) {
          return res.status(403).json({ error: 'Acesso não autorizado a esta conta bancária' });
        }
      }
      
      const recurring = await storage.createRecurringTransaction(recurringData);
      res.status(201).json(recurring);
    } catch (error) {
      console.error('Erro ao criar transação recorrente:', error);
      res.status(400).json({ error: 'Dados inválidos para criação de transação recorrente' });
    }
  });
  
  router.put('/recurring-transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recurring = await storage.getRecurringTransaction(id);
      
      if (!recurring) {
        return res.status(404).json({ error: 'Transação recorrente não encontrada' });
      }
      
      // Verificar se a transação recorrente pertence ao usuário
      if (!req.session.userId || recurring.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta transação recorrente' });
      }
      
      const recurringData = insertRecurringTransactionSchema.partial().parse(req.body);
      
      // Não permitir alterar o usuário
      delete recurringData.userId;
      
      // Se frequência ou data de início mudar, recalcular próxima ocorrência
      if (recurringData.frequency || recurringData.startDate) {
        const frequency = recurringData.frequency || recurring.frequency;
        const startDate = recurringData.startDate || recurring.startDate;
        recurringData.nextOccurrence = calculateNextOccurrence(frequency, startDate);
      }
      
      // Verificar se a conta bancária pertence ao usuário
      if (recurringData.bankAccountId) {
        const account = await storage.getBankAccount(recurringData.bankAccountId);
        
        if (!account || account.userId !== req.session.userId) {
          return res.status(403).json({ error: 'Acesso não autorizado a esta conta bancária' });
        }
      }
      
      const updatedRecurring = await storage.updateRecurringTransaction(id, recurringData);
      res.json(updatedRecurring);
    } catch (error) {
      console.error('Erro ao atualizar transação recorrente:', error);
      res.status(400).json({ error: 'Dados inválidos para atualização de transação recorrente' });
    }
  });
  
  router.delete('/recurring-transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recurring = await storage.getRecurringTransaction(id);
      
      if (!recurring) {
        return res.status(404).json({ error: 'Transação recorrente não encontrada' });
      }
      
      // Verificar se a transação recorrente pertence ao usuário
      if (!req.session.userId || recurring.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Acesso não autorizado a esta transação recorrente' });
      }
      
      // Em vez de excluir, desativar a transação recorrente
      const success = await storage.deactivateRecurringTransaction(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao excluir transação recorrente:', error);
      res.status(500).json({ error: 'Erro ao excluir transação recorrente' });
    }
  });
  
  app.use('/api/finance', router);
}

// Função auxiliar para calcular a próxima data de ocorrência com base na frequência
function calculateNextOccurrence(
  frequency: string,
  startDate: string | Date
): Date {
  const date = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = new Date();
  
  // Se a data de início ainda não chegou, usar como próxima ocorrência
  if (date > now) {
    return date;
  }
  
  // Caso contrário, calcular próxima ocorrência com base na frequência
  switch (frequency) {
    case 'daily':
      return addDays(now, 1);
    case 'weekly':
      return addWeeks(now, 1);
    case 'biweekly':
      return addWeeks(now, 2);
    case 'monthly':
      return addMonths(now, 1);
    case 'bimonthly':
      return addMonths(now, 2);
    case 'quarterly':
      return addMonths(now, 3);
    case 'semiannual':
      return addMonths(now, 6);
    case 'annual':
      return addMonths(now, 12);
    default:
      return addMonths(now, 1); // Mensal por padrão
  }
}