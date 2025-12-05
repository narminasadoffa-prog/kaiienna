import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: params.id },
    })

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(shippingMethod)
  } catch (error) {
    console.error("Error fetching shipping method:", error)
    return NextResponse.json(
      { error: "Failed to fetch shipping method" },
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
    const { name, nameRu, description, descriptionRu, cost, estimatedDays, active } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (nameRu !== undefined) updateData.nameRu = nameRu
    if (description !== undefined) updateData.description = description
    if (descriptionRu !== undefined) updateData.descriptionRu = descriptionRu
    if (cost !== undefined) updateData.cost = parseFloat(cost)
    if (estimatedDays !== undefined) updateData.estimatedDays = estimatedDays ? parseInt(estimatedDays) : null
    if (active !== undefined) updateData.active = active

    const shippingMethod = await prisma.shippingMethod.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(shippingMethod)
  } catch (error) {
    console.error("Error updating shipping method:", error)
    return NextResponse.json(
      { error: "Failed to update shipping method" },
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

    await prisma.shippingMethod.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shipping method:", error)
    return NextResponse.json(
      { error: "Failed to delete shipping method" },
      { status: 500 }
    )
  }
}
