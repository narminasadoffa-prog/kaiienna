import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - Get current logo URL
export async function GET() {
  try {
    // Check if logo.png exists
    const logoPath = join(process.cwd(), "public", "logo.png");
    
    if (existsSync(logoPath)) {
      return NextResponse.json({ logoUrl: "/logo.png" });
    }
    
    return NextResponse.json({ logoUrl: null });
  } catch (error: any) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo" },
      { status: 500 }
    );
  }
}

// POST - Save logo URL
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { logoUrl } = body;

    if (!logoUrl) {
      return NextResponse.json(
        { error: "Logo URL is required" },
        { status: 400 }
      );
    }

    // Copy uploaded file to /logo.png
    try {
      // Remove leading slash if present
      const sourcePath = join(process.cwd(), "public", logoUrl.startsWith("/") ? logoUrl.slice(1) : logoUrl);
      const targetPath = join(process.cwd(), "public", "logo.png");

      if (existsSync(sourcePath)) {
        const fileBuffer = await readFile(sourcePath);
        await writeFile(targetPath, fileBuffer);
        console.log(`Logo copied from ${sourcePath} to ${targetPath}`);
      } else {
        console.error(`Source file not found: ${sourcePath}`);
      }
    } catch (error) {
      console.error("Error copying logo file:", error);
      return NextResponse.json(
        { error: "Failed to copy logo file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      logoUrl: "/logo.png" 
    });
  } catch (error: any) {
    console.error("Error saving logo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save logo" },
      { status: 500 }
    );
  }
}

