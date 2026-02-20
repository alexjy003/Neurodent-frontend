import React, { useState, useEffect } from 'react'
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Download,
  Eye,
  Edit,
  ChevronRight,
  Activity,
  Pill,
  Stethoscope,
  Heart,
  Users
} from 'lucide-react'
import apiService from '../../services/api'
import { API_BASE_URL } from '../../utils/config'
import toast from 'react-hot-toast'

const PatientRecords = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [patientAppointments, setPatientAppointments] = useState([])
  const [patientPrescriptions, setPatientPrescriptions] = useState([])
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching patients...')
      
      const response = await apiService.get('/patients')
      console.log('📊 Patients API Response:', response)
      
      if (response.success) {
        const patientsData = response.data || response.patients || []
        setPatients(patientsData)
        console.log('✅ Patients loaded successfully:', patientsData.length)
      } else {
        console.error('❌ Failed to fetch patients:', response.message)
        toast.error(response.message || 'Failed to load patients')
        setPatients([])
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error)
      toast.error('Failed to load patient records')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDetails = async (patientId) => {
    try {
      console.log('🔍 Fetching details for patient:', patientId)
      
      // Fetch patient appointments
      const appointmentsResponse = await apiService.get(`/appointments/patient/${patientId}`)
      if (appointmentsResponse.success) {
        setPatientAppointments(appointmentsResponse.appointments || [])
      }
      
      // Fetch patient prescriptions
      const prescriptionsResponse = await apiService.get(`/prescriptions/patient/${patientId}`)
      if (prescriptionsResponse.success) {
        setPatientPrescriptions(prescriptionsResponse.prescriptions || [])
      }
    } catch (error) {
      console.error('❌ Error fetching patient details:', error)
    }
  }

  useEffect(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.phone?.includes(searchTerm)
      
      return matchesSearch
    })
    
    setFilteredPatients(filtered)
  }, [patients, searchTerm])

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setActiveTab('overview')
    fetchPatientDetails(patient._id)
  }

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

  const getLastVisit = (appointments) => {
    if (!appointments || appointments.length === 0) return 'No visits'
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed')
    if (completedAppointments.length === 0) return 'No completed visits'
    
    const lastVisit = completedAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]
    return formatDate(lastVisit.appointmentDate)
  }

  const getNextAppointment = (appointments) => {
    if (!appointments || appointments.length === 0) return null
    
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
    
    const upcomingAppointments = appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate)
      return (apt.status === 'scheduled' || apt.status === 'confirmed') && appointmentDate >= now
    })
    
    if (upcomingAppointments.length === 0) return null
    
    const nextAppt = upcomingAppointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0]
    return formatDate(nextAppt.appointmentDate)
  }

  const getTotalVisits = (appointments) => {
    if (!appointments || appointments.length === 0) return 0
    return appointments.filter(apt => apt.status === 'completed').length
  }

  const handleDownloadReport = async (patientId) => {
    try {
      setDownloadingReport(true)
      toast.loading('Generating report...', { id: 'report-download' })
      
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication required', { id: 'report-download' })
        return
      }

      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/report`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patient-report-${selectedPatient.firstName}-${selectedPatient.lastName}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Report downloaded successfully!', { id: 'report-download' })
    } catch (error) {
      console.error('❌ Error downloading report:', error)
      toast.error(error.message || 'Failed to download report', { id: 'report-download' })
    } finally {
      setDownloadingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient records...</p>
        </div>
      </div>
    )
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedPatient(null)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Back to Patients
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedPatient.firstName} {selectedPatient.lastName}
            </h1>
            <p className="text-gray-600">Patient ID: #{selectedPatient._id}</p>
          </div>
          <button
            onClick={() => handleDownloadReport(selectedPatient._id)}
            disabled={downloadingReport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloadingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Age & Gender</p>
                <p className="font-semibold">{calculateAge(selectedPatient.dateOfBirth)} years, {selectedPatient.gender || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{selectedPatient.phone || 'No phone'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm">{selectedPatient.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="font-semibold">{getTotalVisits(patientAppointments)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'history', label: 'Treatment History', icon: Stethoscope },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Last Visit</h3>
                    <p className="text-blue-700">{getLastVisit(patientAppointments)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Next Appointment</h3>
                    <p className="text-green-700">{getNextAppointment(patientAppointments) || 'Not scheduled'}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Medical History</h3>
                  {selectedPatient.medicalHistory && selectedPatient.medicalHistory.trim().length > 0 ? (
                    <p className="text-orange-800 whitespace-pre-wrap">{selectedPatient.medicalHistory}</p>
                  ) : (
                    <p className="text-orange-600 italic">No medical history provided by patient</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appointment History</h3>
                {patientAppointments.length === 0 ? (
                  <p className="text-gray-600">No appointment history found.</p>
                ) : (
                  patientAppointments
                    .filter(appointment => appointment.status === 'completed')
                    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                    .map((appointment) => (
                      <div key={appointment._id} className="border-l-4 border-blue-500 pl-4 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{appointment.slotType || 'General Appointment'}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.appointmentDate)} • {appointment.startTime || 'Time not specified'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Doctor: {appointment.doctorId ? `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 'Not specified'}
                            </p>
                            {appointment.symptoms && (
                              <p className="text-sm mt-2 text-gray-700"><strong>Symptoms:</strong> {appointment.symptoms}</p>
                            )}
                            {appointment.notes && (
                              <p className="text-sm mt-1 text-gray-700"><strong>Notes:</strong> {appointment.notes}</p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-blue-600 capitalize">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prescriptions</h3>
                {patientPrescriptions.length === 0 ? (
                  <p className="text-gray-600">No prescriptions found.</p>
                ) : (
                  patientPrescriptions.map((prescription) => (
                    <div key={prescription._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{prescription.diagnosis}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Prescribed by: {prescription.doctorId ? `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}` : 'Unknown Doctor'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Date: {formatDate(prescription.prescriptionDate || prescription.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : prescription.status === 'dispensed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.status || 'active'}
                        </span>
                      </div>
                      
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Medications:</h5>
                          <div className="space-y-2">
                            {prescription.medications.map((med, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded">
                                <p className="font-medium text-gray-900">{med.name}</p>
                                <p className="text-sm text-gray-600">
                                  {med.dosage} • {med.duration}
                                  {med.frequency && ` • ${med.frequency}`}
                                </p>
                                {med.instructions && (
                                  <p className="text-sm text-gray-600 italic mt-1">{med.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {prescription.generalInstructions && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700">
                            <strong>Instructions:</strong> {prescription.generalInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600 mt-1">View and manage patient information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => handlePatientSelect(patient)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                        {patient.profileImage?.url || patient.profilePicture ? (
                          <img 
                            src={patient.profileImage?.url || patient.profilePicture} 
                            alt={`${patient.firstName} ${patient.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide the image and show the fallback icon
                              e.target.style.display = 'none';
                              const fallbackIcon = e.target.parentElement.querySelector('.fallback-icon');
                              if (fallbackIcon) fallbackIcon.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <User className={`fallback-icon w-6 h-6 text-blue-600 ${patient.profileImage?.url || patient.profilePicture ? 'hidden' : 'block'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{calculateAge(patient.dateOfBirth)} years, {patient.gender || 'N/A'}</span>
                          <span>•</span>
                          <span>{patient.phone || 'No phone'}</span>
                          <span>•</span>
                          <span>Last visit: N/A</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientRecords
