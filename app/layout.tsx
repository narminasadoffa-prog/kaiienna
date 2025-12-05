import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import ConditionalLayoutClient from '@/components/ConditionalLayout';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Kaiienna - Интернет-магазин одежды',
  description: 'Современная одежда для всей семьи. Женская, мужская и детская одежда с доставкой по всей России.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConditionalLayoutClient>{children}</ConditionalLayoutClient>
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

// В админ-панели header и footer не отображаются
function ConditionalLayout({ children }: { children: React.ReactNode }) {
  // Должен быть клиентским компонентом, так как используется usePathname
  return <ConditionalLayoutClient>{children}</ConditionalLayoutClient>;
}

