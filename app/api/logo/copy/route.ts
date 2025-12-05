import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "Source URL is required" },
        { status: 400 }
      );
    }

    // Copy uploaded file to /logo.png
    const sourcePath = join(process.cwd(), "public", sourceUrl.replace("/", ""));
    const targetPath = join(process.cwd(), "public", "logo.png");

    if (!existsSync(sourcePath)) {
      return NextResponse.json(
        { error: "Source file not found" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(sourcePath);
    await writeFile(targetPath, fileBuffer);

    return NextResponse.json({ 
      success: true,
      message: "Logo copied successfully" 
    });
  } catch (error: any) {
    console.error("Error copying logo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to copy logo" },
      { status: 500 }
    );
  }
}

