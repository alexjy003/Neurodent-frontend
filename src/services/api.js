const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    // Only set Content-Type for non-FormData requests
    if (!(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      
      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.response = { data }; // Preserve the response structure for error handling
      throw error;
    }

    return data;
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, body, options = {}) {
    const config = { method: 'POST', ...options };
    
    // Handle FormData differently - don't set Content-Type for FormData
    if (body instanceof FormData) {
      config.body = body;
      // Remove Content-Type header for FormData to let browser set it with boundary
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.body = body;
    }
    
    return this.request(endpoint, config);
  }

  async put(endpoint, body, options = {}) {
    const config = { method: 'PUT', ...options };
    
    // Handle FormData differently - don't set Content-Type for FormData
    if (body instanceof FormData) {
      config.body = body;
      // Remove Content-Type header for FormData to let browser set it with boundary
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.body = body;
    }
    
    return this.request(endpoint, config);
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body, ...options });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Auth methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.removeToken();

    // Clear all localStorage data related to the app
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('email_verified_') || key.includes('neurodent'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.clear();
  }

  getGoogleAuthUrl() {
    // Add timestamp to force fresh OAuth flow
    const timestamp = Date.now();
    return `${API_BASE_URL}/auth/google?t=${timestamp}`;
  }

  getGoogleSignupUrl() {
    // Add timestamp to force fresh OAuth flow
    const timestamp = Date.now();
    return `${API_BASE_URL}/auth/google/signup?t=${timestamp}`;
  }

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send password reset email');
    }

    return data;
  }

  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  }

  async sendVerificationOTP(email, firstName) {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, firstName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }

    return data;
  }

  async verifyEmailOTP(email, otp) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify email');
    }

    return data;
  }

  async verifyPasswordResetOTP(email, otp) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-password-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify reset code');
    }

    return data;
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-with-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  }
}

export default new ApiService();