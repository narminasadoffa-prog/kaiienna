import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
      },
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
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image, videoUrl, parentId, sizeType } = body

    // Slug yoxdursa, avtomatik yarad
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const finalSlug = slug || generateSlug(name)

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        videoUrl: videoUrl || null,
        parentId: parentId || null,
        sizeType: sizeType || null,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}


