import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    environment: {
      status: boolean;
      missing: string[];
    };
    database: {
      status: boolean;
      error?: string;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  
  // Initialize health check response
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    checks: {
      environment: {
        status: true,
        missing: []
      },
      database: {
        status: true
      }
    }
  };

  // Check required environment variables directly
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY
  };

  const missingEnvVars: string[] = [];
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingEnvVars.push(key);
    }
  }
  
  if (missingEnvVars.length > 0) {
    healthCheck.checks.environment.status = false;
    healthCheck.checks.environment.missing = missingEnvVars;
    healthCheck.status = 'unhealthy';
  }

  // Test database connection
  try {
    // Simple query to test connection
    const { error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (error) {
      healthCheck.checks.database.status = false;
      healthCheck.checks.database.error = error.message;
      healthCheck.status = 'unhealthy';
    }
  } catch (error) {
    healthCheck.checks.database.status = false;
    healthCheck.checks.database.error = error instanceof Error ? error.message : 'Unknown database error';
    healthCheck.status = 'unhealthy';
  }

  // Add response time
  const responseTime = Date.now() - startTime;
  
  // Set appropriate status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  
  // Return response with no-cache headers
  return NextResponse.json(
    {
      ...healthCheck,
      responseTime: `${responseTime}ms`
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    }
  );
}