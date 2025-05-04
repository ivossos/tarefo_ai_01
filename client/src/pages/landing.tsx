import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { Confetti } from "@/components/ui/confetti";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleStartClick = (path: string) => {
    // Vamos manter a função setShowConfetti para evitar erros, mas não vamos usá-la por enquanto
    // setShowConfetti(true);
    
    // Navega para a rota imediatamente
    setLocation(path);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Componente de confete */}
      <Confetti active={showConfetti} duration={2000} />
      {/* Header minimalista */}
      <header className="container mx-auto py-6 flex justify-between items-center px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <i className="ri-brain-fill text-primary text-xl flex-shrink-0"></i>
          <h1 className="text-xl font-medium truncate">TarefoAI</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => handleStartClick('/ajuda')}
            className="text-sm"
          >
            <i className="ri-question-line mr-1"></i>
            Ajuda
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => handleStartClick('/auth')}
            className="text-sm"
          >
            Entrar
          </Button>
          <Button 
            size="sm"
            variant="outline" 
            onClick={() => handleStartClick('/onboarding')}
            className="text-sm"
          >
            Cadastrar
          </Button>
        </div>
      </header>
      
      {/* Hero Section com destaque para WhatsApp e Telegram */}
      <main className="container mx-auto py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2 text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
              Uma Equipe de Agentes AI a Seu Serviço
            </h1>
            <p className="text-lg md:text-xl text-foreground mt-6 font-medium">
              Cinco agentes especializados trabalhando em tempo integral para <span className="underline decoration-primary decoration-2">transformar seu caos em produtividade</span>.
            </p>
            
            {/* Destaque de integração com mensageiros */}
            <div className="pt-6 flex flex-col gap-4">
              <div className="flex flex-row items-center gap-4 border-2 border-[#25D366]/30 bg-[#25D366]/5 rounded-xl p-4 transform transition-all hover:scale-102 hover:shadow-md">
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-whatsapp-line text-white text-2xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">WhatsApp</h3>
                  <p className="text-sm text-gray-700">Gerencie sua vida diretamente do app que você já usa todos os dias</p>
                </div>
              </div>
              
              <div className="flex flex-row items-center gap-4 border-2 border-[#0088cc]/30 bg-[#0088cc]/5 rounded-xl p-4 transform transition-all hover:scale-102 hover:shadow-md">
                <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-telegram-line text-white text-2xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Telegram</h3>
                  <p className="text-sm text-gray-700">Interaja com seu assistente pessoal 24h por dia com comandos intuitivos</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg"
                onClick={() => handleStartClick('/auth')}
                className="bg-gradient-to-r from-primary to-primary-400 hover:from-primary-600 hover:to-primary text-white font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <i className="ri-login-circle-line mr-2 text-xl"></i>
                Acessar Agora
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => handleStartClick('/onboarding')}
                className="border-2 border-primary/20 bg-white/5 backdrop-blur-sm hover:bg-primary/10 font-medium px-8 py-6 h-auto rounded-xl hover:shadow-lg transition-all"
              >
                <i className="ri-user-add-line mr-2 text-xl"></i>
                Criar Conta Gratuita
              </Button>
            </div>
          </div>
          
          {/* Animação avançada */}
          <div className="md:w-1/2 md:pl-8">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]"></div>
              
              {/* Partículas de fundo animadas */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute w-20 h-20 bg-primary/20 rounded-full top-1/4 left-1/5 animate-ping" style={{ animationDuration: '6s', animationDelay: '0.2s' }}></div>
                <div className="absolute w-12 h-12 bg-secondary/20 rounded-full bottom-1/4 right-1/3 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                <div className="absolute w-16 h-16 bg-primary/10 rounded-full top-1/3 right-1/4 animate-ping" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
                <div className="absolute w-10 h-10 bg-secondary/10 rounded-full bottom-1/3 left-1/4 animate-ping" style={{ animationDuration: '5s', animationDelay: '1.5s' }}></div>
                
                {/* Linhas de conexão */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-[1px] bg-primary rotate-45 animate-pulse"></div>
                  <div className="absolute top-2/3 left-1/3 w-1/3 h-[1px] bg-secondary -rotate-45 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                  <div className="absolute top-1/3 right-1/4 w-1/4 h-[1px] bg-primary rotate-12 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                </div>
              </div>
              
              {/* Conteúdo principal */}
              <div className="relative z-10 p-10 flex flex-col items-center text-white">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <i className="ri-robot-fill text-4xl"></i>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 text-center">TarefoAI Inteligência Artificial</h3>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 max-w-lg shadow-xl border border-white/10">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                      <i className="ri-message-3-line text-white"></i>
                    </div>
                    <div className="ml-3 p-3 bg-white/5 rounded-r-lg rounded-bl-lg">
                      <p className="text-sm">Como posso te ajudar hoje?</p>
                    </div>
                  </div>
                  <div className="flex items-start mb-4 justify-end">
                    <div className="mr-3 p-3 bg-primary/20 rounded-l-lg rounded-br-lg">
                      <p className="text-sm">Preciso agendar uma reunião com a equipe de marketing amanhã às 14h</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                      <i className="ri-user-line text-white"></i>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                      <i className="ri-message-3-line text-white"></i>
                    </div>
                    <div className="ml-3 p-3 bg-white/5 rounded-r-lg rounded-bl-lg">
                      <p className="text-sm">Pronto! Agendei sua reunião com a equipe de marketing para amanhã às 14h. Deseja enviar um lembrete 15 minutos antes?</p>
                    </div>
                  </div>
                </div>
                
                {/* Recursos */}
                <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-lg">
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center transform hover:scale-105 transition-transform">
                    <i className="ri-calendar-2-line text-2xl text-primary mb-2"></i>
                    <span className="text-xs font-medium">Agenda</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center transform hover:scale-105 transition-transform">
                    <i className="ri-notification-3-line text-2xl text-secondary mb-2"></i>
                    <span className="text-xs font-medium">Alertas</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center transform hover:scale-105 transition-transform">
                    <i className="ri-chat-1-line text-2xl text-primary mb-2"></i>
                    <span className="text-xs font-medium">Chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Seção de Recursos - CrewAI Agentes */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Equipe CrewAI: 5 Especialistas, 1 Missão</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma equipe completa de agentes especializados trabalhando 24h por dia para <span className="font-semibold text-primary">orquestrar sua vida</span> enquanto você foca no que realmente importa
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <i className="ri-chat-1-line text-primary text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Agente de Mensagens</h3>
              <p className="text-sm text-muted-foreground">
                Gerencia toda a comunicação com WhatsApp e Telegram, garantindo respostas contextuais e precisas
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <i className="ri-calendar-check-line text-blue-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Agente de Calendário</h3>
              <p className="text-sm text-muted-foreground">
                Sincroniza eventos com Google Calendar e Apple Calendar, otimizando sua agenda
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <i className="ri-notification-4-line text-amber-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Agente de Lembretes</h3>
              <p className="text-sm text-muted-foreground">
                Envia notificações e alertas no momento certo através dos seus canais preferidos
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <i className="ri-file-scan-line text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Agente de OCR</h3>
              <p className="text-sm text-muted-foreground">
                Extrai dados de imagens e documentos como recibos e faturas automaticamente
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <i className="ri-shield-check-line text-purple-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Agente de Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Garante conformidade com LGPD e GDPR, protegendo seus dados pessoais
              </p>
            </div>
          </div>
          
          {/* Diagrama de Conexão dos Agentes */}
          <div className="mt-12 bg-white p-6 rounded-xl shadow-md border border-neutral-200 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">Arquitetura CrewAI</h3>
            <p className="text-muted-foreground text-center mb-6">
              Nossos agentes trabalham em conjunto através da plataforma CrewAI para oferecer uma experiência integrada e inteligente
            </p>
            <div className="relative h-64 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4">
              {/* Círculo central */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
                <span className="font-bold text-primary">CrewAI</span>
              </div>
              
              {/* Agente de Mensagens */}
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-primary shadow-md">
                <i className="ri-chat-1-line text-primary text-xl"></i>
              </div>
              
              {/* Agente de Calendário */}
              <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-blue-500 shadow-md">
                <i className="ri-calendar-check-line text-blue-500 text-xl"></i>
              </div>
              
              {/* Agente de Lembretes */}
              <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-amber-500 shadow-md">
                <i className="ri-notification-4-line text-amber-500 text-xl"></i>
              </div>
              
              {/* Agente de OCR */}
              <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-green-500 shadow-md">
                <i className="ri-file-scan-line text-green-500 text-xl"></i>
              </div>
              
              {/* Agente de Compliance - posicionado acima */}
              <div className="absolute top-1/8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-purple-500 shadow-md">
                <i className="ri-shield-check-line text-purple-500 text-xl"></i>
              </div>
              
              {/* Linhas de conexão */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[25%] h-[1px] bg-primary"></div>
                <div className="absolute top-1/4 right-1/4 w-[25%] h-[1px] bg-blue-500"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[25%] h-[1px] bg-amber-500"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[25%] h-[1px] bg-green-500"></div>
                <div className="absolute top-1/8 left-1/2 w-[1px] h-[25%] bg-purple-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção de FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Respostas para as perguntas mais comuns sobre o TarefoAI
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h3 className="text-xl font-semibold mb-2">O que é o TarefoAI?</h3>
              <p className="text-muted-foreground">
                O TarefoAI é um assistente de produtividade pessoal que utiliza uma arquitetura de agentes inteligentes (CrewAI), 
                projetado para ajudar você a gerenciar sua agenda, compromissos e lembretes através de uma 
                interface conversacional, funcionando no navegador e integrando com seus aplicativos de mensagens.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h3 className="text-xl font-semibold mb-2">Como funciona a integração com o WhatsApp e Telegram?</h3>
              <p className="text-muted-foreground">
                Após criar sua conta, você pode vincular seu número de telefone e verificá-lo para conectar as 
                plataformas de mensagens. Uma vez conectado, você poderá enviar mensagens normais para seu 
                assistente TarefoAI e receber atualizações, lembretes e respostas diretamente nos aplicativos.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h3 className="text-xl font-semibold mb-2">O serviço é gratuito?</h3>
              <p className="text-muted-foreground">
                O TarefoAI oferece um plano gratuito com recursos básicos e um limite mensal de interações. 
                Para acesso ilimitado e recursos avançados como transcrição de voz, integração com calendários 
                e análises de produtividade, oferecemos planos premium com preços acessíveis.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção de Call-to-Action */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para ter uma <span className="text-primary">equipe de especialistas AI</span> ao seu dispor?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Cinco agentes especializados trabalhando 24/7 para transformar sua vida digital enquanto você foca no que importa
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => handleStartClick('/auth')}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3"
            >
              Começar Agora
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleStartClick('/onboarding')}
              className="border-2 border-primary text-primary hover:bg-primary/5"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-brain-fill text-primary text-xl"></i>
                <h2 className="text-xl font-bold">TarefoAI</h2>
              </div>
              <p className="text-neutral-400 text-sm max-w-xs">
                Assistente de produtividade pessoal alimentado por inteligência artificial para simplificar sua vida
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Planos</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Comunidade</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm">
              &copy; {new Date().getFullYear()} TarefoAI. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}