import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface AddContactDialogProps {
  userId: string;
  onContactAdded: () => void;
}

export default function AddContactDialog({ userId, onContactAdded }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddContact = async () => {
    if (!phone) {
      setError('Введите номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.createChat(userId, phone);
      if (response.chatId) {
        setOpen(false);
        setPhone('');
        onContactAdded();
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Пользователь с таким номером не найден');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Icon name="Plus" size={24} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить контакт</DialogTitle>
          <DialogDescription>
            Введите номер телефона пользователя для начала общения
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Номер телефона</Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Отмена
          </Button>
          <Button
            onClick={handleAddContact}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? 'Добавление...' : 'Добавить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
