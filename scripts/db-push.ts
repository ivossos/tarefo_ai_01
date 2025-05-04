import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const main = async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Running schema push...");
  
  try {
    // Cria as tabelas se elas não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        plan TEXT NOT NULL DEFAULT 'free',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        reminder_time TIMESTAMP,
        notification_channels JSONB NOT NULL DEFAULT '{}',
        event_type TEXT NOT NULL DEFAULT 'task',
        status TEXT NOT NULL DEFAULT 'active',
        is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP NOT NULL,
        notification_channels JSONB NOT NULL DEFAULT '{}',
        priority TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        is_from_user BOOLEAN NOT NULL,
        platform TEXT NOT NULL DEFAULT 'whatsapp'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        related_entity_id INTEGER,
        related_entity_type TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Não inserimos mais dados de exemplo
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(usersResult.rows[0].count) === 0) {
      console.log("Banco de dados está vazio. Os usuários deverão se registrar normalmente.");
    }

    console.log("Schema push concluído com sucesso!");
  } catch (error) {
    console.error("Erro ao executar schema push:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();