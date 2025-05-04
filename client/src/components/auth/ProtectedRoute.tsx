import { useState, useEffect } from "react";
import { Route, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export default function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticação...");
        const response = await fetch("/api/me", {
          credentials: "include", // Importante para enviar cookies
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.log("Usuário não autenticado, redirecionando para /auth");
          setIsAuthenticated(false);
          // Usando window.location para forçar recarregamento completo
          window.location.href = '/auth';
          return;
        }
        
        const userData = await response.json();
        console.log("Usuário autenticado:", userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        // Usando window.location para forçar recarregamento completo
        window.location.href = '/auth';
      }
    };

    checkAuth();
  }, [setLocation]);

  return (
    <Route path={path}>
      {isAuthenticated === null ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isAuthenticated ? (
        <Component />
      ) : null}
    </Route>
  );
}