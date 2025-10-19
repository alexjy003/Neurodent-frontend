// Razorpay payment service for appointment bookings

class PaymentService {
  constructor() {
    // Razorpay configuration
    this.razorpayKeyId = 'rzp_test_RVOOPqMxyaqcQR';
    this.appointmentFee = 50000; // ₹500 in paise (Razorpay uses smallest currency unit)
    
    // Load Razorpay script dynamically
    this.loadRazorpayScript();
  }

  // Load Razorpay SDK script
  loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  // Create payment order on backend
  async createPaymentOrder(appointmentData) {
    try {
      const API_BASE_URL = 'http://localhost:5000';
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('adminToken') || 
                   localStorage.getItem('doctorToken') || 
                   localStorage.getItem('pharmacistToken');
      
      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      console.log('📡 Making request to:', `${API_BASE_URL}/api/payments/create-order`);
      console.log('📝 Request data:', { amount: this.appointmentFee, currency: 'INR', appointmentData });
      
      const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: this.appointmentFee,
          currency: 'INR',
          appointmentData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  // Initialize Razorpay payment
  async initiatePayment(appointmentData, patientInfo) {
    try {
      // Ensure Razorpay script is loaded
      await this.loadRazorpayScript();

      // Create order on backend
      const orderData = await this.createPaymentOrder(appointmentData);

      return new Promise((resolve, reject) => {
        const options = {
          key: this.razorpayKeyId,
          amount: this.appointmentFee,
          currency: 'INR',
          name: 'Neurodent',
          description: 'Appointment Booking Fee',
          order_id: orderData.orderId,
          // image: '/assets/images/neurodent-logo.png', // Commenting out to avoid 404
          handler: async (response) => {
            try {
              // Verify payment on backend
              const verificationResult = await this.verifyPayment(response, appointmentData);
              resolve(verificationResult);
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: `${patientInfo.firstName} ${patientInfo.lastName}`,
            email: patientInfo.email,
            contact: patientInfo.phone || ''
          },
          notes: {
            appointmentId: appointmentData.appointmentId || 'new',
            doctorId: appointmentData.doctorId,
            patientId: patientInfo._id
          },
          theme: {
            color: '#3B82F6' // Your brand color
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          },
          retry: {
            enabled: true,
            max_count: 3
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  // Verify payment on backend and book appointment
  async verifyPayment(paymentResponse, appointmentData) {
    try {
      const API_BASE_URL = 'http://localhost:5000';
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('adminToken') || 
                   localStorage.getItem('doctorToken') || 
                   localStorage.getItem('pharmacistToken');
      
      console.log('🔍 Verifying payment with token:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          appointmentData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Format currency for display
  formatCurrency(amountInPaise) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amountInPaise / 100);
  }

  // Get appointment fee for display
  getAppointmentFee() {
    return this.formatCurrency(this.appointmentFee);
  }

  // Get appointment fee in paise
  getAppointmentFeeInPaise() {
    return this.appointmentFee;
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;