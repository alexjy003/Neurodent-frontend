import apiService from './api';

class AppointmentService {
  /**
   * Get available time slots for a doctor on a specific date
   * @param {string} doctorId - The doctor's ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} API response with available slots
   */
  async getDoctorAvailableSlots(doctorId, date) {
    try {
      console.log(`Fetching slots for doctor ${doctorId} on ${date}`);
      const response = await apiService.get(`/appointments/doctor/${doctorId}/slots/${date}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctor slots:', error);
      throw error;
    }
  }

  /**
   * Book an appointment with a doctor
   * @param {Object} appointmentData - Appointment booking data
   * @returns {Promise} API response with booking confirmation
   */
  async bookAppointment(appointmentData) {
    try {
      console.log('Booking appointment:', appointmentData);
      const response = await apiService.post('/appointments/book', appointmentData);
      return response;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  /**
   * Get patient's appointments
   * @param {Object} params - Query parameters (limit, status)
   * @returns {Promise} API response with patient's appointments
   */
  async getMyAppointments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/appointments/my-appointments${queryString ? `?${queryString}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   * @param {string} appointmentId - The appointment ID to cancel
   * @returns {Promise} API response with cancellation confirmation
   */
  async cancelAppointment(appointmentId) {
    try {
      console.log(`Cancelling appointment ${appointmentId}`);
      const response = await apiService.patch(`/appointments/cancel/${appointmentId}`);
      return response;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Reschedule an appointment
   * @param {string} appointmentId - The appointment ID to reschedule
   * @param {Object} rescheduleData - New appointment data
   * @returns {Promise} API response with reschedule confirmation
   */
  async rescheduleAppointment(appointmentId, rescheduleData) {
    try {
      console.log(`Rescheduling appointment ${appointmentId}:`, rescheduleData);
      const response = await apiService.patch(`/appointments/reschedule/${appointmentId}`, rescheduleData);
      return response;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Format date for API calls (YYYY-MM-DD)
   * @param {Date} date - JavaScript Date object
   * @returns {string} Formatted date string
   */
  formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get minimum bookable date (today if there's still time, otherwise tomorrow)
   * @returns {string} Today's or tomorrow's date in YYYY-MM-DD format
   */
  getMinBookingDate() {
    const now = new Date();
    // Allow same-day booking if current time is before 11 PM (giving 1 hour buffer)
    if (now.getHours() < 23) {
      return this.formatDateForAPI(now);
    } else {
      // If it's too late today, start from tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.formatDateForAPI(tomorrow);
    }
  }

  /**
   * Get maximum bookable date (30 days from now)
   * @returns {string} Max date in YYYY-MM-DD format
   */
  getMaxBookingDate() {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return this.formatDateForAPI(maxDate);
  }

  /**
   * Convert 12-hour time to 24-hour format
   * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM")
   * @returns {string} Time in 24-hour format (e.g., "14:30")
   */
  convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  /**
   * Convert 24-hour time to 12-hour format
   * @param {string} time24h - Time in 24-hour format (e.g., "14:30")
   * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
   */
  convertTo12Hour(time24h) {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDisplayDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Check if a date is in the past
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if date is in the past
   */
  isDateInPast(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj < today;
  }

  /**
   * Check if a date is within booking range
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if date is within booking range
   */
  isDateBookable(date) {
    const dateStr = typeof date === 'string' ? date : this.formatDateForAPI(date);
    const minDate = this.getMinBookingDate();
    const maxDate = this.getMaxBookingDate();
    return dateStr >= minDate && dateStr <= maxDate;
  }

  /**
   * Get time difference in hours between two times
   * @param {string} startTime - Start time in 24-hour format
   * @param {string} endTime - End time in 24-hour format
   * @returns {number} Duration in hours
   */
  getAppointmentDuration(startTime, endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return (endTotalMinutes - startTotalMinutes) / 60;
  }

  /**
   * Validate appointment booking data
   * @param {Object} data - Appointment data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateAppointmentData(data) {
    const errors = [];
    
    if (!data.doctorId) {
      errors.push('Doctor is required');
    }
    
    if (!data.appointmentDate) {
      errors.push('Appointment date is required');
    } else if (this.isDateInPast(data.appointmentDate)) {
      errors.push('Cannot book appointments for past dates');
    } else if (!this.isDateBookable(data.appointmentDate)) {
      errors.push('Appointment date must be within the next 30 days');
    }
    
    if (!data.startTime) {
      errors.push('Start time is required');
    }
    
    if (!data.endTime) {
      errors.push('End time is required');
    }
    
    if (data.startTime && data.endTime) {
      const duration = this.getAppointmentDuration(data.startTime, data.endTime);
      if (duration <= 0) {
        errors.push('End time must be after start time');
      }
      if (duration > 8) {
        errors.push('Appointment duration cannot exceed 8 hours');
      }
    }
    
    if (!data.slotType) {
      errors.push('Slot type is required');
    }
    
    if (data.symptoms && data.symptoms.length > 500) {
      errors.push('Symptoms description must be less than 500 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get appointment status color for UI
   * @param {string} status - Appointment status
   * @returns {string} CSS color class
   */
  getStatusColor(status) {
    const statusColors = {
      'scheduled': 'blue',
      'confirmed': 'green',
      'completed': 'gray',
      'cancelled': 'red'
    };
    return statusColors[status] || 'gray';
  }

  /**
   * Get slot type icon for UI
   * @param {string} slotType - Type of appointment slot
   * @returns {string} Icon name or emoji
   */
  getSlotTypeIcon(slotType) {
    const icons = {
      'Morning Consultations': '🌅',
      'Afternoon Procedures': '🌞',
      'Evening Consultations': '🌆',
      'Surgery': '🏥',
      'Emergency': '🚨',
      'Full Day Clinic': '📅',
      'Morning Session': '🌄',
      'Extended Afternoon': '☀️',
      'Short Afternoon': '🌤️',
      'Half Day': '⏰',
      'Weekend Morning': '🌻'
    };
    return icons[slotType] || '⏱️';
  }
}

export default new AppointmentService();