/**
 * Script para executar a migração e criação de tabelas financeiras
 */
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function migrateFinancialTables() {
  console.log('Iniciando migração das tabelas financeiras...');
  
  try {
    // Criando cada tabela em ordem
    console.log('Criando tabela de bancos...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS banks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        api_base_url TEXT NOT NULL,
        api_type TEXT NOT NULL,
        icon_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Criando tabela de contas bancárias...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        bank_id INTEGER NOT NULL REFERENCES banks(id),
        account_type TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        agency TEXT,
        balance DECIMAL NOT NULL DEFAULT 0,
        currency_code TEXT NOT NULL DEFAULT 'BRL',
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_synced_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Criando tabela de categorias...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id INTEGER REFERENCES categories(id),
        type TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Criando tabela de transações...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
        external_id TEXT,
        date DATE NOT NULL,
        datetime TIMESTAMP NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        balance DECIMAL,
        category TEXT,
        subcategory TEXT,
        payee TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        type TEXT NOT NULL,
        notes TEXT,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Criando tabela de transações recorrentes...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        bank_account_id INTEGER REFERENCES bank_accounts(id),
        title TEXT NOT NULL,
        description TEXT,
        amount DECIMAL NOT NULL,
        frequency TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        day_of_month INTEGER,
        day_of_week INTEGER,
        category TEXT,
        payee TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_processed_date DATE,
        next_occurrence DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Criando tabela de metas financeiras...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        target_amount DECIMAL NOT NULL,
        current_amount DECIMAL NOT NULL DEFAULT 0,
        start_date DATE NOT NULL,
        target_date DATE,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'in_progress',
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao executar a migração:', error);
    throw error;
  }
}

// Executar a migração
migrateFinancialTables()
  .then(() => {
    console.log('Script de migração concluído com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro no script de migração:', error);
    process.exit(1);
  });