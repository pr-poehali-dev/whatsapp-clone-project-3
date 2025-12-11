const API_URLS = {
  auth: 'https://functions.poehali.dev/51decfd2-74c1-4b4c-a8cc-cb1715837910',
  chats: 'https://functions.poehali.dev/b02f8f87-c75c-4c05-b760-58f531ed5374',
  messages: 'https://functions.poehali.dev/d50884e9-8899-42a0-bacc-71878495c769',
};

export interface User {
  id: number;
  phone: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isTyping: boolean;
}

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

export const api = {
  async authenticatePhone(phone: string, name: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'phone', phone, name }),
    });
    return response.json();
  },

  async authenticateGoogle(googleId: string, email: string, name: string, avatar: string, phone?: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'google', google_id: googleId, email, name, avatar, phone }),
    });
    return response.json();
  },

  async authenticateTelegram(telegramId: string, username: string, firstName: string, photoUrl?: string, phone?: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'telegram', telegram_id: telegramId, username, first_name: firstName, photo_url: photoUrl, phone }),
    });
    return response.json();
  },

  async getChats(userId: string): Promise<{ chats: Chat[] }> {
    const response = await fetch(API_URLS.chats, {
      method: 'GET',
      headers: { 'X-User-Id': userId },
    });
    return response.json();
  },

  async createChat(userId: string, contactPhone: string): Promise<{ chatId: string; contact: any }> {
    const response = await fetch(API_URLS.chats, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ action: 'create', phone: contactPhone }),
    });
    return response.json();
  },

  async blockUser(userId: string, chatId: string): Promise<{ success: boolean }> {
    const response = await fetch(API_URLS.chats, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ action: 'block', chatId }),
    });
    return response.json();
  },

  async getMessages(userId: string, chatId: string): Promise<{ messages: Message[] }> {
    const response = await fetch(`${API_URLS.messages}?chatId=${chatId}`, {
      method: 'GET',
      headers: { 'X-User-Id': userId },
    });
    return response.json();
  },

  async sendMessage(userId: string, chatId: string, text: string, attachmentType?: string, attachmentUrl?: string, attachmentName?: string): Promise<{ message: Message }> {
    const response = await fetch(API_URLS.messages, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        chatId,
        text,
        attachmentType,
        attachmentUrl,
        attachmentName,
      }),
    });
    return response.json();
  },
};
