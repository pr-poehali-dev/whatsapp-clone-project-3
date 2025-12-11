import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  };
}

interface ChatWindowProps {
  chatName: string;
  chatAvatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  messages: Message[];
  isTyping?: boolean;
  onSendMessage: (text: string) => void;
  onBlock: () => void;
}

export default function ChatWindow({
  chatName,
  chatAvatar,
  isOnline,
  lastSeen,
  messages,
  isTyping,
  onSendMessage,
  onBlock,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chatAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                {chatName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">{chatName}</h2>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'в сети' : lastSeen ? `был(а) ${lastSeen}` : 'офлайн'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <Icon name="Phone" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <Icon name="Video" size={20} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Icon name="User" size={16} className="mr-2" />
                Профиль контакта
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="Bell" size={16} className="mr-2" />
                Уведомления
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBlock} className="text-destructive">
                <Icon name="Ban" size={16} className="mr-2" />
                Заблокировать
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-3 ${
                  message.isSent
                    ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm'
                    : 'bg-white shadow-sm rounded-bl-sm'
                }`}
              >
                {message.attachment && (
                  <div className="mb-2">
                    {message.attachment.type === 'image' ? (
                      <img
                        src={message.attachment.url}
                        alt="attachment"
                        className="rounded-lg max-w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                        <Icon name="File" size={20} />
                        <span className="text-sm">{message.attachment.name}</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm break-words">{message.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                  message.isSent ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  <span>{message.timestamp}</span>
                  {message.isSent && (
                    <Icon
                      name={message.status === 'read' ? 'CheckCheck' : 'Check'}
                      size={14}
                      className={message.status === 'read' ? 'text-blue-300' : ''}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm p-3 px-5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="Paperclip" size={20} />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Сообщение..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="rounded-full pr-20 bg-accent/50 border-0"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
                <Icon name="Smile" size={18} />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="rounded-full h-10 w-10 p-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shrink-0"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
