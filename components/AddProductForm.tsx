'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AddProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultCategoryId?: string
}

export default function AddProductForm({
  open,
  onOpenChange,
  onSuccess,
  defaultCategoryId,
}: AddProductFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [mainCategories, setMainCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    barcode: '',
    quantity: '0',
    weight: '',
    categoryId: defaultCategoryId || '',
    featured: false,
    active: true,
  })
  const [images, setImages] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0) // Əsas şəkil indeksi
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // Ölçü növləri
  const shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const numericSizes = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54']
  const letterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

  // Kateqoriyaları yüklə
  useEffect(() => {
    if (open) {
      fetchCategories()
      if (defaultCategoryId) {
        setFormData((prev) => ({ ...prev, categoryId: defaultCategoryId }))
      } else {
        // Formu təmizlə
        setFormData({
          name: '',
          slug: '',
          description: '',
          price: '',
          compareAtPrice: '',
          sku: '',
          barcode: '',
          quantity: '0',
          weight: '',
          categoryId: '',
          featured: false,
          active: true,
        })
        setImages([])
        setSizes([])
        setSizeInput('')
      }
    }
  }, [open, defaultCategoryId])

  // Ölçülər üçün funksiyalar
  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()])
      setSizeInput('')
    }
  }

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((size) => size !== sizeToRemove))
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        // Əsas kateqoriyaları ayır
        const mainCats = data.filter((cat: any) => !cat.parentId)
        setMainCategories(mainCats)
        
        // Əgər defaultCategoryId varsa, onun əsas kateqoriyasını tap
        if (defaultCategoryId) {
          const defaultCat = data.find((cat: any) => cat.id === defaultCategoryId)
          if (defaultCat) {
            if (defaultCat.parentId) {
              // Alt kateqoriyadırsa, əsas kateqoriyasını tap
              const parentCat = data.find((cat: any) => cat.id === defaultCat.parentId)
              if (parentCat) {
                setSelectedMainCategoryId(parentCat.id)
                const subs = data.filter((cat: any) => cat.parentId === parentCat.id)
                setSubCategories(subs)
              }
            } else {
              // Əsas kateqoriyadırsa
              setSelectedMainCategoryId(defaultCategoryId)
              const subs = data.filter((cat: any) => cat.parentId === defaultCategoryId)
              setSubCategories(subs)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Əsas kateqoriya seçildikdə alt kateqoriyaları yüklə
  const handleMainCategoryChange = (mainCategoryId: string) => {
    setSelectedMainCategoryId(mainCategoryId)
    setFormData({ ...formData, categoryId: '' }) // Alt kateqoriya seçimini təmizlə
    if (mainCategoryId) {
      const subs = categories.filter((cat: any) => cat.parentId === mainCategoryId)
      setSubCategories(subs)
    } else {
      setSubCategories([])
    }
  }

  // Kateqoriyanın ölçü növünü yoxla
  const getCategorySizeType = () => {
    const categoryId = formData.categoryId || selectedMainCategoryId
    if (!categoryId) return null
    const selectedCategory = categories.find((cat: any) => cat.id === categoryId)
    if (!selectedCategory) return null
    return selectedCategory.sizeType || null
  }

  // Ölçü növünə görə ölçüləri al
  const getAvailableSizes = () => {
    const sizeType = getCategorySizeType()
    switch (sizeType) {
      case 'shoe':
        return shoeSizes
      case 'clothing':
        return clothingSizes
      case 'numeric':
        return numericSizes
      case 'letter':
        return letterSizes
      default:
        return clothingSizes // По умолчанию размеры одежды
    }
  }

  // Ölçü növünə görə label
  const getSizeLabel = () => {
    const sizeType = getCategorySizeType()
    switch (sizeType) {
      case 'shoe':
        return 'Размеры обуви (Цифрами)'
      case 'clothing':
        return 'Размеры одежды (Буквами)'
      case 'numeric':
        return 'Размеры (Цифрами)'
      case 'letter':
        return 'Размеры (Буквами)'
      default:
        return 'Размеры'
    }
  }

  // Kateqoriya ayaqqabı kateqoriyasıdırsa yoxla (köhnə funksiya - uyğunluq üçün)
  const isShoeCategory = () => {
    const sizeType = getCategorySizeType()
    if (sizeType === 'shoe') return true
    
    // Əgər sizeType yoxdursa, köhnə yoxlamadan istifadə et
    if (!formData.categoryId) return false
    const selectedCategory = categories.find((cat: any) => cat.id === formData.categoryId)
    if (!selectedCategory) return false
    const categoryName = selectedCategory.name?.toLowerCase() || ''
    const categorySlug = selectedCategory.slug?.toLowerCase() || ''
    return categoryName.includes('ayaqqabı') || 
           categoryName.includes('ayakkabı') || 
           categorySlug.includes('shoe') ||
           categorySlug.includes('ayaqqabı') ||
           categorySlug.includes('ayakkabı')
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

  const handleImageAdd = (url: string) => {
    if (url.trim() && !images.includes(url.trim())) {
      setImages([...images, url.trim()])
    }
  }

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    // Əgər silinən şəkil əsas şəkil idisə, birinci şəkli əsas et
    if (index === mainImageIndex) {
      setMainImageIndex(0)
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  // Əsas şəkil seç
  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index)
    // Şəkilləri yenidən sırala - əsas şəkil birinci olsun
    const newImages = [...images]
    const mainImage = newImages[index]
    newImages.splice(index, 1)
    newImages.unshift(mainImage)
    setImages(newImages)
    setMainImageIndex(0) // İndi birinci şəkil əsas şəkildir
  }

  // Şəkilləri sırala (əsas şəkil birinci olsun)
  const sortedImages = images.length > 0 
    ? [images[mainImageIndex], ...images.filter((_, i) => i !== mainImageIndex)]
    : []

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Fayl tipini yoxla
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Xəta',
            description: `${file.name} şəkil faylı deyil`,
            variant: 'destructive',
          })
          continue
        }

        // Fayl ölçüsünü yoxla (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Xəta',
            description: `${file.name} çox böyükdür (max 5MB)`,
            variant: 'destructive',
          })
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setImages((prev) => [...prev, data.url])
        } else {
          const error = await response.json()
          toast({
            title: 'Xəta',
            description: error.error || `${file.name} yüklənə bilmədi`,
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Şəkil yüklənərkən xəta baş verdi',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      // Input-u təmizlə
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validasiya
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название товара обязательно',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    if (!formData.description || !formData.description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Описание товара обязательно',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    const finalCategoryId = formData.categoryId || selectedMainCategoryId
    if (!finalCategoryId) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо выбрать основную категорию',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите правильную цену (должна быть больше 0)',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    // Şəkil validasiyası - opsional edirik
    // if (images.length === 0) {
    //   toast({
    //     title: 'Xəta',
    //     description: 'Ən azı bir şəkil əlavə edilməlidir',
    //     variant: 'destructive',
    //   })
    //   setIsLoading(false)
    //   return
    // }

    try {
      // Slug yarad
      const finalSlug = formData.slug || generateSlug(formData.name)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: finalSlug,
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice
            ? parseFloat(formData.compareAtPrice)
            : null,
          quantity: parseInt(formData.quantity) || 0,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          sku: formData.sku || null,
          barcode: formData.barcode || null,
          // Şəkilləri sırala - əsas şəkil birinci olsun
          images: images.length > 0 
            ? [images[mainImageIndex], ...images.filter((_, i) => i !== mainImageIndex)]
            : [],
          sizes: sizes || [],
          categoryId: formData.categoryId || selectedMainCategoryId,
          trackQuantity: true,
          featured: formData.featured || false,
          active: formData.active !== false,
        }),
      })

      if (response.ok) {
        toast({
        title: 'Успешно',
        description: 'Товар успешно добавлен',
        })
        // Formu təmizlə
        setFormData({
          name: '',
          slug: '',
          description: '',
          price: '',
          compareAtPrice: '',
          sku: '',
          barcode: '',
          quantity: '0',
          weight: '',
          categoryId: defaultCategoryId || '',
          featured: false,
          active: true,
        })
        setImages([])
        setMainImageIndex(0)
        setSizes([])
        setSizeInput('')
        setSelectedMainCategoryId('')
        setSubCategories([])
        onOpenChange(false)
        onSuccess?.()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        console.error('Product creation error:', errorData)
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось добавить товар',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Product creation exception:', error)
      toast({
        title: 'Xəta',
        description: error.message || 'Xəta baş verdi',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[60]">
        <DialogHeader>
          <DialogTitle>Добавить новый товар</DialogTitle>
          <DialogDescription>
            Заполните информацию о товаре и добавьте изображения
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Название товара *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="Название товара"
              />
              {formData.slug && (
                <p className="text-xs text-gray-500 mt-1">
                  Slug: <span className="font-mono">{formData.slug}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Описание товара"
              />
            </div>

            {/* Основная категория */}
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
            </div>

            {/* Подкатегория */}
            {selectedMainCategoryId && subCategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="categoryId">Подкатегория *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Выберите подкатегорию</option>
                  {subCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Если в основной категории нет подкатегорий, выбрать основную категорию */}
            {selectedMainCategoryId && subCategories.length === 0 && (
              <div className="space-y-2">
                <Label>Категория</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    В этой основной категории нет подкатегорий. Товар будет добавлен в основную категорию.
                  </p>
                </div>
                <input 
                  type="hidden" 
                  value={selectedMainCategoryId}
                  onChange={() => setFormData({ ...formData, categoryId: selectedMainCategoryId })}
                />
              </div>
            )}
          </div>

          {/* Цена и Склад */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Цена и Склад</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Старая цена</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compareAtPrice: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Количество *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="SKU kodu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barkod</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="Barkod"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Изображения */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Изображения</h3>

            {/* Fayl yükləmə */}
            <div className="space-y-2">
              <Label>Загрузить файл изображения</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {uploading ? 'Загрузка...' : 'Выбрать изображение'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF (макс. 5MB каждый)
              </p>
            </div>

            {/* Добавление URL (альтернатива) */}
            <div className="space-y-2">
              <Label>Или добавьте URL изображения</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleImageAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget
                      .previousElementSibling as HTMLInputElement
                    if (input) {
                      handleImageAdd(input.value)
                      input.value = ''
                    }
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className={`relative w-full h-32 rounded-lg border-2 overflow-hidden ${
                        index === mainImageIndex 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200'
                      }`}>
                        <img
                          src={url}
                          alt={`Изображение ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/300x300?text=Изображение+не+найдено'
                          }}
                        />
                        {index === mainImageIndex && (
                          <div className="absolute top-1 left-1 bg-primary-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Главное
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant={index === mainImageIndex ? "default" : "secondary"}
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleSetMainImage(index)}
                            title="Сделать главным"
                          >
                            <ImageIcon className="w-4 h-4 mr-1" />
                            {index === mainImageIndex ? 'Главное' : 'Сделать главным'}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index)}
                            title="Удалить"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Наведите на изображение и нажмите кнопку "Сделать главным" для выбора главного изображения
                </p>
              </div>
            )}
          </div>

          {/* Размеры */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Размеры</h3>

            {(formData.categoryId || selectedMainCategoryId) ? (
              <div className="space-y-2">
                <Label>{getSizeLabel()}</Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSizes().map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={sizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (sizes.includes(size)) {
                          handleRemoveSize(size)
                        } else {
                          setSizes([...sizes, size])
                        }
                      }}
                      className="min-w-[50px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {sizes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Выбранные размеры:</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-md"
                        >
                          <span className="text-sm font-medium">{size}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-primary-200"
                            onClick={() => handleRemoveSize(size)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Выберите размеры, соответствующие категории
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Размеры</Label>
                <p className="text-sm text-gray-500">
                  Сначала выберите категорию, затем будут показаны размеры
                </p>
              </div>
            )}
          </div>

          {/* Другие настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Другие настройки</h3>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>Рекомендуемый</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>Активен</span>
              </label>
            </div>
          </div>

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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

