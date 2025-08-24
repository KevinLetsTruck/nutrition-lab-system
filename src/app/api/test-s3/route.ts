import { NextResponse } from "next/server";
import { medicalDocStorage } from "@/lib/medical/s3-storage";

export async function GET() {
  try {

    // Test basic connection
    const isConnected = await medicalDocStorage.testConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "S3 connection failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "S3 connection successful!",
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    console.error("S3 Test Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
