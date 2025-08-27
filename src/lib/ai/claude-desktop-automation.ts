import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export interface ClaudeAnalysisResult {
  success: boolean;
  analysis?: string;
  error?: string;
  debugInfo?: any;
}

export class ClaudeDesktopAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(
    private options: {
      headless?: boolean;
      timeout?: number;
      claudeEmail?: string;
      claudePassword?: string;
    } = {}
  ) {
    this.options = {
      headless: true, // Set to false for debugging
      timeout: 60000, // 60 seconds
      ...options,
    };
  }

  async initialize(): Promise<void> {
    console.log('🤖 Launching Puppeteer browser...');
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Required for Railway/Docker
        '--disable-gpu',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Set realistic viewport and user agent
    await this.page.setViewport({ width: 1920, height: 1080 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );

    console.log('✅ Browser initialized');
  }

  async navigateToClaude(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('🌐 Navigating to Claude.ai...');
    await this.page.goto('https://claude.ai/chats', {
      waitUntil: 'networkidle2',
      timeout: this.options.timeout,
    });

    // Wait for page to load
    await this.page.waitForTimeout(2000);
    console.log('✅ Reached Claude.ai');
  }

  async handleAuthentication(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      // Check if already logged in by looking for chat interface
      await this.page.waitForSelector('[data-testid="send-button"]', { 
        timeout: 5000 
      });
      console.log('✅ Already authenticated');
      return;
    } catch {
      console.log('🔑 Need to authenticate...');
      // If we need auth, we'll handle it here
      // For now, assume user needs to handle auth manually
      throw new Error('Authentication required - please log in to Claude.ai manually first');
    }
  }

  async createNewChat(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('💬 Creating new chat...');
    
    try {
      // Look for "New Chat" button or similar
      const newChatButton = await this.page.$('button:has-text("New Chat"), a[href*="/chat"], button[aria-label*="new"]');
      if (newChatButton) {
        await newChatButton.click();
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('ℹ️ Continuing with existing chat interface');
    }

    console.log('✅ Ready for new conversation');
  }

  async uploadFile(filePath: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log(`📎 Uploading file: ${path.basename(filePath)}`);

    // Look for file upload input
    const fileInput = await this.page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File upload input not found');
    }

    await fileInput.uploadFile(filePath);
    await this.page.waitForTimeout(3000); // Wait for upload to process

    console.log('✅ File uploaded successfully');
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('💬 Sending analysis prompt...');

    // Find the text input area
    const textArea = await this.page.$('textarea, [contenteditable="true"]');
    if (!textArea) {
      throw new Error('Message input not found');
    }

    // Clear and type the message
    await textArea.click();
    await this.page.keyboard.selectAll();
    await this.page.type('textarea, [contenteditable="true"]', message);

    // Find and click send button
    const sendButton = await this.page.$('button[type="submit"], [data-testid="send-button"], button:has-text("Send")');
    if (!sendButton) {
      throw new Error('Send button not found');
    }

    await sendButton.click();
    console.log('✅ Message sent, waiting for response...');
  }

  async waitForResponse(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('⏳ Waiting for Claude response...');

    // Wait for response to appear and complete
    await this.page.waitForTimeout(5000); // Initial delay

    // Look for response container - this may need adjustment based on Claude's HTML
    let response = '';
    let previousLength = 0;
    let stableCount = 0;

    for (let i = 0; i < 30; i++) { // Max 30 iterations (3 minutes)
      try {
        // Try multiple selectors for response content
        const responseElements = await this.page.$$('div[data-message-id] div, .message-content, .response-content, [role="presentation"] p');
        
        if (responseElements.length > 0) {
          // Get the last response (Claude's latest message)
          const lastResponse = responseElements[responseElements.length - 1];
          const currentText = await lastResponse.evaluate(el => el.textContent || '');
          
          if (currentText.length > previousLength) {
            response = currentText;
            previousLength = currentText.length;
            stableCount = 0;
          } else {
            stableCount++;
          }

          // If response hasn't changed for 3 iterations, consider it complete
          if (stableCount >= 3 && response.length > 100) {
            break;
          }
        }
      } catch (error) {
        console.log(`⏳ Waiting for response... (attempt ${i + 1})`);
      }

      await this.page.waitForTimeout(6000); // Wait 6 seconds between checks
    }

    if (!response || response.length < 50) {
      throw new Error('No valid response received from Claude');
    }

    console.log(`✅ Response received (${response.length} characters)`);
    return response;
  }

  async analyzeClientData(zipFilePath: string, clientName: string): Promise<ClaudeAnalysisResult> {
    try {
      await this.initialize();
      await this.navigateToClaude();
      await this.handleAuthentication();
      await this.createNewChat();
      
      // Upload the client data ZIP
      await this.uploadFile(zipFilePath);
      
      // Send the functional medicine analysis prompt
      const prompt = this.getFunctionalMedicinePrompt(clientName);
      await this.sendMessage(prompt);
      
      // Wait for and extract Claude's response
      const analysis = await this.waitForResponse();
      
      return {
        success: true,
        analysis: analysis,
      };

    } catch (error) {
      console.error('❌ Claude Desktop automation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: {
          currentUrl: await this.page?.url(),
          pageTitle: await this.page?.title(),
        },
      };
    } finally {
      await this.cleanup();
    }
  }

  private getFunctionalMedicinePrompt(clientName: string): string {
    return `I've uploaded a comprehensive client data export for ${clientName}. This ZIP file contains:

1. **Client Information** - Demographics, health goals, medications, conditions
2. **Assessment Data** - Functional medicine questionnaire responses and scores  
3. **Clinical Documents** - Lab results, medical reports, images
4. **Practitioner Notes** - Interview notes, coaching sessions, observations
5. **Treatment Protocols** - Current supplements, dietary plans, lifestyle recommendations

Please provide a comprehensive functional medicine analysis including:

**1. CLIENT OVERVIEW**
- Current health status and primary concerns
- Key demographic and lifestyle factors

**2. PATTERN ANALYSIS**
- Assessment score patterns and significant findings
- Root cause analysis using functional medicine principles
- System dysfunction identification (digestive, hormonal, detox, etc.)

**3. DOCUMENT INSIGHTS**
- Lab value analysis and critical findings
- Medical document review and correlations
- Integration with assessment data

**4. CLINICAL NOTES SUMMARY**
- Practitioner observations and patient-reported symptoms
- Treatment history and responses
- Progress tracking and compliance notes

**5. FUNCTIONAL MEDICINE RECOMMENDATIONS**
- Priority interventions based on findings
- Targeted testing recommendations
- Supplement and lifestyle modifications
- Monitoring and follow-up protocols

Please make this analysis clinically actionable for a functional medicine practitioner, referencing specific data points from the uploaded files.`;
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up browser resources...');
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log('✅ Cleanup complete');
  }
}
