import { NextRequest, NextResponse } from 'next/server';
import { AIConversationEngine } from '@/lib/ai-conversation-engine';

export async function POST(request: NextRequest) {
  try {
    const { action, clientId, conversationId, message, section } = await request.json();
    
    const engine = new AIConversationEngine();
    
    switch (action) {
      case 'start':
        const convId = await engine.startConversation(clientId);
        return NextResponse.json({ conversationId: convId });
        
      case 'message':
        const response = await engine.processClientResponse(conversationId, message);
        return NextResponse.json(response);
        
      case 'validate':
        const validation = await engine.validateSection(conversationId, section);
        return NextResponse.json(validation);
        
      case 'complete':
        const analysis = await engine.completeConversation(conversationId);
        return NextResponse.json(analysis);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Conversation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}