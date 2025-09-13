import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Star,
  Upload,
  Eye,
  EyeOff,
  User,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { getAdminToken } from '../../utils/adminAuth'

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewProfile, setShowViewProfile] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [viewingDoctor, setViewingDoctor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSpecialization, setFilterSpecialization] = useState('all')
  const [filterExperience, setFilterExperience] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    experience: '',
    position: '',
    bio: '',
    availability: 'active'
  })

  // Helper function to get axios config with admin authentication
  const getAuthConfig = (isFormData = false) => {
    const adminToken = getAdminToken()
    if (!adminToken) {
      throw new Error('Admin authentication required')
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
    
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  }

  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Endodontics',
    'Periodontics',
    'Prosthodontics',
    'Oral Pathology',
    'Oral Radiology',
    'Cosmetic Dentistry'
  ]

  const positions = [
    'Junior Doctor',
    'Senior Doctor',
    'Consultant',
    'Head of Department'
  ]

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const adminToken = getAdminToken()
      
      if (!adminToken) {
        toast.error('Admin authentication required')
        return
      }

      const response = await axios.get('http://localhost:5000/api/doctors', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        setDoctors(response.data.data.doctors)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      if (error.response?.status === 401) {
        toast.error('Admin authentication expired. Please login again.')
      } else {
        toast.error('Failed to fetch doctors')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || doctor.availability === filterStatus
    const matchesSpecialization = filterSpecialization === 'all' || doctor.specialization === filterSpecialization

    let matchesExperience = true
    if (filterExperience !== 'all') {
      const experienceValue = parseInt(filterExperience)
      matchesExperience = doctor.experience >= experienceValue
    }

    return matchesSearch && matchesStatus && matchesSpecialization && matchesExperience
  })

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setSelectedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'availability') {
      console.log('Availability changed to:', value)
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      specialization: '',
      experience: '',
      position: '',
      bio: '',
      availability: 'active'
    })
    setSelectedImage(null)
    setImagePreview(null)
    setShowPassword(false)
    setEditingDoctor(null)
  }

  // Open edit form with doctor data
  const handleEditDoctor = (doctor) => {
    console.log('Editing doctor:', doctor)
    console.log('Doctor availability:', doctor.availability)
    setEditingDoctor(doctor)
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      password: '', // Don't pre-fill password for security
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.split('T')[0] : '',
      gender: doctor.gender,
      specialization: doctor.specialization,
      experience: doctor.experience.toString(),
      position: doctor.position,
      bio: doctor.bio || '',
      availability: doctor.availability
    })

    // Set existing image preview if available
    if (doctor.profileImage) {
      setImagePreview(doctor.profileImage)
    } else {
      setImagePreview(null)
    }

    setSelectedImage(null)
    setShowPassword(false)
    setShowEditForm(true)
  }

  // View doctor profile
  const handleViewProfile = (doctor) => {
    setViewingDoctor(doctor)
    setShowViewProfile(true)
  }

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage)
      }

      console.log('Sending doctor data with image:', selectedImage ? 'Image included' : 'No image')

      const response = await axios.post('http://localhost:5000/api/doctors', formDataToSend, {
        ...getAuthConfig(true),
        headers: {
          ...getAuthConfig(true).headers,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Doctor added successfully!')
        resetForm()
        setShowAddForm(false)
        fetchDoctors() // Refresh the doctors list
      }
    } catch (error) {
      console.error('Error adding doctor:', error)
      if (error.response?.data?.errors) {
        // Show validation errors
        error.response.data.errors.forEach(err => {
          toast.error(err.msg)
        })
      } else {
        toast.error(error.response?.data?.message || 'Failed to add doctor')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDoctor = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add all form fields except password if it's empty
      Object.keys(formData).forEach(key => {
        if (key === 'password' && formData[key] === '') {
          // Skip empty password
          return
        }
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage)
      }

      console.log('Updating doctor data with image:', selectedImage ? 'Image included' : 'No new image')
      console.log('Form data being sent:', Object.fromEntries(formDataToSend.entries()))

      const response = await axios.put(`http://localhost:5000/api/doctors/${editingDoctor._id}`, formDataToSend, {
        ...getAuthConfig(true),
        headers: {
          ...getAuthConfig(true).headers,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Doctor updated successfully!')
        resetForm()
        setShowEditForm(false)
        fetchDoctors() // Refresh the doctors list
      }
    } catch (error) {
      console.error('Error updating doctor:', error)
      if (error.response?.data?.errors) {
        // Show validation errors
        error.response.data.errors.forEach(err => {
          toast.error(err.msg)
        })
      } else {
        toast.error(error.response?.data?.message || 'Failed to update doctor')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDoctor = async (doctor) => {
    const confirmMessage = `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?\n\nThis action cannot be undone and will permanently remove:\n- Doctor profile and credentials\n- All associated data\n- Access to the system\n\nType "DELETE" to confirm:`

    const userInput = window.prompt(confirmMessage)

    if (userInput === 'DELETE') {
      try {
        const response = await axios.delete(`http://localhost:5000/api/doctors/${doctor._id}`, getAuthConfig())
        if (response.data.success) {
          toast.success(`Dr. ${doctor.firstName} ${doctor.lastName} deleted successfully!`)
          fetchDoctors() // Refresh the doctors list
        }
      } catch (error) {
        console.error('Error deleting doctor:', error)
        toast.error(error.response?.data?.message || 'Failed to delete doctor')
      }
    } else if (userInput !== null) {
      toast.error('Delete cancelled - you must type "DELETE" exactly to confirm')
    }
  }

  const toggleDoctorStatus = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/doctors/${id}/availability`, {}, getAuthConfig())
      if (response.data.success) {
        toast.success('Doctor status updated!')
        fetchDoctors() // Refresh the doctors list
      }
    } catch (error) {
      console.error('Error updating doctor status:', error)
      toast.error('Failed to update doctor status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-600">Manage your medical team</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialization, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Specialization Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Specialization</label>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Experience</label>
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Any Experience</option>
                <option value="15">15+ Years</option>
                <option value="10">10+ Years</option>
                <option value="5">5+ Years</option>
                <option value="2">2+ Years</option>
                <option value="1">1+ Years</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setFilterStatus('all')
                setFilterSpecialization('all')
                setFilterExperience('all')
                setSearchTerm('')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </p>
          {(filterStatus !== 'all' || filterSpecialization !== 'all' || filterExperience !== 'all' || searchTerm) && (
            <p className="text-sm text-teal-600 font-medium">
              Filters applied
            </p>
          )}
        </div>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={doctor.profileImage || `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0d9488&color=fff`}
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.firstName} {doctor.lastName}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleEditDoctor(doctor)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Doctor
                  </button>
                  <button
                    onClick={() => toggleDoctorStatus(doctor._id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {doctor.availability === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {doctor.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {doctor.position} • {doctor.experience} years
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {doctor.rating || 0} rating • {doctor.patientsToday || 0} patients today
                  </div>
                  {doctor.bio && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p className="line-clamp-2">{doctor.bio}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doctor.availability === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.availability}
                  </span>
                  <button
                    onClick={() => handleViewProfile(doctor)}
                    className="text-teal-500 text-sm font-semibold hover:text-teal-700 transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Doctor</h2>
            <form onSubmit={handleAddDoctor} className="space-y-6">

              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-teal-500 text-white p-1 rounded-full cursor-pointer hover:bg-teal-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Upload profile image (max 5MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="doctor@neurodent.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must contain uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    required
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability *
                  </label>
                  <select
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="active">Active (Recommended for new doctors)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Set to "Active" to allow immediate login access for the doctor
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Brief description about the doctor..."
                  rows="3"
                  maxLength="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{submitting ? 'Adding...' : 'Add Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditForm && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Doctor - {editingDoctor.firstName} {editingDoctor.lastName}</h2>
            <form onSubmit={handleUpdateDoctor} className="space-y-6">

              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-teal-500 text-white p-1 rounded-full cursor-pointer hover:bg-teal-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Upload new profile image (max 5MB) or keep existing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="doctor@neurodent.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Leave empty to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current password. If changing, must contain uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    required
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability *
                  </label>
                  <select
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Brief description about the doctor..."
                  rows="3"
                  maxLength="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{submitting ? 'Updating...' : 'Update Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewProfile && viewingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Doctor Profile</h2>
              <button
                onClick={() => setShowViewProfile(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {viewingDoctor.profileImage ? (
                    <img
                      src={viewingDoctor.profileImage}
                      alt={`${viewingDoctor.firstName} ${viewingDoctor.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Dr. {viewingDoctor.firstName} {viewingDoctor.lastName}
                  </h3>
                  <p className="text-lg text-teal-600 font-medium">{viewingDoctor.specialization}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingDoctor.availability === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingDoctor.availability}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{viewingDoctor.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{viewingDoctor.phone}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="text-gray-900">{viewingDoctor.position}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-gray-900">{viewingDoctor.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900 capitalize">{viewingDoctor.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">
                    {viewingDoctor.dateOfBirth ? new Date(viewingDoctor.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{viewingDoctor.rating || 0}</p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{viewingDoctor.patientsToday || 0}</p>
                  <p className="text-sm text-gray-500">Patients Today</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{viewingDoctor.totalPatients || 0}</p>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>
              </div>

              {/* Bio */}
              {viewingDoctor.bio && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700 leading-relaxed">{viewingDoctor.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewProfile(false)
                    handleEditDoctor(viewingDoctor)
                  }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Doctor</span>
                </button>
                <button
                  onClick={() => setShowViewProfile(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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

export default DoctorsManagement