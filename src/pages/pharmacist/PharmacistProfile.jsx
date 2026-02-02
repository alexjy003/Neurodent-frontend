import React, { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Camera,
  Save,
  Edit3,
  Award,
  Clock,
  Loader2,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/config'

const PharmacistProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [prescriptionsFilled, setPrescriptionsFilled] = useState(0)

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    profileImage: null,
    employeeId: '',
    role: 'Pharmacist',
    department: 'Pharmacy',
    dateJoined: '',
    gender: '',
    shift: '',
    specialization: '',
    createdAt: ''
  })

  const [tempProfileData, setTempProfileData] = useState({ ...profileData })

  // Fetch pharmacist profile on component mount
  useEffect(() => {
    fetchPharmacistProfile()
    fetchPrescriptionCount()
  }, [])

  const fetchPharmacistProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('pharmacistToken')
      
      if (!token) {
        toast.error('Please login to view your profile')
        return
      }

      const response = await fetch(`${API_BASE_URL}/pharmacists/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.data.pharmacist) {
        const pharmacist = data.data.pharmacist
        const formattedData = {
          firstName: pharmacist.firstName || '',
          lastName: pharmacist.lastName || '',
          email: pharmacist.email || '',
          phone: pharmacist.phone || '',
          dateOfBirth: pharmacist.dateOfBirth ? new Date(pharmacist.dateOfBirth).toISOString().split('T')[0] : '',
          address: pharmacist.address || '',
          city: pharmacist.city || '',
          state: pharmacist.state || '',
          zipCode: pharmacist.zipCode || '',
          emergencyContact: pharmacist.emergencyContact || '',
          profileImage: pharmacist.profileImage || null,
          employeeId: pharmacist._id ? pharmacist._id.substring(0, 8).toUpperCase() : '',
          role: 'Pharmacist',
          department: pharmacist.department || 'Pharmacy',
          dateJoined: pharmacist.createdAt || '',
          gender: pharmacist.gender || '',
          shift: pharmacist.shift || '',
          specialization: pharmacist.specialization || '',
          createdAt: pharmacist.createdAt || ''
        }
        
        setProfileData(formattedData)
        setTempProfileData(formattedData)
      } else {
        toast.error(data.message || 'Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptionCount = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      if (!token) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/prescriptions/pharmacist/my-prescriptions?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.prescriptions) {
        // Count prescriptions that are dispensed (filled)
        const filledCount = data.prescriptions.filter(
          p => p.status === 'dispensed' || p.paymentStatus === 'paid'
        ).length
        setPrescriptionsFilled(filledCount)
      }
    } catch (error) {
      console.error('Error fetching prescription count:', error)
    }
  }

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      await handleSaveProfile()
    } else {
      // Start editing
      setTempProfileData({ ...profileData })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    try {
      setUpdating(true)
      const token = localStorage.getItem('pharmacistToken')
      
      if (!token) {
        toast.error('Please login to update your profile')
        return
      }

      const response = await fetch(`${API_BASE_URL}/pharmacists/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: tempProfileData.firstName,
          lastName: tempProfileData.lastName,
          phone: tempProfileData.phone,
          dateOfBirth: tempProfileData.dateOfBirth,
          gender: tempProfileData.gender,
          address: tempProfileData.address,
          city: tempProfileData.city,
          state: tempProfileData.state,
          zipCode: tempProfileData.zipCode,
          emergencyContact: tempProfileData.emergencyContact
        })
      })

      const data = await response.json()

      if (data.success) {
        setProfileData({ ...tempProfileData })
        toast.success('Profile updated successfully!')
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setTempProfileData({ ...profileData })
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        // Preview image immediately
        const reader = new FileReader()
        reader.onload = (e) => {
          setTempProfileData(prev => ({
            ...prev,
            profileImage: e.target.result
          }))
        }
        reader.readAsDataURL(file)

        // Upload to server
        const token = localStorage.getItem('pharmacistToken')
        const formData = new FormData()
        formData.append('profileImage', file)

        const response = await fetch(`${API_BASE_URL}/pharmacists/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()

        if (data.success && data.data.pharmacist) {
          setProfileData(prev => ({
            ...prev,
            profileImage: data.data.pharmacist.profileImage
          }))
          setTempProfileData(prev => ({
            ...prev,
            profileImage: data.data.pharmacist.profileImage
          }))
          toast.success('Profile image updated!')
        } else {
          toast.error(data.message || 'Failed to upload image')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Error uploading image')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getYearsExperience = () => {
    if (!profileData.createdAt) return 0
    const joinDate = new Date(profileData.createdAt)
    const today = new Date()
    const years = (today - joinDate) / (1000 * 60 * 60 * 24 * 365)
    return years.toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#C33764]" />
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and professional details
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditToggle}
                disabled={updating}
                className="flex items-center px-4 py-2 bg-[#C33764] text-white rounded-lg hover:bg-[#1d2671] transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditToggle}
              className="flex items-center px-4 py-2 bg-[#C33764] text-white rounded-lg hover:bg-[#1d2671] transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-[#C33764] to-[#1d2671] flex items-center justify-center">
              {tempProfileData.profileImage ? (
                <img 
                  src={tempProfileData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-[#C33764] p-2 rounded-full cursor-pointer hover:bg-[#1d2671] transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {tempProfileData.firstName} {tempProfileData.lastName}
            </h2>
            <p className="text-lg text-gray-600">{profileData.role}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                ID: {profileData.employeeId}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined: {formatDate(profileData.dateJoined)}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-pink-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-[#C33764]">{getYearsExperience()}</p>
              <p className="text-xs text-gray-600">Years Experience</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{prescriptionsFilled}</p>
              <p className="text-xs text-gray-600">Prescriptions Filled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="email"
                    value={tempProfileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempProfileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="date"
                    value={tempProfileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(profileData.dateOfBirth)}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfileData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Name - Phone Number"
                />
              ) : (
                <p className="text-gray-900">{profileData.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profileData.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profileData.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profileData.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <p className="text-gray-900">{formatDate(profileData.dateJoined)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profileData.shift || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profileData.specialization || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              {isEditing ? (
                <select
                  value={tempProfileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.gender || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.address}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.zipCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacistProfile