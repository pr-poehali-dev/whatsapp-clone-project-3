import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
  name: string;
  phone: string;
  bio: string;
  avatar?: string;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
}

interface ProfilePanelProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function ProfilePanel({ profile, onUpdateProfile, onClose }: ProfilePanelProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold">Профиль</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
          <Icon name="X" size={20} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-32 w-32">
                <AvatarImage src={editedProfile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
                  {editedProfile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="Camera" size={32} className="text-white" />
                </button>
              )}
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-full"
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать профиль
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="rounded-full bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Check" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button
                  onClick={() => {
                    setEditedProfile(profile);
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Имя
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              ) : (
                <p className="text-base p-3 bg-accent/30 rounded-xl">{profile.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Номер телефона
              </Label>
              <p className="text-base p-3 bg-accent/30 rounded-xl flex items-center gap-2">
                <Icon name="Phone" size={16} className="text-muted-foreground" />
                {profile.phone}
              </p>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium mb-2 block">
                О себе
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, bio: e.target.value })
                  }
                  placeholder="Расскажите о себе..."
                  className="rounded-xl min-h-[100px]"
                />
              ) : (
                <p className="text-base p-3 bg-accent/30 rounded-xl">
                  {profile.bio || 'Не указано'}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Приватность</h3>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Eye" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Статус "в сети"</p>
                  <p className="text-xs text-muted-foreground">
                    Показывать другим когда я онлайн
                  </p>
                </div>
              </div>
              <Switch
                checked={editedProfile.showOnlineStatus}
                onCheckedChange={(checked) =>
                  setEditedProfile({ ...editedProfile, showOnlineStatus: checked })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Время последнего визита</p>
                  <p className="text-xs text-muted-foreground">
                    Показывать когда был(а) в последний раз
                  </p>
                </div>
              </div>
              <Switch
                checked={editedProfile.showLastSeen}
                onCheckedChange={(checked) =>
                  setEditedProfile({ ...editedProfile, showLastSeen: checked })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Аккаунт</h3>
            
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon name="Settings" size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Настройки</p>
                  <p className="text-xs text-muted-foreground">Язык, уведомления, темы</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start rounded-xl h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Безопасность</p>
                  <p className="text-xs text-muted-foreground">Двухфакторная аутентификация</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start rounded-xl h-auto p-4 text-destructive border-destructive/30 hover:bg-destructive/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Icon name="LogOut" size={20} className="text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Выйти</p>
                  <p className="text-xs text-muted-foreground">Выйти из аккаунта</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
