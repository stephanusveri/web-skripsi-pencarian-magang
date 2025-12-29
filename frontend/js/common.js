// common.js
const API_URL = 'http://localhost:5000/api';

// ========================================
// AUTH HELPERS
// ========================================

function checkAuth(requiredRole = null) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = getLoginUrl();
        return null;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        window.location.href = getLoginUrl();
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        alert('Anda tidak memiliki akses ke halaman ini');
        logout();
        return null;
    }

    return user;
}

/**
 * Get login URL based on current location
 */
function getLoginUrl() {
    const path = window.location.pathname;
    if (path.includes('/admin/') || path.includes('/mahasiswa/') || path.includes('/perusahaan/')) {
        return '../login.html';
    }
    return '/login.html';
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = getLoginUrl();
}

/**
 * Get current user
 */
function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user:', error);
        return null;
    }
}

/**
 * Get auth token
 */
function getToken() {
    return localStorage.getItem('token');
}

// ========================================
// API HELPERS
// ========================================

async function apiCall(endpoint, options = {}) {
    const token = getToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                logout();
                return null;
            }
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * GET request
 */
async function apiGet(endpoint) {
    return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(endpoint, data) {
    return apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request
 */
async function apiPut(endpoint, data) {
    return apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request
 */
async function apiDelete(endpoint) {
    return apiCall(endpoint, { method: 'DELETE' });
}

// ========================================
// UI HELPERS
// ========================================

/**
 * Show loading indicator
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        `;
    }
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Show success toast
 */
function showToast(message, type = 'success') {
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-gray-500';

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Confirm dialog
 */
function confirmDialog(message) {
    return confirm(message);
}

// ========================================
// FORMAT HELPERS
// ========================================

/**
 * Format date to Indonesian locale
 */
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

/**
 * Format date for input[type="date"]
 */
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Get status badge class
 */
function getStatusClass(status) {
    const classes = {
        'PENDING': 'bg-yellow-100 text-yellow-700',
        'DITERIMA': 'bg-green-100 text-green-700',
        'DITOLAK': 'bg-red-100 text-red-700',
        'BUKA': 'bg-green-100 text-green-700',
        'TUTUP': 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
}

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Validate email
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate required field
 */
function isRequired(value) {
    return value && value.trim() !== '';
}

// ========================================
// NAVBAR HELPER
// ========================================

/**
 * Setup logout button
 */
function setupLogoutButton(buttonId = 'logout-btn') {
    const logoutBtn = document.getElementById(buttonId);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// ========================================
// INIT
// ========================================

/**
 * Initialize common functionalities
 * Call this at the end of every page
 */
function initCommon(requiredRole = null) {
    // Check auth
    const user = checkAuth(requiredRole);

    // Setup logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout)
    }

    return user;
}