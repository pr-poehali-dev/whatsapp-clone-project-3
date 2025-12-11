import { useState } from 'react';
import ChatList, { type Chat } from '@/components/ChatList';
import ChatWindow, { type Message } from '@/components/ChatWindow';
import ProfilePanel from '@/components/ProfilePanel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    avatar: '',
    lastMessage: 'Привет! Как дела?',
    timestamp: '12:34',
    unread: 2,
    isOnline: true,
    isTyping: false,
  },
  {
    id: '2',
    name: 'Иван Сидоров',
    avatar: '',
    lastMessage: 'Отправил тебе файлы',
    timestamp: 'вчера',
    unread: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Мария Иванова',
    avatar: '',
    lastMessage: 'Созвонимся сегодня?',
    timestamp: '10:22',
    unread: 1,
    isOnline: true,
    isTyping: true,
  },
  {
    id: '4',
    name: 'Дмитрий Козлов',
    avatar: '',
    lastMessage: 'Спасибо за помощь!',
    timestamp: '08:15',
    unread: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Елена Волкова',
    avatar: '',
    lastMessage: 'Отлично, договорились!',
    timestamp: 'ПН',
    unread: 0,
    isOnline: true,
  },
];

const mockMessages: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'Привет! Как твои дела?',
      timestamp: '12:30',
      isSent: false,
    },
    {
      id: '2',
      text: 'Привет! Все отлично, работаю над новым проектом',
      timestamp: '12:32',
      isSent: true,
      status: 'read',
    },
    {
      id: '3',
      text: 'Звучит интересно! Расскажешь подробнее?',
      timestamp: '12:33',
      isSent: false,
    },
    {
      id: '4',
      text: 'Конечно! Это мессенджер с современным интерфейсом',
      timestamp: '12:34',
      isSent: true,
      status: 'read',
    },
  ],
  '2': [
    {
      id: '1',
      text: 'Смотри какие файлы нашел',
      timestamp: 'вчера',
      isSent: false,
    },
    {
      id: '2',
      text: 'Документация проекта',
      timestamp: 'вчера',
      isSent: false,
      attachment: {
        type: 'file',
        url: '',
        name: 'documentation.pdf',
      },
    },
  ],
  '3': [
    {
      id: '1',
      text: 'У меня есть важная тема для обсуждения',
      timestamp: '10:20',
      isSent: false,
    },
    {
      id: '2',
      text: 'Давай созвонимся сегодня вечером?',
      timestamp: '10:22',
      isSent: false,
    },
  ],
};

const defaultProfile = {
  name: 'Вы',
  phone: '+7 (999) 123-45-67',
  bio: 'Всегда на связи! 🚀',
  avatar: '',
  showOnlineStatus: true,
  showLastSeen: true,
};

export default function Index() {
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const [showProfile, setShowProfile] = useState(false);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [messages, setMessages] = useState(mockMessages);
  const [profile, setProfile] = useState(defaultProfile);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const currentMessages = messages[selectedChatId] || [];

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isSent: true,
      status: 'sent',
    };

    setMessages({
      ...messages,
      [selectedChatId]: [...currentMessages, newMessage],
    });

    setChats(
      chats.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, lastMessage: text, timestamp: 'сейчас', isTyping: false }
          : chat
      )
    );
  };

  const handleBlockUser = () => {
    alert(`Пользователь ${selectedChat?.name} заблокирован`);
  };

  const handleUpdateProfile = (updatedProfile: typeof profile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-[380px] flex-shrink-0">
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
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
