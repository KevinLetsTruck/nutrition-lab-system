import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = (await params).filename;
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    try {
      const fileBuffer = await fs.readFile(filePath);

      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = "application/octet-stream";

      if (ext === ".pdf") {
        contentType = "application/pdf";
      } else if (ext === ".jpg" || ext === ".jpeg") {
        contentType = "image/jpeg";
      } else if (ext === ".png") {
        contentType = "image/png";
      }

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      });
    } catch (fileError) {
      console.error("File not found:", filePath, fileError);
      return new NextResponse("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
