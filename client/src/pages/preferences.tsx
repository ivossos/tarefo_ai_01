import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatModal from "@/components/chat/ChatModal";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type CalendarStatus = {
  google: boolean;
  apple: boolean;
  preferredCalendar: string;
};

export default function PreferencesPage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  // Hard-coded user ID for demo purposes
  const userId = 1;
  
  // Buscar status de integração dos calendários
  const { 
    data: calendarStatus
  } = useQuery<CalendarStatus>({
    queryKey: ['/api/calendar/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/calendar/status');
      return response.json();
    }
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Preferências" subtitle="Personalize sua experiência com o TarefoAI" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Chat Notifications</h4>
                      <p className="text-sm text-neutral-600">Receive messages in your chat app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-neutral-600">Receive reminders and updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-neutral-600">Receive text message alerts for important reminders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Calendar Settings</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Default Calendar View</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                      <option>Day</option>
                      <option>Week</option>
                      <option>Month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Default Reminder Time</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                      <option>15 minutes before</option>
                      <option>30 minutes before</option>
                      <option>1 hour before</option>
                      <option>1 day before</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Google Calendar Sync</h4>
                      <p className="text-sm text-neutral-600">Sync events with your Google Calendar</p>
                    </div>
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg ${calendarStatus?.google 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-secondary hover:bg-secondary-dark text-white'}`}
                      onClick={() => setLocation('/calendar-integration')}
                    >
                      {calendarStatus?.google ? 'Configurado' : 'Conectar'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Apple Calendar Sync</h4>
                      <p className="text-sm text-neutral-600">Sync events with your Apple Calendar</p>
                    </div>
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg ${calendarStatus?.apple 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-secondary hover:bg-secondary-dark text-white'}`}
                      onClick={() => setLocation('/calendar-integration')}
                    >
                      {calendarStatus?.apple ? 'Configurado' : 'Conectar'}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button 
                      className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                      onClick={() => setLocation('/calendar-integration')}
                    >
                      <i className="ri-settings-3-line"></i>
                      Gerenciar integrações de calendário
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">App Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Language</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                      <option>English</option>
                      <option>Portuguese</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-neutral-600">Choose between light and dark mode</p>
                    </div>
                    <div className="flex">
                      <button className="px-3 py-1 text-sm bg-white text-neutral-700 border border-neutral-300 rounded-l-lg hover:bg-neutral-50">
                        Light
                      </button>
                      <button className="px-3 py-1 text-sm bg-neutral-800 text-white border border-neutral-800 rounded-r-lg hover:bg-neutral-700">
                        Dark
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Sounds</h4>
                      <p className="text-sm text-neutral-600">Play sounds for notifications and actions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg mr-2 hover:bg-neutral-300">
                  Reset to Default
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
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
    </div>
  );
}
