import { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoicePanel } from './VoicePanel';

interface VoiceButtonProps {
  userId: number;
}

export function VoiceButton({ userId }: VoiceButtonProps) {
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false);
  
  const toggleVoicePanel = () => {
    setIsVoicePanelOpen(!isVoicePanelOpen);
  };
  
  return (
    <>
      {/* Botão flutuante para ativar painel de voz */}
      {!isVoicePanelOpen && (
        <div className="fixed bottom-20 right-5 z-40">
          <Button
            onClick={toggleVoicePanel}
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Painel de voz */}
      {isVoicePanelOpen && (
        <VoicePanel 
          userId={userId} 
          onToggleCollapse={toggleVoicePanel} 
        />
      )}
    </>
  );
}