'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, X, Edit, Trash2, Loader2 as Loader2Icon } from 'lucide-react';
import Image from 'next/image';
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

interface Banner {
  id: string;
  position: string;
  image?: string;
  videoUrl?: string;
  link?: string;
  title?: string;
  description?: string;
  active: boolean;
  order: number;
}

const BANNER_POSITIONS = [
  { value: 'main', label: 'Главный баннер (слева, большой)' },
];

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    position: '',
    videoUrl: '',
    link: '',
    title: '',
    description: '',
    active: true,
    order: 0,
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners?active=false');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось загрузить баннеры',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при загрузке баннеров',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите видео файл',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, videoUrl: data.url });
        toast({
          title: 'Успешно',
          description: 'Видео загружено',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при загрузке');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при загрузке видео',
        variant: 'destructive',
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.position.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Выберите позицию',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.videoUrl || !formData.videoUrl.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте видео URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingBanner
        ? `/api/banners/${editingBanner.id}`
        : '/api/banners';
      const method = editingBanner ? 'PATCH' : 'POST';

      // Prepare data - remove empty strings and convert to null
      const submitData = {
        position: formData.position.trim(),
        videoUrl: formData.videoUrl.trim(),
        link: formData.link?.trim() || null,
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        active: formData.active,
        order: formData.order || 0,
      };

      console.log('[Banner Form] Submitting data:', submitData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingBanner
            ? 'Баннер обновлен'
            : 'Баннер создан',
        });
        fetchBanners();
        handleDialogClose();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        console.error('[Banner Form] API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        const errorMessage = errorData.error || errorData.details || `Ошибка при сохранении (${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('[Banner Form] Error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при сохранении',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      position: banner.position,
      videoUrl: banner.videoUrl || '',
      link: banner.link || '',
      title: banner.title || '',
      description: banner.description || '',
      active: banner.active,
      order: banner.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Вы уверены, что хотите удалить баннер "${BANNER_POSITIONS.find(p => p.value === banner.position)?.label}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Баннер удален',
        });
        fetchBanners();
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
      position: '',
      videoUrl: '',
      link: '',
      title: '',
      description: '',
      active: true,
      order: 0,
    });
    setEditingBanner(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Баннеры главной страницы</h1>
            <p className="text-gray-600 mt-1">Управление баннерами на главной странице</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить баннер
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2Icon className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => {
              const positionLabel = BANNER_POSITIONS.find(p => p.value === banner.position)?.label || banner.position;
              return (
                <div
                  key={banner.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="relative h-48 bg-gray-100">
                    {banner.image ? (
                      <Image
                        src={banner.image}
                        alt={banner.title || positionLabel}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Нет изображения
                      </div>
                    )}
                    {!banner.active && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Неактивен
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{positionLabel}</h3>
                    {banner.title && (
                      <p className="text-sm text-gray-600 mb-1 line-clamp-1">{banner.title}</p>
                    )}
                    {banner.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{banner.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Редактировать баннер' : 'Добавить баннер'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию о баннере
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Позиция *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Выберите позицию" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Видео URL или загрузка видео</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube URL (например: https://www.youtube.com/watch?v=5K0HaRoYzdk) или ID (5K0HaRoYzdk)"
                  />
                  <p className="text-sm text-gray-500">
                    Или загрузите видео файл ниже
                  </p>
                  {formData.videoUrl && (formData.videoUrl.startsWith('/') || formData.videoUrl.startsWith('http://') || formData.videoUrl.startsWith('https://')) && !formData.videoUrl.includes('youtube.com') && !formData.videoUrl.includes('youtu.be') && (
                    <div className="relative mt-2">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <video
                          src={formData.videoUrl}
                          controls
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {formData.videoUrl && (formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be')) && (
                    <div className="relative mt-2">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <p className="text-sm text-gray-600">YouTube видео: {formData.videoUrl}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {!formData.videoUrl && (
                    <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadingVideo ? 'Загрузка видео...' : 'Загрузить видео файл'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={uploadingVideo}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Заголовок баннера"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание баннера"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Ссылка</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="Категория Женщина"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Порядок сортировки</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
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
                    Активен
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Отмена
                </Button>
                <Button type="submit" disabled={uploadingVideo}>
                  {editingBanner ? 'Сохранить изменения' : 'Создать баннер'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}

