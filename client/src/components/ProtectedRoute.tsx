import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

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

interface ProtectedRouteProps {
  component: React.ComponentType;
  path?: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include" // Importante para enviar cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Não autorizado - redirecionaremos em breve
            console.log("Usuário não autenticado");
            setUser(null);
          } else {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
          }
        } else {
          const userData = await response.json();
          console.log("Dados do usuário:", userData);
          setUser(userData);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Página de loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4 mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    console.log("Redirecionando para /auth de", location);
    return <Redirect to="/auth" />;
  }

  // Renderiza o componente se estiver autenticado
  return <Component />;
}

export function AdminProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include" // Importante para enviar cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Não autorizado - redirecionaremos em breve
            setUser(null);
          } else {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
          }
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Página de loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4 mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    console.log("Redirecionando para /admin-login de", location);
    return <Redirect to="/admin-login" />;
  }

  // Verifica se é administrador
  if (user.role !== 'admin') {
    console.log("Acesso negado: usuário não é admin");
    return <Redirect to="/auth" />;
  }

  // Renderiza o componente se estiver autenticado e for admin
  return <Component />;
}