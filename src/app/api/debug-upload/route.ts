import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Upload request received");
    console.log("📋 Headers:", Object.fromEntries(request.headers.entries()));
    console.log("🌐 URL:", request.url);
    console.log("📝 Method:", request.method);
    console.log("📏 Content-Length:", request.headers.get("content-length"));
    console.log("📄 Content-Type:", request.headers.get("content-type"));
    
    // Try to get the raw body first
    try {
      const contentType = request.headers.get("content-type") || "";
      console.log("🔍 Content-Type:", contentType);
      
      if (contentType.includes("multipart/form-data")) {
        console.log("📦 Attempting FormData parsing...");
        const formData = await request.formData();
        console.log("✅ FormData parsed successfully");
        
        const entries = Array.from(formData.entries());
        console.log("📋 FormData entries:", entries.length);
        
        for (const [key, value] of entries) {
          if (value instanceof File) {
            console.log(`📁 ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`📝 ${key}: ${value}`);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: "FormData parsed successfully",
          entries: entries.length 
        });
      } else {
        console.log("📄 Not FormData, trying text...");
        const text = await request.text();
        console.log("📄 Body text length:", text.length);
        console.log("📄 Body preview:", text.substring(0, 200));
        
        return NextResponse.json({ 
          success: true, 
          message: "Text body received",
          bodyLength: text.length,
          contentType 
        });
      }
    } catch (parseError) {
      console.log("❌ Body parsing failed:", parseError);
      return NextResponse.json({ 
        error: "Body parsing failed", 
        details: parseError instanceof Error ? parseError.message : "Unknown parse error" 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.log("❌ Debug endpoint error:", error);
    return NextResponse.json({ 
      error: "Debug endpoint failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
