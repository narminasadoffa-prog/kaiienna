import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş edilməyib" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: "Profil uğurla yeniləndi",
      user,
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Profil yenilənərkən xəta baş verdi" },
      { status: 500 }
    )
  }
}

