// Authentication utility functions

const TOKEN_KEY = 'auth_token';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Set auth token in localStorage
function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// Remove auth token from localStorage
function removeAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Logout user
function logout() {
    removeAuthToken();
    window.location.href = '/login.html';
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

// Protect routes - redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
    }
}

// Get user info from localStorage
function getUserInfo() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}
