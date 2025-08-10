import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file to /tmp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join('/tmp', filename);
    
    await writeFile(filepath, buffer);
    console.log(`File saved to ${filepath}`);

    // Save document record to database
    if (clientId) {
      const document = await prisma.document.create({
        data: {
          client_id: parseInt(clientId),
          file_name: file.name,
          file_path: filepath,
          file_size: file.size,
          file_type: file.type,
          upload_date: new Date(),
          created_by: session.user.id
        }
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          fileName: document.file_name,
          filePath: document.file_path,
          uploadDate: document.upload_date
        }
      });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: filepath,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}