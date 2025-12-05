'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ConditionalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // В админ-панели header и footer не отображаются
  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>
  }

  // На обычных страницах header и footer отображаются
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}


