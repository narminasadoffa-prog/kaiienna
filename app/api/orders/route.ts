import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const userId = searchParams.get("userId")

    const where: any = {}

    // Admin can see all orders or filter by userId
    if (session.user.role === "ADMIN") {
      if (userId) {
        where.userId = userId
      }
    } else {
      // Regular users can only see their own orders
      where.userId = session.user.id
    }

    // Try to include shippingMethod, fallback if not available
    let ordersQuery: any = {
      where,
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
              select: {
                id: true,
                name: true,
                images: true,
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
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    };

    // Try to add shippingMethod, but handle if it doesn't exist
    try {
      ordersQuery.include.shippingMethod = true;
      const [orders, total] = await Promise.all([
        prisma.order.findMany(ordersQuery),
        prisma.order.count({ where }),
      ]);
      
      // Manually fetch shippingMethods for orders that have shippingMethodId
      const ordersWithShipping = await Promise.all(
        orders.map(async (order: any) => {
          if (order.shippingMethodId && !order.shippingMethod) {
            try {
              const shippingMethod = await prisma.shippingMethod.findUnique({
                where: { id: order.shippingMethodId },
              });
              if (shippingMethod) {
                order.shippingMethod = shippingMethod;
              }
            } catch {
              // Ignore
            }
          }
          return order;
        })
      );

      return NextResponse.json({
        orders: ordersWithShipping,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      // If shippingMethod doesn't exist in Prisma client, fetch without it
      if (error?.message?.includes('shippingMethod')) {
        delete ordersQuery.include.shippingMethod;
        const [orders, total] = await Promise.all([
          prisma.order.findMany(ordersQuery),
          prisma.order.count({ where }),
        ]);
        
        // Manually fetch shippingMethods
        const ordersWithShipping = await Promise.all(
          orders.map(async (order: any) => {
            if (order.shippingMethodId) {
              try {
                const shippingMethod = await prisma.shippingMethod.findUnique({
                  where: { id: order.shippingMethodId },
                });
                if (shippingMethod) {
                  order.shippingMethod = shippingMethod;
                }
              } catch {
                // Ignore
              }
            }
            return order;
          })
        );

        return NextResponse.json({
          orders: ordersWithShipping,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      }
      throw error;
    }

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { shippingAddressId, shippingMethodId, items, subtotal, tax, shipping } = body

    // Get cart items if not provided
    let orderItems = items
    if (!orderItems) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
      })

      if (cartItems.length === 0) {
        return NextResponse.json(
          { error: "Cart is empty" },
          { status: 400 }
        )
      }

      orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.product.price.toString()),
        variantId: item.variantId,
      }))
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal !== undefined && subtotal !== null
      ? parseFloat(subtotal.toString())
      : orderItems.reduce(
          (sum: number, item: any) => {
            const itemPrice = typeof item.price === 'string' 
              ? parseFloat(item.price) 
              : typeof item.price === 'number'
              ? item.price
              : 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            return sum + itemPrice * itemQuantity;
          },
          0
        );
    const calculatedTax = tax !== undefined && tax !== null ? parseFloat(tax.toString()) : 0;
    const calculatedShipping = shipping !== undefined && shipping !== null ? parseFloat(shipping.toString()) : 0;
    const total = calculatedSubtotal + calculatedTax + calculatedShipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Validate orderItems
    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      )
    }

    // Validate shippingAddressId
    if (!shippingAddressId) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    // Verify shipping address exists and belongs to user
    try {
      const addressExists = await prisma.address.findFirst({
        where: { 
          id: shippingAddressId,
          userId: session.user.id 
        },
      })
      
      if (!addressExists) {
        // If address doesn't exist, it might have been just created
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 100));
        const addressRetry = await prisma.address.findFirst({
          where: { 
            id: shippingAddressId,
            userId: session.user.id 
          },
        })
        
        if (!addressRetry) {
          return NextResponse.json(
            { error: "Shipping address not found or doesn't belong to user" },
            { status: 404 }
          )
        }
      }
    } catch (error: any) {
      // If it's a foreign key error, the address might not exist yet
      // Continue anyway and let Prisma handle it
      console.warn("Address verification error:", error?.message);
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "PENDING",
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        shipping: calculatedShipping,
        total,
        shippingAddressId,
        ...(shippingMethodId ? { shippingMethodId } : {}),
        items: {
          create: orderItems.map((item: any) => {
            const price = typeof item.price === 'string' 
              ? parseFloat(item.price) 
              : typeof item.price === 'number'
              ? item.price
              : 0;
            
            if (price <= 0 || isNaN(price)) {
              throw new Error(`Invalid price for product ${item.productId}: ${item.price}`);
            }
            
            const quantity = parseInt(item.quantity) || 1;
            if (quantity <= 0 || isNaN(quantity)) {
              throw new Error(`Invalid quantity for product ${item.productId}: ${item.quantity}`);
            }
            
            return {
              productId: item.productId,
              quantity: quantity,
              price: price,
              variantId: item.variantId || null,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    
    // Return more specific error message
    let errorMessage = "Failed to create order"
    if (error.code === 'P2002') {
      errorMessage = "Order number already exists. Please try again."
    } else if (error.code === 'P2003') {
      errorMessage = "Invalid shipping address or product reference."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



