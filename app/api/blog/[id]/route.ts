import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    const post = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ ...post, views: post.views + 1 })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
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

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    const body = await request.json()
    const { title, slug, excerpt, content, image, author, published, featured } = body

    console.log("Updating blog post:", { id, image, hasImage: !!image });

    const updateData: any = {}
    if (title !== undefined && title !== null) {
      updateData.title = typeof title === 'string' ? title.trim() : title
    }
    if (slug !== undefined && slug !== null) {
      updateData.slug = typeof slug === 'string' ? slug.trim() : slug
    }
    if (excerpt !== undefined) {
      updateData.excerpt = (excerpt && typeof excerpt === 'string') ? excerpt.trim() || null : null
    }
    if (content !== undefined && content !== null) {
      updateData.content = typeof content === 'string' ? content.trim() : content
    }
    if (image !== undefined) {
      updateData.image = (image && typeof image === 'string') ? image.trim() || null : null
    }
    if (author !== undefined) {
      updateData.author = (author && typeof author === 'string') ? author.trim() || "Admin" : "Admin"
    }
    if (featured !== undefined) updateData.featured = featured
    
    // Handle published status
    if (published !== undefined) {
      updateData.published = published
      if (published && !updateData.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error("Error updating blog post:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting blog post:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
}
