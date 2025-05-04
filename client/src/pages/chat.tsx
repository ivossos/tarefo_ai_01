import { useState, useRef, useEffect } from "react";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatMessage from "@/components/chat/ChatMessage";
import { ChatMessage as ChatMessageType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState<"whatsapp" | "telegram">("whatsapp");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hard-coded user ID for demo purposes
  const userId = 1;
  
  const { data: messages = [], isLoading } = useChatMessages(userId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage({
      userId,
      content: message,
      isFromUser: true,
      platform
    });
    
    setMessage("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Chat" subtitle="Converse com o TarefoAI diretamente" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 border-r border-neutral-200">
            <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between">
              <div className="flex">
                <button 
                  onClick={() => setPlatform("whatsapp")} 
                  className={`flex items-center px-3 py-2 rounded-l-lg border ${
                    platform === "whatsapp" 
                      ? "bg-green-50 text-green-600 border-green-200" 
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <i className="ri-whatsapp-line mr-1 md:mr-2"></i>
                  <span className="text-sm md:text-base">WhatsApp</span>
                </button>
                <button 
                  onClick={() => setPlatform("telegram")}
                  className={`flex items-center px-3 py-2 rounded-r-lg border ${
                    platform === "telegram" 
                      ? "bg-blue-50 text-blue-600 border-blue-200" 
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <i className="ri-telegram-line mr-1 md:mr-2"></i>
                  <span className="text-sm md:text-base">Telegram</span>
                </button>
              </div>
              
              <div className="flex items-center">
                {/* Drawer de comandos rápidos para dispositivos móveis */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <i className="ri-command-line mr-1"></i>
                      <span className="text-xs">Comandos</span>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Comandos Rápidos</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-2">
                      <button 
                        onClick={() => setMessage("O que tenho na minha agenda hoje?")}
                        className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <i className="ri-calendar-line text-neutral-500 mr-2 flex-shrink-0"></i>
                          <span className="truncate">O que tenho na minha agenda hoje?</span>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setMessage("Lembre-me de ligar para João amanhã às 10h")}
                        className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <i className="ri-alarm-line text-neutral-500 mr-2 flex-shrink-0"></i>
                          <span className="truncate">Lembre-me de ligar para João amanhã às 10h</span>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setMessage("Mostre meus próximos compromissos")}
                        className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <i className="ri-calendar-check-line text-neutral-500 mr-2 flex-shrink-0"></i>
                          <span className="truncate">Mostre meus próximos compromissos</span>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setMessage("Adicione uma nova tarefa: comprar mantimentos hoje à noite")}
                        className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <i className="ri-task-line text-neutral-500 mr-2 flex-shrink-0"></i>
                          <span className="truncate">Adicione uma nova tarefa: comprar mantimentos hoje à noite</span>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setMessage("Quais contas vencem esta semana?")}
                        className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <i className="ri-bill-line text-neutral-500 mr-2"></i>
                          <span>Quais contas vencem esta semana?</span>
                        </div>
                      </button>
                    </div>
                  </DrawerContent>
                </Drawer>
              
                <div className="ml-2 hidden md:block">
                  <p className="text-sm text-neutral-500">
                    Conectado como <span className="font-medium">Usuário</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-500">Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-500">Nenhuma mensagem ainda. Inicie uma conversa!</p>
                </div>
              ) : (
                messages.map((message: ChatMessageType) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-2 sm:p-4 border-t border-neutral-200 bg-white">
              <div className="flex items-center">
                <button type="button" className="p-1 sm:p-2 text-neutral-300 cursor-not-allowed hidden xs:inline-block" disabled>
                  <i className="ri-image-add-line text-lg"></i>
                </button>
                <button type="button" className="p-1 sm:p-2 text-neutral-300 cursor-not-allowed hidden xs:inline-block" disabled>
                  <i className="ri-mic-line text-lg"></i>
                </button>
                <div className="flex-1 mx-1 sm:mx-2">
                  <input 
                    type="text" 
                    placeholder="Digite uma mensagem..." 
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className="p-2 text-primary hover:text-primary-dark disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  <i className="ri-send-plane-fill text-lg"></i>
                </button>
              </div>
            </form>
          </div>
          
          <div className="w-72 bg-white hidden md:block p-4">
            <h3 className="font-semibold text-lg mb-4">Comandos Rápidos</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => setMessage("O que tenho na minha agenda hoje?")}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center">
                  <i className="ri-calendar-line text-neutral-500 mr-2"></i>
                  <span>O que tenho na minha agenda hoje?</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMessage("Lembre-me de ligar para João amanhã às 10h")}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center">
                  <i className="ri-alarm-line text-neutral-500 mr-2"></i>
                  <span>Lembre-me de ligar para João amanhã às 10h</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMessage("Mostre meus próximos compromissos")}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center">
                  <i className="ri-calendar-check-line text-neutral-500 mr-2"></i>
                  <span>Mostre meus próximos compromissos</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMessage("Adicione uma nova tarefa: comprar mantimentos hoje à noite")}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center">
                  <i className="ri-task-line text-neutral-500 mr-2"></i>
                  <span>Adicione uma nova tarefa: comprar mantimentos hoje à noite</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMessage("Quais contas vencem esta semana?")}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center">
                  <i className="ri-bill-line text-neutral-500 mr-2"></i>
                  <span>Quais contas vencem esta semana?</span>
                </div>
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h4 className="font-medium text-sm mb-2">Dicas do Assistente</h4>
              <p className="text-xs text-neutral-600">
                Você pode pedir ao TarefoAI para criar lembretes, verificar sua agenda, acompanhar despesas e muito mais. Experimente mensagens de voz ou envie imagens de recibos para processamento automático.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
