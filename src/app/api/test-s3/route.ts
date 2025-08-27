import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple environment check (no auth required for debugging)
    const envCheck = {
      S3_REGION: process.env.S3_REGION || 'NOT SET',
      S3_MEDICAL_BUCKET_NAME: process.env.S3_MEDICAL_BUCKET_NAME || 'NOT SET',
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ? 
        `SET (length: ${process.env.S3_ACCESS_KEY_ID.length})` : 'NOT SET',
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ? 
        `SET (length: ${process.env.S3_SECRET_ACCESS_KEY.length})` : 'NOT SET'
    };

    // Test S3 connection
    try {
      const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
      
      if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
        return NextResponse.json({
          success: false,
          environment: envCheck,
          error: 'Missing S3 credentials'
        });
      }
      
      const s3Client = new S3Client({
        region: process.env.S3_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      });

      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      const buckets = response.Buckets?.map(b => b.Name) || [];
      const targetBucket = process.env.S3_MEDICAL_BUCKET_NAME;
      const bucketExists = buckets.includes(targetBucket);

      return NextResponse.json({
        success: true,
        environment: envCheck,
        s3Test: {
          success: true,
          buckets,
          targetBucket,
          bucketExists
        }
      });
      
    } catch (s3Error: any) {
      return NextResponse.json({
        success: false,
        environment: envCheck,
        s3Test: {
          success: false,
          error: s3Error.message,
          code: s3Error.Code || s3Error.name,
          statusCode: s3Error.$metadata?.httpStatusCode
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
