'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 as Loader2Icon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  active: boolean;
}

const PAGE_SLUGS = [
  { value: 'privacy', label: 'Политика конфиденциальности' },
  { value: 'terms', label: 'Пользовательское соглашение' },
  { value: 'contacts', label: 'Контакты' },
];

export default function AdminPagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    active: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить страницы',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при загрузке',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.title || !formData.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingPage
        ? `/api/pages/${editingPage.id}`
        : '/api/pages';
      const method = editingPage ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingPage
            ? 'Страница обновлена'
            : 'Страница создана',
        });
        fetchPages();
        handleDialogClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Ошибка при сохранении');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при сохранении',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      active: page.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (page: StaticPage) => {
    if (!confirm(`Вы уверены, что хотите удалить страницу "${page.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Страница удалена',
        });
        fetchPages();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при удалении');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      active: true,
    });
    setEditingPage(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Статические страницы</h1>
            <p className="text-gray-600 mt-1">Управление страницами: Политика конфиденциальности, Контакты, Пользовательское соглашение</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить страницу
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2Icon className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              const pageLabel = PAGE_SLUGS.find(p => p.value === page.slug)?.label || page.slug;
              return (
                <div
                  key={page.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-8 h-8 text-primary-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{pageLabel}</h3>
                        <p className="text-sm text-gray-500">/{page.slug}</p>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">{page.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{page.content}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        page.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {page.active ? 'Активна' : 'Неактивна'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(page)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Редактировать страницу' : 'Добавить страницу'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию о странице
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Тип страницы *</Label>
                  <Select
                    value={formData.slug}
                    onValueChange={(value) => setFormData({ ...formData, slug: value })}
                    disabled={!!editingPage}
                  >
                    <SelectTrigger id="slug">
                      <SelectValue placeholder="Выберите тип страницы" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SLUGS.map((pageSlug) => (
                        <SelectItem key={pageSlug.value} value={pageSlug.value}>
                          {pageSlug.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Заголовок страницы"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Содержание *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Содержание страницы"
                    rows={15}
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500">
                    Поддерживается HTML разметка
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Активна
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Отмена
                </Button>
                <Button type="submit">
                  {editingPage ? 'Сохранить изменения' : 'Создать страницу'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}

