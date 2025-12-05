'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function LogoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/logo');
      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.logoUrl || '/logo.png');
        setPreview(data.logoUrl || '/logo.png');
      } else {
        // Default logo
        setLogoUrl('/logo.png');
        setPreview('/logo.png');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      setLogoUrl('/logo.png');
      setPreview('/logo.png');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, выберите изображение',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('logo-file') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите файл',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }

      const uploadData = await uploadResponse.json();
      const uploadedUrl = uploadData.url;

      // Save logo URL and copy to /logo.png
      const saveResponse = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: uploadedUrl }),
        credentials: 'include',
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Ошибка сохранения логотипа');
      }

      setLogoUrl('/logo.png');
      setPreview('/logo.png');
      toast({
        title: 'Успешно',
        description: 'Логотип успешно обновлен',
      });

      // Reset file input
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить логотип',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setPreview(logoUrl);
    const fileInput = document.getElementById('logo-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Управление логотипом
            </CardTitle>
            <CardDescription>
              Загрузите новый логотип для сайта. Рекомендуемый размер: 200x60px или больше. Форматы: PNG, JPG, SVG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Logo Preview */}
            <div>
              <Label>Текущий логотип</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Current Logo"
                    className="max-h-20 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Логотип не загружен</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <Label htmlFor="logo-file">Выберите новый логотип</Label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    id="logo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                    disabled={uploading}
                  />
                  {preview && preview !== logoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePreview}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отменить
                    </Button>
                  )}
                </div>

                {/* Preview */}
                {preview && preview !== logoUrl && (
                  <div>
                    <Label>Предпросмотр</Label>
                    <div className="mt-2 border-2 border-dashed border-primary-300 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-20 w-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading || !preview || preview === logoUrl}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить логотип
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Совет:</strong> После загрузки логотип будет отображаться в шапке сайта. 
                Убедитесь, что логотип имеет прозрачный фон (PNG) или подходящий цвет фона.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}

