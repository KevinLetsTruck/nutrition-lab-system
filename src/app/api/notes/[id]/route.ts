import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ DELETE note endpoint called');
    
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Auth failed');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log('🗑️ Deleting note with ID:', id);

    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: {
        Client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existingNote) {
      console.log('❌ Note not found:', id);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    console.log('👤 Note belongs to client:', existingNote.Client.firstName, existingNote.Client.lastName);

    // Delete the note
    await prisma.note.delete({
      where: { id },
    });

    console.log('✅ Note deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
      deletedNoteId: id,
      client: `${existingNote.Client.firstName} ${existingNote.Client.lastName}`,
    });

  } catch (error) {
    console.error('❌ Error deleting note:', error);
    return NextResponse.json(
      {
        error: "Failed to delete note",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        Client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('❌ Error fetching note:', error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}