import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

// Esquemas de validação para autenticação
export const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres")
});

export const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  name: z.string().min(3, "Nome completo precisa ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Número de telefone deve ter pelo menos 10 dígitos")
});

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Função para comparar senhas
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware para verificar autenticação
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Não autorizado" });
}

// Middleware para verificar se o usuário é administrador
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Acesso restrito a administradores" });
    }

    return next();
  } catch (error) {
    console.error("Erro ao verificar permissão de administrador:", error);
    return res.status(500).json({ message: "Erro ao verificar permissões" });
  }
}

// Configuração das rotas de autenticação
export function setupAuthRoutes(app: any) {
  // Registro de usuário
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já está em uso" });
      }

      // Hash da senha antes de salvar
      const hashedPassword = await hashPassword(userData.password);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Iniciar sessão para o usuário
      req.session.userId = user.id;
      
      // Garantir que a sessão seja salva antes de responder
      req.session.save((err) => {
        if (err) {
          console.error("Erro ao salvar sessão durante registro:", err);
          return res.status(500).json({ message: "Erro ao iniciar sessão após registro" });
        }
        
        // Não retornar a senha no resultado
        const { password, ...userWithoutPassword } = user;
        console.log(`Registro bem-sucedido para usuário: ${user.username} (ID: ${user.id})`);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao registrar:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  // Login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      console.log("Tentando login com:", { username: req.body.username });
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log(`Usuário não encontrado: ${username}`);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      console.log(`Usuário encontrado: ${username}, verificando senha...`);
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        console.log(`Senha inválida para usuário: ${username}`);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Iniciar sessão para o usuário
      req.session.userId = user.id;
      console.log(`Login bem-sucedido para usuário: ${username} (ID: ${user.id})`);

      // Garantir que a sessão seja salva antes de responder
      req.session.save((err) => {
        if (err) {
          console.error("Erro ao salvar sessão:", err);
          return res.status(500).json({ message: "Erro ao iniciar sessão" });
        }
        
        // Não retornar a senha no resultado
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Erro de validação:", error.errors);
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao fazer login:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  // Logout
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });

  // Obter usuário atual
  app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);

      if (!user) {
        req.session.destroy(() => {});
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Não retornar a senha no resultado
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      res.status(500).json({ message: "Erro ao obter usuário" });
    }
  });
}