import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { api, type User } from '@/lib/api';

interface AuthScreenProps {
  onAuth: (user: User, token: string) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneAuth = async () => {
    if (!phone || !name) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.authenticatePhone(phone, name);
      if (response.user && response.token) {
        onAuth(response.user, response.token);
      } else {
        setError('Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 animate-scale-in">
          <div className="text-center space-y-2">
            <div className="h-20 w-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageSquare" size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Добро пожаловать
            </h1>
            <p className="text-muted-foreground">Войдите или создайте аккаунт</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ваше имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <Button
              onClick={handlePhoneAuth}
              disabled={loading}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg font-semibold"
            >
              {loading ? 'Вход...' : 'Продолжить'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">или войти через</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-12 hover:bg-accent"
              disabled
            >
              <Icon name="Mail" size={20} className="mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-12 hover:bg-accent"
              disabled
            >
              <Icon name="Send" size={20} className="mr-2" />
              Telegram
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Входя в систему, вы соглашаетесь с условиями использования и политикой конфиденциальности
          </p>
        </div>
      </div>
    </div>
  );
}
