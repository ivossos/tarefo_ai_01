import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatModal from "@/components/chat/ChatModal";

export default function FinancesPage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  // Hard-coded user ID for demo purposes
  const userId = 1;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Finances" subtitle="Track your expenses and manage your budget" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary/5 rounded-lg p-6 mb-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Financial Insights</h2>
                <p className="mb-6 text-neutral-600">
                  Connect your bank accounts to unlock detailed financial insights.
                </p>
                <div className="inline-flex gap-3">
                  <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark shadow-sm">
                    Connect Bank Account
                  </button>
                  <button className="px-6 py-3 bg-white text-neutral-700 font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50">
                    Upload Receipts
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Monthly Overview</h3>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <i className="ri-more-2-fill"></i>
                    </button>
                  </div>
                  <div className="h-52 flex items-center justify-center bg-neutral-50 rounded-lg mb-4">
                    <div className="text-center text-neutral-500">
                      <i className="ri-line-chart-line text-4xl mb-2"></i>
                      <p>Connect your bank to see your monthly spending overview</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Upcoming Bills</h3>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <div className="h-52 flex items-center justify-center bg-neutral-50 rounded-lg mb-4">
                    <div className="text-center text-neutral-500">
                      <i className="ri-bill-line text-4xl mb-2"></i>
                      <p>No upcoming bills found</p>
                      <button className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark">
                        Add Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Recent Expenses</h3>
                  <div className="relative">
                    <select className="pr-8 pl-3 py-1 border border-neutral-200 rounded-lg bg-white appearance-none text-sm">
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Last 3 Months</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500"></i>
                  </div>
                </div>
                
                <div className="flex items-center justify-center bg-neutral-50 rounded-lg p-8">
                  <div className="text-center">
                    <i className="ri-receipt-line text-4xl text-neutral-400 mb-2"></i>
                    <p className="text-neutral-500 mb-2">No expense data available</p>
                    <p className="text-sm text-neutral-400 mb-4">
                      Connect your bank account or upload receipts to track your expenses
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark">
                        <i className="ri-bank-card-line mr-1"></i>
                        Connect Bank
                      </button>
                      <button className="px-4 py-2 bg-white text-neutral-700 text-sm font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50">
                        <i className="ri-upload-2-line mr-1"></i>
                        Upload Receipt
                      </button>
                    </div>
                  </div>
                </div>
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
