import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEventsByDate } from "@/hooks/use-events";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import DayView from "@/components/calendar/DayView";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import ChatModal from "@/components/chat/ChatModal";
import AddEventModal from "@/components/calendar/AddEventModal";
import { apiRequest } from "@/lib/queryClient";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  // Utilizando getUserId do localStorage
  const [userId, setUserId] = useState<number>(1); 
  
  useEffect(() => {
    // Obter ID do usuário do localStorage ou API
    const fetchUserId = async () => {
      try {
        const response = await apiRequest("GET", "/api/me");
        const userData = await response.json();
        if (userData && userData.id) {
          setUserId(userData.id);
        }
      } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
      }
    };
    
    fetchUserId();
  }, []);
  
  const { data: events = [], isLoading } = useEventsByDate(userId, selectedDate);
  
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const formatMonth = (date: Date) => {
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar 
          title="Calendário" 
          subtitle={`Você tem ${events.length} ${events.length === 1 ? 'tarefa' : 'tarefas'} hoje.`}
        />
        
        {/* Calendar tools */}
        <div className="bg-white border-b border-neutral-200 px-4 py-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <button 
              onClick={handlePrevDay}
              className="p-1 hover:bg-neutral-100 rounded"
            >
              <i className="ri-arrow-left-s-line text-lg text-neutral-600"></i>
            </button>
            <h2 className="mx-2 font-semibold">{formatMonth(selectedDate)}</h2>
            <button 
              onClick={handleNextDay}
              className="p-1 hover:bg-neutral-100 rounded"
            >
              <i className="ri-arrow-right-s-line text-lg text-neutral-600"></i>
            </button>
          </div>
          
          <div className="flex mr-auto">
            <button 
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-sm font-medium rounded-l border ${
                viewMode === "day" 
                  ? "bg-primary-light/20 text-primary border-primary/10" 
                  : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm font-medium border-t border-b ${
                viewMode === "week" 
                  ? "bg-primary-light/20 text-primary border-primary/10" 
                  : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm font-medium rounded-r border ${
                viewMode === "month" 
                  ? "bg-primary-light/20 text-primary border-primary/10" 
                  : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Mês
            </button>
            
            <button 
              onClick={() => setLocation("/calendar-integration")}
              className="ml-2 px-3 py-1 text-sm font-medium border border-neutral-200 rounded flex items-center gap-1 text-neutral-600 hover:bg-neutral-50"
            >
              <i className="ri-settings-4-line"></i>
              <span>Integrar</span>
            </button>
          </div>
          
          <button 
            onClick={() => setLocation("/task-form")}
            className="flex items-center px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark shadow-sm"
          >
            <i className="ri-add-line mr-1"></i>
            <span>Nova Tarefa</span>
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar main view */}
          <div className="flex-1 overflow-y-auto bg-white p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">Carregando eventos...</p>
              </div>
            ) : (
              <DayView date={selectedDate} events={events} userId={userId} />
            )}
          </div>
          
          {/* Notifications panel */}
          <NotificationsPanel userId={userId} />
        </div>
      </main>
      
      {/* Chat launcher button */}
      <button 
        onClick={() => setIsChatModalOpen(true)}
        className="fixed bottom-5 right-5 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-dark z-50"
      >
        <i className="ri-message-3-fill text-2xl"></i>
      </button>
      
      {/* Chat modal */}
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
        userId={userId}
      />
      
      {/* Add event modal */}
      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}
