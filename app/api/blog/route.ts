import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get("published")
    const featured = searchParams.get("featured")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    
    // Admin can see all posts, users only see published
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      where.published = true
    } else if (published === "true") {
      where.published = true
    } else if (published === "false") {
      where.published = false
    }

    if (featured === "true") {
      where.featured = true
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch blog posts",
        posts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      },
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
    const { title, slug, excerpt, content, image, author, published, featured } = body

    console.log("Received blog post data:", { 
      title: title?.substring?.(0, 50), 
      slug, 
      hasContent: !!content,
      contentLength: content?.length 
    })

    // Validate required fields with safe checks
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      )
    }

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      )
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: "Slug is required and must be a string" },
        { status: 400 }
      )
    }

    const trimmedSlug = slug.trim()
    if (!trimmedSlug) {
      return NextResponse.json(
        { error: "Slug cannot be empty" },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      )
    }

    const imageValue = (image && typeof image === 'string') ? image.trim() || null : null;
    
    console.log("Creating blog post with data:", {
      title: trimmedTitle,
      slug: trimmedSlug,
      hasImage: !!imageValue,
      image: imageValue,
      contentLength: trimmedContent.length
    });

    const post = await prisma.blogPost.create({
      data: {
        title: trimmedTitle,
        slug: trimmedSlug,
        excerpt: (excerpt && typeof excerpt === 'string') ? excerpt.trim() || null : null,
        content: trimmedContent,
        image: imageValue,
        author: (author && typeof author === 'string') ? author.trim() || "Admin" : "Admin",
        published: published === true,
        featured: featured === true,
        publishedAt: published === true ? new Date() : null,
      },
    })

    console.log("Blog post created successfully:", { id: post.id, image: post.image })
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blog post:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Slug "${body.slug}" already exists. Please choose a different slug.` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to create blog post" },
      { status: 500 }
    )
  }
}
