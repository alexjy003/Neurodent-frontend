import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'
import apiService from '../../services/api'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/config.js'

const PatientRecords = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    upcomingVisits: 0,
    recentVisits: 0
  })

  // Fetch patients from database
  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Debug logging
      const adminToken = localStorage.getItem('adminToken')
      const adminAuth = localStorage.getItem('adminAuth')
      const adminUser = localStorage.getItem('adminUser')
      console.log('🔍 Debug - Admin Token:', adminToken)
      console.log('🔍 Debug - Admin Auth:', adminAuth)
      console.log('🔍 Debug - Admin User:', adminUser)
      
      // API_BASE_URL is now imported from config
      
      console.log('🔍 Debug - API Base URL:', API_BASE_URL)
      
      // Try to make the API call and log full request/response details
      console.log('🔍 Making API call to:', `${API_BASE_URL}/patients`)
      console.log('🔍 With headers:', { Authorization: `Bearer ${adminToken}` })
      
      const response = await apiService.get('/patients')
      console.log('Patients API Response:', response)
      
      if (response.success) {
        setPatients(response.data || response.patients || [])
        calculateStats(response.data || response.patients || [])
      } else {
        setError('Failed to fetch patients')
        toast.error('Failed to load patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Failed to load patients. Please try again.')
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (patientsData) => {
    const total = patientsData.length
    const active = patientsData.filter(p => p.isActive !== false).length
    
    // Calculate upcoming visits (patients with future appointments)
    const upcoming = patientsData.filter(p => {
      if (!p.appointments || !Array.isArray(p.appointments)) return false
      return p.appointments.some(apt => {
        const aptDate = new Date(apt.date || apt.appointmentDate)
        return aptDate > new Date() && (apt.status === 'scheduled' || apt.status === 'confirmed')
      })
    }).length

    // Calculate recent visits (last 7 days)
    const recent = patientsData.filter(p => {
      if (!p.appointments || !Array.isArray(p.appointments)) return false
      return p.appointments.some(apt => {
        const aptDate = new Date(apt.date || apt.appointmentDate)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return aptDate >= weekAgo && aptDate <= new Date() && apt.status === 'completed'
      })
    }).length

    setStats({
      totalPatients: total,
      activePatients: active,
      upcomingVisits: upcoming,
      recentVisits: recent
    })
  }

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase()
    const email = (patient.email || '').toLowerCase()
    const phone = (patient.phone || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return fullName.includes(searchLower) ||
           email.includes(searchLower) ||
           phone.includes(searchLower)
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getPatientFullName = (patient) => {
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'N/A'
  }

  const getLastVisit = (patient) => {
    if (!patient.appointments || !Array.isArray(patient.appointments)) return null
    
    const completedAppointments = patient.appointments.filter(apt => apt.status === 'completed')
    if (completedAppointments.length === 0) return null
    
    const lastAppt = completedAppointments.sort((a, b) => 
      new Date(b.date || b.appointmentDate) - new Date(a.date || a.appointmentDate)
    )[0]
    
    return lastAppt.date || lastAppt.appointmentDate
  }

  const getNextAppointment = (patient) => {
    if (!patient.appointments || !Array.isArray(patient.appointments)) return null
    
    const futureAppointments = patient.appointments.filter(apt => {
      const aptDate = new Date(apt.date || apt.appointmentDate)
      return aptDate > new Date() && (apt.status === 'scheduled' || apt.status === 'confirmed')
    })
    
    if (futureAppointments.length === 0) return null
    
    const nextAppt = futureAppointments.sort((a, b) => 
      new Date(a.date || a.appointmentDate) - new Date(b.date || b.appointmentDate)
    )[0]
    
    return nextAppt.date || nextAppt.appointmentDate
  }

  const getTotalVisits = (patient) => {
    if (!patient.appointments || !Array.isArray(patient.appointments)) return 0
    return patient.appointments.filter(apt => apt.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading patient records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading patients</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={fetchPatients}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    // Manual admin token creation for debugging
                    const adminToken = `admin_token_${Date.now()}`
                    const adminUser = { 
                      role: 'admin', 
                      email: 'admin@gmail.com',
                      firstName: 'Admin',
                      lastName: 'User'
                    }
                    localStorage.setItem('adminToken', adminToken)
                    localStorage.setItem('adminAuth', 'true')
                    localStorage.setItem('adminUser', JSON.stringify(adminUser))
                    sessionStorage.setItem('adminSession', 'active')
                    const expirationTime = Date.now() + (8 * 60 * 60 * 1000)
                    localStorage.setItem('adminTokenExpiry', expirationTime.toString())
                    console.log('🔧 Debug: Created admin token:', adminToken)
                    
                    // Retry fetching patients
                    fetchPatients()
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                >
                  Debug: Fix Auth
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600">Manage patient information and medical history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Upcoming Visits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Recent Visits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentVisits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPatients}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No patients found</p>
                    {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {getPatientFullName(patient).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{getPatientFullName(patient)}</div>
                          <div className="text-sm text-gray-500">Age: {calculateAge(patient.dateOfBirth)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{patient.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(getLastVisit(patient))}</div>
                      <div className="text-sm text-gray-500">{getTotalVisits(patient)} total visits</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(getNextAppointment(patient))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.assignedDoctor || 'Not assigned'}
                      </div>
                      {patient.treatments && patient.treatments.length > 0 && (
                        <div className="text-sm text-gray-500">{patient.treatments.join(', ')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                          title="Edit Patient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          title="Medical Records"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Patient Profile</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Info */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                    <span className="text-2xl font-bold text-white">
                      {getPatientFullName(selectedPatient).split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{getPatientFullName(selectedPatient)}</h3>
                  <p className="text-teal-100">Age: {calculateAge(selectedPatient.dateOfBirth)}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedPatient.phoneNumber || 'Not provided'}
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedPatient.email}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Visits:</span>
                      <span className="font-semibold">{getTotalVisits(selectedPatient)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-semibold">{getLastVisit(selectedPatient)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-semibold">{selectedPatient._id?.slice(-6) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Date of Birth:</span>
                        <p className="font-semibold">{formatDate(selectedPatient.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Gender:</span>
                        <p className="font-semibold">{selectedPatient.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="font-semibold">{selectedPatient.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Medical Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Emergency Contact:</span>
                        <p className="font-semibold">{selectedPatient.emergencyContactNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Medical History:</span>
                        <div className="mt-1">
                          {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                            selectedPatient.medicalHistory.map((condition, index) => (
                              <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                {condition}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No medical history recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Treatment History</h4>
                    <div className="space-y-2">
                      {selectedPatient.treatments && selectedPatient.treatments.length > 0 ? (
                        selectedPatient.treatments.map((treatment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{treatment}</span>
                            <span className="text-xs text-gray-500">Completed</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No treatment history available</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Appointments</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Next Appointment:</span>
                        <p className="font-semibold">{getNextAppointment(selectedPatient)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Registration Date:</span>
                        <p className="font-semibold">{formatDate(selectedPatient.createdAt)}</p>
                      </div>
                      <button className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors duration-200">
                        Schedule New Appointment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Edit Patient
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    View Medical Records
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientRecords