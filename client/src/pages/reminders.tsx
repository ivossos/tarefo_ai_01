import { useState } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/date";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatModal from "@/components/chat/ChatModal";

export default function RemindersPage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  // Hard-coded user ID for demo purposes
  const userId = 1;
  
  const { data: reminders = [], isLoading } = useReminders(userId);
  
  // Group reminders by status
  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Reminders" subtitle="Manage your tasks and never miss a deadline" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Reminders</h2>
              <button className="flex items-center px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark shadow-sm">
                <i className="ri-add-line mr-1"></i>
                <span>New Reminder</span>
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">Loading reminders...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Pending ({pendingReminders.length})</h3>
                  
                  {pendingReminders.length === 0 ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
                      <i className="ri-checkbox-circle-line text-4xl text-neutral-300 mb-2"></i>
                      <p className="text-neutral-500">No pending reminders. You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingReminders.map(reminder => (
                        <div key={reminder.id} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-lg">{reminder.title}</h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              reminder.priority === 'high' 
                                ? 'bg-rose-100 text-rose-700' 
                                : reminder.priority === 'low'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                            </span>
                          </div>
                          
                          {reminder.description && (
                            <p className="text-sm text-neutral-600 mb-3">{reminder.description}</p>
                          )}
                          
                          <div className="flex items-center text-sm text-neutral-500 mb-3">
                            <i className="ri-time-line mr-1"></i>
                            <span>{formatDateTime(reminder.dueDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-neutral-500 mb-4">
                            <i className="ri-alarm-line mr-1"></i>
                            <span>{formatRelativeTime(reminder.dueDate)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <button className="px-3 py-1 text-xs bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200">
                              Snooze
                            </button>
                            <button className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark">
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {completedReminders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Completed ({completedReminders.length})</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedReminders.map(reminder => (
                        <div key={reminder.id} className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 opacity-70">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-lg line-through">{reminder.title}</h4>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              Completed
                            </span>
                          </div>
                          
                          {reminder.description && (
                            <p className="text-sm text-neutral-600 mb-3 line-through">{reminder.description}</p>
                          )}
                          
                          <div className="flex items-center text-sm text-neutral-500 mb-4">
                            <i className="ri-time-line mr-1"></i>
                            <span>{formatDateTime(reminder.dueDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
