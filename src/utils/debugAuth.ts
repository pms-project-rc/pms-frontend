/**
 * Debugging utility for authentication issues
 * Paste this in browser console to diagnose problems
 */

export const debugAuth = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check localStorage
  const token = localStorage.getItem('pms_access_token');
  console.log('1. Token in localStorage:', token ? `✓ Found (${token.length} chars)` : '✗ Not found');
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('2. JWT Payload:', payload);
        console.log('   - user_id:', payload.user_id);
        console.log('   - username:', payload.username);
        console.log('   - role:', payload.role);
      } else {
        console.warn('2. Token is not a valid JWT (expected 3 parts, got', parts.length, ')');
      }
    } catch (e) {
      console.error('2. Failed to decode JWT:', e);
    }
  } else {
    console.log('2. Skipping JWT decode - no token found');
  }
  
  // Check Redux state (if available in window.__REDUX_DEVTOOLS__)
  console.log('3. Check Redux DevTools or look in React DevTools for auth state');
  
  console.log('=== QUICK CHECKS ===');
  console.log('✓ If token is found, user should be able to access /washer/dashboard');
  console.log('✓ If JWT payload has role="washer", ProtectedRoute should allow access');
  console.log('✓ If both above are true but you see login page, refresh and try again');
};

// Make it available globally in dev mode
if (import.meta.env.DEV) {
  (window as any).__debugAuth = debugAuth;
  console.log('🔍 DEBUG: Use window.__debugAuth() in console to check auth state');
}
