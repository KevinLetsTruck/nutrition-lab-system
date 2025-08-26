// This script creates an HTML page that clears authentication tokens from localStorage

const fs = require("fs");
const path = require("path");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clear Auth Tokens - FNTP Nutrition System</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a1628;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #1a202c;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            text-align: center;
        }
        h1 {
            color: #4ade80;
            margin-bottom: 1rem;
        }
        .status {
            margin: 1.5rem 0;
            padding: 1rem;
            border-radius: 4px;
            background-color: #374151;
        }
        .success {
            background-color: #065f46;
            color: #34d399;
        }
        .error {
            background-color: #7f1d1d;
            color: #f87171;
        }
        button {
            background-color: #4ade80;
            color: #0a1628;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 0.5rem;
        }
        button:hover {
            background-color: #22c55e;
        }
        .info {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Fix JWT Authentication</h1>
        
        <div id="status" class="status">
            Click the button below to clear your authentication tokens and fix the JWT error.
        </div>
        
        <button onclick="clearAuth()">Clear Auth Tokens</button>
        <button onclick="goToLogin()">Go to Login</button>
        
        <div class="info">
            <p>This will clear your stored authentication data and allow you to log in with the new JWT configuration.</p>
        </div>
    </div>

    <script>
        function clearAuth() {
            try {
                // Clear all auth-related items from localStorage
                const keysToRemove = ['token', 'user', 'auth', 'jwt'];
                let removedCount = 0;
                
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (keysToRemove.some(k => key && key.toLowerCase().includes(k))) {
                        console.log('Removing:', key);
                        localStorage.removeItem(key);
                        removedCount++;
                    }
                }
                
                // Also clear sessionStorage
                for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const key = sessionStorage.key(i);
                    if (keysToRemove.some(k => key && key.toLowerCase().includes(k))) {
                        console.log('Removing from session:', key);
                        sessionStorage.removeItem(key);
                        removedCount++;
                    }
                }
                
                document.getElementById('status').className = 'status success';
                document.getElementById('status').innerHTML = 
                    '✅ Success! Cleared ' + removedCount + ' authentication tokens.<br>' +
                    'You can now log in again with your credentials.';
                    
            } catch (error) {
                document.getElementById('status').className = 'status error';
                document.getElementById('status').innerHTML = 
                    '❌ Error: ' + error.message;
            }
        }
        
        function goToLogin() {
            // Determine the correct port
            const port = window.location.port || '3000';
            window.location.href = 'http://localhost:' + port + '/login';
        }
    </script>
</body>
</html>`;

const outputPath = path.join(process.cwd(), "public", "clear-auth.html");

// Ensure public directory exists
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the HTML file
fs.writeFileSync(outputPath, htmlContent);

console.log("✅ Created auth clearing page at: public/clear-auth.html");
console.log("\n📝 Instructions:");
console.log("   1. Open http://localhost:3001/clear-auth.html in your browser");
console.log('   2. Click "Clear Auth Tokens"');
console.log('   3. Click "Go to Login" to log in again');
console.log('\n💡 This will fix the JWT "invalid signature" errors.');
