import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
                active: true,
              },
            },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image, videoUrl, parentId, sizeType } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Mövcud kateqoriyanı yüklə
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      select: { slug: true }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Slug yoxdursa və ya dəyişməyibsə, mövcud slug-u saxla
    let finalSlug = existingCategory.slug
    if (slug && slug !== existingCategory.slug) {
      // Yeni slug-un unique olduğunu yoxla
      const slugExists = await prisma.category.findUnique({
        where: { slug },
        select: { id: true }
      })
      
      if (slugExists && slugExists.id !== params.id) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        )
      }
      finalSlug = slug
    } else if (!slug) {
      // Slug yoxdursa, avtomatik yarad (yalnız name dəyişibsə)
      const generateSlug = (text: string) => {
        // Rus hərflərini transliterasiya et
        const translit: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        }
        
        return text
          .toLowerCase()
          .split('')
          .map(char => translit[char] || char)
          .join('')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }
      
      const newSlug = generateSlug(name)
      if (newSlug && newSlug !== existingCategory.slug) {
        // Yeni slug-un unique olduğunu yoxla
        const slugExists = await prisma.category.findUnique({
          where: { slug: newSlug },
          select: { id: true }
        })
        
        if (!slugExists || slugExists.id === params.id) {
          finalSlug = newSlug
        }
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        image: image || null,
        videoUrl: videoUrl || null,
        parentId: parentId || null,
        sizeType: sizeType || null,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete
    await prisma.category.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}


