/**
 * Schedule Management Utilities
 * Handles time formatting, schedule validation, and data transformations
 */

export const timeUtils = {
  /**
   * Convert 24-hour time to 12-hour format
   * @param {string} time24 - Time in HH:MM format
   * @returns {string} Time in 12-hour format with AM/PM
   */
  formatTo12Hour: (time24) => {
    if (!time24 || typeof time24 !== 'string') return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    if (isNaN(hour) || isNaN(minute)) return time24;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  },

  /**
   * Convert 12-hour time to 24-hour format
   * @param {string} time12 - Time in 12-hour format with AM/PM
   * @returns {string} Time in HH:MM format
   */
  formatTo24Hour: (time12) => {
    if (!time12 || typeof time12 !== 'string') return '';
    
    // Handle already 24-hour format
    if (time12.match(/^\d{1,2}:\d{2}$/) && !time12.includes('AM') && !time12.includes('PM')) {
      return time12;
    }
    
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = time12.trim().match(timeRegex);
    
    if (!match) return time12;
    
    const [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate duration between two times in hours
   * @param {string} startTime - Start time in HH:MM format
   * @param {string} endTime - End time in HH:MM format
   * @returns {number} Duration in hours (decimal)
   */
  calculateDuration: (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  },

  /**
   * Validate time format (HH:MM)
   * @param {string} time - Time string to validate
   * @returns {boolean} True if valid
   */
  isValidTime: (time) => {
    if (!time || typeof time !== 'string') return false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  /**
   * Check if start time is before end time
   * @param {string} startTime - Start time in HH:MM format
   * @param {string} endTime - End time in HH:MM format
   * @returns {boolean} True if start is before end
   */
  isStartBeforeEnd: (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    return start < end;
  },

  /**
   * Validate if time is within business hours (9 AM to 8 PM)
   * @param {string} time - Time in HH:MM format
   * @returns {boolean} True if within business hours
   */
  isWithinBusinessHours: (time) => {
    if (!time || typeof time !== 'string') return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    // 9:00 AM to 8:00 PM (09:00 to 20:00)
    return hours >= 9 && hours < 20;
  },

  /**
   * Validate if end time is not after 8 PM
   * @param {string} time - Time in HH:MM format
   * @returns {boolean} True if not after 8 PM
   */
  isNotAfter8PM: (time) => {
    if (!time || typeof time !== 'string') return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    // Allow up to 20:00 (8:00 PM) but not beyond
    return hours < 20 || (hours === 20 && minutes === 0);
  },

  /**
   * Get business hours time options for dropdowns (9 AM to 8 PM)
   * @returns {Array} Array of time strings in 12-hour format
   */
  getBusinessHours: () => {
    const times = [];
    
    // Generate times from 9 AM to 8 PM in 30-minute intervals
    for (let hour = 9; hour <= 20; hour++) {
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      
      // Add on the hour
      times.push(`${hour12}:00 ${period}`);
      
      // Add 30 minutes past the hour (except for 8 PM)
      if (hour < 20) {
        times.push(`${hour12}:30 ${period}`);
      }
    }
    
    return times;
  }
};

export const scheduleUtils = {
  /**
   * Get the start date of the current week (Monday)
   * @returns {Date} Monday of current week
   */
  getCurrentWeekStart: () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(today); // Create new date object
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0); // Set to start of day
    return weekStart;
  },

  /**
   * Get formatted week range string
   * @param {Date} startDate - Week start date
   * @returns {string} Formatted week range
   */
  getWeekRange: (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  },

  /**
   * Get formatted date for API calls
   * @param {Date} date - Date to format
   * @returns {string} Date in YYYY-MM-DD format
   */
  formatDateForAPI: (date) => {
    return date.toISOString().split('T')[0];
  },

  /**
   * Calculate total hours for a weekly schedule
   * @param {Object} weeklySchedule - Schedule object with daily slots
   * @returns {number} Total hours for the week
   */
  calculateTotalWeekHours: (weeklySchedule) => {
    if (!weeklySchedule || typeof weeklySchedule !== 'object') return 0;
    
    let totalHours = 0;
    
    Object.values(weeklySchedule).forEach(daySlots => {
      if (Array.isArray(daySlots)) {
        daySlots.forEach(slot => {
          if (slot.startTime && slot.endTime) {
            totalHours += timeUtils.calculateDuration(slot.startTime, slot.endTime);
          }
        });
      }
    });
    
    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Validate a schedule slot
   * @param {Object} slot - Schedule slot object
   * @returns {Object} Validation result with isValid and errors
   */
  validateSlot: (slot) => {
    const errors = [];
    
    if (!slot.startTime || !timeUtils.isValidTime(slot.startTime)) {
      errors.push('Invalid start time format');
    }
    
    if (!slot.endTime || !timeUtils.isValidTime(slot.endTime)) {
      errors.push('Invalid end time format');
    }
    
    if (slot.startTime && slot.endTime && !timeUtils.isStartBeforeEnd(slot.startTime, slot.endTime)) {
      errors.push('Start time must be before end time');
    }
    
    if (!slot.type || typeof slot.type !== 'string') {
      errors.push('Schedule type is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get default schedule types
   * @returns {Array} Array of schedule type options
   */
  getScheduleTypes: () => [
    'Morning Consultations',
    'Afternoon Procedures',
    'Evening Consultations',
    'Surgery',
    'Emergency',
    'Full Day Clinic',
    'Morning Session',
    'Extended Afternoon',
    'Short Afternoon',
    'Half Day',
    'Weekend Morning',
    'Day Off'
  ],

  /**
   * Get days of the week
   * @returns {Array} Array of day names
   */
  getDaysOfWeek: () => [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ],

  /**
   * Create empty weekly schedule structure
   * @returns {Object} Empty weekly schedule
   */
  createEmptyWeeklySchedule: () => ({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  })
};

export const apiUtils = {
  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - API error object
   * @returns {string} User-friendly error message
   */
  handleScheduleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  },

  /**
   * Format schedule data for API submission
   * @param {Object} scheduleData - Raw schedule data
   * @returns {Object} Formatted data for API
   */
  formatScheduleForAPI: (scheduleData) => {
    const formatted = {
      weekStartDate: scheduleUtils.formatDateForAPI(scheduleData.weekStartDate),
      weeklySchedule: {},
      notes: scheduleData.notes || ''
    };
    
    // Convert 12-hour times to 24-hour format for API
    Object.keys(scheduleData.weeklySchedule).forEach(day => {
      formatted.weeklySchedule[day] = scheduleData.weeklySchedule[day].map(slot => ({
        startTime: slot.startTime.includes('AM') || slot.startTime.includes('PM') 
          ? timeUtils.formatTo24Hour(slot.startTime) 
          : slot.startTime,
        endTime: slot.endTime.includes('AM') || slot.endTime.includes('PM') 
          ? timeUtils.formatTo24Hour(slot.endTime) 
          : slot.endTime,
        type: slot.type,
        notes: slot.notes || ''
      }));
    });
    
    return formatted;
  }
};

export default {
  timeUtils,
  scheduleUtils,
  apiUtils
};
