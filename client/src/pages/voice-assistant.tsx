import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/layout/Sidebar';
import NavBar from '@/components/layout/NavBar';
import { VoicePanel } from '@/components/voice/VoicePanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Check, Info, Mic, Phone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VoiceAssistantPage() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number>(1);
  const [voiceStatus, setVoiceStatus] = useState<{ available: boolean; reason?: string }>({ available: false });
  const { toast } = useToast();

  useEffect(() => {
    // Obter ID do usuário e status do serviço de voz
    const fetchUserAndStatus = async () => {
      try {
        // Obter usuário
        const userResponse = await apiRequest('GET', '/api/me');
        const userData = await userResponse.json();
        if (userData && userData.id) {
          setUserId(userData.id);
        }

        // Obter status do serviço de voz
        const voiceResponse = await apiRequest('GET', '/api/voice/status');
        const voiceData = await voiceResponse.json();
        setVoiceStatus(voiceData);
      } catch (error) {
        console.error('Erro ao obter dados iniciais:', error);
        setVoiceStatus({ 
          available: false, 
          reason: 'Não foi possível verificar o status do serviço' 
        });
      }
    };

    fetchUserAndStatus();
  }, []);

  // Verifica se o navegador suporta Web Speech API
  const browserSupportsVoice = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  // Verifica se o navegador suporta a API MediaRecorder
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkMediaRecorderSupport = async () => {
      try {
        // Verifica se o navegador suporta MediaRecorder
        if (!window.MediaRecorder) {
          setMediaRecorderSupported(false);
          return;
        }

        // Verifica se o navegador pode gravar áudio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        // Limpa o stream após o teste
        stream.getTracks().forEach(track => track.stop());
        
        setMediaRecorderSupported(true);
      } catch (error) {
        console.error('Erro ao verificar suporte a MediaRecorder:', error);
        setMediaRecorderSupported(false);
      }
    };

    checkMediaRecorderSupport();
  }, []);

  // Exemplo de telefone para testes
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  
  // Configurações do usuário
  const [userSettings, setUserSettings] = useState({
    voiceEnabled: true,
    autoConnect: false,
    preferredVoice: 'alloy', // Opções da OpenAI: alloy, echo, fable, onyx, nova, shimmer
    notificationsEnabled: true
  });
  
  // Atualiza configurações
  const handleSettingsChange = (key: keyof typeof userSettings, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Aqui deveria salvar as configurações no banco de dados
    toast({
      title: 'Configurações atualizadas',
      description: 'Suas preferências de assistente de voz foram salvas'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <NavBar 
          title="Assistente de Voz" 
          subtitle="Configure e controle seu assistente por voz"
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna principal - Painéis e status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status do serviço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Status do Assistente de Voz
                  </CardTitle>
                  <CardDescription>
                    Verifique a disponibilidade e compatibilidade do assistente de voz
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status do serviço */}
                    <div className="border rounded-lg p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Serviço de Voz</span>
                        {voiceStatus.available ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            Disponível
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-sm">
                            <X className="h-4 w-4 mr-1" />
                            Indisponível
                          </span>
                        )}
                      </div>
                      {!voiceStatus.available && voiceStatus.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {voiceStatus.reason}
                        </p>
                      )}
                    </div>
                    
                    {/* Compatibilidade do navegador */}
                    <div className="border rounded-lg p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Compatibilidade do Navegador</span>
                        {browserSupportsVoice && mediaRecorderSupported ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            Compatível
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-sm">
                            <X className="h-4 w-4 mr-1" />
                            Incompatível
                          </span>
                        )}
                      </div>
                      {(!browserSupportsVoice || !mediaRecorderSupported) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Seu navegador não suporta todas as funcionalidades necessárias para o assistente de voz.
                          Recomendamos usar Chrome, Edge ou Safari atualizados.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Avisos e informações */}
                  {(voiceStatus.available && browserSupportsVoice && mediaRecorderSupported) ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                      <Info className="h-5 w-5 flex-shrink-0" />
                      <p>
                        Seu assistente de voz está pronto para uso. Você pode ativá-lo em qualquer página usando o botão
                        flutuante ou através deste painel.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                      <Info className="h-5 w-5 flex-shrink-0" />
                      <p>
                        Alguns recursos podem estar indisponíveis devido a limitações técnicas.
                        Verifique se seu navegador permite acesso ao microfone e se as credenciais 
                        do serviço estão configuradas corretamente.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Interface do Assistente */}
              <Card>
                <CardHeader>
                  <CardTitle>Experimente o Assistente de Voz</CardTitle>
                  <CardDescription>
                    Teste o assistente de voz diretamente nesta página
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <VoicePanel userId={userId} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Coluna lateral - Configurações */}
            <div className="space-y-6">
              {/* Configurações do assistente */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>
                    Personalize seu assistente de voz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="general" className="flex-1">Geral</TabsTrigger>
                      <TabsTrigger value="voice" className="flex-1">Voz</TabsTrigger>
                      <TabsTrigger value="calls" className="flex-1">Chamadas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="voiceEnabled">Ativar assistente de voz</Label>
                          <p className="text-xs text-muted-foreground">
                            Habilita o assistente de voz em todas as páginas
                          </p>
                        </div>
                        <Switch 
                          id="voiceEnabled" 
                          checked={userSettings.voiceEnabled}
                          onCheckedChange={(checked) => handleSettingsChange('voiceEnabled', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autoConnect">Conectar automaticamente</Label>
                          <p className="text-xs text-muted-foreground">
                            O assistente se conectará assim que a página for carregada
                          </p>
                        </div>
                        <Switch 
                          id="autoConnect" 
                          checked={userSettings.autoConnect}
                          onCheckedChange={(checked) => handleSettingsChange('autoConnect', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Notificações</Label>
                          <p className="text-xs text-muted-foreground">
                            Receba notificações do assistente de voz
                          </p>
                        </div>
                        <Switch 
                          id="notifications" 
                          checked={userSettings.notificationsEnabled}
                          onCheckedChange={(checked) => handleSettingsChange('notificationsEnabled', checked)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="voice" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredVoice">Voz do assistente</Label>
                        <select
                          id="preferredVoice"
                          className="w-full p-2 border rounded-md"
                          value={userSettings.preferredVoice}
                          onChange={(e) => handleSettingsChange('preferredVoice', e.target.value)}
                        >
                          <option value="alloy">Alloy (Neutra)</option>
                          <option value="echo">Echo (Masculina)</option>
                          <option value="fable">Fable (Feminina)</option>
                          <option value="onyx">Onyx (Grave)</option>
                          <option value="nova">Nova (Suave)</option>
                          <option value="shimmer">Shimmer (Clara)</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Escolha a voz que o assistente usará para responder
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="calls" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="testCall">Fazer uma chamada de teste</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="testCall"
                            placeholder="(11) 98765-4321"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                          />
                          <Button variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Testar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use esta função para testar se as chamadas telefônicas estão funcionando corretamente
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-start gap-2">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>
                          As chamadas telefônicas utilizam o serviço Twilio. Você precisa ter créditos 
                          disponíveis e um número verificado para receber chamadas de teste.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Comandos de voz */}
              <Card>
                <CardHeader>
                  <CardTitle>Comandos de Voz</CardTitle>
                  <CardDescription>
                    Comandos úteis que você pode usar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="p-2 border-b">
                      <span className="font-medium">"Agendar reunião"</span> - Cria um novo evento no calendário
                    </li>
                    <li className="p-2 border-b">
                      <span className="font-medium">"Ligar para [contato]"</span> - Inicia uma chamada telefônica
                    </li>
                    <li className="p-2 border-b">
                      <span className="font-medium">"Criar lembrete"</span> - Adiciona um novo lembrete
                    </li>
                    <li className="p-2 border-b">
                      <span className="font-medium">"O que tenho para hoje?"</span> - Lista seus eventos do dia
                    </li>
                    <li className="p-2">
                      <span className="font-medium">"Resumir mensagens"</span> - Resume suas mensagens recentes
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}