import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        category: true,
        reviews: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        variants: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const updateData: any = {}

    if (body.name) updateData.name = body.name
    if (body.slug) updateData.slug = body.slug
    if (body.description) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.compareAtPrice !== undefined)
      updateData.compareAtPrice = body.compareAtPrice
        ? parseFloat(body.compareAtPrice)
        : null
    if (body.sku) updateData.sku = body.sku
    if (body.barcode) updateData.barcode = body.barcode
    if (body.trackQuantity !== undefined)
      updateData.trackQuantity = body.trackQuantity
    if (body.quantity !== undefined)
      updateData.quantity = parseInt(body.quantity)
    if (body.weight !== undefined)
      updateData.weight = body.weight ? parseFloat(body.weight) : null
    if (body.images) updateData.images = body.images
    if (body.categoryId) updateData.categoryId = body.categoryId
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.active !== undefined) updateData.active = body.active

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
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
    await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}



