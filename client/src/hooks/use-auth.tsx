import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/me", {
          credentials: "include"
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha na autenticação");
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer logout");
      }

      setUser(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }

      const newUserData = await response.json();
      setUser(newUserData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}