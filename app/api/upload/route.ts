import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Fayl tapılmadı" },
        { status: 400 }
      )
    }

    // Fayl tipini yoxla
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Yalnız şəkil faylları qəbul edilir" },
        { status: 400 }
      )
    }

    // Fayl ölçüsünü yoxla (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fayl ölçüsü 5MB-dan böyük ola bilməz" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Unikal fayl adı yarad
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Uploads qovluğunu yoxla və yarat
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Qovluq artıq mövcuddursa, xəta vermə
    }

    // Faylı yaz
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // URL qaytar
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      url: fileUrl,
      fileName: fileName,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Fayl yüklənə bilmədi: " + error.message },
      { status: 500 }
    )
  }
}


