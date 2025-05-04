import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Esquemas de validação
const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  name: z.string().min(3, "Nome completo precisa ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Número de telefone deve ter pelo menos 10 dígitos"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
      phone: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoginLoading(true);
    try {
      console.log("Enviando dados de login:", data);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include" // Importante para guardar cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro desconhecido no login");
      }
      
      const userData = await response.json();
      console.log("Login bem-sucedido:", userData);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o dashboard.",
      });
      
      // Redirecionamento direto após o login
      console.log("Redirecionando para dashboard após login bem-sucedido");
      
      // Usando redirecionamento direto ao invés de verificar a sessão novamente
      // Isso proporciona uma experiência mais fluida ao usuário
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Erro de login:", error);
      
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Verifique seu nome de usuário e senha.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setRegisterLoading(true);
    try {
      console.log("Enviando dados de registro:", data);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include" // Importante para guardar cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro desconhecido no registro");
      }
      
      const userData = await response.json();
      console.log("Registro bem-sucedido:", userData);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você será redirecionado para o dashboard.",
      });
      
      // Adicionando um pequeno atraso antes do redirecionamento
      // para garantir que a sessão seja estabelecida corretamente
      console.log("Aguardando sessão ser estabelecida...");
      setTimeout(() => {
        console.log("Redirecionando para dashboard após registro bem-sucedido");
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Erro ao registrar:", error);
      
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Verifique as informações fornecidas ou tente outro nome de usuário.",
        variant: "destructive",
      });
      
      setActiveTab("login");
      registerForm.reset();
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Hero section com informações sobre o TarefoAI */}
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-4">TarefoAI</h1>
          <h2 className="text-xl mb-6">Seu assistente pessoal inteligente</h2>
          <p className="mb-6">
            Gerencie suas tarefas, eventos, lembretes e comunique-se naturalmente
            com um assistente que realmente entende suas necessidades.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Integração com WhatsApp e Telegram</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Gerenciamento inteligente de calendário</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Lembretes personalizados</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Monitoramento de finanças</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Formulários de login e registro */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Bem-vindo ao TarefoAI</CardTitle>
            <CardDescription className="text-center">
              Faça login ou crie uma conta para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>

              {/* Aba de Login */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Aba de Cadastro */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Escolha um nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Digite seu email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu telefone (com DDD)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Será usado para integração com WhatsApp e Telegram
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crie uma senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerLoading}>
                      {registerLoading ? "Criando conta..." : "Criar conta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}