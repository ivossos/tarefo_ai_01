import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/NavBar";
import ChatModal from "@/components/chat/ChatModal";

export default function ProfilePage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  // Hard-coded user ID for demo purposes
  const userId = 1;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar title="Configurações de Perfil" subtitle="Gerencie suas informações pessoais e configurações da conta" />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-neutral-200">
                  <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center">
                    <i className="ri-user-line text-4xl text-neutral-500"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">Perfil do Usuário</h3>
                    <p className="text-neutral-500 mb-3">Plano Gratuito</p>
                    <button className="px-4 py-2 bg-neutral-100 text-neutral-400 font-medium text-sm rounded-lg cursor-not-allowed" disabled>
                      <i className="ri-camera-line mr-1"></i>
                      Alterar Foto
                    </button>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h4 className="font-semibold mb-4">Informações Pessoais</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nome de Usuário</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Digite seu nome de usuário"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Digite seu email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="+55 (11) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg mr-2 hover:bg-neutral-300">
                      Cancelar
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                <h4 className="font-semibold mb-4">Alterar Senha</h4>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Senha Atual</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nova Senha</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Atualizar Senha
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h4 className="font-semibold mb-4 text-red-600">Zona de Perigo</h4>
                
                <p className="text-sm text-neutral-600 mb-4">
                  Após excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.
                </p>
                
                <button className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                  Excluir Conta
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
