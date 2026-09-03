/* ============================================
   AUTHENTICATION UTILITIES
   JWT Token & User Management
   ============================================ */

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
}

/**
 * Get JWT token
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Get current user information
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role && user.role.toLowerCase() === 'admin';
}

/**
 * Require authentication
 * Redirects to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        showToast('Please login to continue', 'warning');
        setTimeout(() => navigateTo('login.html'), 1000);
        return false;
    }
    return true;
}

/**
 * Require admin role
 * Redirects to home if not admin
 */
function requireAdmin() {
    if (!isAdmin()) {
        showToast('Admin access required', 'error');
        setTimeout(() => navigateTo('index.html'), 1000);
        return false;
    }
    return true;
}

/**
 * Logout user
 * Clears token and user data
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
}

/**
 * Store user session
 */
function storeUserSession(token, user) {
    localStorage.setItem('token', token);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
}

/**
 * Clear user session
 */
function clearUserSession() {
    logout();
}

/**
 * Decode JWT token (basic decoding without verification)
 * IMPORTANT: This doesn't verify the token signature
 * Only use this to read claims on the client side
 */
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token) {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
        return true;
    }
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
}

/**
 * Get token expiration time
 */
function getTokenExpirationTime(token) {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
        return null;
    }
    
    return new Date(payload.exp * 1000);
}

/**
 * Validate token and redirect if expired
 */
function validateTokenAndRedirect() {
    const token = getToken();
    if (token && isTokenExpired(token)) {
        logout();
        showToast('Your session has expired. Please login again.', 'warning');
        navigateTo('login.html');
        return false;
    }
    return true;
}

/**
 * Refresh token if close to expiration
 * Call this periodically to keep session alive
 */
async function refreshTokenIfNeeded() {
    const token = getToken();
    if (!token) {
        return false;
    }
    
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
        return false;
    }
    
    const timeUntilExpiration = expirationTime - new Date();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    // If token expires in less than 5 minutes, try to refresh
    if (timeUntilExpiration < fiveMinutesInMs) {
        try {
            // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
            const response = await apiRequest('/api/auth/refresh-token', {
                method: 'POST'
            });
            
            if (response.token) {
                storeUserSession(response.token, response.user);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    }
    
    return true;
}

/**
 * Setup automatic token refresh
 * Checks every minute if token needs refreshing
 */
function setupTokenRefreshInterval() {
    setInterval(() => {
        if (isLoggedIn()) {
            refreshTokenIfNeeded();
        }
    }, 60000); // Check every minute
}

/**
 * Get authorization header
 */
function getAuthorizationHeader() {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
}

/**
 * Validate user credentials format
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    return password && password.length >= 6;
}

/**
 * Start session monitoring
 */
function startSessionMonitoring() {
    // Validate token on page load
    validateTokenAndRedirect();
    
    // Setup automatic token refresh
    setupTokenRefreshInterval();
    
    // Setup page visibility listener to refresh on tab focus
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isLoggedIn()) {
            refreshTokenIfNeeded();
        }
    });
}

// Start monitoring when script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (isLoggedIn()) {
            startSessionMonitoring();
        }
    });
}
