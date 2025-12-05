'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Plus, Folder, ChevronRight, Package, Edit, Trash2, MoreVertical, X, Upload, Loader2 as Loader2Icon, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import AddCategoryForm from '@/components/AddCategoryForm';
import CategoryProductsModal from '@/components/CategoryProductsModal';
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  heroImages?: string[];
  parentId?: string;
  parent?: Category;
  children?: Category[];
  sizeType?: string;
  _count?: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<{ id: string; name: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    description?: string;
  } | null>(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        // По умолчанию все категории закрыты
        setExpandedCategories(new Set());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Категория удалена',
        });
        fetchCategories();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить категорию',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  // Основные категории (parentId null)
  const mainCategories = categories.filter((cat) => !cat.parentId);
  // Подкатегории (parentId есть)
  const subCategories = categories.filter((cat) => cat.parentId);

  const getSubCategories = (parentId: string) => {
    return subCategories.filter((cat) => cat.parentId === parentId);
  };

  const CategoryItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const subCats = getSubCategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = subCats.length > 0;
    const productsCount = category._count?.products || 0;

    return (
      <div className="select-none">
        <div
          className={`
            flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors group
            ${level > 0 ? 'ml-6' : ''}
          `}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Icon */}
          {hasChildren ? (
            <Folder className="w-4 h-4 text-primary-600 flex-shrink-0" />
          ) : (
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">{category.name}</span>
              {category.sizeType && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {category.sizeType === 'shoe' ? 'Обувь' :
                   category.sizeType === 'clothing' ? 'Одежда' :
                   category.sizeType === 'numeric' ? 'Цифры' :
                   category.sizeType === 'letter' ? 'Буквы' : category.sizeType}
                </span>
              )}
              <span className="text-xs text-gray-500">
                ({productsCount} товаров)
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {category.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                  });
                  setIsProductsModalOpen(true);
                }}
                className="h-8 w-8 p-0"
              >
                <Package className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedParent({ id: category.id, name: category.name });
                  setIsAddDialogOpen(true);
                }}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-2">
            {subCats.map((subCat) => (
              <div key={subCat.id} className="select-none">
                <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="w-6" />
                  <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{subCat.name}</span>
                      {subCat.sizeType && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {subCat.sizeType === 'shoe' ? 'Обувь' :
                           subCat.sizeType === 'clothing' ? 'Одежда' :
                           subCat.sizeType === 'numeric' ? 'Цифры' :
                           subCat.sizeType === 'letter' ? 'Буквы' : subCat.sizeType}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        ({(subCat._count?.products || 0)} товаров)
                      </span>
                    </div>
                    {subCat.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {subCat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory({
                          id: subCat.id,
                          name: subCat.name,
                          slug: subCat.slug,
                          description: subCat.description,
                        });
                        setIsProductsModalOpen(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(subCat)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subCat)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
              <p className="text-sm text-gray-600">Управление категориями</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/categories/translate', {
                      method: 'POST',
                    })
                    const data = await response.json()
                    if (response.ok) {
                      toast({
                        title: 'Успешно',
                        description: `Переведено ${data.translatedCategories} категорий и ${data.translatedProducts} товаров`,
                      })
                      fetchCategories()
                    } else {
                      toast({
                        title: 'Ошибка',
                        description: data.error || 'Не удалось перевести категории и товары',
                        variant: 'destructive',
                      })
                    }
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось перевести категории и товары',
                      variant: 'destructive',
                    })
                  }
                }}
                variant="outline"
              >
                Перевести подкатегории и товары на русский
              </Button>
              <Button
                onClick={async () => {
                  if (!confirm('Вы уверены, что хотите перевести описания подкатегорий на русский язык?')) {
                    return;
                  }
                  try {
                    const response = await fetch('/api/categories/translate-descriptions', {
                      method: 'POST',
                    })
                    const data = await response.json()
                    if (response.ok) {
                      toast({
                        title: 'Успешно',
                        description: `Переведено ${data.translated} из ${data.total} описаний. Пропущено: ${data.skipped}`,
                      })
                      fetchCategories()
                    } else {
                      toast({
                        title: 'Ошибка',
                        description: data.error || 'Не удалось перевести описания',
                        variant: 'destructive',
                      })
                    }
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось перевести описания',
                      variant: 'destructive',
                    })
                  }
                }}
                variant="outline"
              >
                Перевести описания на русский
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedParent(null);
                  setIsAddingSubcategory(false);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Основная Категория
              </Button>
              <Button
                onClick={() => {
                  // При добавлении подкатегории parentCategory должен быть null, чтобы пользователь мог выбрать
                  setSelectedParent(null);
                  setIsAddingSubcategory(true);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Подкатегория
              </Button>
            </div>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : mainCategories.length > 0 ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                {mainCategories.map((mainCat) => (
                  <CategoryItem key={mainCat.id} category={mainCat} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Категорий пока нет</p>
              <p className="text-sm text-gray-500 mb-4">
                Нажмите кнопку "Основная категория" для создания первой категории
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать первую категорию
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <AddCategoryForm
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setSelectedParent(null);
          }
        }}
        parentCategory={selectedParent}
        isSubcategory={selectedParent === null && mainCategories.length > 0}
        onSuccess={() => {
          fetchCategories();
        }}
        onEditCategory={(category) => {
          setEditingCategory(category);
          setIsEditDialogOpen(true);
        }}
      />

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={editingCategory}
        categories={categories}
        onSuccess={() => {
          fetchCategories();
          setIsEditDialogOpen(false);
          setEditingCategory(null);
        }}
      />

      {/* Products Modal */}
      <CategoryProductsModal
        open={isProductsModalOpen}
        onOpenChange={setIsProductsModalOpen}
        category={selectedCategory}
      />
    </AdminGuard>
  );
}

