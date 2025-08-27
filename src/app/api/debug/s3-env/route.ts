import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authUser = await verifyAuthToken(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug environment variables
    const envDebug = {
      S3_REGION: process.env.S3_REGION || 'NOT SET',
      S3_MEDICAL_BUCKET_NAME: process.env.S3_MEDICAL_BUCKET_NAME || 'NOT SET',
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ? 
        `SET (length: ${process.env.S3_ACCESS_KEY_ID.length}, starts: ${process.env.S3_ACCESS_KEY_ID.substring(0, 10)}...)` : 
        'NOT SET',
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ? 
        `SET (length: ${process.env.S3_SECRET_ACCESS_KEY.length}, starts: ${process.env.S3_SECRET_ACCESS_KEY.substring(0, 10)}...)` : 
        'NOT SET'
    };

    // Test S3 connection with current env vars
    try {
      const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: process.env.S3_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });

      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      const buckets = response.Buckets?.map(b => b.Name) || [];
      const targetBucket = process.env.S3_MEDICAL_BUCKET_NAME;
      const bucketExists = buckets.includes(targetBucket);

      return NextResponse.json({
        success: true,
        environment: envDebug,
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
        environment: envDebug,
        s3Test: {
          success: false,
          error: s3Error.message
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
