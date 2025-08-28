// Clear invalid authentication state
console.log('🧹 Clearing authentication state...');

// Clear all auth data
localStorage.removeItem('token');
localStorage.removeItem('user');
sessionStorage.clear();

console.log('✅ Authentication state cleared');
console.log('🔄 Please refresh the page and log in again');

// Force redirect to login
window.location.href = '/auth/login';
