import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function OnboardingPage() {
  const [step, setStep] = useState<'platform' | 'info' | 'verify' | 'success'>('platform');
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [, setLocation] = useLocation();
  
  // Avança para o próximo passo
  const nextStep = () => {
    if (step === 'platform') setStep('info');
    else if (step === 'info') setStep('verify');
    else if (step === 'verify') setStep('success');
    else if (step === 'success') setLocation('/chat');
  };
  
  // Simula o envio do código de verificação
  const sendVerificationCode = () => {
    // Em produção, aqui chamaríamos uma API para enviar o código
    console.log(`Enviando código para ${phone} via ${platform}`);
    nextStep();
  };
  
  // Simula a verificação do código
  const verifyCode = () => {
    setIsSubmitting(true);
    
    // Em produção, aqui verificaríamos o código com uma API
    setTimeout(() => {
      setIsSubmitting(false);
      nextStep();
    }, 1500);
  };
  
  // Completa o onboarding e redireciona para a integração de calendário
  const completeOnboarding = () => {
    setLocation('/calendar-integration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'platform' && 'Bem-vindo ao TarefoAI'}
            {step === 'info' && 'Seus dados'}
            {step === 'verify' && 'Verificação'}
            {step === 'success' && 'Tudo pronto!'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'platform' && 'Escolha como deseja receber suas notificações'}
            {step === 'info' && 'Precisamos de algumas informações para começar'}
            {step === 'verify' && `Enviamos um código para seu ${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'}`}
            {step === 'success' && 'Sua conta foi criada com sucesso!'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Passo 1: Escolha da plataforma */}
          {step === 'platform' && (
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => {
                  setPlatform('whatsapp');
                  nextStep();
                }}
                className="h-20 gap-2 bg-green-600 hover:bg-green-700"
              >
                <i className="ri-whatsapp-line text-2xl"></i>
                <span className="text-lg">Continuar com WhatsApp</span>
              </Button>
              
              <Button 
                onClick={() => {
                  setPlatform('telegram');
                  nextStep();
                }}
                className="h-20 gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <i className="ri-telegram-line text-2xl"></i>
                <span className="text-lg">Continuar com Telegram</span>
              </Button>
            </div>
          )}
          
          {/* Passo 2: Informações de contato */}
          {step === 'info' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Número de telefone</Label>
                <Input 
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 (00) 00000-0000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Formato internacional com código do país
                </p>
              </div>
              

            </div>
          )}
          
          {/* Passo 3: Verificação do código */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificação</Label>
                <Input 
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Digite o código de 6 dígitos"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enviamos um código para seu {platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
                </p>
              </div>
              
              <Button
                variant="link"
                className="w-full text-sm"
                onClick={() => console.log('Reenviar código')}
              >
                Não recebeu? Reenviar código
              </Button>
            </div>
          )}
          
          {/* Passo 4: Sucesso e próximos passos */}
          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="h-20 w-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <i className="ri-check-line text-4xl"></i>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Sua conta está pronta!</h3>
                <p className="text-sm text-muted-foreground">
                  O TarefoAI vai te ajudar a organizar suas tarefas, compromissos e lembretes.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vamos agora conectar seu calendário para trazer seus eventos existentes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {step === 'info' && (
            <Button 
              onClick={sendVerificationCode}
              className="w-full"
              disabled={!name || !phone}
            >
              Continuar
            </Button>
          )}
          
          {step === 'verify' && (
            <Button 
              onClick={verifyCode}
              className="w-full"
              disabled={verificationCode.length !== 6 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          )}
          
          {step === 'success' && (
            <Button 
              onClick={completeOnboarding}
              className="w-full"
            >
              Conectar meu calendário
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}