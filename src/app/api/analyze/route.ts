import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }
    
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this lab result as a Functional Nutritional Therapy Practitioner (FNTP): ${text}`
      }]
    });
    
    return Response.json({ analysis: message.content });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
