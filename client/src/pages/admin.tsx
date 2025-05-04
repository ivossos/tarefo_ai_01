import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LogOut, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Shield, 
  ShieldAlert,
  Loader2,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>("users");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  // Estados para gerenciar confirmação de exclusão
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<"user" | "event" | "reminder" | "message" | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  useEffect(() => {
    // Carrega os dados iniciais
    loadData(activeTab);
  }, [activeTab]);

  // Função para carregar os dados com base na tab ativa
  const loadData = async (tab: string) => {
    setLoading(true);
    try {
      let endpoint = "";
      
      switch (tab) {
        case "users":
          endpoint = "/api/admin/users";
          const usersResponse = await apiRequest("GET", endpoint);
          const usersData = await usersResponse.json();
          setUsers(usersData);
          break;
          
        case "events":
          endpoint = "/api/admin/events";
          const eventsResponse = await apiRequest("GET", endpoint);
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
          break;
          
        case "reminders":
          endpoint = "/api/admin/reminders";
          const remindersResponse = await apiRequest("GET", endpoint);
          const remindersData = await remindersResponse.json();
          setReminders(remindersData);
          break;
          
        case "messages":
          endpoint = "/api/admin/chat-messages";
          const messagesResponse = await apiRequest("GET", endpoint);
          const messagesData = await messagesResponse.json();
          setChatMessages(messagesData);
          break;
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os dados administrativos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para promover um usuário a administrador
  const promoteUser = async (userId: number) => {
    try {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/promote`);
      const updatedUser = await response.json();
      
      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      toast({
        title: "Usuário promovido",
        description: "O usuário agora tem privilégios de administrador.",
      });
    } catch (error) {
      toast({
        title: "Erro ao promover usuário",
        description: "Não foi possível atribuir privilégios de administrador.",
        variant: "destructive",
      });
    }
  };

  // Função para rebaixar um usuário (remover privilégios de administrador)
  const demoteUser = async (userId: number) => {
    try {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/demote`);
      const updatedUser = await response.json();
      
      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      toast({
        title: "Privilégios removidos",
        description: "O usuário não tem mais privilégios de administrador.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover privilégios",
        description: "Não foi possível remover os privilégios de administrador.",
        variant: "destructive",
      });
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do painel administrativo.",
      });
      setLocation("/admin-login");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar sua sessão.",
        variant: "destructive",
      });
    }
  };

  // Função para excluir um item (usuário, evento, lembrete ou mensagem)
  const confirmDelete = (type: "user" | "event" | "reminder" | "message", id: number) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setShowDeleteDialog(true);
  };

  // Função para processar a exclusão após confirmação
  const handleDelete = async () => {
    if (!deleteItemId || !deleteItemType) return;
    
    try {
      let endpoint = "";
      
      switch (deleteItemType) {
        case "user":
          endpoint = `/api/admin/users/${deleteItemId}`;
          await apiRequest("DELETE", endpoint);
          setUsers(users.filter(user => user.id !== deleteItemId));
          break;
          
        case "event":
          endpoint = `/api/admin/events/${deleteItemId}`;
          await apiRequest("DELETE", endpoint);
          setEvents(events.filter(event => event.id !== deleteItemId));
          break;
          
        case "reminder":
          endpoint = `/api/admin/reminders/${deleteItemId}`;
          await apiRequest("DELETE", endpoint);
          setReminders(reminders.filter(reminder => reminder.id !== deleteItemId));
          break;
          
        case "message":
          endpoint = `/api/admin/chat-messages/${deleteItemId}`;
          await apiRequest("DELETE", endpoint);
          setChatMessages(chatMessages.filter(msg => msg.id !== deleteItemId));
          break;
      }
      
      toast({
        title: "Item excluído",
        description: "O item foi removido com sucesso.",
      });
      
      // Recarrega os dados da aba atual para garantir que tudo esteja atualizado
      await loadData(activeTab);
      
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item selecionado.",
        variant: "destructive",
      });
    } finally {
      // Fecha o diálogo de confirmação
      setShowDeleteDialog(false);
      setDeleteItemId(null);
      setDeleteItemType(null);
    }
  };

  // Helper para formatar data
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Painel Administrativo TarefoAI</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="text-white hover:text-primary border-white hover:border-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4 gap-4">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Lembretes</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Mensagens</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das abas */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Usuários */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerenciamento de Usuários</CardTitle>
                    <CardDescription>
                      Visualize e gerencie as contas de usuário do TarefoAI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Lista de usuários cadastrados no sistema.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              <Badge variant={user.plan === "premium" ? "default" : "outline"}>
                                {user.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {user.role === "admin" ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => demoteUser(user.id)}
                                  >
                                    <ShieldAlert className="h-4 w-4 mr-1" />
                                    <span className="hidden md:inline">Remover admin</span>
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => promoteUser(user.id)}
                                  >
                                    <Shield className="h-4 w-4 mr-1" />
                                    <span className="hidden md:inline">Tornar admin</span>
                                  </Button>
                                )}
                                
                                {/* Botão de excluir usuário */}
                                {user.username !== 'system_admin' && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => confirmDelete("user", user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Eventos */}
              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos</CardTitle>
                    <CardDescription>
                      Visualize todos os eventos criados pelos usuários.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Lista de eventos do sistema.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Local</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Fim</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{event.id}</TableCell>
                            <TableCell>{event.userId}</TableCell>
                            <TableCell>{event.title}</TableCell>
                            <TableCell>{event.description || "-"}</TableCell>
                            <TableCell>{event.location || "-"}</TableCell>
                            <TableCell>{formatDate(event.startTime)}</TableCell>
                            <TableCell>{event.endTime ? formatDate(event.endTime) : "-"}</TableCell>
                            <TableCell>
                              <Badge variant={
                                event.status === "completed" ? "success" : 
                                event.status === "cancelled" ? "destructive" : 
                                "secondary"
                              }>
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(event.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setLocation(`/task-form?edit=${event.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDelete("event", event.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lembretes */}
              <TabsContent value="reminders">
                <Card>
                  <CardHeader>
                    <CardTitle>Lembretes</CardTitle>
                    <CardDescription>
                      Visualize todos os lembretes criados pelos usuários.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Lista de lembretes do sistema.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reminders.map((reminder) => (
                          <TableRow key={reminder.id}>
                            <TableCell>{reminder.id}</TableCell>
                            <TableCell>{reminder.userId}</TableCell>
                            <TableCell>{reminder.title}</TableCell>
                            <TableCell>{reminder.description || "-"}</TableCell>
                            <TableCell>{formatDate(reminder.dueDate)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                reminder.priority === "high" ? "destructive" : 
                                reminder.priority === "medium" ? "default" : 
                                "secondary"
                              }>
                                {reminder.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                reminder.status === "completed" ? "success" : 
                                reminder.status === "cancelled" ? "destructive" : 
                                "secondary"
                              }>
                                {reminder.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(reminder.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setLocation(`/task-form?edit_reminder=${reminder.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDelete("reminder", reminder.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mensagens */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Chat</CardTitle>
                    <CardDescription>
                      Visualize todas as mensagens trocadas entre os usuários e o TarefoAI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Histórico de mensagens do sistema.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Plataforma</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Conteúdo</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chatMessages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell>{message.id}</TableCell>
                            <TableCell>{message.userId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {message.platform}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={message.isFromUser ? "secondary" : "default"}>
                                {message.isFromUser ? "Usuário" : "TarefoAI"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {message.content}
                            </TableCell>
                            <TableCell>{formatDate(message.timestamp)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDelete("message", message.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItemType === "event" && "Tem certeza que deseja excluir este evento?"}
              {deleteItemType === "reminder" && "Tem certeza que deseja excluir este lembrete?"}
              {deleteItemType === "message" && "Tem certeza que deseja excluir esta mensagem?"}
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPage;