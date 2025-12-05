'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'Admin',
    published: false,
    featured: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for auth to complete
    }

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/blog');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      // Only fetch posts if user is admin
      fetchPosts();
    }
  }, [session, status, router]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch posts`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.posts)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }
      
      // Remove duplicates by slug (keep first occurrence)
      const seenSlugs = new Set<string>();
      const uniquePosts = (data.posts || []).filter((post: BlogPost) => {
        if (seenSlugs.has(post.slug)) {
          return false; // Skip duplicate
        }
        seenSlugs.add(post.slug);
        return true;
      });
      
      setPosts(uniquePosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error.message || 'Не удалось загрузить статьи. Проверьте консоль для деталей.',
        variant: 'destructive',
      });
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const trimmedTitle = formData.title?.trim() || '';
    if (!trimmedTitle) {
      toast({
        title: 'Ошибка',
        description: 'Заголовок обязателен',
        variant: 'destructive',
      });
      return;
    }

    const trimmedContent = formData.content?.trim() || '';
    if (!trimmedContent) {
      toast({
        title: 'Ошибка',
        description: 'Содержание обязательно',
        variant: 'destructive',
      });
      return;
    }

    // Generate slug from title automatically
    const autoSlug = generateSlug(trimmedTitle);
    
    // Fallback: if slug is still empty, use timestamp
    const finalSlug = autoSlug || `post-${Date.now()}`;

    setIsSubmitting(true);
    try {
      const url = editingPost ? `/api/blog/${editingPost.id}` : '/api/blog';
      const method = editingPost ? 'PATCH' : 'POST';

      // Ensure image URL is properly set - check both imagePreview and formData.image
      const currentImageUrl = imagePreview || formData.image;
      const imageUrl = currentImageUrl?.trim() || null;
      
      const requestBody = {
        title: trimmedTitle,
        slug: editingPost ? (formData.slug?.trim() || finalSlug) : finalSlug, // Keep existing slug when editing, generate new when creating
        excerpt: formData.excerpt?.trim() || null,
        content: trimmedContent,
        image: imageUrl,
        author: formData.author?.trim() || 'Admin',
        published: formData.published || false,
        featured: formData.featured || false,
      };

      console.log('Sending request:', { 
        url, 
        method, 
        body: {
          ...requestBody,
          content: requestBody.content?.substring(0, 50) + '...',
          image: imageUrl
        }
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(`Server returned invalid response (${response.status})`);
      }

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData?.error || `Failed to ${editingPost ? 'update' : 'create'} post (${response.status})`);
      }

      toast({
        title: 'Успешно',
        description: editingPost ? 'Статья обновлена' : 'Статья создана',
      });

      setIsDialogOpen(false);
      setEditingPost(null);
      setImagePreview(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: '',
        author: 'Admin',
        published: false,
        featured: false,
      });
      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error.message || 'Не удалось сохранить статью';
      console.error('Full error details:', {
        message: errorMessage,
        stack: error.stack,
        imageUrl: imagePreview || formData.image
      });
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      author: post.author || 'Admin',
      published: post.published || false,
      featured: post.featured || false,
    });
    setImagePreview(post.image || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту статью?')) return;

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      toast({
        title: 'Успешно',
        description: 'Статья удалена',
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить статью',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });

      if (!response.ok) throw new Error('Failed to update post');

      toast({
        title: 'Успешно',
        description: post.published ? 'Статья скрыта' : 'Статья опубликована',
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = (title: string) => {
    if (!title || typeof title !== 'string') {
      return '';
    }
    
    // Convert Cyrillic and other characters to Latin
    const transliteration: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };
    
    let slug = title
      .split('')
      .map(char => transliteration[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // If slug is empty, generate from timestamp
    if (!slug) {
      slug = `post-${Date.now()}`;
    }
    
    return slug;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Файл должен быть изображением',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.url;
      
      // Update both formData and imagePreview using functional update
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setImagePreview(imageUrl);

      console.log('Image uploaded successfully:', imageUrl);

      toast({
        title: 'Успешно',
        description: 'Изображение загружено',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Блог о моде</h1>
          <p className="text-gray-600">Управление статьями блога</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" onClick={() => {
              setEditingPost(null);
              setImagePreview(null);
              setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                image: '',
                author: 'Admin',
                published: false,
                featured: false,
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Новая статья
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Редактировать статью' : 'Новая статья'}</DialogTitle>
              <DialogDescription>
                Заполните форму для создания новой статьи о моде
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                  }}
                  required
                  placeholder="Например: Тренды моды 2025-2026"
                />
              </div>


              <div>
                <Label htmlFor="excerpt">Краткое описание</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  placeholder="Краткое описание статьи для превью"
                />
              </div>

              <div>
                <Label htmlFor="content">Содержание *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  required
                  placeholder="Полный текст статьи..."
                />
              </div>

              <div>
                <Label htmlFor="image">Изображение</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />
                    {formData.image && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {uploadingImage && (
                    <p className="text-sm text-gray-500">Загрузка изображения...</p>
                  )}
                  {(imagePreview || formData.image) && (
                    <div className="relative w-full h-96 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || formData.image}
                        alt="Preview"
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </div>
                  )}
                  {formData.image && (
                    <p className="text-xs text-gray-500">Текущее изображение: {formData.image}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="author">Автор</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Admin"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Опубликовано</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Рекомендуемое</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting || uploadingImage}>
                  {isSubmitting ? 'Сохранение...' : (editingPost ? 'Сохранить изменения' : 'Создать статью')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все статьи ({posts.length})</CardTitle>
          <CardDescription>Управление статьями блога о моде</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Статьи не найдены</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title || 'Без названия'}</h3>
                        {post.published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Опубликовано</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Черновик</span>
                        )}
                        {post.featured && (
                          <span className="px-2 py-1 bg-[#DAA520] text-white text-xs rounded">Рекомендуемое</span>
                        )}
                      </div>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{String(post.excerpt || '').substring(0, 200)}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span>Автор: {post.author || 'Admin'}</span>
                        <span>Просмотры: {post.views || 0}</span>
                        <span>Создано: {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ru-RU') : 'Не указано'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(post)}
                        title={post.published ? 'Скрыть' : 'Опубликовать'}
                      >
                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
