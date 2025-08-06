import React, { useState } from 'react'

const AppointmentManagement = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Mock data - in real app, this would come from API
  const appointments = {
    upcoming: [
      {
        id: 1,
        date: '2024-01-15',
        time: '10:00 AM',
        doctor: 'Dr. Sarah Johnson',
        specialization: 'General Dentistry',
        type: 'Regular Checkup',
        location: 'Downtown Clinic',
        status: 'confirmed',
        duration: '45 minutes',
        notes: 'Routine cleaning and examination'
      },
      {
        id: 2,
        date: '2024-01-22',
        time: '2:30 PM',
        doctor: 'Dr. Michael Chen',
        specialization: 'Orthodontics',
        type: 'Braces Adjustment',
        location: 'Uptown Center',
        status: 'confirmed',
        duration: '30 minutes',
        notes: 'Monthly adjustment appointment'
      }
    ],
    past: [
      {
        id: 3,
        date: '2024-01-08',
        time: '11:00 AM',
        doctor: 'Dr. Sarah Johnson',
        specialization: 'General Dentistry',
        type: 'Cleaning',
        location: 'Downtown Clinic',
        status: 'completed',
        duration: '45 minutes',
        notes: 'Completed successfully'
      },
      {
        id: 4,
        date: '2023-12-20',
        time: '3:00 PM',
        doctor: 'Dr. Emily Rodriguez',
        specialization: 'Pediatric Dentistry',
        type: 'Consultation',
        location: 'Family Dental Center',
        status: 'completed',
        duration: '30 minutes',
        notes: 'Initial consultation'
      },
      {
        id: 5,
        date: '2023-12-05',
        time: '9:30 AM',
        doctor: 'Dr. Robert Smith',
        specialization: 'Oral Surgery',
        type: 'Tooth Extraction',
        location: 'Surgical Center',
        status: 'completed',
        duration: '60 minutes',
        notes: 'Wisdom tooth extraction'
      }
    ]
  }

  const [bookingForm, setBookingForm] = useState({
    doctor: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  })

  const availableTimes = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ]

  const appointmentTypes = [
    'Regular Checkup',
    'Cleaning',
    'Consultation',
    'Follow-up',
    'Emergency',
    'Cosmetic Consultation'
  ]

  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Dentistry' },
    { id: 2, name: 'Dr. Michael Chen', specialization: 'Orthodontics' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialization: 'Pediatric Dentistry' },
    { id: 4, name: 'Dr. Robert Smith', specialization: 'Oral Surgery' }
  ]

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    // Handle booking submission here
    console.log('Booking appointment:', bookingForm)
    setShowBookingModal(false)
    setBookingForm({ doctor: '', date: '', time: '', type: '', notes: '' })
  }

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      // Handle cancellation here
      console.log('Canceling appointment:', appointmentId)
    }
  }

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setBookingForm({
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes
    })
    setShowRescheduleModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
            <p className="text-gray-600 mt-1">Manage your dental appointments</p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
          >
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'border-dental-primary text-dental-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Appointments ({appointments.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'past'
                  ? 'border-dental-primary text-dental-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Appointments ({appointments.past.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Upcoming Appointments */}
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {appointments.upcoming.length > 0 ? (
                appointments.upcoming.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-dental-primary rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.type}</h3>
                          <p className="text-dental-primary font-medium">{appointment.doctor}</p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                        </svg>
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appointment.time} ({appointment.duration})
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {appointment.location}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRescheduleAppointment(appointment)}
                        className="px-4 py-2 border border-dental-primary text-dental-primary rounded-md text-sm font-medium hover:bg-dental-primary hover:text-white transition-colors duration-200"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600 mb-4">You don't have any scheduled appointments.</p>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Past Appointments */}
          {activeTab === 'past' && (
            <div className="space-y-4">
              {appointments.past.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.type}</h3>
                        <p className="text-gray-600 font-medium">{appointment.doctor}</p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                      </svg>
                      {formatDate(appointment.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {appointment.time} ({appointment.duration})
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {appointment.location}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200">
                      Book Again
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBookingModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleBookingSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Book New Appointment</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                      <select
                        value={bookingForm.doctor}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, doctor: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.name}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                      <select
                        value={bookingForm.type}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, type: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      >
                        <option value="">Select appointment type</option>
                        {appointmentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                      <select
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      >
                        <option value="">Select time</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        rows={3}
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any specific concerns or requests..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-dental-primary text-base font-medium text-white hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRescheduleModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleBookingSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Appointment</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Current:</strong> {selectedAppointment?.type} with {selectedAppointment?.doctor}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment?.date} at {selectedAppointment?.time}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                      <select
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      >
                        <option value="">Select time</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rescheduling</label>
                      <textarea
                        rows={3}
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Please let us know why you need to reschedule..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-dental-primary text-base font-medium text-white hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentManagement