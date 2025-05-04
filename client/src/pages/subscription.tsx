import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatModal from "@/components/chat/ChatModal";

type PlanFeature = {
  name: string;
  basicIncluded: boolean;
  standardIncluded: boolean;
  proIncluded: boolean;
};

const planFeatures: PlanFeature[] = [
  { name: "WhatsApp & Telegram Integration", basicIncluded: true, standardIncluded: true, proIncluded: true },
  { name: "Calendar Sync (Google, Apple)", basicIncluded: true, standardIncluded: true, proIncluded: true },
  { name: "Basic Reminders", basicIncluded: true, standardIncluded: true, proIncluded: true },
  { name: "Email Notifications", basicIncluded: false, standardIncluded: true, proIncluded: true },
  { name: "SMS Notifications", basicIncluded: false, standardIncluded: true, proIncluded: true },
  { name: "OCR for Receipts & Invoices", basicIncluded: false, standardIncluded: true, proIncluded: true },
  { name: "Bank Account Integration", basicIncluded: false, standardIncluded: false, proIncluded: true },
  { name: "Financial Insights & Reports", basicIncluded: false, standardIncluded: false, proIncluded: true },
  { name: "Priority Support", basicIncluded: false, standardIncluded: false, proIncluded: true },
];

export default function SubscriptionPage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "pro">("basic");
  
  // Hard-coded user ID for demo purposes
  const userId = 1;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Subscription Plans" subtitle="Choose the plan that works best for you" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Upgrade your plan to unlock additional features and get the most out of TarefoAI.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Basic Plan */}
                <div className={`bg-white rounded-lg border-2 ${selectedPlan === "basic" ? "border-primary" : "border-neutral-200"} p-6 hover:shadow-md transition-shadow`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">Basic</h3>
                    <div className="text-3xl font-bold my-3">Free</div>
                    <p className="text-neutral-600 text-sm">Get started with essential features</p>
                  </div>
                  
                  <div className="mb-6">
                    <ul className="space-y-3">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className={`flex items-center ${!feature.basicIncluded && 'text-neutral-400'}`}>
                          <i className={`${feature.basicIncluded ? 'ri-check-line text-primary' : 'ri-close-line text-neutral-400'} mr-2`}></i>
                          <span className="text-sm">{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPlan("basic")}
                    className={`w-full py-2 rounded-lg font-medium ${
                      selectedPlan === "basic" 
                        ? "bg-primary text-white" 
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {selectedPlan === "basic" ? "Current Plan" : "Select Plan"}
                  </button>
                </div>
                
                {/* Standard Plan */}
                <div className={`bg-white rounded-lg border-2 ${selectedPlan === "standard" ? "border-primary" : "border-neutral-200"} p-6 hover:shadow-md transition-shadow`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">Standard</h3>
                    <div className="text-3xl font-bold my-3">$9.99<span className="text-base font-normal text-neutral-500">/month</span></div>
                    <p className="text-neutral-600 text-sm">Enhanced productivity features</p>
                  </div>
                  
                  <div className="mb-6">
                    <ul className="space-y-3">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className={`flex items-center ${!feature.standardIncluded && 'text-neutral-400'}`}>
                          <i className={`${feature.standardIncluded ? 'ri-check-line text-primary' : 'ri-close-line text-neutral-400'} mr-2`}></i>
                          <span className="text-sm">{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPlan("standard")}
                    className={`w-full py-2 rounded-lg font-medium ${
                      selectedPlan === "standard" 
                        ? "bg-primary text-white" 
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {selectedPlan === "standard" ? "Current Plan" : "Select Plan"}
                  </button>
                </div>
                
                {/* Pro Plan */}
                <div className={`bg-white rounded-lg border-2 ${selectedPlan === "pro" ? "border-primary" : "border-neutral-200"} p-6 hover:shadow-md transition-shadow relative`}>
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    BEST VALUE
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">Pro</h3>
                    <div className="text-3xl font-bold my-3">$19.99<span className="text-base font-normal text-neutral-500">/month</span></div>
                    <p className="text-neutral-600 text-sm">Complete productivity suite with financial tools</p>
                  </div>
                  
                  <div className="mb-6">
                    <ul className="space-y-3">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className={`flex items-center ${!feature.proIncluded && 'text-neutral-400'}`}>
                          <i className={`${feature.proIncluded ? 'ri-check-line text-primary' : 'ri-close-line text-neutral-400'} mr-2`}></i>
                          <span className="text-sm">{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPlan("pro")}
                    className={`w-full py-2 rounded-lg font-medium ${
                      selectedPlan === "pro" 
                        ? "bg-primary text-white" 
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {selectedPlan === "pro" ? "Current Plan" : "Select Plan"}
                  </button>
                </div>
              </div>
              
              {selectedPlan !== "basic" && (
                <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">CVC</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark">
                    Subscribe to {selectedPlan === "standard" ? "Standard" : "Pro"} Plan
                  </button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-neutral-500">
                      You can cancel your subscription at any time. Your subscription will renew automatically.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Can I change my plan later?</h4>
                    <p className="text-sm text-neutral-600">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect on your next billing cycle.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">How do I cancel my subscription?</h4>
                    <p className="text-sm text-neutral-600">You can cancel your subscription from your account settings. Your plan will remain active until the end of the current billing period.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Is there a free trial?</h4>
                    <p className="text-sm text-neutral-600">Yes, new users get a 14-day free trial of the Pro plan when they sign up.</p>
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
