const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class PharmacistAPIService {
  constructor() {
    this.token = localStorage.getItem('pharmacistToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('pharmacistToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
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

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/pharmacist-auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('pharmacistData', JSON.stringify(response.data.pharmacist));
      localStorage.setItem('userRole', 'pharmacist');
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/pharmacist-auth/profile');
  }

  logout() {
    this.removeToken();
    localStorage.removeItem('userRole');
    
    // Clear all localStorage data related to pharmacist
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('pharmacist')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.clear();
  }

  // Get stored pharmacist data
  getStoredPharmacistData() {
    const data = localStorage.getItem('pharmacistData');
    return data ? JSON.parse(data) : null;
  }

  // Check if pharmacist is authenticated
  isAuthenticated() {
    return !!this.token && !!this.getStoredPharmacistData();
  }
}

export default new PharmacistAPIService();