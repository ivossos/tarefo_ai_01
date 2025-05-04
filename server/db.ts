import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

console.log('Conectando ao banco de dados Supabase...');

// Função de inicialização do banco de dados com reconexão
const initializeDatabase = () => {
  // Criando um pool de conexões PostgreSQL usando variáveis individuais
  const pool = new Pool({
    host: process.env.PGHOST || 'db.ranigtkguixsiuebwhbl.supabase.co',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'ROSY808120#',
    database: process.env.PGDATABASE || 'postgres',
    port: parseInt(process.env.PGPORT || '5432'),
    ssl: { rejectUnauthorized: false },
    // Opções adicionais para melhorar a resiliência
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000, // tempo em ms que uma conexão pode ficar inativa
    connectionTimeoutMillis: 10000, // tempo máximo de espera para uma conexão
  });

  // Tratamento de erros no pool
  pool.on('error', (err, client) => {
    console.error('❌ Erro inesperado no client do pool PostgreSQL:', err);
    // Não finalize o cliente aqui para permitir reconexão
  });

  // Verificar conexão
  testConnection(pool);
  
  return pool;
};

// Função para testar a conexão
const testConnection = async (pool) => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados Supabase estabelecida com sucesso!', res.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    console.log('⏱️ Tentando reconectar em 5 segundos...');
    
    // Tenta reconectar após 5 segundos
    setTimeout(() => testConnection(pool), 5000);
  }
};

// Inicializa o pool de conexões
export const pool = initializeDatabase();

// Criando uma instância do Drizzle ORM com o pool
export const db = drizzle(pool, { schema });