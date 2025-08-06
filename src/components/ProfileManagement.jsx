import React, { useState } from 'react'

const ProfileManagement = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'spouse',
      phone: '+1 (555) 987-6543'
    },
    medicalInfo: {
      allergies: 'Penicillin, Latex',
      medications: 'Ibuprofen 200mg as needed',
      conditions: 'Hypertension',
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001'
      }
    }
  })

  const [activeTab, setActiveTab] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target
    
    if (section) {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleNestedInputChange = (e, section, subsection) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [name]: value
        }
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Profile updated:', profileData)
    setIsEditing(false)
    // Show success message
  }

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: '👤' },
    { id: 'contact', name: 'Contact Details', icon: '📞' },
    { id: 'emergency', name: 'Emergency Contact', icon: '🚨' },
    { id: 'medical', name: 'Medical Information', icon: '🏥' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-600 mt-1">Manage your personal information and medical details</p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-dental-primary text-dental-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.emergencyContact.name}
                    onChange={(e) => handleInputChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    value={profileData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  >
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.emergencyContact.phone}
                    onChange={(e) => handleInputChange(e, 'emergencyContact')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    rows={3}
                    value={profileData.medicalInfo.allergies}
                    onChange={(e) => handleInputChange(e, 'medicalInfo')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="List any known allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    name="medications"
                    rows={3}
                    value={profileData.medicalInfo.medications}
                    onChange={(e) => handleInputChange(e, 'medicalInfo')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="List current medications..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    name="conditions"
                    rows={3}
                    value={profileData.medicalInfo.conditions}
                    onChange={(e) => handleInputChange(e, 'medicalInfo')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="List any medical conditions..."
                  />
                </div>
                
                {/* Insurance Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        name="provider"
                        value={profileData.medicalInfo.insurance.provider}
                        onChange={(e) => handleNestedInputChange(e, 'medicalInfo', 'insurance')}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        name="policyNumber"
                        value={profileData.medicalInfo.insurance.policyNumber}
                        onChange={(e) => handleNestedInputChange(e, 'medicalInfo', 'insurance')}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Number
                      </label>
                      <input
                        type="text"
                        name="groupNumber"
                        value={profileData.medicalInfo.insurance.groupNumber}
                        onChange={(e) => handleNestedInputChange(e, 'medicalInfo', 'insurance')}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dental-primary focus:border-dental-primary ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileManagement