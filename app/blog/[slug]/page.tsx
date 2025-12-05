'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  publishedAt: string | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blog/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Статья не найдена');
        } else {
          setError('Ошибка при загрузке статьи');
        }
        return;
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Ошибка при загрузке статьи');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">{error || 'Статья не найдена'}</p>
            <Link href="/blog">
              <Button variant="outline">Вернуться к блогу</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="outline" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к блогу
            </Button>
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          {post.image && (
            <div className="relative h-[600px] w-full mb-8 rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-contain"
              />
            </div>
          )}

          <div className="mb-6">
            {post.featured && (
              <span className="px-3 py-1 bg-[#DAA520] text-white text-sm font-semibold rounded-full mb-4 inline-block">
                Рекомендуемое
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views} просмотров
              </div>
              {post.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
