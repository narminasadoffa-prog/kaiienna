'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Произошла ошибка при обновлении профиля',
          variant: 'destructive',
        });
        return;
      }

      // Update session
      await update();

      toast({
        title: 'Успешно',
        description: 'Профиль успешно обновлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при обновлении профиля',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Информация о профиле */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Личные данные</CardTitle>
                <CardDescription>
                  Обновите информацию профиля
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя и Фамилия</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">Email нельзя изменить</p>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Обновление...' : 'Обновить'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Информация об аккаунте */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Информация об аккаунте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Роль</Label>
                  <p className="font-semibold capitalize">
                    {session?.user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-semibold">{email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}
