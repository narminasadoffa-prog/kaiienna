import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, amount, paymentMethod, status } = body

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || "card",
        status: status || "PENDING",
      },
      include: {
        order: true,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get("orderId")

    const where: any = {}

    if (orderId) {
      where.orderId = orderId
    }

    // If not admin, only show payments for user's orders
    if (session.user.role !== "ADMIN") {
      const userOrderIds = await prisma.order.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      })
      where.orderId = {
        in: userOrderIds.map((o) => o.id),
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

