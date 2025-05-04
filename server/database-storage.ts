import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  reminders, type Reminder, type InsertReminder,
  chatMessages, type ChatMessage, type InsertChatMessage,
  notifications, type Notification, type InsertNotification,
  // Modelos financeiros
  banks, type Bank, type InsertBank,
  bankAccounts, type BankAccount, type InsertBankAccount,
  transactions, type Transaction, type InsertTransaction,
  categories, type Category, type InsertCategory,
  recurringTransactions, type RecurringTransaction, type InsertRecurringTransaction,
  financialGoals, type FinancialGoal, type InsertFinancialGoal
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, gte, lte, inArray, or, SQL } from "drizzle-orm";
import type { 
  ColumnBaseConfig, 
  ColumnDataType, 
  PgColumn 
} from "drizzle-orm/pg-core";
import { IStorage } from "./storage";
import { startOfDay, endOfDay } from "date-fns";
import { hashPassword } from "./auth";
import session from "express-session";

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Para compatibilidade com a interface IStorage
  
  constructor() {
    // Inicializa o usuário administrador nativo ao criar a instância
    this.initializeAdminUser();
    
    // A configuração do session store está sendo feita no arquivo server/index.ts
    // para evitar dependências circulares
    this.sessionStore = null;
  }

  // Inicializa o usuário administrador nativo
  private async initializeAdminUser() {
    try {
      // Verifica se o usuário admin já existe
      const existingAdmin = await this.getUserByUsername('system_admin');
      
      if (!existingAdmin) {
        // Criar o usuário administrador nativo com senha fixa "808120"
        const hashedPassword = await hashPassword('808120');
        const adminUser: InsertUser = {
          username: 'system_admin',
          password: hashedPassword,
          name: 'Administrador do Sistema',
          email: 'admin@tarefo.ai',
          phone: '+5500000000000',
          plan: 'enterprise',
          role: 'admin',
          googleAccessToken: null,
          googleRefreshToken: null,
          googleTokenExpiry: null,
          appleAccessToken: null,
          appleRefreshToken: null,
          appleTokenExpiry: null,
          preferredCalendar: 'none'
        };
        
        await this.createUser(adminUser);
        console.log('✅ Usuário administrador nativo inicializado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar usuário administrador:', error);
    }
  }

  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Eventos
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    return db.select().from(events).where(eq(events.userId, userId));
  }

  async getEventsByDate(userId: number, date: Date): Promise<Event[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return db.select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          and(
            gte(events.startTime, start), 
            lte(events.startTime, end)
          )
        )
      );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning({ id: events.id });
    return result.length > 0;
  }
  
  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  // Lembretes
  async getReminder(id: number): Promise<Reminder | undefined> {
    const [reminder] = await db.select().from(reminders).where(eq(reminders.id, id));
    return reminder || undefined;
  }

  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async getUpcomingReminders(userId: number, limit: number = 5): Promise<Reminder[]> {
    const now = new Date();
    
    return db.select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          gte(reminders.dueDate, now)
        )
      )
      .orderBy(reminders.dueDate)
      .limit(limit);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set(data)
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async deleteReminder(id: number): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(eq(reminders.id, id))
      .returning({ id: reminders.id });
    return result.length > 0;
  }
  
  async getAllReminders(): Promise<Reminder[]> {
    return db.select().from(reminders);
  }

  // Mensagens de chat
  async getChatMessagesByUserId(userId: number, limit: number = 20): Promise<ChatMessage[]> {
    return db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).orderBy(desc(chatMessages.timestamp));
  }

  // Integração de Calendário
  async getUserCalendarTokens(userId: number): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiryDate: Date | null;
    provider?: 'google' | 'apple' | null;
  } | null> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return null;
    }
    
    if (user.preferredCalendar === 'google' || (!user.preferredCalendar || user.preferredCalendar === 'none') && user.googleAccessToken) {
      return {
        accessToken: user.googleAccessToken,
        refreshToken: user.googleRefreshToken,
        expiryDate: user.googleTokenExpiry,
        provider: 'google'
      };
    } else if (user.preferredCalendar === 'apple' || (!user.preferredCalendar || user.preferredCalendar === 'none') && user.appleAccessToken) {
      return {
        accessToken: user.appleAccessToken,
        refreshToken: user.appleRefreshToken,
        expiryDate: user.appleTokenExpiry,
        provider: 'apple'
      };
    }
    
    return null;
  }
  
  async updateUserCalendarTokens(userId: number, tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiryDate: Date | null | number;
    provider?: 'google' | 'apple' | null;
  }): Promise<boolean> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return false;
    }
    
    let updateData: Partial<InsertUser> = {};
    
    // Converter expiryDate para Date se for um número
    const expiryDate = typeof tokens.expiryDate === 'number' 
      ? new Date(tokens.expiryDate) 
      : tokens.expiryDate;
    
    if (tokens.provider === 'google') {
      updateData = {
        googleAccessToken: tokens.accessToken,
        googleRefreshToken: tokens.refreshToken,
        googleTokenExpiry: expiryDate,
        preferredCalendar: 'google'
      };
    } else if (tokens.provider === 'apple') {
      updateData = {
        appleAccessToken: tokens.accessToken,
        appleRefreshToken: tokens.refreshToken,
        appleTokenExpiry: expiryDate,
        preferredCalendar: 'apple'
      };
    } else if (tokens.provider === null) {
      // Caso de desconexão
      updateData = {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        appleAccessToken: null,
        appleRefreshToken: null,
        appleTokenExpiry: null,
        preferredCalendar: 'none'
      };
    }
    
    const updatedUser = await this.updateUser(userId, updateData);
    return !!updatedUser;
  }

  // Notificações
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.timestamp));
  }

  async getUnreadNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.timestamp));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning({ id: notifications.id });
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .returning({ id: notifications.id });
    return result.length > 0;
  }
  
  // Métodos adicionais para administradores
  async deleteUser(id: number): Promise<boolean> {
    // Não permitir deletar o usuário administrador nativo
    const user = await this.getUser(id);
    if (user && user.username === 'system_admin') {
      return false;
    }
    
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return false;
    }
  }
  
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    try {
      const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
      return message;
    } catch (error) {
      console.error("Erro ao buscar mensagem:", error);
      return undefined;
    }
  }
  
  async deleteChatMessage(id: number): Promise<boolean> {
    try {
      await db.delete(chatMessages).where(eq(chatMessages.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error);
      return false;
    }
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
      return notification;
    } catch (error) {
      console.error("Erro ao buscar notificação:", error);
      return undefined;
    }
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    try {
      await db.delete(notifications).where(eq(notifications.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
      return false;
    }
  }
  
  // Métodos para Bancos
  async getBank(id: number): Promise<Bank | undefined> {
    try {
      const [bank] = await db.select().from(banks).where(eq(banks.id, id));
      return bank;
    } catch (error) {
      console.error("Erro ao buscar banco:", error);
      return undefined;
    }
  }
  
  async getAllBanks(): Promise<Bank[]> {
    try {
      return await db.select().from(banks);
    } catch (error) {
      console.error("Erro ao buscar bancos:", error);
      return [];
    }
  }
  
  async createBank(bank: InsertBank): Promise<Bank> {
    try {
      const [newBank] = await db.insert(banks).values(bank).returning();
      return newBank;
    } catch (error) {
      console.error("Erro ao criar banco:", error);
      throw error;
    }
  }
  
  async updateBank(id: number, data: Partial<InsertBank>): Promise<Bank | undefined> {
    try {
      const [updatedBank] = await db
        .update(banks)
        .set(data)
        .where(eq(banks.id, id))
        .returning();
      return updatedBank;
    } catch (error) {
      console.error("Erro ao atualizar banco:", error);
      return undefined;
    }
  }
  
  async deleteBank(id: number): Promise<boolean> {
    try {
      await db.delete(banks).where(eq(banks.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar banco:", error);
      return false;
    }
  }
  
  // Métodos para Contas Bancárias
  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    try {
      const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
      return account;
    } catch (error) {
      console.error("Erro ao buscar conta bancária:", error);
      return undefined;
    }
  }
  
  async getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
    try {
      return await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.userId, userId));
    } catch (error) {
      console.error("Erro ao buscar contas bancárias do usuário:", error);
      return [];
    }
  }
  
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    try {
      const [newAccount] = await db
        .insert(bankAccounts)
        .values(account)
        .returning();
      return newAccount;
    } catch (error) {
      console.error("Erro ao criar conta bancária:", error);
      throw error;
    }
  }
  
  async updateBankAccount(id: number, data: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    try {
      const [updatedAccount] = await db
        .update(bankAccounts)
        .set(data)
        .where(eq(bankAccounts.id, id))
        .returning();
      return updatedAccount;
    } catch (error) {
      console.error("Erro ao atualizar conta bancária:", error);
      return undefined;
    }
  }
  
  async updateBankAccountTokens(
    id: number, 
    tokens: { 
      accessToken: string | null; 
      refreshToken: string | null; 
      tokenExpiry: Date | null; 
    }
  ): Promise<boolean> {
    try {
      const [updatedAccount] = await db
        .update(bankAccounts)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: tokens.tokenExpiry,
          lastUpdated: new Date()
        })
        .where(eq(bankAccounts.id, id))
        .returning();
      return !!updatedAccount;
    } catch (error) {
      console.error("Erro ao atualizar tokens da conta bancária:", error);
      return false;
    }
  }
  
  async updateBankAccountBalance(id: number, balance: string): Promise<boolean> {
    try {
      const [updatedAccount] = await db
        .update(bankAccounts)
        .set({
          balance,
          lastUpdated: new Date()
        })
        .where(eq(bankAccounts.id, id))
        .returning();
      return !!updatedAccount;
    } catch (error) {
      console.error("Erro ao atualizar saldo da conta bancária:", error);
      return false;
    }
  }
  
  async updateBankAccountLastSynced(id: number): Promise<boolean> {
    try {
      const [updatedAccount] = await db
        .update(bankAccounts)
        .set({
          lastSynced: new Date()
        })
        .where(eq(bankAccounts.id, id))
        .returning();
      return !!updatedAccount;
    } catch (error) {
      console.error("Erro ao atualizar data de sincronização da conta bancária:", error);
      return false;
    }
  }
  
  async deleteBankAccount(id: number): Promise<boolean> {
    try {
      await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar conta bancária:", error);
      return false;
    }
  }
  
  // Métodos para Transações
  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id));
      return transaction;
    } catch (error) {
      console.error("Erro ao buscar transação:", error);
      return undefined;
    }
  }
  
  async getTransactionsByBankAccountId(
    bankAccountId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Transaction[]> {
    try {
      let query = db
        .select()
        .from(transactions)
        .where(eq(transactions.bankAccountId, bankAccountId));
      
      if (startDate) {
        query = query.where(gte(transactions.date, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(transactions.date, endDate));
      }
      
      return await query.orderBy(desc(transactions.date));
    } catch (error) {
      console.error("Erro ao buscar transações da conta bancária:", error);
      return [];
    }
  }
  
  async getTransactionsByUserId(
    userId: number, 
    startDate?: Date, 
    endDate?: Date, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      // Primeiro, busca as contas bancárias do usuário
      const userAccounts = await this.getBankAccountsByUserId(userId);
      
      if (userAccounts.length === 0) {
        return [];
      }
      
      const accountIds = userAccounts.map(account => account.id);
      
      let query = db
        .select()
        .from(transactions)
        .where(inArray(transactions.bankAccountId, accountIds));
      
      if (startDate) {
        query = query.where(gte(transactions.date, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(transactions.date, endDate));
      }
      
      return await query
        .orderBy(desc(transactions.date))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Erro ao buscar transações do usuário:", error);
      return [];
    }
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      const [newTransaction] = await db
        .insert(transactions)
        .values(transaction)
        .returning();
      return newTransaction;
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  }
  
  async createTransactions(transactionsList: InsertTransaction[]): Promise<number> {
    if (transactionsList.length === 0) {
      return 0;
    }
    
    try {
      const result = await db
        .insert(transactions)
        .values(transactionsList)
        .returning();
      return result.length;
    } catch (error) {
      console.error("Erro ao criar múltiplas transações:", error);
      throw error;
    }
  }
  
  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    try {
      const [updatedTransaction] = await db
        .update(transactions)
        .set(data)
        .where(eq(transactions.id, id))
        .returning();
      return updatedTransaction;
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      return undefined;
    }
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    try {
      await db.delete(transactions).where(eq(transactions.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      return false;
    }
  }
  
  // Métodos para Categorias
  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      return undefined;
    }
  }
  
  async getSystemCategories(): Promise<Category[]> {
    try {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.isSystem, true));
    } catch (error) {
      console.error("Erro ao buscar categorias do sistema:", error);
      return [];
    }
  }
  
  async getUserCategories(userId: number): Promise<Category[]> {
    try {
      return await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.isSystem, false)
          )
        );
    } catch (error) {
      console.error("Erro ao buscar categorias do usuário:", error);
      return [];
    }
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await db
        .insert(categories)
        .values(category)
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  }
  
  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      // Não permite alterar categorias do sistema
      const category = await this.getCategory(id);
      if (category?.isSystem) {
        console.error("Não é permitido alterar categorias do sistema");
        return undefined;
      }
      
      const [updatedCategory] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      return undefined;
    }
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    try {
      // Não permite deletar categorias do sistema
      const category = await this.getCategory(id);
      if (category?.isSystem) {
        console.error("Não é permitido deletar categorias do sistema");
        return false;
      }
      
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      return false;
    }
  }
  
  // Métodos para Metas Financeiras
  async getFinancialGoal(id: number): Promise<FinancialGoal | undefined> {
    try {
      const [goal] = await db.select().from(financialGoals).where(eq(financialGoals.id, id));
      return goal;
    } catch (error) {
      console.error("Erro ao buscar meta financeira:", error);
      return undefined;
    }
  }
  
  async getFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]> {
    try {
      return await db
        .select()
        .from(financialGoals)
        .where(eq(financialGoals.userId, userId));
    } catch (error) {
      console.error("Erro ao buscar metas financeiras do usuário:", error);
      return [];
    }
  }
  
  async createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal> {
    try {
      const [newGoal] = await db
        .insert(financialGoals)
        .values(goal)
        .returning();
      return newGoal;
    } catch (error) {
      console.error("Erro ao criar meta financeira:", error);
      throw error;
    }
  }
  
  async updateFinancialGoal(id: number, data: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined> {
    try {
      const [updatedGoal] = await db
        .update(financialGoals)
        .set(data)
        .where(eq(financialGoals.id, id))
        .returning();
      return updatedGoal;
    } catch (error) {
      console.error("Erro ao atualizar meta financeira:", error);
      return undefined;
    }
  }
  
  async updateFinancialGoalAmount(id: number, amount: string): Promise<boolean> {
    try {
      const [updatedGoal] = await db
        .update(financialGoals)
        .set({
          currentAmount: amount,
          lastUpdated: new Date()
        })
        .where(eq(financialGoals.id, id))
        .returning();
      return !!updatedGoal;
    } catch (error) {
      console.error("Erro ao atualizar valor da meta financeira:", error);
      return false;
    }
  }
  
  async deleteFinancialGoal(id: number): Promise<boolean> {
    try {
      await db.delete(financialGoals).where(eq(financialGoals.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar meta financeira:", error);
      return false;
    }
  }
  
  // Métodos para Transações Recorrentes
  async getRecurringTransaction(id: number): Promise<RecurringTransaction | undefined> {
    try {
      const [recurringTransaction] = await db
        .select()
        .from(recurringTransactions)
        .where(eq(recurringTransactions.id, id));
      return recurringTransaction;
    } catch (error) {
      console.error("Erro ao buscar transação recorrente:", error);
      return undefined;
    }
  }
  
  async getRecurringTransactionsByUserId(userId: number): Promise<RecurringTransaction[]> {
    try {
      // Primeiro, busca as contas bancárias do usuário
      const userAccounts = await this.getBankAccountsByUserId(userId);
      
      if (userAccounts.length === 0) {
        return [];
      }
      
      const accountIds = userAccounts.map(account => account.id);
      
      return await db
        .select()
        .from(recurringTransactions)
        .where(
          and(
            inArray(recurringTransactions.bankAccountId, accountIds),
            eq(recurringTransactions.active, true)
          )
        );
    } catch (error) {
      console.error("Erro ao buscar transações recorrentes do usuário:", error);
      return [];
    }
  }
  
  async getActiveRecurringTransactionsDue(): Promise<RecurringTransaction[]> {
    try {
      const now = new Date();
      
      return await db
        .select()
        .from(recurringTransactions)
        .where(
          and(
            eq(recurringTransactions.active, true),
            lte(recurringTransactions.nextOccurrence, now)
          )
        );
    } catch (error) {
      console.error("Erro ao buscar transações recorrentes ativas e vencidas:", error);
      return [];
    }
  }
  
  async createRecurringTransaction(recurring: InsertRecurringTransaction): Promise<RecurringTransaction> {
    try {
      const [newRecurring] = await db
        .insert(recurringTransactions)
        .values(recurring)
        .returning();
      return newRecurring;
    } catch (error) {
      console.error("Erro ao criar transação recorrente:", error);
      throw error;
    }
  }
  
  async updateRecurringTransaction(
    id: number, 
    data: Partial<InsertRecurringTransaction>
  ): Promise<RecurringTransaction | undefined> {
    try {
      const [updatedRecurring] = await db
        .update(recurringTransactions)
        .set(data)
        .where(eq(recurringTransactions.id, id))
        .returning();
      return updatedRecurring;
    } catch (error) {
      console.error("Erro ao atualizar transação recorrente:", error);
      return undefined;
    }
  }
  
  async updateRecurringTransactionOccurrence(
    id: number, 
    lastProcessedDate: Date, 
    nextOccurrence: Date
  ): Promise<boolean> {
    try {
      const [updatedRecurring] = await db
        .update(recurringTransactions)
        .set({
          lastProcessedDate,
          nextOccurrence,
          lastUpdated: new Date()
        })
        .where(eq(recurringTransactions.id, id))
        .returning();
      return !!updatedRecurring;
    } catch (error) {
      console.error("Erro ao atualizar ocorrência da transação recorrente:", error);
      return false;
    }
  }
  
  async deactivateRecurringTransaction(id: number): Promise<boolean> {
    try {
      const [updatedRecurring] = await db
        .update(recurringTransactions)
        .set({
          active: false,
          lastUpdated: new Date()
        })
        .where(eq(recurringTransactions.id, id))
        .returning();
      return !!updatedRecurring;
    } catch (error) {
      console.error("Erro ao desativar transação recorrente:", error);
      return false;
    }
  }
}