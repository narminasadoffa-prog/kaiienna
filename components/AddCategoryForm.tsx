'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Upload, X, Image as ImageIcon, Folder, Edit, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface AddCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  parentCategory?: { id: string; name: string } | null
  onEditCategory?: (category: any) => void
  isSubcategory?: boolean // Alt kateqoriya əlavə edilirsə true
}

export default function AddCategoryForm({
  open,
  onOpenChange,
  onSuccess,
  parentCategory,
  onEditCategory,
  isSubcategory = false,
}: AddCategoryFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [parentCategories, setParentCategories] = useState<any[]>([])
  const [mainCategories, setMainCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>('')
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    videoUrl: '',
    parentId: parentCategory?.id || '',
    sizeType: '', // 'shoe', 'clothing', 'custom'
  })

  // Parent kateqoriyaları yüklə
  useEffect(() => {
    if (open) {
      if (parentCategory) {
        setFormData((prev) => ({ ...prev, parentId: parentCategory.id }))
        fetchParentCategories()
        // Əgər parentCategory varsa, onun əsas kateqoriyasını tap
        fetchParentCategories().then(() => {
          const allCategories = parentCategories.length > 0 ? parentCategories : []
          const mainCat = allCategories.find((cat: any) => 
            !cat.parentId && allCategories.some((sub: any) => 
              sub.parentId === cat.id && sub.id === parentCategory.id
            )
          )
          if (mainCat) {
            setSelectedMainCategoryId(mainCat.id)
            const subs = allCategories.filter((cat: any) => cat.parentId === mainCat.id)
            setSubCategories(subs)
          }
        })
      } else {
        // Alt kateqoriya əlavə edilirsə (parentCategory null, amma alt kateqoriya düyməsinə basılıbsa)
        // və ya əsas kateqoriya əlavə edilirsə
        setFormData((prev) => ({ ...prev, parentId: '', sizeType: '' }))
        setSelectedMainCategoryId('')
        setSelectedSubCategoryId('')
        setSubCategories([])
        // Alt kateqoriya üçün parent kateqoriyaları yüklə
        fetchParentCategories()
      }
    }
  }, [open, parentCategory])

  // Alt kateqoriyaları yüklə
  const fetchSubCategories = async (parentId: string) => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        const subs = data.filter((cat: any) => cat.parentId === parentId)
        setSubCategories(subs)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setParentCategories(data)
        // Yalnız əsas kateqoriyaları ayır (parentId null olanlar)
        const mainCats = data.filter((cat: any) => !cat.parentId)
        setMainCategories(mainCats)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Rekursiv olaraq bütün alt kateqoriyaları tap (alt-alt kateqoriyalar daxil)
  const getAllSubCategories = (parentId: string, allCategories: any[]): any[] => {
    const directChildren = allCategories.filter((cat: any) => cat.parentId === parentId)
    const allSubs: any[] = []
    
    directChildren.forEach((child: any) => {
      allSubs.push(child)
      // Rekursiv olaraq alt kateqoriyanın alt kateqoriyalarını da əlavə et
      const nestedSubs = getAllSubCategories(child.id, allCategories)
      allSubs.push(...nestedSubs)
    })
    
    return allSubs
  }

  // Əsas kateqoriya seçildikdə, onun bütün alt kateqoriyalarını yüklə (rekursiv)
  const handleMainCategoryChange = (mainCategoryId: string) => {
    setSelectedMainCategoryId(mainCategoryId)
    setSelectedSubCategoryId('') // Alt kateqoriya seçimini təmizlə
    if (mainCategoryId) {
      // Rekursiv olaraq bütün alt kateqoriyaları tap
      const allSubs = getAllSubCategories(mainCategoryId, parentCategories)
      setSubCategories(allSubs)
      // Əgər alt kateqoriya seçilməyibsə, əsas kateqoriyanı parent kimi qeyd et
      setFormData({ ...formData, parentId: mainCategoryId })
    } else {
      setSubCategories([])
      setFormData({ ...formData, parentId: '' })
    }
  }

  // Alt kateqoriya seçildikdə
  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId)
    if (subCategoryId) {
      // Seçilmiş alt kateqoriyanı parent kimi qeyd et
      setFormData({ ...formData, parentId: subCategoryId })
    } else {
      // Alt kateqoriya seçilməyibsə, əsas kateqoriyanı parent kimi qeyd et
      setFormData({ ...formData, parentId: selectedMainCategoryId })
    }
  }

  // Slug avtomatik yaradılır
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasiya
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название категории обязательно',
        variant: 'destructive',
      })
      return
    }

    if ((parentCategory || formData.parentId) && !formData.sizeType) {
      toast({
        title: 'Ошибка',
        description: 'Для подкатегории необходимо выбрать тип размера',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description.trim() || null,
          image: formData.image || null,
          parentId: formData.parentId || null,
          sizeType: formData.sizeType || null,
        }),
      })

      if (response.ok) {
        toast({
        title: 'Успешно',
        description: 'Категория успешно создана',
        })
        // Formu təmizlə
        setFormData({
          name: '',
          slug: '',
          description: '',
          image: '',
          videoUrl: '',
          parentId: parentCategory?.id || '',
          sizeType: '',
        })
        onOpenChange(false)
        onSuccess?.()
      } else {
        const error = await response.json()
        toast({
        title: 'Ошибка',
        description: error.error || 'Не удалось создать категорию',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parentCategory
              ? `Добавить подкатегорию для ${parentCategory.name}`
              : 'Добавить новую категорию'}
          </DialogTitle>
          <DialogDescription>
            {parentCategory
              ? 'Заполните информацию о подкатегории'
              : 'Создайте основную категорию или подкатегорию'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ana Kateqoriya (yuxarıda) - yalnız parentCategory seçilibsə */}
          {parentCategory && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Основная категория</p>
                    <h3 className="text-xl font-bold text-gray-900">{parentCategory.name}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Əsas Kateqoriya seçimi - yalnız alt kateqoriya əlavə edərkən */}
          {isSubcategory && !parentCategory && (
            <div className="space-y-4">
              {/* Əsas Kateqoriya */}
              <div className="space-y-2">
                <Label htmlFor="mainCategoryId">Основная категория *</Label>
                <select
                  id="mainCategoryId"
                  value={selectedMainCategoryId}
                  onChange={(e) => handleMainCategoryChange(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Выберите основную категорию</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Для подкатегории необходимо выбрать основную категорию
                </p>
              </div>

              {/* Mövcud Alt Kateqoriyalar (əgər əsas kateqoriya seçilibsə) */}
              {selectedMainCategoryId && (
                <div className="space-y-2">
                  <Label htmlFor="subCategoryId">Существующая подкатегория (Опционально)</Label>
                  <select
                    id="subCategoryId"
                    value={selectedSubCategoryId}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Добавить в основную категорию</option>
                    {subCategories.map((subCat) => {
                      // Kateqoriyanın tam yolunu göstər
                      const getCategoryPath = (category: any, allCategories: any[]): string => {
                        if (!category.parentId || category.parentId === selectedMainCategoryId) {
                          return category.name
                        }
                        const parent = allCategories.find((cat: any) => cat.id === category.parentId)
                        if (parent) {
                          return `${getCategoryPath(parent, allCategories)} > ${category.name}`
                        }
                        return category.name
                      }
                      return (
                        <option key={subCat.id} value={subCat.id}>
                          {getCategoryPath(subCat, parentCategories)}
                        </option>
                      )
                    })}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Если вы выберете существующую подкатегорию, новая категория будет добавлена под неё. 
                    Если оставите пустым, будет добавлена в основную категорию.
                    {subCategories.length === 0 && ' (В этой основной категории пока нет подкатегорий)'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Yeni Alt Kateqoriya Formu */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Новая подкатегория</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название категории *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Например: Кроссовки, Джинсы и т.д."
                  className="text-base"
                />
              </div>

              {/* Slug скрыт, создается автоматически */}
              {formData.slug && (
                <input type="hidden" value={formData.slug} />
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Описание категории"
                />
              </div>

          {/* Video URL для Hero Banner (только для основных категорий) */}
          {!parentCategory && !formData.parentId && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Видео URL для Hero Banner</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/VIDEO_ID или URL видео"
              />
              <p className="text-xs text-gray-500">
                Вставьте URL видео (YouTube embed URL или прямой URL видео файла)
              </p>
            </div>
          )}

              {/* Тип размера (только для подкатегории) */}
              {(parentCategory || formData.parentId) && (
                <div className="space-y-2">
                  <Label htmlFor="sizeType">Тип размера *</Label>
                  <select
                    id="sizeType"
                    value={formData.sizeType}
                    onChange={(e) =>
                      setFormData({ ...formData, sizeType: e.target.value })
                    }
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Выберите тип размера</option>
                    <option value="shoe">Обувь (Цифрами: 35-48)</option>
                    <option value="clothing">Одежда (Буквами: XS, S, M, L, XL)</option>
                    <option value="numeric">Цифрами (28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54)</option>
                    <option value="letter">Буквами (XS, S, M, L, XL, XXL, XXXL)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Выбранный тип размера будет использоваться при добавлении товаров в эту подкатегорию
                  </p>
                </div>
              )}


            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

