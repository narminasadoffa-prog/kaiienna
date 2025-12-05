'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog?published=true', {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      const allPosts = data.posts || [];
      
      // Remove duplicates by slug (keep first occurrence)
      const seenSlugs = new Set<string>();
      const uniquePosts = allPosts.filter((p: BlogPost) => {
        if (seenSlugs.has(p.slug)) {
          return false; // Skip duplicate
        }
        seenSlugs.add(p.slug);
        return true;
      });
      
      // Find featured post
      const featured = uniquePosts.find((p: BlogPost) => p.featured);
      setFeaturedPost(featured || null);
      
      // Other posts (excluding featured)
      const otherPosts = uniquePosts.filter((p: BlogPost) => !p.featured);
      setPosts(otherPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Блог о моде</h1>
          <p className="text-xl text-gray-600">
            Актуальные тренды моды 2025-2026
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <Link href={`/blog/${featuredPost.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  {featuredPost.image && (
                    <div className="relative h-96 md:h-[600px] min-h-[500px]">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-contain bg-gray-50"
                      />
                    </div>
                  )}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-[#DAA520] text-white text-sm font-semibold rounded-full">
                        Рекомендуемое
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-gray-600 mb-6 text-lg">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {featuredPost.views}
                      </div>
                      {featuredPost.author && (
                        <span>Автор: {featuredPost.author}</span>
                      )}
                    </div>
                    <div className="flex items-center text-[#DAA520] font-semibold">
                      Читать далее
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Other Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Все статьи</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Статьи не найдены</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    {post.image && (
                      <div className="relative h-64 w-full bg-gray-50">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
