import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const AppointmentBookingModal = ({ isOpen, onClose, doctor, onSuccess }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Reset modal state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

  const resetModal = () => {
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSymptoms('');
    setMessage('');
    setMessageType('');
    setLoading(false);
    setLoadingSlots(false);
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setMessage('');
      setSelectedSlot(null);
      
      const response = await appointmentService.getDoctorAvailableSlots(doctor._id, selectedDate);
      
      if (response.success) {
        setAvailableSlots(response.availableSlots);
        
        if (response.availableSlots.length === 0) {
          setMessage('Time slots not scheduled by the doctor');
          setMessageType('info');
        } else {
          const availableCount = response.availableSlots.filter(slot => slot.isAvailable).length;
          if (availableCount === 0) {
            setMessage('All time slots are booked for this date');
            setMessageType('warning');
          }
        }
      } else {
        setMessage(response.message || 'Time slots not scheduled by the doctor');
        setMessageType('info');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      
      if (error.response?.status === 401) {
        setMessage('Please log in to book appointments');
        setMessageType('error');
      } else {
        setMessage('Error fetching available slots. Please try again.');
        setMessageType('error');
      }
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setMessage('');
    }
  };

  const handlePaymentAndBooking = async () => {
    if (!selectedSlot) {
      setMessage('Please select a time slot');
      setMessageType('error');
      return;
    }

    // Validate symptoms length
    if (symptoms.length > 500) {
      setMessage('Symptoms description must be less than 500 characters');
      setMessageType('error');
      return;
    }

    if (!user) {
      setMessage('Please log in to book appointments');
      setMessageType('error');
      return;
    }

    try {
      setPaymentProcessing(true);
      setMessage('');

      const appointmentData = {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime24,
        endTime: selectedSlot.endTime24,
        slotType: selectedSlot.type,
        symptoms: symptoms.trim()
      };

      // Validate appointment data
      const validation = appointmentService.validateAppointmentData(appointmentData);
      if (!validation.isValid) {
        setMessage(validation.errors[0]);
        setMessageType('error');
        return;
      }

      // Initiate Razorpay payment
      setMessage('Redirecting to payment gateway...');
      setMessageType('info');

      const paymentResult = await paymentService.initiatePayment(appointmentData, user);

      if (paymentResult.success) {
        setMessage('Payment successful! Appointment booked successfully!');
        setMessageType('success');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess && onSuccess(paymentResult.appointment);
          onClose();
        }, 1500);
      } else {
        setMessage(paymentResult.message || 'Payment failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error processing payment and booking:', error);
      
      if (error.message === 'Payment cancelled by user') {
        setMessage('Payment was cancelled. Please try again if you want to book the appointment.');
        setMessageType('warning');
      } else if (error.message === 'Failed to load Razorpay SDK') {
        setMessage('Payment gateway not available. Please try again later.');
        setMessageType('error');
      } else {
        setMessage('Error processing payment. Please try again.');
        setMessageType('error');
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Doctor Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {doctor?.firstName?.[0]}{doctor?.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{doctor?.specialization}</p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
                setMessage('');
              }}
              min={appointmentService.getMinBookingDate()}
              max={appointmentService.getMaxBookingDate()}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {selectedDate && (
              <p className="text-xs text-gray-500 mt-1">
                {appointmentService.formatDisplayDate(selectedDate)}
              </p>
            )}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading slots...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.isAvailable || loading}
                      className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : slot.isAvailable
                          ? 'hover:bg-gray-50 bg-white'
                          : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">
                              {appointmentService.getSlotTypeIcon(slot.type)}
                            </span>
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-xs text-gray-600">{slot.type}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            slot.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No time slots available</p>
                </div>
              )}
            </div>
          )}

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms or Reason for Visit (Optional)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms or reason for the appointment..."
              rows="3"
              maxLength="500"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Optional field</span>
              <span>{symptoms.length}/500</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-3 rounded-md border ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : messageType === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : messageType === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Payment Info */}
          {selectedSlot && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Appointment Fee</h4>
                  <p className="text-sm text-green-600">Consultation charges</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-800">{paymentService.getAppointmentFee()}</p>
                  <p className="text-xs text-green-600">Secure payment via Razorpay</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading || paymentProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentAndBooking}
              disabled={!selectedSlot || loading || paymentProcessing || messageType === 'success'}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors font-semibold"
            >
              {paymentProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a3 3 0 00-3 3v6a3 3 0 003 3h10a2 2 0 002-2v-2M17 9h4l-4 4-4-4h4z" />
                  </svg>
                  Go to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;