// Authentication utility functions

/**
 * Store authentication token in both localStorage and cookies
 * @param {string} token - JWT token to store
 * @param {number} expirationHours - Hours until token expires (default: 24)
 */
export const storeAuthToken = (token, expirationHours = 24) => {
  if (!token || token === 'null' || token === 'undefined') {
    console.warn('Invalid token provided to storeAuthToken');
    return;
  }

  // Store in localStorage
  localStorage.setItem('tokenlogin', token);
  // Store in cookies with expiration
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + (expirationHours * 60 * 60 * 1000));
  
  // Use Secure flag only in production (HTTPS)
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? '; Secure' : '';
  
  document.cookie = `tokenlogin=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
  
  console.log('Token stored in localStorage and cookies');
};

/**
 * Get authentication token from localStorage or cookies
 * @returns {string|null} - The authentication token or null if not found
 */
export const getAuthToken = () => {
  // Try localStorage first
  const tokenFromStorage = localStorage.getItem('tokenlogin');
  if (tokenFromStorage) {
    return tokenFromStorage;
  }

  // Fallback to cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'tokenlogin') {
      return value;
    }
  }

  return null;
};

/**
 * Remove authentication token from both localStorage and cookies
 */
export const clearAuthToken = () => {
  // Remove from localStorage
  localStorage.removeItem('tokenlogin');
  localStorage.removeItem('token'); // Remove old token key if exists

  // Remove from cookies by setting expiration to past
  document.cookie = 'tokenlogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  
  console.log('Token cleared from localStorage and cookies');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get headers for authenticated API requests
 * Includes both Authorization header and ensures credentials are sent
 * @returns {object} - Headers object for fetch requests
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
