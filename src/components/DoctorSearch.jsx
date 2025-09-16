import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AppointmentBookingModal from './AppointmentBookingModal'

const DoctorSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    specialization: '',
    rating: '',
    availability: '',
    location: '',
    experience: ''
  })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Appointment booking state
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [doctorToBook, setDoctorToBook] = useState(null)
  const [bookingMessage, setBookingMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('http://localhost:5000/api/doctors')
      if (response.data.success) {
        // Transform the data to match the expected format
        const transformedDoctors = response.data.data.doctors.map(doctor => ({
          id: doctor._id,
          _id: doctor._id, // Keep original _id for API calls
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
          experience: parseInt(doctor.experience) || 5,
          location: 'Neurodent Clinic', // Default location
          image: doctor.profileImage || `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0d9488&color=fff`,
          availability: doctor.availability === 'active' ? 'Available Today' : 'Limited Availability',
          nextSlot: doctor.nextAvailableSlot || 'Not available',
          about: doctor.bio || `Experienced ${doctor.specialization.toLowerCase()} specialist providing quality dental care.`,
          qualifications: [`${doctor.position}`, `Specialization in ${doctor.specialization}`],
          languages: ['English'],
          services: getServicesForSpecialization(doctor.specialization),
          position: doctor.position,
          phone: doctor.phone,
          email: doctor.email,
          gender: doctor.gender,
          dateOfBirth: doctor.dateOfBirth,
          firstName: doctor.firstName,
          lastName: doctor.lastName
        }))
        console.log('Transformed doctors:', transformedDoctors)
        setDoctors(transformedDoctors)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Failed to load doctors. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get services based on specialization
  const getServicesForSpecialization = (specialization) => {
    const serviceMap = {
      'General Dentistry': ['Cleanings', 'Fillings', 'Whitening', 'Crowns'],
      'Orthodontics': ['Braces', 'Invisalign', 'Retainers'],
      'Pediatric Dentistry': ['Cleanings', 'Fluoride Treatments', 'Sealants'],
      'Oral Surgery': ['Extractions', 'Implants', 'Jaw Surgery'],
      'Periodontology': ['Gum Treatment', 'Deep Cleaning', 'Gum Surgery'],
      'Endodontics': ['Root Canal', 'Pulp Treatment', 'Tooth Pain'],
      'Prosthodontics': ['Dentures', 'Bridges', 'Implants']
    }
    return serviceMap[specialization] || ['General Dental Care', 'Consultations', 'Examinations']
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Get unique specializations from doctors data
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))].sort()

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      specialization: '',
      rating: '',
      availability: '',
      location: '',
      experience: ''
    })
    setSearchQuery('')
  }

  // Appointment booking functions
  const handleBookAppointment = (doctor) => {
    setDoctorToBook(doctor)
    setBookingModalOpen(true)
    setBookingMessage('')
    setMessageType('')
  }

  const handleBookingSuccess = (appointment) => {
    setBookingMessage(`Appointment booked successfully with ${appointment.doctorName}!`)
    setMessageType('success')
    setBookingModalOpen(false)
    setDoctorToBook(null)
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setBookingMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleBookingModalClose = () => {
    setBookingModalOpen(false)
    setDoctorToBook(null)
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialization = !filters.specialization || doctor.specialization === filters.specialization
    const matchesRating = !filters.rating || doctor.rating >= parseFloat(filters.rating)
    const matchesExperience = !filters.experience || doctor.experience >= parseInt(filters.experience)
    
    return matchesSearch && matchesSpecialization && matchesRating && matchesExperience
  })

  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      )
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      )
    }
    
    return stars
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Doctors</h2>
        <p className="text-gray-600">Search and book appointments with our qualified dental professionals</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-dental-primary focus:border-dental-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
            >
              <option value="">Any Experience</option>
              <option value="10">10+ Years</option>
              <option value="5">5+ Years</option>
              <option value="2">2+ Years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary"
            >
              <option value="">Any Time</option>
              <option value="today">Available Today</option>
              <option value="tomorrow">Available Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Loading doctors...' : `Showing ${filteredDoctors.length} of ${doctors.length} doctors`}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-primary mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-center text-center">
            <div className="text-red-600">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Error Loading Doctors</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDoctors}
                className="px-4 py-2 bg-dental-primary text-white rounded-md hover:bg-dental-primary-dark transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && filteredDoctors.length === 0 && doctors.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-dental-primary text-white rounded-md hover:bg-dental-primary-dark transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Doctor Cards */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doctor.availability === 'Available Today' ? 'bg-green-100 text-green-800' :
                    doctor.availability === 'Available Tomorrow' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doctor.availability}
                  </span>
                </div>
                <p className="text-sm text-dental-primary font-medium mb-1">{doctor.specialization}</p>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    {getRatingStars(doctor.rating)}
                    <span className="ml-1 text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{doctor.experience} years exp.</span>
                  <span className="text-sm text-gray-600">{doctor.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{doctor.about}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {doctor.services.slice(0, 3).map((service, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {service}
                    </span>
                  ))}
                  {doctor.services.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      +{doctor.services.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Next available</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.nextSlot}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>View Profile</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0V7a1 1 0 00-1-1H5a1 1 0 00-1 1v0m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                        </svg>
                        <span>Book Appointment</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedDoctor(null)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8 z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg" style={{display: 'none'}}>
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{selectedDoctor.name}</h3>
                    <p className="text-blue-100 font-medium text-lg">{selectedDoctor.specialization}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        {getRatingStars(selectedDoctor.rating)}
                        <span className="ml-2 text-blue-100">{selectedDoctor.rating}</span>
                      </div>
                      <span className="text-blue-100">{selectedDoctor.experience} years exp.</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-white hover:text-gray-200 text-3xl font-bold p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200 leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26c.67.36 1.45.36 2.12 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedDoctor.email}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedDoctor.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h4>
                <p className="text-gray-600 leading-relaxed">{selectedDoctor.about}</p>
              </div>
              
              {/* Qualifications */}
              <div>
                <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Qualifications
                </h4>
                <div className="space-y-2">
                  {selectedDoctor.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Languages */}
              <div>
                <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.languages.map((lang, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Services */}
              <div>
                <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Services Offered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.services.map((service, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Next Available Slot</h4>
                    <p className="text-blue-600 font-medium">{selectedDoctor.nextSlot}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDoctor.availability === 'Available Today' ? 'bg-green-100 text-green-800' :
                    selectedDoctor.availability === 'Available Tomorrow' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedDoctor.availability}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <button
                type="button"
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                onClick={() => setSelectedDoctor(null)}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor(null)
                  handleBookAppointment(selectedDoctor)
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0V7a1 1 0 00-1-1H5a1 1 0 00-1 1v0m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                  </svg>
                  <span>Book Appointment</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Message */}
      {bookingMessage && (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${
          messageType === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        } px-4 py-3 rounded shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {messageType === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm font-medium">{bookingMessage}</span>
            </div>
            <button
              onClick={() => {
                setBookingMessage('')
                setMessageType('')
              }}
              className="ml-2 text-lg font-bold leading-none hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={handleBookingModalClose}
        doctor={doctorToBook}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default DoctorSearch