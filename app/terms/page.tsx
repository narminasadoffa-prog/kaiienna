'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  active: boolean;
}

export default function TermsPage() {
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await fetch('/api/pages?slug=terms');
      if (response.ok) {
        const data = await response.json();
        if (data && data.active) {
          setPage(data);
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Пользовательское соглашение</h1>
          <p className="text-gray-600">Страница находится в разработке</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">{page.title}</h1>
      <div className="max-w-4xl mx-auto">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}

