import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  plan: text("plan").notNull().default("free"),
  role: text("role").notNull().default("user"),
  // Campos para integração com Google Calendar
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
  // Campos para integração com Apple Calendar
  appleAccessToken: text("apple_access_token"),
  appleRefreshToken: text("apple_refresh_token"),
  appleTokenExpiry: timestamp("apple_token_expiry"),
  // Configuração de preferência de calendário
  preferredCalendar: text("preferred_calendar").default("none"), // none, google, apple
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  reminderTime: timestamp("reminder_time"),
  notificationChannels: jsonb("notification_channels").notNull().default({}),
  eventType: text("event_type").notNull().default("task"), // task, meeting, bill, appointment
  status: text("status").notNull().default("active"), // active, completed, cancelled
  isAllDay: boolean("is_all_day").notNull().default(false),
  // Campos para vinculação com serviços externos
  googleEventId: text("google_event_id"),
  appleEventId: text("apple_event_id"),
  calendarSource: text("calendar_source").default("tarefo"), // tarefo, google, apple
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Reminders schema
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  notificationChannels: jsonb("notification_channels").notNull().default({}),
  priority: text("priority").notNull().default("normal"), // low, normal, high
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isFromUser: boolean("is_from_user").notNull(),
  platform: text("platform").notNull().default("whatsapp"), // whatsapp, telegram
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // reminder, event, message, system
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  timestamp: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// ================ MODELOS FINANCEIROS ================

// Bancos que o sistema suporta
export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(), // Código do banco (ex: 001, 341, etc.)
  apiBaseUrl: text("api_base_url").notNull(), // URL base da API do banco
  apiType: text("api_type").notNull(), // open_banking, direct_api, etc.
  iconUrl: text("icon_url"), // URL do ícone do banco
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBankSchema = createInsertSchema(banks).omit({
  id: true,
  createdAt: true,
});

// Contas bancárias dos usuários
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // Usuário dono da conta
  bankId: integer("bank_id").notNull().references(() => banks.id), // Banco da conta
  accountType: text("account_type").notNull(), // checking, savings, investment, credit_card
  accountName: text("account_name").notNull(), // Nome da conta (ex: "Nubank principal")
  accountNumber: text("account_number").notNull(), // Número da conta
  agency: text("agency"), // Agência (se aplicável)
  balance: numeric("balance").notNull().default("0"), // Saldo atual
  currencyCode: text("currency_code").notNull().default("BRL"), // Código da moeda
  
  // Tokens de autenticação para a API do banco
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  
  // Status da conta
  isActive: boolean("is_active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  balance: true, // O saldo deve ser atualizado por processos específicos
  lastSyncedAt: true,
  createdAt: true,
});

// Transações financeiras
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  bankAccountId: integer("bank_account_id").notNull().references(() => bankAccounts.id),
  externalId: text("external_id"), // ID da transação no sistema do banco
  date: date("date").notNull(), // Data da transação
  datetime: timestamp("datetime").notNull(), // Data e hora da transação
  description: text("description").notNull(), // Descrição da transação
  amount: numeric("amount").notNull(), // Valor da transação (positivo para receita, negativo para despesa)
  balance: numeric("balance"), // Saldo após a transação
  category: text("category"), // Categoria da transação (ex: alimentação, transporte, etc.)
  subcategory: text("subcategory"), // Subcategoria
  payee: text("payee"), // Destinatário/Pagador
  status: text("status").notNull().default("completed"), // pending, completed, canceled
  type: text("type").notNull(), // debit, credit, transfer, payment, withdrawal
  notes: text("notes"), // Notas do usuário sobre a transação
  isRecurring: boolean("is_recurring").default(false), // Se é uma transação recorrente
  recurringId: integer("recurring_id"), // ID da recorrência, se aplicável
  metadata: jsonb("metadata"), // Metadados da transação
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Categorias de transações
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => categories.id), // Para subcategorias
  type: text("type").notNull(), // income, expense
  icon: text("icon"),
  color: text("color"),
  isSystem: boolean("is_system").notNull().default(false), // Se é uma categoria do sistema
  isDefault: boolean("is_default").notNull().default(false), // Se é uma categoria padrão
  userId: integer("user_id").references(() => users.id), // Nulo para categorias do sistema
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Recorrências financeiras (assinaturas, pagamentos recorrentes, etc.)
export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  title: text("title").notNull(),
  description: text("description"),
  amount: numeric("amount").notNull(),
  frequency: text("frequency").notNull(), // monthly, weekly, biweekly, yearly
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  dayOfMonth: integer("day_of_month"), // Para frequências mensais
  dayOfWeek: integer("day_of_week"), // Para frequências semanais
  category: text("category"),
  payee: text("payee"),
  isActive: boolean("is_active").notNull().default(true),
  lastProcessedDate: date("last_processed_date"),
  nextOccurrence: date("next_occurrence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecurringTransactionSchema = createInsertSchema(recurringTransactions).omit({
  id: true,
  lastProcessedDate: true,
  nextOccurrence: true,
  createdAt: true,
});

// Metas financeiras
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  startDate: date("start_date").notNull(),
  targetDate: date("target_date"),
  category: text("category"),
  status: text("status").notNull().default("in_progress"), // not_started, in_progress, completed, cancelled
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({
  id: true,
  currentAmount: true,
  createdAt: true,
});

// Exportar tipos dos modelos financeiros
export type Bank = typeof banks.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = z.infer<typeof insertRecurringTransactionSchema>;

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
