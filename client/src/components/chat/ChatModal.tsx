import { useState, useRef, useEffect } from "react";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "@shared/schema";

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
};

export default function ChatModal({ isOpen, onClose, userId }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState<"whatsapp" | "telegram">("whatsapp");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-neutral-800/50" onClick={onClose}></div>
      <div className="absolute right-5 bottom-5 w-[95%] max-w-sm bg-white rounded-lg shadow-xl overflow-hidden" style={{ maxHeight: "70vh" }}>
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <i className="ri-robot-fill"></i>
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">TarefoAI</h3>
              <p className="text-xs text-primary-light">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="flex">
          <div className="w-1/5 bg-neutral-50 border-r border-neutral-200">
            <button 
              className={`w-full p-3 text-center hover:bg-neutral-100 text-neutral-600 border-l-4 ${platform === 'whatsapp' ? 'border-primary' : 'border-transparent'}`} 
              title="WhatsApp"
              onClick={() => setPlatform("whatsapp")}
            >
              <i className="ri-whatsapp-line text-xl"></i>
            </button>
            <button 
              className={`w-full p-3 text-center hover:bg-neutral-100 text-neutral-600 border-l-4 ${platform === 'telegram' ? 'border-primary' : 'border-transparent'}`} 
              title="Telegram"
              onClick={() => setPlatform("telegram")}
            >
              <i className="ri-telegram-line text-xl"></i>
            </button>
          </div>
          
          <div className="w-4/5 flex flex-col" style={{ height: "60vh" }}>
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
            
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-white">
              <div className="flex items-center">
                <button type="button" className="p-2 text-neutral-300 cursor-not-allowed" disabled>
                  <i className="ri-image-add-line text-lg"></i>
                </button>
                <button type="button" className="p-2 text-neutral-300 cursor-not-allowed" disabled>
                  <i className="ri-mic-line text-lg"></i>
                </button>
                <div className="flex-1 mx-2">
                  <input 
                    type="text" 
                    placeholder="Digite uma mensagem..." 
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
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
        </div>
      </div>
    </div>
  );
}
