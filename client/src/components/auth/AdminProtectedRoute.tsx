import { useState, useEffect } from "react";
import { Route, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

type AdminProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export default function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Primeiro, verifica se o usuário está autenticado
        console.log("Verificando autenticação do administrador...");
        const userResponse = await fetch("/api/me", {
          credentials: "include" // Importante para enviar cookies
        });
        
        if (!userResponse.ok) {
          console.log("Usuário não autenticado, redirecionando para /admin-login");
          setIsAdmin(false);
          setLocation("/admin-login");
          return;
        }
        
        const userData = await userResponse.json();
        console.log("Usuário encontrado:", userData);
        
        // Verifica se o usuário é administrador
        if (userData.role !== 'admin') {
          console.log("Usuário não é administrador, redirecionando para /auth");
          setIsAdmin(false);
          setLocation("/auth");
          return;
        }
        
        console.log("Usuário é administrador, permitindo acesso");
        setIsAdmin(true);
      } catch (error) {
        console.error("Erro ao verificar permissões de administrador:", error);
        setIsAdmin(false);
        setLocation("/admin-login");
      }
    };

    checkAdmin();
  }, [setLocation]);

  return (
    <Route path={path}>
      {isAdmin === null ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isAdmin ? (
        <Component />
      ) : null}
    </Route>
  );
}