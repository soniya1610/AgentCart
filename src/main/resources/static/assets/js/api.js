/* ============================================
   API UTILITIES
   Reusable API Request Handler
   ============================================ */

// Backend Base URL Configuration
const API_BASE_URL = '/api';

/**
 * Make authenticated API requests
 * Automatically includes JWT token if available
 * @param {string} url - API endpoint (relative to API_BASE_URL)
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Parsed JSON response
 */
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Add JWT token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle response
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 
                           errorData.error || 
                           `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }

        throw new Error(errorMessage);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
        return {};
    }

    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}

/**
 * GET request
 */
async function apiGet(url) {
    return apiRequest(url, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(url, data) {
    return apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request
 */
async function apiPut(url, data) {
    return apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request
 */
async function apiDelete(url) {
    return apiRequest(url, { method: 'DELETE' });
}

/**
 * Patch request
 */
async function apiPatch(url, data) {
    return apiRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Build query parameters
 */
function buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }
    
    const queryPairs = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    
    return `?${queryPairs}`;
}

/**
 * Make API request with query parameters
 */
async function apiRequestWithParams(url, params = {}, options = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(url + queryString, options);
}

/* ============================================
   BATCH OPERATIONS
   ============================================ */

/**
 * Retry API request with exponential backoff
 */
async function apiRequestWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiRequest(url, options);
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Parallel API requests
 */
async function apiRequestAll(requests) {
    return Promise.all(
        requests.map(({ url, options = {} }) => apiRequest(url, options).catch(err => ({ error: err })))
    );
}

/* ============================================
   RESPONSE HANDLERS
   ============================================ */

/**
 * Handle common API errors
 */
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    } else if (error.message.includes('403')) {
        return 'You do not have permission to perform this action';
    } else if (error.message.includes('404')) {
        return 'Resource not found';
    } else if (error.message.includes('500')) {
        return 'Server error. Please try again later';
    }
    
    return error.message || 'An error occurred';
}

/**
 * Parse error response
 */
function parseErrorResponse(errorData) {
    if (typeof errorData === 'string') {
        return errorData;
    }
    
    if (errorData.message) {
        return errorData.message;
    }
    
    if (errorData.error) {
        return errorData.error;
    }
    
    if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors[0]?.message || 'An error occurred';
    }
    
    return 'An error occurred';
}
