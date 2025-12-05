import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    // Admin paneli üçün bütün məhsulları göstər (active parametri yoxdursa)
    const activeParam = searchParams.get("active")
    const active = activeParam === null ? undefined : activeParam !== "false"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null,
    }
    
    // Əgər active parametri verilibsə, onu əlavə et
    if (active !== undefined) {
      where.active = active
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    if (featured === "true") {
      where.featured = true
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            where: { deletedAt: null },
            select: {
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
      barcode,
      trackQuantity,
      quantity,
      weight,
      images,
      sizes,
      categoryId,
      featured,
      active,
    } = body

    // Validasiya
    if (!name) {
      return NextResponse.json(
        { error: "Məhsul adı tələb olunur" },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Kateqoriya seçilməlidir" },
        { status: 400 }
      )
    }

    // Kateqoriyanın mövcud olduğunu yoxla
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kateqoriya tapılmadı" },
        { status: 404 }
      )
    }

    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Düzgün qiymət daxil edin" },
        { status: 400 }
      )
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Məhsul təsviri tələb olunur" },
        { status: 400 }
      )
    }

    // Slug yoxdursa, avtomatik yarad
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const finalSlug = slug || generateSlug(name)

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku,
        barcode,
        trackQuantity,
        quantity: parseInt(quantity) || 0,
        weight: weight ? parseFloat(weight) : null,
        images: images || [],
        categoryId,
        featured: featured || false,
        active: active !== false,
      },
      include: {
        category: true,
      },
    })

    // Əgər ölçülər varsa, variantlar yarat
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      await Promise.all(
        sizes.map((size: string) =>
          prisma.productVariant.create({
            data: {
              productId: product.id,
              name: `Ölçü: ${size}`,
              quantity: parseInt(quantity) || 0,
            },
          })
        )
      )
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
    
    // Prisma xətalarını daha detallı göstər
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Bu slug və ya SKU artıq mövcuddur" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Kateqoriya tapılmadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Məhsul yaradıla bilmədi" },
      { status: 500 }
    )
  }
}


