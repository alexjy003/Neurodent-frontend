import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
          experience: parseInt(doctor.experience) || 5,
          location: 'Neurodent Clinic', // Default location
          image: doctor.profileImage || `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0d9488&color=fff`,
          availability: doctor.availability === 'active' ? 'Available Today' : 'Limited Availability',
          nextSlot: getNextAvailableSlot(),
          about: doctor.bio || `Experienced ${doctor.specialization.toLowerCase()} specialist providing quality dental care.`,
          qualifications: [`${doctor.position}`, `Specialization in ${doctor.specialization}`],
          languages: ['English'],
          services: getServicesForSpecialization(doctor.specialization),
          position: doctor.position,
          phone: doctor.phone,
          email: doctor.email,
          gender: doctor.gender,
          dateOfBirth: doctor.dateOfBirth
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

  // Helper function to get next available slot
  const getNextAvailableSlot = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const hours = 9 + Math.floor(Math.random() * 8) // Random hour between 9 AM and 5 PM
    const minutes = Math.random() > 0.5 ? '00' : '30'
    return `${tomorrow.toISOString().split('T')[0]} ${hours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="px-4 py-2 border border-dental-primary text-dental-primary rounded-md text-sm font-medium hover:bg-dental-primary hover:text-white transition-colors duration-200"
                    >
                      View Profile
                    </button>
                    <button className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200">
                      Book Appointment
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedDoctor(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h3>
                    <p className="text-dental-primary font-medium">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-sm text-gray-600">{selectedDoctor.about}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedDoctor.qualifications.map((qual, index) => (
                        <li key={index}>• {qual}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.languages.map((lang, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.services.map((service, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-dental-light text-dental-primary">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-dental-primary text-base font-medium text-white hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorSearch