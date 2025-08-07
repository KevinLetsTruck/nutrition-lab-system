/**
 * AI Service Environment Configuration Checker
 * 
 * Validates that required API keys are properly configured
 * and provides helpful warnings during startup.
 */

export interface AIEnvironmentStatus {
  anthropic: {
    present: boolean;
    valid: boolean;
    message: string;
  };
  openai: {
    present: boolean;
    valid: boolean;
    message: string;
  };
  isConfigured: boolean;
  warnings: string[];
}

/**
 * Checks if the AI service environment is properly configured
 * 
 * @returns Status of each provider's configuration
 */
export function checkAIEnvironment(): AIEnvironmentStatus {
  const status: AIEnvironmentStatus = {
    anthropic: {
      present: false,
      valid: false,
      message: ''
    },
    openai: {
      present: false,
      valid: false,
      message: ''
    },
    isConfigured: false,
    warnings: []
  };

  // Check Anthropic API key (check process.env directly for real-time values)
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  
  if (!anthropicKey) {
    status.anthropic.message = 'ANTHROPIC_API_KEY not found in environment';
    status.warnings.push('⚠️  Anthropic API key not configured. Claude AI features will be unavailable.');
  } else {
    status.anthropic.present = true;
    
    if (anthropicKey.startsWith('sk-ant-')) {
      status.anthropic.valid = true;
      status.anthropic.message = 'Valid Anthropic API key format detected';
    } else {
      status.anthropic.message = 'Invalid format - should start with "sk-ant-"';
      status.warnings.push('⚠️  Anthropic API key has invalid format. Expected to start with "sk-ant-".');
    }
  }

  // Check OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    status.openai.message = 'OPENAI_API_KEY not found in environment';
    status.warnings.push('⚠️  OpenAI API key not configured. GPT features and Whisper transcription will be unavailable.');
  } else {
    status.openai.present = true;
    
    if (openaiKey.startsWith('sk-')) {
      status.openai.valid = true;
      status.openai.message = 'Valid OpenAI API key format detected';
    } else {
      status.openai.message = 'Invalid format - should start with "sk-"';
      status.warnings.push('⚠️  OpenAI API key has invalid format. Expected to start with "sk-".');
    }
  }

  // Determine overall configuration status
  status.isConfigured = status.anthropic.valid || status.openai.valid;

  // Add general warning if no providers are configured
  if (!status.isConfigured) {
    status.warnings.push('❌ No AI providers are properly configured. The service will only use the Mock provider.');
  }

  return status;
}

/**
 * Logs environment check results to the console
 * 
 * @param status - The environment status to log
 */
export function logEnvironmentStatus(status: AIEnvironmentStatus): void {
  console.log('\n🔍 AI Service Environment Check:');
  console.log('================================');
  
  // Anthropic status
  console.log('\n📘 Anthropic (Claude):');
  console.log(`   Present: ${status.anthropic.present ? '✅' : '❌'}`);
  console.log(`   Valid:   ${status.anthropic.valid ? '✅' : '❌'}`);
  console.log(`   Status:  ${status.anthropic.message}`);
  
  // OpenAI status
  console.log('\n📗 OpenAI (GPT):');
  console.log(`   Present: ${status.openai.present ? '✅' : '❌'}`);
  console.log(`   Valid:   ${status.openai.valid ? '✅' : '❌'}`);
  console.log(`   Status:  ${status.openai.message}`);
  
  // Warnings
  if (status.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    status.warnings.forEach(warning => {
      console.log(`   ${warning}`);
    });
  } else {
    console.log('\n✅ All AI providers are properly configured!');
  }
  
  console.log('\n================================\n');
}

/**
 * Performs a complete environment check and logs the results
 * 
 * @returns The environment status
 */
export function checkAndLogAIEnvironment(): AIEnvironmentStatus {
  const status = checkAIEnvironment();
  logEnvironmentStatus(status);
  return status;
}

// Helper function to mask API keys for safe logging
export function maskApiKey(key: string | undefined): string {
  if (!key) return '<not set>';
  if (key.length < 10) return '<invalid>';
  
  const prefix = key.substring(0, 7);
  const suffix = key.substring(key.length - 4);
  return `${prefix}...${suffix}`;
}

/**
 * Gets a summary of configured providers
 * 
 * @returns Array of configured provider names
 */
export function getConfiguredProviders(): string[] {
  const providers: string[] = [];
  const status = checkAIEnvironment();
  
  if (status.anthropic.valid) {
    providers.push('anthropic');
  }
  
  if (status.openai.valid) {
    providers.push('openai');
  }
  
  // Mock is always available
  providers.push('mock');
  
  return providers;
}