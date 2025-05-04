import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Página de redirecionamento para o callback do Google OAuth
 * 
 * Esta página captura o código de autorização e o encaminha para o backend para processamento
 */
export default function GoogleCallbackPage() {
  const [message, setMessage] = useState("Processando autenticação do Google...");
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function processCallback() {
      try {
        // Obtém os parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          console.error("Erro retornado pelo Google:", error);
          setError(`Erro na autenticação: ${error}`);
          setTimeout(() => {
            navigate("/calendar-integration?error=true&provider=google&reason=" + error);
          }, 2000);
          return;
        }

        if (!code) {
          console.error("Nenhum código de autorização recebido");
          setError("Nenhum código de autorização recebido");
          setTimeout(() => {
            navigate("/calendar-integration?error=true&provider=google&reason=no_code");
          }, 2000);
          return;
        }

        // Envia o código para o backend
        const response = await fetch(`/api/calendar/google/callback?code=${code}`, {
          method: "GET",
          credentials: "include", // Importante para enviar cookies de sessão
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao processar autenticação");
        }

        setMessage("Autenticação concluída com sucesso! Redirecionando...");
        
        // Redireciona para a página de integração com sucesso
        setTimeout(() => {
          navigate("/calendar-integration?success=true&provider=google");
        }, 1500);

      } catch (error) {
        console.error("Erro ao processar callback:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        
        setTimeout(() => {
          navigate("/calendar-integration?error=true&provider=google");
        }, 2000);
      }
    }

    processCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        {error ? (
          <>
            <div className="mb-6 flex justify-center text-destructive text-5xl">⚠️</div>
            <h1 className="mb-4 text-center text-2xl font-bold">Erro na Autenticação</h1>
            <p className="mb-6 text-center text-muted-foreground">{error}</p>
            <p className="text-center text-sm text-muted-foreground">Redirecionando para a página de integração...</p>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="mb-4 text-center text-2xl font-bold">Autenticação do Google</h1>
            <p className="mb-6 text-center text-muted-foreground">{message}</p>
            <p className="text-center text-sm text-muted-foreground">Um momento enquanto processamos sua autenticação...</p>
          </>
        )}
      </div>
    </div>
  );
}