import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isTyping?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onChatSelect }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Чаты
          </h1>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Icon name="Plus" size={24} />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-3 rounded-xl mb-1 transition-all duration-200 hover:bg-accent/50 ${
                selectedChatId === chat.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {chat.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {chat.isTyping ? (
                        <span className="text-primary font-medium flex items-center gap-1">
                          <span className="animate-pulse">печатает</span>
                          <span className="flex gap-0.5">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                          </span>
                        </span>
                      ) : (
                        chat.lastMessage
                      )}
                    </p>
                    {chat.unread > 0 && (
                      <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white border-0">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
