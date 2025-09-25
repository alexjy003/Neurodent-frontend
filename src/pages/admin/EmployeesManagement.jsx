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
  MapPin,
  Briefcase,
  Clock,
  Upload,
  User,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const PharmacistManagement = () => {
  const [pharmacists, setPharmacists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPharmacist, setEditingPharmacist] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [imagePreview, setImagePreview] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [newPharmacist, setNewPharmacist] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    shift: 'Full-time',
    department: 'Pharmacy',
    specialization: '',
    availability: 'Active',
    image: ''
  })

  const [editPharmacist, setEditPharmacist] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    shift: 'Full-time',
    department: 'Pharmacy',
    specialization: '',
    availability: 'Active',
    image: ''
  })

  // Password visibility states (only for edit form)
  const [showEditPassword, setShowEditPassword] = useState(false)
  
  // Dropdown state for actions menu
  const [openDropdown, setOpenDropdown] = useState(null)

  // Fetch pharmacists on component mount
  useEffect(() => {
    fetchPharmacists()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  // Fetch all pharmacists from API
  const fetchPharmacists = async () => {
    try {
      setLoading(true)
      const response = await api.get('/pharmacists')
      if (response.success) {
        setPharmacists(response.data.pharmacists)
      }
    } catch (error) {
      console.error('Error fetching pharmacists:', error)
      toast.error('Failed to fetch pharmacists')
    } finally {
      setLoading(false)
    }
  }

  const filteredPharmacists = pharmacists.filter(pharmacist => {
    const fullName = `${pharmacist.firstName} ${pharmacist.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         pharmacist.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacist.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const pharmacistStatus = pharmacist.availability === 'Active' ? 'active' : 'inactive'
    const matchesStatus = filterStatus === 'all' || pharmacistStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result)
          setEditPharmacist({...editPharmacist, image: file}) // Store File object, not base64
        } else {
          setImagePreview(reader.result)
          setNewPharmacist({...newPharmacist, image: file}) // Store File object, not base64
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPharmacist = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!newPharmacist.firstName || !newPharmacist.lastName || !newPharmacist.email || 
        !newPharmacist.phone || !newPharmacist.dateOfBirth || 
        !newPharmacist.gender || !newPharmacist.specialization) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newPharmacist.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(newPharmacist.phone)) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    try {
      setSubmitting(true)

      // Prepare form data
      const formData = new FormData()
      Object.keys(newPharmacist).forEach(key => {
        if (key === 'image' && newPharmacist[key]) {
          formData.append('profileImage', newPharmacist[key])
        } else if (key !== 'image') {
          formData.append(key, newPharmacist[key])
        }
      })

      const response = await api.post('/pharmacists', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.success) {
        await fetchPharmacists() // Refresh the list
        setNewPharmacist({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          shift: 'Full-time',
          department: 'Pharmacy',
          specialization: '',
          availability: 'Active',
          image: ''
        })
        setShowAddForm(false)
        setImagePreview(null)
        
        // Show appropriate success message based on email delivery
        if (response.data.emailSent) {
          toast.success('Pharmacist added successfully! Login credentials have been sent to their email.', {
            duration: 5000
          })
          
          // Show preview URL for test emails
          if (response.data.emailPreview) {
            console.log('Email preview available at:', response.data.emailPreview)
            toast.success('📧 Check console for email preview link', {
              duration: 3000
            })
          }
        } else {
          toast.success('Pharmacist added successfully, but failed to send credentials email. Please contact them manually.', {
            duration: 6000
          })
        }
      }
    } catch (error) {
      console.error('Error adding pharmacist:', error)
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg)
        toast.error(errorMessages.join('. '))
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to add pharmacist. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPharmacist = (pharmacist) => {
    setEditingPharmacist(pharmacist)
    setEditImagePreview(pharmacist.profileImage || pharmacist.image)
    setEditPharmacist({
      firstName: pharmacist.firstName,
      lastName: pharmacist.lastName,
      email: pharmacist.email,
      phone: pharmacist.phone,
      dateOfBirth: pharmacist.dateOfBirth?.split('T')[0] || pharmacist.dateOfBirth,
      gender: pharmacist.gender,
      shift: pharmacist.shift,
      department: pharmacist.department,
      specialization: pharmacist.specialization,
      availability: pharmacist.availability,
      password: '',
      image: pharmacist.profileImage || pharmacist.image
    })
    setShowEditForm(true)
  }

  const handleUpdatePharmacist = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!editPharmacist.firstName || !editPharmacist.lastName || !editPharmacist.email || 
        !editPharmacist.phone || !editPharmacist.dateOfBirth || 
        !editPharmacist.gender || !editPharmacist.specialization) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editPharmacist.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(editPharmacist.phone)) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    // Password validation (only if password is provided)
    if (editPharmacist.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
      if (editPharmacist.password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }
      if (!passwordRegex.test(editPharmacist.password)) {
        toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        return
      }
    }

    try {
      setSubmitting(true)

      // Prepare form data
      const formData = new FormData()
      Object.keys(editPharmacist).forEach(key => {
        if (key === 'image' && editPharmacist[key] && typeof editPharmacist[key] !== 'string') {
          formData.append('profileImage', editPharmacist[key])
        } else if (key !== 'image' && editPharmacist[key]) {
          formData.append(key, editPharmacist[key])
        }
      })

      const response = await api.put(`/pharmacists/${editingPharmacist.id || editingPharmacist._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.success) {
        await fetchPharmacists() // Refresh the list
        setShowEditForm(false)
        setEditingPharmacist(null)
        setEditImagePreview(null)
        toast.success('Pharmacist updated successfully!')
      }
    } catch (error) {
      console.error('Error updating pharmacist:', error)
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg)
        toast.error(errorMessages.join('. '))
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to update pharmacist. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePharmacist = async (pharmacist) => {
    if (window.confirm(`Are you sure you want to delete ${pharmacist.firstName} ${pharmacist.lastName}?`)) {
      try {
        const response = await api.delete(`/pharmacists/${pharmacist.id || pharmacist._id}`)
        if (response.success) {
          await fetchPharmacists() // Refresh the list
          toast.success('Pharmacist deleted successfully!')
        }
      } catch (error) {
        console.error('Error deleting pharmacist:', error)
        toast.error('Failed to delete pharmacist. Please try again.')
      }
    }
  }

  const togglePharmacistStatus = async (pharmacist) => {
    try {
      const response = await api.patch(`/pharmacists/${pharmacist.id || pharmacist._id}/availability`)
      if (response.success) {
        await fetchPharmacists() // Refresh the list
        toast.success(`Pharmacist ${response.data.pharmacist.availability === 'Active' ? 'activated' : 'deactivated'} successfully!`)
      }
    } catch (error) {
      console.error('Error toggling pharmacist status:', error)
      toast.error('Failed to update pharmacist status. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacist Management</h1>
          <p className="text-gray-600">Manage pharmacists and pharmacy technicians</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Pharmacist</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Pharmacists</p>
              <p className="text-2xl font-bold text-gray-900">{pharmacists.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">{pharmacists.filter(pharm => pharm.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Full-time</p>
              <p className="text-2xl font-bold text-gray-900">{pharmacists.filter(pharm => pharm.shift === 'Full-time').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Part-time</p>
              <p className="text-2xl font-bold text-gray-900">{pharmacists.filter(pharm => ['Morning', 'Evening', 'Night'].includes(pharm.shift)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pharmacists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacists Cards */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading pharmacists...</div>
          </div>
        ) : filteredPharmacists.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">No pharmacists found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacists.map((pharmacist) => (
              <div key={pharmacist._id || pharmacist.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                {/* Header with Profile Image and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={pharmacist.profileImage || pharmacist.image || '/api/placeholder/60/60'}
                      alt={`${pharmacist.firstName} ${pharmacist.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pharmacist.firstName} {pharmacist.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pharmacist.department} Department
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === pharmacist._id ? null : pharmacist._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    {openDropdown === pharmacist._id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button 
                          onClick={() => {
                            handleEditPharmacist(pharmacist)
                            setOpenDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Pharmacist
                        </button>
                        <button
                          onClick={() => {
                            togglePharmacistStatus(pharmacist)
                            setOpenDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {pharmacist.availability === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            handleDeletePharmacist(pharmacist)
                            setOpenDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{pharmacist.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{pharmacist.email}</span>
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{pharmacist.specialization}</span>
                  </div>
                </div>

                {/* Status and Shift */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pharmacist.shift === 'Full-time' ? 'bg-blue-100 text-blue-800' :
                      pharmacist.shift === 'Morning' ? 'bg-yellow-100 text-yellow-800' :
                      pharmacist.shift === 'Evening' ? 'bg-purple-100 text-purple-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {pharmacist.shift}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    pharmacist.availability === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pharmacist.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Pharmacist Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Pharmacist</h2>
            
            {/* Image Upload Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mb-6">Upload profile image (max 5MB)</p>
            
            <form onSubmit={handleAddPharmacist} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={newPharmacist.firstName}
                    onChange={(e) => setNewPharmacist({...newPharmacist, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newPharmacist.lastName}
                    onChange={(e) => setNewPharmacist({...newPharmacist, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newPharmacist.email}
                    onChange={(e) => setNewPharmacist({...newPharmacist, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="pharmacist@neurodent.com"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Login credentials will be auto-generated and sent to this email
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPharmacist.phone}
                    onChange={(e) => setNewPharmacist({...newPharmacist, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newPharmacist.dateOfBirth}
                    onChange={(e) => setNewPharmacist({...newPharmacist, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    required
                    value={newPharmacist.gender}
                    onChange={(e) => setNewPharmacist({...newPharmacist, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shift</label>
                  <select
                    required
                    value={newPharmacist.shift}
                    onChange={(e) => setNewPharmacist({...newPharmacist, shift: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <select
                    required
                    value={newPharmacist.specialization}
                    onChange={(e) => setNewPharmacist({...newPharmacist, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    <option value="Clinical Pharmacy">Clinical Pharmacy</option>
                    <option value="Pharmaceutical Care">Pharmaceutical Care</option>
                    <option value="Drug Therapy">Drug Therapy</option>
                    <option value="Pain Management">Pain Management</option>
                    <option value="Medication Preparation">Medication Preparation</option>
                    <option value="Inventory Management">Inventory Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                  <select
                    required
                    value={newPharmacist.availability}
                    onChange={(e) => setNewPharmacist({...newPharmacist, availability: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setImagePreview(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Adding...' : 'Add Pharmacist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pharmacist Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Pharmacist</h2>
            
            {/* Image Upload Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mb-6">Upload profile image (max 5MB)</p>
            
            <form onSubmit={handleUpdatePharmacist} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={editPharmacist.firstName}
                    onChange={(e) => setEditPharmacist({...editPharmacist, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editPharmacist.lastName}
                    onChange={(e) => setEditPharmacist({...editPharmacist, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={editPharmacist.email}
                    onChange={(e) => setEditPharmacist({...editPharmacist, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="pharmacist@neurodent.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPharmacist.password}
                      onChange={(e) => setEditPharmacist({...editPharmacist, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only fill this if you want to change the current password
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editPharmacist.phone}
                    onChange={(e) => setEditPharmacist({...editPharmacist, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={editPharmacist.dateOfBirth}
                    onChange={(e) => setEditPharmacist({...editPharmacist, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    required
                    value={editPharmacist.gender}
                    onChange={(e) => setEditPharmacist({...editPharmacist, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shift</label>
                  <select
                    required
                    value={editPharmacist.shift}
                    onChange={(e) => setEditPharmacist({...editPharmacist, shift: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <select
                    required
                    value={editPharmacist.specialization}
                    onChange={(e) => setEditPharmacist({...editPharmacist, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    <option value="Clinical Pharmacy">Clinical Pharmacy</option>
                    <option value="Pharmaceutical Care">Pharmaceutical Care</option>
                    <option value="Drug Therapy">Drug Therapy</option>
                    <option value="Pain Management">Pain Management</option>
                    <option value="Medication Preparation">Medication Preparation</option>
                    <option value="Inventory Management">Inventory Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                  <select
                    required
                    value={editPharmacist.availability}
                    onChange={(e) => setEditPharmacist({...editPharmacist, availability: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingPharmacist(null)
                    setEditImagePreview(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Updating...' : 'Update Pharmacist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PharmacistManagement