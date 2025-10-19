// Import configuration utility
import { API_BASE_URL } from '../utils/config.js';

// API_BASE_URL is now imported from config

console.log('🔧 API Service initialized with base URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.token = this.getToken();
  }

  getToken() {
    // Check for different token types based on context
    return localStorage.getItem('adminToken') ||
           localStorage.getItem('doctorToken') || 
           localStorage.getItem('pharmacistToken') || 
           localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setAdminToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  setDoctorToken(token) {
    this.token = token;
    localStorage.setItem('doctorToken', token);
  }

  setPharmacistToken(token) {
    this.token = token;
    localStorage.setItem('pharmacistToken', token);
  }

  removeToken() {
    this.token = null;
    // Clear all token types
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('pharmacistToken');
    
    // Clear all user data types
    localStorage.removeItem('user');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminTokenExpiry');
    localStorage.removeItem('doctorInfo');
    localStorage.removeItem('pharmacistData');
    localStorage.removeItem('patientInfo');
    
    // Clear session storage
    sessionStorage.clear();
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get the most current token
    const currentToken = this.getToken();
    
    const config = {
      headers: {
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
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
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { data, status: response.status }; // Preserve the response structure for error handling
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

  // Universal login that checks all user types
  async universalLogin(credentials) {
    const response = await this.request('/auth/universal-login', {
      method: 'POST',
      body: credentials,
    });
    
    // Set appropriate token and user info based on user type
    if (response.token && response.user) {
      switch (response.user.userType) {
        case 'admin':
          this.setAdminToken(response.token);
          // Set admin auth using the admin utilities
          localStorage.setItem('adminAuth', 'true');
          localStorage.setItem('adminUser', JSON.stringify(response.user));
          sessionStorage.setItem('adminSession', 'active');
          // Set session timeout (8 hours)
          const expirationTime = Date.now() + (8 * 60 * 60 * 1000);
          localStorage.setItem('adminTokenExpiry', expirationTime.toString());
          break;
        case 'doctor':
          this.setDoctorToken(response.token);
          // Set doctor info for DoctorProtectedRoute
          localStorage.setItem('doctorInfo', JSON.stringify(response.user));
          break;
        case 'pharmacist':
          this.setPharmacistToken(response.token);
          // Set pharmacist data for PharmacistProtectedRoute
          localStorage.setItem('pharmacistData', JSON.stringify(response.user));
          break;
        case 'patient':
        default:
          this.setToken(response.token);
          // Set patient info for regular auth context
          localStorage.setItem('user', JSON.stringify(response.user));
          break;
      }
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

  // Schedule Management Methods
  async getCurrentWeekSchedule() {
    return this.get('/schedules/current-week');
  }

  async getWeekSchedule(startDate) {
    return this.get(`/schedules/week/${startDate}`);
  }

  async updateWeekSchedule(scheduleData) {
    return this.put('/schedules/week', scheduleData);
  }

  async updateDaySchedule(day, scheduleData) {
    return this.put(`/schedules/day/${day}`, scheduleData);
  }

  async getScheduleHistory(page = 1, limit = 10) {
    return this.get(`/schedules/history?page=${page}&limit=${limit}`);
  }

  async deleteTimeSlot(day, slotId, weekStartDate = null) {
    const url = weekStartDate 
      ? `/schedules/slot/${day}/${slotId}?weekStartDate=${weekStartDate}`
      : `/schedules/slot/${day}/${slotId}`;
    return this.delete(url);
  }

  async deleteSchedule(scheduleId) {
    return this.delete(`/schedules/${scheduleId}`);
  }

  // Prescription Management Methods
  async getPrescriptions(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.patientId) queryParams.append('patientId', params.patientId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/prescriptions/doctor/my-prescriptions?${queryString}` : '/prescriptions/doctor/my-prescriptions';
    
    return this.get(endpoint);
  }

  async createPrescription(prescriptionData) {
    return this.post('/prescriptions', prescriptionData);
  }

  async generateAIPrescription(data) {
    return this.post('/prescriptions/generate-ai', data);
  }

  async getPrescriptionById(id) {
    return this.get(`/prescriptions/${id}`);
  }

  async updatePrescription(id, prescriptionData) {
    return this.put(`/prescriptions/${id}`, prescriptionData);
  }

  async deletePrescription(id) {
    return this.delete(`/prescriptions/${id}`);
  }

  async updatePrescriptionStatus(id, status) {
    return this.patch(`/prescriptions/${id}/status`, { status });
  }

  async downloadPrescriptionPDF(id) {
    const url = `${API_BASE_URL}/prescriptions/${id}/pdf`;
    const currentToken = this.getToken();
    
    const response = await fetch(url, {
      headers: {
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download prescription file');
    }

    // Handle both text and PDF responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/plain')) {
      return { data: await response.text(), type: 'text' };
    } else {
      return { data: await response.blob(), type: 'blob' };
    }
  }

  async sendPrescriptionToPharmacy(id) {
    return this.patch(`/prescriptions/${id}/send-to-pharmacy`);
  }
}

export default new ApiService();