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

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>; // Método para administradores
  getAllUsers(): Promise<User[]>; // Método para administradores
  
  // Calendar methods
  getUserCalendarTokens(userId: number): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiryDate: Date | null;
    provider?: 'google' | 'apple' | null;
  } | null>;
  updateUserCalendarTokens(userId: number, tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiryDate: Date | null | number;
    provider?: 'google' | 'apple' | null;
  }): Promise<boolean>;
  
  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  getEventsByDate(userId: number, date: Date): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getAllEvents(): Promise<Event[]>; // Método para administradores
  
  // Reminder methods
  getReminder(id: number): Promise<Reminder | undefined>;
  getRemindersByUserId(userId: number): Promise<Reminder[]>;
  getUpcomingReminders(userId: number, limit?: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  getAllReminders(): Promise<Reminder[]>; // Método para administradores
  
  // Chat methods
  getChatMessage(id: number): Promise<ChatMessage | undefined>; // Método para obter uma mensagem específica
  getChatMessagesByUserId(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessage(id: number): Promise<boolean>; // Método para administradores
  getAllChatMessages(): Promise<ChatMessage[]>; // Método para administradores
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>; // Método para obter uma notificação específica
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  deleteNotification(id: number): Promise<boolean>; // Método para administradores
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Bank methods
  getBank(id: number): Promise<Bank | undefined>;
  getAllBanks(): Promise<Bank[]>;
  createBank(bank: InsertBank): Promise<Bank>;
  updateBank(id: number, data: Partial<InsertBank>): Promise<Bank | undefined>;
  deleteBank(id: number): Promise<boolean>;
  
  // Bank Account methods
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  getBankAccountsByUserId(userId: number): Promise<BankAccount[]>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, data: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  updateBankAccountTokens(
    id: number, 
    tokens: { 
      accessToken: string | null; 
      refreshToken: string | null; 
      tokenExpiry: Date | null; 
    }
  ): Promise<boolean>;
  updateBankAccountBalance(id: number, balance: string): Promise<boolean>;
  updateBankAccountLastSynced(id: number): Promise<boolean>;
  deleteBankAccount(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByBankAccountId(
    bankAccountId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Transaction[]>;
  getTransactionsByUserId(
    userId: number, 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number, 
    offset?: number
  ): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactions(transactions: InsertTransaction[]): Promise<number>;
  updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getSystemCategories(): Promise<Category[]>;
  getUserCategories(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Financial Goals methods
  getFinancialGoal(id: number): Promise<FinancialGoal | undefined>;
  getFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: number, data: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined>;
  updateFinancialGoalAmount(id: number, amount: string): Promise<boolean>;
  deleteFinancialGoal(id: number): Promise<boolean>;
  
  // Recurring Transaction methods
  getRecurringTransaction(id: number): Promise<RecurringTransaction | undefined>;
  getRecurringTransactionsByUserId(userId: number): Promise<RecurringTransaction[]>;
  getActiveRecurringTransactionsDue(): Promise<RecurringTransaction[]>;
  createRecurringTransaction(recurring: InsertRecurringTransaction): Promise<RecurringTransaction>;
  updateRecurringTransaction(
    id: number, 
    data: Partial<InsertRecurringTransaction>
  ): Promise<RecurringTransaction | undefined>;
  updateRecurringTransactionOccurrence(
    id: number, 
    lastProcessedDate: Date, 
    nextOccurrence: Date
  ): Promise<boolean>;
  deactivateRecurringTransaction(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private reminders: Map<number, Reminder>;
  private chatMessages: Map<number, ChatMessage>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private reminderIdCounter: number;
  private chatMessageIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.reminders = new Map();
    this.chatMessages = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.reminderIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Inicializar o usuário administrador nativo
    this.initializeAdminUser();
  }
  
  // Inicializa o usuário administrador nativo
  private async initializeAdminUser() {
    // Verifica se o usuário admin já existe
    const existingAdmin = await this.getUserByUsername('system_admin');
    
    if (!existingAdmin) {
      const { hashPassword } = require('./auth');
      
      // Criar o usuário administrador nativo com senha fixa "808120"
      const adminUser: User = {
        id: this.userIdCounter++,
        username: 'system_admin',
        password: await hashPassword('808120'),
        name: 'Administrador do Sistema',
        email: 'admin@tarefo.ai',
        phone: '+5500000000000',
        plan: 'enterprise',
        role: 'admin',
        createdAt: new Date()
      };
      
      this.users.set(adminUser.id, adminUser);
      console.log('✅ Usuário administrador nativo inicializado com sucesso');
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByUserId(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async getEventsByDate(userId: number, date: Date): Promise<Event[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return Array.from(this.events.values())
      .filter(event => 
        event.userId === userId && 
        event.startTime >= targetDate && 
        event.startTime < nextDay
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...data };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Reminder methods
  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }
  
  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }
  
  async getUpcomingReminders(userId: number, limit: number = 5): Promise<Reminder[]> {
    const now = new Date();
    
    return Array.from(this.reminders.values())
      .filter(reminder => 
        reminder.userId === userId && 
        reminder.dueDate > now &&
        reminder.status === 'pending'
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
  }
  
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderIdCounter++;
    const createdAt = new Date();
    const reminder: Reminder = { ...insertReminder, id, createdAt };
    this.reminders.set(id, reminder);
    return reminder;
  }
  
  async updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...data };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }
  
  // Chat methods
  async getChatMessagesByUserId(userId: number, limit: number = 20): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .reverse();
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const timestamp = new Date();
    const message: ChatMessage = { ...insertMessage, id, timestamp };
    this.chatMessages.set(id, message);
    return message;
  }
  
  // Notification methods
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getUnreadNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const timestamp = new Date();
    const notification: Notification = { ...insertNotification, id, timestamp };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .forEach(notification => {
        notification.isRead = true;
        this.notifications.set(notification.id, notification);
      });
    
    return true;
  }
  
  // Métodos para administradores
  
  async deleteUser(id: number): Promise<boolean> {
    // Não permitir deletar o usuário administrador nativo
    const user = await this.getUser(id);
    if (user && user.username === 'system_admin') {
      return false;
    }
    return this.users.delete(id);
  }
  
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }
  
  async deleteChatMessage(id: number): Promise<boolean> {
    return this.chatMessages.delete(id);
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getAllReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values());
  }
  
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values());
  }
  
  // Demo data seeding
  private seedDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: 'anasilva',
      password: 'password123',
      name: 'Ana Silva',
      email: 'ana.silva@example.com',
      phone: '+5511999887766',
      plan: 'free',
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Set current date as a reference
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create demo events
    const events: Partial<Event>[] = [
      {
        userId: demoUser.id,
        title: 'Team Standup Meeting',
        description: 'Google Meet: meet.google.com/abc-defg-hij',
        startTime: new Date(today.getTime() + 9 * 3600 * 1000), // 9:00 AM
        endTime: new Date(today.getTime() + 9.5 * 3600 * 1000), // 9:30 AM
        eventType: 'meeting',
        notificationChannels: { chat: true, email: true, sms: false }
      },
      {
        userId: demoUser.id,
        title: 'Lunch with Client',
        description: 'Café Restaurante - Centro, São Paulo',
        location: 'Café Restaurante - Centro, São Paulo',
        startTime: new Date(today.getTime() + 12 * 3600 * 1000), // 12:00 PM
        endTime: new Date(today.getTime() + 13.5 * 3600 * 1000), // 1:30 PM
        eventType: 'meeting',
        notificationChannels: { chat: true, email: true, sms: false }
      },
      {
        userId: demoUser.id,
        title: 'Call Doctor for Appointment',
        description: 'Phone: +55 11 9876-5432',
        startTime: new Date(today.getTime() + 14.25 * 3600 * 1000), // 2:15 PM
        eventType: 'appointment',
        notificationChannels: { chat: true, email: true, sms: false }
      },
      {
        userId: demoUser.id,
        title: 'Pay Internet Bill',
        description: 'R$89,90 - Internet Provider',
        startTime: new Date(today.getTime() + 16 * 3600 * 1000), // 4:00 PM
        eventType: 'bill',
        notificationChannels: { chat: true, email: true, sms: false }
      },
      {
        userId: demoUser.id,
        title: 'Weekly Team Meeting',
        description: 'Weekly sync with the development team',
        startTime: new Date(today.getTime() + 24 * 3600 * 1000 + 10 * 3600 * 1000), // Tomorrow 10:00 AM
        endTime: new Date(today.getTime() + 24 * 3600 * 1000 + 11 * 3600 * 1000), // Tomorrow 11:00 AM
        eventType: 'meeting',
        notificationChannels: { chat: true, email: true, sms: false }
      },
      {
        userId: demoUser.id,
        title: 'Project Deadline',
        description: 'Submit final project deliverables',
        startTime: new Date(today.getTime() + 3 * 24 * 3600 * 1000 + 17 * 3600 * 1000), // In 3 days at 5:00 PM
        eventType: 'task',
        priority: 'high',
        notificationChannels: { chat: true, email: true, sms: true }
      },
      {
        userId: demoUser.id,
        title: 'Doctor Appointment',
        description: 'Regular check-up',
        location: 'Medical Center',
        startTime: new Date(today.getTime() + 6 * 24 * 3600 * 1000 + 14.5 * 3600 * 1000), // In 6 days at 2:30 PM
        eventType: 'appointment',
        notificationChannels: { chat: true, email: true, sms: false }
      }
    ];
    
    // Add events to storage
    events.forEach(eventData => {
      const id = this.eventIdCounter++;
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000); // Random creation in last week
      const event = { ...eventData, id, createdAt } as Event;
      this.events.set(id, event);
      
      // Create a reminder for each event
      const reminderId = this.reminderIdCounter++;
      const reminderTime = new Date(event.startTime.getTime() - 15 * 60 * 1000); // 15 minutes before
      
      const reminder: Reminder = {
        id: reminderId,
        userId: demoUser.id,
        eventId: id,
        title: event.title,
        description: event.description || '',
        dueDate: reminderTime,
        notificationChannels: event.notificationChannels,
        priority: event.eventType === 'bill' ? 'high' : 'normal',
        status: 'pending',
        createdAt: createdAt
      };
      
      this.reminders.set(reminderId, reminder);
    });
    
    // Create demo notifications
    const notifications: Partial<Notification>[] = [
      {
        userId: demoUser.id,
        title: 'Reminder: Team Standup Meeting',
        content: 'Today at 9:00 AM',
        type: 'reminder',
        isRead: false,
        relatedEntityId: 1,
        relatedEntityType: 'event'
      },
      {
        userId: demoUser.id,
        title: 'Payment due: Internet Bill',
        content: 'Due today - R$89,90',
        type: 'reminder',
        isRead: false,
        relatedEntityId: 4,
        relatedEntityType: 'event'
      },
      {
        userId: demoUser.id,
        title: 'New message from Tarefo AI',
        content: 'Don\'t forget your lunch meeting with the client today at 12:00 PM.',
        type: 'message',
        isRead: false
      }
    ];
    
    // Add notifications to storage
    notifications.forEach(notificationData => {
      const id = this.notificationIdCounter++;
      const timestamp = new Date(Date.now() - Math.random() * 60 * 60 * 1000); // Last hour
      const notification = { ...notificationData, id, timestamp } as Notification;
      this.notifications.set(id, notification);
    });
    
    // Create demo chat messages
    const chatMessages: Partial<ChatMessage>[] = [
      {
        userId: demoUser.id,
        content: 'Hello Ana! How can I assist you today? You can ask me to set reminders, check your calendar, or track expenses.',
        isFromUser: false,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'Can you remind me to call the doctor tomorrow at 2pm?',
        isFromUser: true,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'I\'ve set a reminder for you to call the doctor tomorrow at 2:00 PM. Would you like me to add this to your calendar as well?',
        isFromUser: false,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'Yes, please add it to my calendar.',
        isFromUser: true,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'Great! I\'ve added "Call Doctor" to your calendar for tomorrow at 2:00 PM. You\'ll receive a reminder 15 minutes before. Is there anything else you\'d like me to do?',
        isFromUser: false,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'What\'s on my schedule today?',
        isFromUser: true,
        platform: 'whatsapp'
      },
      {
        userId: demoUser.id,
        content: 'Here\'s your schedule for today:\n- 9:00 AM - Team Standup Meeting (Google Meet)\n- 12:00 PM - Lunch with Client (Café Restaurante)\n- 2:15 PM - Call Doctor for Appointment\n- Due Today - Pay Internet Bill (R$89,90)',
        isFromUser: false,
        platform: 'whatsapp'
      }
    ];
    
    // Add chat messages to storage
    let messageTime = new Date();
    messageTime.setHours(messageTime.getHours() - 1); // Start with messages from 1 hour ago
    
    chatMessages.forEach(messageData => {
      const id = this.chatMessageIdCounter++;
      messageTime = new Date(messageTime.getTime() + 1 * 60 * 1000); // Add 1 minute between messages
      const timestamp = new Date(messageTime);
      const message = { ...messageData, id, timestamp } as ChatMessage;
      this.chatMessages.set(id, message);
    });
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
