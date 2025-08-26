// Simple test app to verify Next.js is working
export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✅ Next.js is Working!</h1>
      <p>If you can see this, the server is running despite TypeScript errors.</p>
      <hr />
      <h2>Quick Status:</h2>
      <ul>
        <li>Server: Running</li>
        <li>TypeScript Errors: Ignored</li>
        <li>Database: {process.env.DATABASE_URL ? '✓ Configured' : '✗ Not configured'}</li>
      </ul>
    </div>
  );
}
