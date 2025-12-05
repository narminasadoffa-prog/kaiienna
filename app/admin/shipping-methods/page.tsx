'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ShippingMethod {
  id: string;
  name: string;
  nameRu: string;
  description: string | null;
  descriptionRu: string | null;
  cost: string;
  estimatedDays: number | null;
  active: boolean;
}

export default function AdminShippingMethodsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameRu: '',
    description: '',
    descriptionRu: '',
    cost: '',
    estimatedDays: '',
    active: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/shipping-methods');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchMethods();
    }
  }, [status, session, router]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping-methods');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }

      const data = await response.json();
      setMethods(data);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить методы доставки',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        nameRu: method.nameRu,
        description: method.description || '',
        descriptionRu: method.descriptionRu || '',
        cost: method.cost,
        estimatedDays: method.estimatedDays?.toString() || '',
        active: method.active,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        nameRu: '',
        description: '',
        descriptionRu: '',
        cost: '',
        estimatedDays: '',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMethod(null);
    setFormData({
      name: '',
      nameRu: '',
      description: '',
      descriptionRu: '',
      cost: '',
      estimatedDays: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingMethod
        ? `/api/shipping-methods/${editingMethod.id}`
        : '/api/shipping-methods';
      const method = editingMethod ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nameRu: formData.nameRu,
          description: formData.description || null,
          descriptionRu: formData.descriptionRu || null,
          cost: parseFloat(formData.cost),
          estimatedDays: formData.estimatedDays ? parseInt(formData.estimatedDays) : null,
          active: formData.active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save shipping method');
      }

      toast({
        title: 'Успешно',
        description: editingMethod
          ? 'Метод доставки обновлен'
          : 'Метод доставки создан',
      });

      handleCloseDialog();
      fetchMethods();
    } catch (error) {
      console.error('Error saving shipping method:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить метод доставки',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот метод доставки?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping-methods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shipping method');
      }

      toast({
        title: 'Успешно',
        description: 'Метод доставки удален',
      });

      fetchMethods();
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить метод доставки',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DAA520] mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Методы доставки</h1>
          <p className="text-gray-600">Управление способами доставки товаров</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить метод
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список методов доставки</CardTitle>
          <CardDescription>
            Всего: {methods.length} методов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Методы доставки не найдены</p>
              <Button onClick={() => handleOpenDialog()}>
                Добавить первый метод
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {method.nameRu}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          method.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {method.active ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    {method.descriptionRu && (
                      <p className="text-sm text-gray-600 mb-2">
                        {method.descriptionRu}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Стоимость:{' '}
                        {parseFloat(method.cost).toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </span>
                      {method.estimatedDays && (
                        <span>Срок: {method.estimatedDays} дней</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(method)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Редактировать метод доставки' : 'Добавить метод доставки'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о методе доставки
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название (EN) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Standard Shipping"
                  />
                </div>
                <div>
                  <Label htmlFor="nameRu">Название (RU) *</Label>
                  <Input
                    id="nameRu"
                    value={formData.nameRu}
                    onChange={(e) =>
                      setFormData({ ...formData, nameRu: e.target.value })
                    }
                    required
                    placeholder="Стандартная доставка"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Описание (EN)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description in English"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionRu">Описание (RU)</Label>
                  <Textarea
                    id="descriptionRu"
                    value={formData.descriptionRu}
                    onChange={(e) =>
                      setFormData({ ...formData, descriptionRu: e.target.value })
                    }
                    placeholder="Описание на русском"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Стоимость (₽) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    required
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedDays">Срок доставки (дней)</Label>
                  <Input
                    id="estimatedDays"
                    type="number"
                    min="1"
                    value={formData.estimatedDays}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDays: e.target.value })
                    }
                    placeholder="3-5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 text-[#DAA520] rounded focus:ring-[#DAA520]"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Активен (доступен для выбора)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">
                {editingMethod ? 'Сохранить изменения' : 'Создать метод'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
