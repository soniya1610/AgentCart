/* ============================================
   COMMON UTILITIES
   Navbar, Navigation, & Shared Functions
   ============================================ */

/**
 * Render Navigation Bar
 * Dynamic content based on authentication status
 */
function renderNavbar() {
    const navElement = document.getElementById('navbar');
    if (!navElement) return;

    const isAuth = isLoggedIn();
    const user = getCurrentUser();
    const cartItems = getCartItemCount();
    const currentTheme = localStorage.getItem('theme') || 'system';

    const navbarHTML = `
        <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
            <a href="index.html" class="navbar-brand">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M7 4V3c0-.5.5-1 1-1h8c.5 0 1 .5 1 1v1h4.5a.5.5 0 0 1 0 1h-.5l-.5 14c0 1-1 2-2 2H5c-1 0-2-1-2-2l-.5-14h-.5a.5.5 0 0 1 0-1H7z"/>
                </svg>
                AgentCart
            </a>

            <ul class="navbar-nav" id="navbar-menu">
                <li><a href="index.html">Home</a></li>
                <li><a href="products.html">Products</a></li>
                ${isAuth ? `
                    <li><a href="negotiation.html">Negotiations</a></li>
                    <li><a href="orders.html">Orders</a></li>
                ` : ''}
            </ul>

            <div class="navbar-end">
                ${isAuth ? `
                    <div class="navbar-icon" id="cart-icon" onclick="navigateTo('cart.html')" title="Shopping Cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span id="cartBadge" style="display: ${cartItems > 0 ? 'flex' : 'none'};">${cartItems}</span>
                    </div>
                ` : ''}

                <button class="navbar-icon theme-toggle" id="theme-btn" title="Toggle Theme">
                    <svg viewBox="0 0 24 24" fill="currentColor" style="display: ${currentTheme === 'dark' ? 'block' : 'none'}">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: ${currentTheme === 'dark' ? 'none' : 'block'}">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </button>

                <button class="hamburger" id="hamburger-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                ${isAuth ? `
                    <a href="profile.html" class="navbar-icon" title="Profile">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                    ${user?.role?.toLowerCase() === 'admin' ? `
                        <a href="admin.html" class="navbar-icon" title="Admin">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 6V4m0 2a2 2 0 100 4 2 2 0 000-4z"></path>
                                <path d="M8 20h8M6 16h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2z"></path>
                            </svg>
                        </a>
                    ` : ''}
                    <button class="navbar-icon" onclick="handleLogout()" title="Logout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                ` : `
                    <a href="login.html" class="btn btn-primary" style="margin-right: var(--spacing-md);">Login</a>
                    <a href="register.html" class="btn btn-secondary">Register</a>
                `}
            </div>
        </div>
    `;

    navElement.innerHTML = navbarHTML;
    setupNavbarListeners();
    setupThemeToggle();
    updateCartBadge();
}

/**
 * Setup navbar event listeners
 */
function setupNavbarListeners() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('navbar-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('mobile-open');
        });

        // Close menu when link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav')) {
                navMenu.classList.remove('mobile-open');
            }
        });
    }
}

/**
 * Setup theme toggle
 */
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'system';
        let newTheme;

        if (currentTheme === 'light') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'system';
        } else {
            newTheme = 'light';
        }

        setTheme(newTheme);
    });
}

/**
 * Set theme (light, dark, or system)
 */
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }

    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

/**
 * Initialize theme on page load
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const theme = localStorage.getItem('theme') || 'system';
        if (theme === 'system') {
            applyTheme('system');
        }
    });
}

/* ============================================
   NAVIGATION & ROUTING
   ============================================ */

/**
 * Navigate to a different page
 */
function navigateTo(page) {
    window.location.href = page;
}

/**
 * Navigate with parameters (for product details)
 */
function navigateWithParams(page, params) {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = `${page}?${queryString}`;
}

/**
 * Get URL parameter by name
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Get all URL parameters as object
 */
function getUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const typeLabels = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${typeLabels[type] || 'Notification'}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => removeToast(toastId), duration);
    }
}

/**
 * Remove toast notification
 */
function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format price with currency
 */
function formatPrice(amount) {
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
}

/**
 * Format date
 */
function formatDate(dateString, locale = 'en-IN') {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

/**
 * Format date and time
 */
function formatDateTime(dateString, locale = 'en-IN') {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

/**
 * Debounce function
 */
function debounce(func, delay = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success', 2000);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
}

/**
 * Get cart item count
 */
function getCartItemCount() {
    try {
        const cart = localStorage.getItem('cart');
        if (!cart) return 0;
        const items = JSON.parse(cart);
        return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } catch {
        return 0;
    }
}

/**
 * Update cart badge in navbar
 */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCartItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
        showToast('Logged out successfully', 'success');
        setTimeout(() => navigateTo('index.html'), 500);
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeTheme();
    });
}
