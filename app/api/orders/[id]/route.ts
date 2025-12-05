import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both promise and direct params
    const resolvedParams = await Promise.resolve(params)
    const orderId = resolvedParams.id

    // Try to include shippingMethod, but handle if it doesn't exist in Prisma client yet
    let order;
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          shippingAddress: true,
          shippingMethod: true,
          payments: true,
        },
      })
    } catch (includeError: any) {
      // If shippingMethod doesn't exist, fetch without it
      if (includeError?.message?.includes('shippingMethod')) {
        order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            shippingAddress: true,
            payments: true,
          },
        })
        // Manually fetch shippingMethod if order has shippingMethodId
        if (order && (order as any).shippingMethodId) {
          try {
            const shippingMethod = await prisma.shippingMethod.findUnique({
              where: { id: (order as any).shippingMethodId },
            })
            if (shippingMethod) {
              (order as any).shippingMethod = shippingMethod;
            }
          } catch {
            // Ignore if shippingMethod fetch fails
          }
        }
      } else {
        throw includeError;
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user owns the order or is admin
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Error fetching order:", error)
    
    // More specific error messages
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }
    
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error?.message || "Failed to fetch order",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both promise and direct params
    const resolvedParams = await Promise.resolve(params)
    const orderId = resolvedParams.id

    const body = await request.json()
    const { status, paymentStatus, paymentId } = body

    // Update order status if provided
    if (status) {
      let order;
      try {
        order = await prisma.order.update({
          where: { id: orderId },
          data: { status },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
            shippingAddress: true,
            shippingMethod: true,
            payments: true,
          },
        })
      } catch (includeError: any) {
        if (includeError?.message?.includes('shippingMethod')) {
          order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              items: {
                include: {
                  product: true,
                },
              },
              shippingAddress: true,
              payments: true,
            },
          })
          if (order && (order as any).shippingMethodId) {
            try {
              const shippingMethod = await prisma.shippingMethod.findUnique({
                where: { id: (order as any).shippingMethodId },
              })
              if (shippingMethod) {
                (order as any).shippingMethod = shippingMethod;
              }
            } catch {
              // Ignore
            }
          }
        } else {
          throw includeError;
        }
      }

      return NextResponse.json(order)
    }

    // Update payment status if provided
    if (paymentStatus && paymentId) {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: paymentStatus },
      })

      // Return updated order with payments
      let order;
      try {
        order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
            shippingAddress: true,
            shippingMethod: true,
            payments: true,
          },
        })
      } catch (includeError: any) {
        if (includeError?.message?.includes('shippingMethod')) {
          order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              items: {
                include: {
                  product: true,
                },
              },
              shippingAddress: true,
              payments: true,
            },
          })
          if (order && (order as any).shippingMethodId) {
            try {
              const shippingMethod = await prisma.shippingMethod.findUnique({
                where: { id: (order as any).shippingMethodId },
              })
              if (shippingMethod) {
                (order as any).shippingMethod = shippingMethod;
              }
            } catch {
              // Ignore
            }
          }
        } else {
          throw includeError;
        }
      }

      return NextResponse.json(order)
    }

    return NextResponse.json({ error: "No valid update provided" }, { status: 400 })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}



