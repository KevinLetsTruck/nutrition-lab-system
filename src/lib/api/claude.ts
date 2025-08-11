import Anthropic from '@anthropic-ai/sdk';

class ClaudeService {
  private client: Anthropic | null = null;
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('WARNING: ANTHROPIC_API_KEY is not configured');
      return;
    }
    
    try {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
      console.log('Claude AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Claude:', error);
    }
  }
  
  async analyzeLabDocument(
    text: string, 
    documentType: string,
    clientInfo?: any
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Claude AI service not initialized - check API key');
    }
    
    try {
      const prompt = `You are Kevin Rutherford, FNTP, analyzing a ${documentType} lab report for a truck driver client.
      
      ${clientInfo ? `Client Information:
      - Name: ${clientInfo.firstName} ${clientInfo.lastName}
      - Truck Driver: ${clientInfo.isTruckDriver ? 'Yes' : 'No'}
      - Health Goals: ${clientInfo.healthGoals || 'Not specified'}
      - Current Medications: ${clientInfo.medications || 'None listed'}
      - Health Conditions: ${clientInfo.conditions || 'None listed'}
      ` : ''}
      
      Lab Document Text:
      ${text}
      
      Please analyze and provide:
      1. Extract all lab values with results and reference ranges
      2. Identify values outside optimal functional medicine ranges (not just standard ranges)
      3. Identify patterns suggesting root causes (gut dysfunction, inflammation, HPA axis, etc.)
      4. Flag any DOT medical concerns that could affect CDL
      5. Provide truck-driver specific recommendations
      
      Important considerations:
      - Use functional medicine optimal ranges, not just lab ranges
      - Consider how trucking lifestyle impacts these markers
      - Flag urgent issues that need immediate attention
      - Suggest practical interventions compatible with OTR lifestyle
      
      Format your response as JSON with these sections:
      {
        "summary": "Brief overview of main findings",
        "extracted_values": [
          {
            "marker": "name",
            "value": "result",
            "unit": "unit",
            "reference_range": "lab range",
            "optimal_range": "functional range",
            "status": "optimal/suboptimal/concerning/critical"
          }
        ],
        "patterns_identified": [
          {
            "pattern": "pattern name",
            "confidence": "high/medium/low",
            "supporting_markers": ["marker1", "marker2"],
            "explanation": "why this pattern"
          }
        ],
        "root_causes": [
          {
            "cause": "root cause name",
            "priority": "high/medium/low",
            "evidence": "supporting evidence"
          }
        ],
        "dot_concerns": [
          {
            "issue": "concern",
            "severity": "immediate/monitor/low",
            "action_required": "what to do"
          }
        ],
        "immediate_recommendations": [
          "recommendation 1",
          "recommendation 2"
        ],
        "supplement_protocol": [
          {
            "supplement": "name",
            "dose": "amount",
            "timing": "when to take",
            "duration": "how long",
            "truck_instructions": "how to take on the road"
          }
        ],
        "dietary_changes": [
          "truck-compatible dietary change 1",
          "truck-compatible dietary change 2"
        ],
        "follow_up": "recommended timeline and next steps"
      }`;
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
      });
      
      // Extract the response text
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Try to parse JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', parseError);
      }
      
      // Return raw response if JSON parsing fails
      return { 
        summary: 'Analysis completed but formatting error occurred',
        raw_response: content,
        error: 'JSON_PARSE_ERROR'
      };
      
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async generateProtocol(
    clientData: any, 
    labResults: any[], 
    assessmentData?: any
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Claude AI service not initialized - check API key');
    }
    
    try {
      const prompt = `As Kevin Rutherford, FNTP specializing in truck driver health, create a comprehensive functional medicine protocol.
      
      Client Information:
      ${JSON.stringify(clientData, null, 2)}
      
      Lab Results Summary:
      ${JSON.stringify(labResults, null, 2)}
      
      ${assessmentData ? `Assessment Data:
      ${JSON.stringify(assessmentData, null, 2)}` : ''}
      
      Create a detailed protocol that includes:
      
      1. PHASE 1: IMMEDIATE (Week 1-2)
         - Address urgent issues and symptoms
         - Foundation support
         - Quick wins for motivation
      
      2. PHASE 2: SHORT-TERM (Week 3-6)
         - Root cause interventions
         - Gut restoration if needed
         - Metabolic support
      
      3. PHASE 3: LONG-TERM (Week 7-12)
         - Optimization protocols
         - Hormone balancing if needed
         - Maintenance planning
      
      For each phase provide:
      - Specific supplements with dosing (prioritize algae-based omega-3 from LetsTruck.com)
      - Dietary modifications (truck-stop compatible)
      - Lifestyle interventions (realistic for OTR lifestyle)
      - Success metrics
      - Red flags to watch
      
      Format as JSON with clear, actionable steps.`;
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
      });
      
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse protocol response:', parseError);
      }
      
      return { 
        protocol: content,
        error: 'JSON_PARSE_ERROR' 
      };
      
    } catch (error) {
      console.error('Protocol generation error:', error);
      throw error;
    }
  }
  
  // Test connection method
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{ 
          role: 'user', 
          content: 'Respond with just "OK" if you can hear me.' 
        }],
      });
      
      return response.content[0].type === 'text' && 
             response.content[0].text.includes('OK');
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