// Edit Category Dialog Component
function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  categories: Category[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    videoUrl: '',
    parentId: '',
    sizeType: '',
  });

  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        videoUrl: (category as any).videoUrl || '',
        parentId: category.parentId || '',
        sizeType: category.sizeType || '',
      });
    } else if (!open) {
      // Formu təmizlə
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        videoUrl: '',
        parentId: '',
        sizeType: '',
      });
    }
  }, [category, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image: formData.image || null,
          videoUrl: formData.videoUrl || null,
          parentId: formData.parentId || null,
          sizeType: formData.sizeType || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Категория обновлена',
        });
        onSuccess();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось обновить категорию',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mainCategories = categories.filter((cat) => !cat.parentId && cat.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать Категорию</DialogTitle>
          <DialogDescription>
            Измените информацию о категории
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Название Категории *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={handleNameChange}
              required
              placeholder="Название категории"
            />
          </div>

          {/* Slug скрыт, создается автоматически */}
          {formData.slug && (
            <input type="hidden" value={formData.slug} />
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Описание категории"
            />
          </div>

          {/* Video URL для Hero Banner */}
          {!category?.parentId && (
            <div className="space-y-2">
              <Label htmlFor="edit-videoUrl">Видео URL для Hero Banner</Label>
              <Input
                id="edit-videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/VIDEO_ID или URL видео"
              />
              <p className="text-xs text-gray-500">
                Вставьте URL видео (YouTube embed URL или прямой URL видео файла)
              </p>
            </div>
          )}

          {category?.parentId && (
            <div className="space-y-2">
              <Label htmlFor="edit-parentId">Основная категория</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger id="edit-parentId">
                  <SelectValue placeholder="Выберите основную категорию" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {category?.parentId && (
            <div className="space-y-2">
              <Label htmlFor="edit-sizeType">Тип размера</Label>
              <Select
                value={formData.sizeType}
                onValueChange={(value) => setFormData({ ...formData, sizeType: value })}
              >
                <SelectTrigger id="edit-sizeType">
                  <SelectValue placeholder="Выберите тип размера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shoe">Обувь (Цифрами: 35-48)</SelectItem>
                  <SelectItem value="clothing">Одежда (Буквами: XS, S, M, L, XL)</SelectItem>
                  <SelectItem value="numeric">Цифрами (28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54)</SelectItem>
                  <SelectItem value="letter">Буквами (XS, S, M, L, XL, XXL, XXXL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Обновление...' : 'Обновить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
