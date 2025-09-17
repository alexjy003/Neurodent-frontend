import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import DoctorSearch from './DoctorSearch';

const AppointmentManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Reschedule-specific state
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleError, setRescheduleError] = useState('');

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await appointmentService.getMyAppointments();
      
      if (response.success) {
        // Separate upcoming and past appointments based on current date and time
        const now = new Date();
        
        const upcoming = [];
        const past = [];
        
        response.appointments.forEach(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          
          // Parse the start time from timeRange (e.g., "3:00 PM - 5:00 PM")
          const startTimeStr = appointment.timeRange.split(' - ')[0].trim();
          
          // Convert 12-hour format to 24-hour for comparison
          const convertTo24Hour = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(n => parseInt(n));
            
            if (period === 'AM' && hours === 12) {
              hours = 0;
            } else if (period === 'PM' && hours !== 12) {
              hours += 12;
            }
            
            return { hours, minutes };
          };
          
          const { hours, minutes } = convertTo24Hour(startTimeStr);
          appointmentDate.setHours(hours, minutes, 0, 0);
          
          // Check if appointment is in the future and not completed/cancelled
          if (appointmentDate > now && appointment.status !== 'completed' && appointment.status !== 'cancelled') {
            upcoming.push(appointment);
          } else {
            past.push(appointment);
          }
        });
        
        setAppointments({ upcoming, past });
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setMessage('');
        setMessageType('');
        const response = await appointmentService.cancelAppointment(appointmentId);
        
        if (response.success) {
          setMessage('Appointment cancelled successfully');
          setMessageType('success');
          fetchAppointments(); // Refresh the list
        } else {
          setMessage(response.message || 'Failed to cancel appointment');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        
        // Extract error message from API response
        let errorMessage = 'Failed to cancel appointment. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
        setMessageType('error');
      }
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
    setRescheduleError('');
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const fetchAvailableSlotsForReschedule = async (date) => {
    try {
      setRescheduleLoading(true);
      setRescheduleError('');
      
      if (!selectedAppointment) return;
      
      // Use the doctorId from the appointment
      const doctorId = selectedAppointment.doctorId;
      
      if (!doctorId) {
        setRescheduleError('Doctor information not available. Please try booking a new appointment.');
        return;
      }
      
      const response = await appointmentService.getDoctorAvailableSlots(doctorId, date);
      
      if (response.success) {
        const availableOnly = response.availableSlots.filter(slot => slot.isAvailable);
        setAvailableSlots(availableOnly);
        
        if (availableOnly.length === 0) {
          setRescheduleError('No available slots for this doctor on the selected date. Please try another date.');
        }
      } else {
        setRescheduleError(response.message || 'Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots for reschedule:', error);
      setRescheduleError('This doctor has not scheduled availability for the selected date. Please try another date.');
      setAvailableSlots([]);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    if (date) {
      fetchAvailableSlotsForReschedule(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const confirmReschedule = async () => {
    if (!selectedSlot || !selectedDate) {
      setRescheduleError('Please select a date and time slot');
      return;
    }

    if (!selectedAppointment.id) {
      setRescheduleError('Appointment information not available. Please try refreshing the page.');
      return;
    }

    try {
      setRescheduleLoading(true);
      setRescheduleError('');
      
      const reschedulePayload = {
        newDate: selectedDate,
        newStartTime: selectedSlot.startTime24,
        newEndTime: selectedSlot.endTime24,
        newSlotType: selectedSlot.type
      };

      const response = await appointmentService.rescheduleAppointment(
        selectedAppointment.id,
        reschedulePayload
      );
      
      if (response.success) {
        setMessage('Appointment rescheduled successfully! A confirmation email has been sent.');
        setMessageType('success');
        closeModals();
        fetchAppointments();
      } else {
        setRescheduleError(response.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reschedule appointment. Please try again.';
      setRescheduleError(errorMessage);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const closeModals = () => {
    setShowBookingModal(false);
    setShowRescheduleModal(false);
    setShowDetailsModal(false);
    setSelectedAppointment(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
    setRescheduleError('');
    setMessage('');
    setMessageType('');
  };

  const onAppointmentBooked = () => {
    fetchAppointments();
    closeModals();
    setMessage('Appointment booked successfully!');
    setMessageType('success');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      completed: { color: 'bg-gray-100 text-gray-800', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get minimum date for rescheduling (tomorrow)
  const getMinRescheduleDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date for rescheduling (30 days from now)
  const getMaxRescheduleDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Appointments</h2>
            <p className="text-gray-600 mt-2 text-lg">Manage your dental appointments</p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
          >
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`rounded-lg p-6 ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="ml-3">
              <p className={`text-base font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage('')}
                className={`inline-flex rounded-md p-2 text-base ${
                  messageType === 'success' 
                    ? 'text-green-500 hover:bg-green-100' 
                    : 'text-red-500 hover:bg-red-100'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-12 px-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-6 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Appointments ({appointments.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-6 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'past'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Appointments ({appointments.past.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-6 text-lg">{error}</p>
              <button
                onClick={fetchAppointments}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : appointments[activeTab].length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8v4m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                No {activeTab} appointments
              </h3>
              <p className="text-gray-500 mb-6 text-lg">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : "You don't have any past appointments."}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {appointments[activeTab].map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-200 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {appointment.slotType}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-base text-gray-600">
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium text-gray-900">{appointment.doctorName}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8v4m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{appointment.timeRange}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{appointment.specialization}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Neurodent Clinic</span>
                          </div>
                          {appointment.symptoms && (
                            <div className="flex items-start">
                              <svg className="h-5 w-5 mr-3 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">{appointment.symptoms}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3 ml-8">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        View Details
                      </button>
                      
                      {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleRescheduleAppointment(appointment)}
                            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Book New Appointment</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DoctorSearch onAppointmentBooked={onAppointmentBooked} />
          </div>
        </div>
      )}

      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Reschedule Appointment</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Current Appointment</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Doctor: {selectedAppointment.doctorName}</div>
                <div>Date: {formatDate(selectedAppointment.appointmentDate)}</div>
                <div>Time: {selectedAppointment.timeRange}</div>
                <div>Type: {selectedAppointment.slotType}</div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinRescheduleDate()}
                  max={getMaxRescheduleDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Available Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  
                  {rescheduleLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : rescheduleError ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-4">{rescheduleError}</div>
                      <p className="text-sm text-gray-500">
                        Please select a different date or contact the clinic directly.
                      </p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No available slots found for this date.</p>
                      <p className="text-sm mt-2">Please try selecting another date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 text-left border rounded-lg transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                          <div className="text-sm text-gray-600">{slot.type}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {rescheduleError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 text-sm">{rescheduleError}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={closeModals} 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!selectedSlot || rescheduleLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Appointment Details</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <p className="text-base text-gray-900">{selectedAppointment.slotType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <p className="text-base text-gray-900">{selectedAppointment.doctorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <p className="text-base text-gray-900">
                  {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.timeRange}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div>{getStatusBadge(selectedAppointment.status)}</div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={closeModals} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;