import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold mb-4">404</CardTitle>
          <CardDescription className="text-lg">
            Səhifə tapılmadı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Axtardığınız səhifə mövcud deyil və ya silinib.
          </p>
          <Link href="/">
            <Button className="w-full">
              Ana səhifəyə qayıt
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}


