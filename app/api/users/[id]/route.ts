import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    price: true,
                  },
                },
              },
            },
            shippingAddress: true,
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                paymentMethod: true,
                transactionId: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        cart: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            cart: true,
            reviews: true,
            addresses: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate statistics
    const totalSpent = user.orders.reduce(
      (sum, order) => sum + parseFloat(order.total.toString()),
      0
    )
    const completedOrders = user.orders.filter(
      (o) => o.status === "DELIVERED"
    ).length
    const pendingOrders = user.orders.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSING"
    ).length

    return NextResponse.json({
      user,
      statistics: {
        totalSpent,
        totalOrders: user._count.orders,
        completedOrders,
        pendingOrders,
        cartItems: user._count.cart,
        reviews: user._count.reviews,
        addresses: user._count.addresses,
      },
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    )
  }
}
