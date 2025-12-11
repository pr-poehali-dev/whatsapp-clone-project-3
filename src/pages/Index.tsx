import { useState, useEffect } from 'react';
import ChatList, { type Chat } from '@/components/ChatList';
import ChatWindow, { type Message } from '@/components/ChatWindow';
import ProfilePanel from '@/components/ProfilePanel';
import AuthScreen from '@/components/AuthScreen';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api, type User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      loadChats();
      const interval = setInterval(loadChats, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (selectedChatId && token) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId, token]);

  const handleAuth = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', userToken);
  };

  const loadChats = async () => {
    if (!token) return;
    try {
      const response = await api.getChats(token);
      setChats(response.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!token) return;
    try {
      const response = await api.getMessages(token, chatId);
      setMessages((prev) => ({ ...prev, [chatId]: response.messages || [] }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!token || !selectedChatId) return;

    try {
      const response = await api.sendMessage(token, selectedChatId, text);
      
      setMessages((prev) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), response.message],
      }));

      await loadChats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleBlockUser = async () => {
    if (!token || !selectedChatId) return;
    
    try {
      await api.blockUser(token, selectedChatId);
      toast({
        title: 'Пользователь заблокирован',
        description: 'Вы больше не будете получать сообщения от этого пользователя',
      });
      setSelectedChatId('');
      await loadChats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось заблокировать пользователя',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = (updatedProfile: any) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updatedProfile };
      setCurrentUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  if (!currentUser || !token) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const currentMessages = messages[selectedChatId] || [];

  const profile = {
    name: currentUser.name,
    phone: currentUser.phone,
    bio: currentUser.bio || '',
    avatar: currentUser.avatar,
    showOnlineStatus: true,
    showLastSeen: true,
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-[380px] flex-shrink-0">
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
          userId={token || undefined}
          onContactAdded={loadChats}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chatName={selectedChat.name}
            chatAvatar={selectedChat.avatar}
            isOnline={selectedChat.isOnline}
            lastSeen={selectedChat.isOnline ? undefined : 'час назад'}
            messages={currentMessages}
            isTyping={selectedChat.isTyping}
            onSendMessage={handleSendMessage}
            onBlock={handleBlockUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-32 w-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Icon name="MessageSquare" size={64} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Выберите чат</h2>
              <p className="text-muted-foreground">
                Начните общение с друзьями и коллегами
              </p>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <div className="w-[420px] flex-shrink-0 animate-slide-in-right">
          <ProfilePanel
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      <Button
        onClick={() => setShowProfile(!showProfile)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
      >
        <Icon name={showProfile ? 'X' : 'User'} size={24} />
      </Button>
    </div>
  );
}