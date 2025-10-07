import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  User, 
  Save,
  Camera,
  Loader
} from 'lucide-react'
import apiService from '../../services/api'

const Settings = () => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    experience: '',
    position: '',
    bio: '',
    profileImage: null
  })

  // Fetch doctor profile data on component mount
  useEffect(() => {
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    try {
      setInitialLoading(true)
      const doctorToken = localStorage.getItem('doctorToken')
      
      if (!doctorToken) {
        toast.error('Authentication required. Please log in again.')
        return
      }
      
      const response = await apiService.get('/doctors/profile/me', {
        headers: {
          'Authorization': `Bearer ${doctorToken}`
        }
      })
      
      if (response.success) {
        const doctor = response.data.doctor
        setProfileData({
          firstName: doctor.firstName || '',
          lastName: doctor.lastName || '',
          email: doctor.email || '',
          phone: doctor.phone || '',
          dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.split('T')[0] : '',
          gender: doctor.gender || '',
          specialization: doctor.specialization || '',
          experience: doctor.experience || '',
          position: doctor.position || '',
          bio: doctor.bio || '',
          profileImage: doctor.profileImage || null
        })
      } else {
        toast.error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    // Only allow changes to bio field
    if (name === 'bio') {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const doctorToken = localStorage.getItem('doctorToken')
      
      if (!doctorToken) {
        toast.error('Authentication required. Please log in again.')
        setLoading(false)
        return
      }
      
      // Create FormData for file upload support
      const formData = new FormData()
      
      // Only add bio field (other fields are read-only)
      formData.append('bio', profileData.bio)
      
      // Add profile image if it's a file
      if (profileData.profileImage && profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage)
      }
      
      const response = await apiService.put('/doctors/profile/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${doctorToken}`
        }
      })
      
      if (response.success) {
        toast.success('Profile updated successfully!')
        // Update local state with response data
        const updatedDoctor = response.data.doctor
        setProfileData(prev => ({
          ...prev,
          bio: updatedDoctor.bio || prev.bio,
          profileImage: updatedDoctor.profileImage || prev.profileImage,
          profileImagePreview: null // Clear preview after successful upload
        }))
        
        // Update localStorage to reflect changes in header and sidebar
        const existingDoctorInfo = localStorage.getItem('doctorInfo')
        if (existingDoctorInfo) {
          try {
            const doctorInfo = JSON.parse(existingDoctorInfo)
            const updatedDoctorInfo = {
              ...doctorInfo,
              bio: updatedDoctor.bio,
              profileImage: updatedDoctor.profileImage
            }
            localStorage.setItem('doctorInfo', JSON.stringify(updatedDoctorInfo))
            
            // Trigger a custom event to notify DoctorLayout of the change
            window.dispatchEvent(new CustomEvent('doctorProfileUpdated', {
              detail: updatedDoctorInfo
            }))
          } catch (error) {
            console.error('Error updating localStorage doctorInfo:', error)
          }
        }
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      // Create preview URL and store file
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: file, // Store file for upload
          profileImagePreview: e.target.result // Store preview URL
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Loading state */}
      {initialLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">Update your profile photo and bio. Other information is managed by administration.</p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only edit your profile photo and bio. Contact administration to update other personal information.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            <form onSubmit={handleProfileSubmit} className="space-y-8">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profileImagePreview || profileData.profileImage ? (
                      <img 
                        src={profileData.profileImagePreview || profileData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-600">Upload a professional photo (Max 5MB)</p>
                  <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    readOnly
                    value={profileData.firstName}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    readOnly
                    value={profileData.lastName}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    readOnly
                    value={profileData.email}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    readOnly
                    value={profileData.phone}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    readOnly
                    value={profileData.dateOfBirth}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <input
                    type="text"
                    name="gender"
                    readOnly
                    value={profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : ''}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    readOnly
                    value={profileData.specialization}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    name="experience"
                    readOnly
                    value={profileData.experience}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  readOnly
                  value={profileData.position}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  rows="4"
                  maxLength="500"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell patients about yourself... (max 500 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default Settings
