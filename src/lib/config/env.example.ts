/**
 * Example usage of the Environment Configuration system
 */

import { env } from './env';

// Example 1: Get an optional environment variable
const apiKey = env.get('ANTHROPIC_API_KEY');
if (apiKey) {
  console.log('API key is configured');
}

// Example 2: Get a required environment variable (throws if not set)
try {
  const supabaseUrl = env.getOrThrow('NEXT_PUBLIC_SUPABASE_URL');
  console.log('Supabase URL:', supabaseUrl);
} catch (error) {
  console.error('Required environment variable missing:', error);
}

// Example 3: Check if variable exists
if (env.has('OPENAI_API_KEY')) {
  console.log('OpenAI is configured');
}

// Example 4: Debug environment (safe for logging)
env.debug();

// Example 5: Validate required variables
// const required = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
// const missing = env.validateRequired(required as (keyof EnvironmentVariables)[]);
// if (missing.length > 0) {
//   console.error('Missing required environment variables:', missing);
// }

// Example 6: Get environment status for health checks
const status = env.getStatus();
console.log('Environment status:', status);

// Example 7: Environment-specific logic
if (env.isProduction()) {
  console.log('Running in production mode');
} else if (env.isDevelopment()) {
  console.log('Running in development mode');
}

// Example 8: Get port with fallback
const port = env.getPort();
console.log(`Server will run on port: ${port}`);