import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("activeOnly") === "true"

    const where: any = {}
    if (activeOnly) {
      where.active = true
    }

    const shippingMethods = await prisma.shippingMethod.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(shippingMethods)
  } catch (error) {
    console.error("Error fetching shipping methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
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
    const { name, nameRu, description, descriptionRu, cost, estimatedDays, active } = body

    if (!name || !nameRu || cost === undefined) {
      return NextResponse.json(
        { error: "Name, nameRu, and cost are required" },
        { status: 400 }
      )
    }

    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name,
        nameRu,
        description,
        descriptionRu,
        cost: parseFloat(cost),
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(shippingMethod, { status: 201 })
  } catch (error) {
    console.error("Error creating shipping method:", error)
    return NextResponse.json(
      { error: "Failed to create shipping method" },
      { status: 500 }
    )
  }
}
