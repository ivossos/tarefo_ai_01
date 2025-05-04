import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Shield } from "lucide-react";

// Esquema de validação
const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Formulário de login
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Fazer login
      const response = await apiRequest("POST", "/api/login", data);
      const user = await response.json();
      
      console.log("Login realizado:", user);
      
      // Verificar se o usuário é administrador
      if (user.role === "admin") {
        toast({
          title: "Login de administrador bem-sucedido",
          description: "Você será redirecionado para o painel administrativo.",
        });
        // Adicionando um pequeno delay para garantir que a sessão está estabelecida
        setTimeout(() => {
          setLocation("/admin");
        }, 500);
      } else {
        console.log("Usuário não é administrador:", user);
        // Se não for administrador, fazer logout e mostrar erro
        await apiRequest("POST", "/api/logout");
        toast({
          title: "Acesso negado",
          description: "Esta área é restrita a administradores do sistema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro de login:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Verifique seu nome de usuário e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center">
          <Shield className="w-10 h-10 mx-auto mb-2 text-primary" />
          <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
          <CardDescription>
            Esta área é restrita a administradores do sistema. 
            Por favor, faça login com suas credenciais de administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar como Administrador"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setLocation("/")}>
              Voltar para a página inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}