import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@shared/schema";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isFromUser = message.isFromUser;
  
  return (
    <div className={`mb-4 ${isFromUser ? 'ml-auto text-right' : ''}`}>
      <div 
        className={cn(
          isFromUser
            ? "chat-bubble-user bg-primary text-white" 
            : "chat-bubble-assistant bg-white border border-neutral-200",
          "p-3 rounded-lg shadow-sm inline-block max-w-[80%] text-left break-words"
        )}
      >
        {/* Format message content with line breaks */}
        {message.content.split('\n').map((line, i) => (
          <p key={i} className="text-sm">
            {line}
            {/* Don't add <br/> after the last line */}
            {i < message.content.split('\n').length - 1 && <br />}
          </p>
        ))}
        
        {/* Handle lists if they exist */}
        {message.content.includes('- ') && !isFromUser && (
          <ul className="mt-2 text-sm pl-5 list-disc">
            {message.content
              .split('\n')
              .filter(line => line.trim().startsWith('- '))
              .map((line, i) => (
                <li key={i}>{line.replace('- ', '')}</li>
              ))
            }
          </ul>
        )}
      </div>
      <div className="text-xs text-neutral-500 mt-1">
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
}
