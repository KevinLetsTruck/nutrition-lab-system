export default function TestBasicPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Basic Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
