import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Stethoscope,
  FileText,
  Brain,
  PenTool,
  Zap,
  Save,
  X,
  Plus
} from 'lucide-react'
import apiService from '../../services/api'

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [appointments, setAppointments] = useState([])
  const [pastPendingAppointments, setPastPendingAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filteredPastPending, setFilteredPastPending] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [prescriptionMode, setPrescriptionMode] = useState('ai') // 'ai' or 'manual'
  const [generatingPrescription, setGeneratingPrescription] = useState(false)
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [slotError, setSlotError] = useState('')
  const [completeFormData, setCompleteFormData] = useState({
    notes: ''
  })
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTimeSlot: '',
    reason: ''
  })
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [],
    instructions: '',
    diagnosis: '',
    followUpDate: '',
    aiGenerated: false
  })

  useEffect(() => {
    console.log('🔄 useEffect triggered. Active tab:', activeTab, 'Date filter:', dateFilter)
    fetchAppointments()
  }, [activeTab, dateFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Debug: Check if doctorToken exists
      const doctorToken = localStorage.getItem('doctorToken')
      console.log('🔍 Frontend Debug:')
      console.log('- Doctor token available:', doctorToken ? 'Yes' : 'No')
      console.log('- Token preview:', doctorToken ? doctorToken.substring(0, 20) + '...' : 'None')
      console.log('- Active tab:', activeTab)
      console.log('- Date filter:', dateFilter)
      
      const params = new URLSearchParams({
        status: activeTab === 'pending' ? 'pending' : activeTab,
        limit: '50'
      })
      
      // For pending appointments, fetch both upcoming and past
      if (activeTab === 'pending') {
        params.append('appointmentType', 'upcoming')
      }
      
      // Only apply date filters when not on "All Dates"
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        params.append('date', today)
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.append('date', tomorrow.toISOString().split('T')[0])
      }
      // For "All Dates" option, don't add any date filter
      
      console.log('📡 Making API call to:', `/appointments/doctor/my-appointments?${params}`)
      const response = await apiService.get(`/appointments/doctor/my-appointments?${params}`)
      console.log('📡 API Response:', response)
      
      if (response.success) {
        setAppointments(response.appointments || [])
        
        // If it's pending tab, also fetch past pending appointments
        if (activeTab === 'pending') {
          const pastParams = new URLSearchParams({
            status: 'pending',
            appointmentType: 'past',
            limit: '50'
          })
          
          console.log('📡 Fetching past pending appointments...')
          const pastResponse = await apiService.get(`/appointments/doctor/my-appointments?${pastParams}`)
          
          if (pastResponse.success) {
            setPastPendingAppointments(pastResponse.appointments || [])
            console.log('📡 Past pending appointments:', pastResponse.appointments)
          } else {
            setPastPendingAppointments([])
            console.log('❌ Failed to fetch past pending appointments:', pastResponse.message)
          }
        } else {
          setPastPendingAppointments([])
        }
        
        setError('') // Clear any previous errors
        console.log('✅ Appointments set successfully. Count:', response.appointments?.length || 0)
      } else {
        console.log('❌ Response not successful:', response)
        setError('Failed to fetch appointments')
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error)
      setError('Failed to load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.slotType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesSearch
    })
    
    setFilteredAppointments(filtered)
    
    // Also filter past pending appointments if they exist
    if (pastPendingAppointments.length > 0) {
      let filteredPast = pastPendingAppointments.filter(appointment => {
        const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             appointment.slotType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
        
        return matchesSearch
      })
      
      setFilteredPastPending(filteredPast)
    } else {
      setFilteredPastPending([])
    }
  }, [appointments, pastPendingAppointments, searchTerm])

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleStartConsultation = async (appointmentId) => {
    try {
      const response = await apiService.patch(`/appointments/doctor/start/${appointmentId}`)
      
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'confirmed' }
              : apt
          )
        )
      }
    } catch (error) {
      console.error('Error starting consultation:', error)
      setError('Failed to start consultation')
    }
  }

  const handleOpenPrescription = (appointment) => {
    setSelectedAppointment(appointment)
    setPrescriptionData({
      medications: [],
      instructions: '',
      diagnosis: '',
      followUpDate: '',
      aiGenerated: false
    })
    setShowPrescriptionModal(true)
  }

  const generateAIPrescription = async () => {
    if (!selectedAppointment) return
    
    setGeneratingPrescription(true)
    try {
      console.log('🤖 Generating AI prescription for:', selectedAppointment.patientName)
      
      const response = await apiService.post('/prescriptions/generate-ai', {
        symptoms: selectedAppointment.symptoms || 'General dental consultation',
        patientName: selectedAppointment.patientName,
        patientAge: selectedAppointment.patientAge,
        medicalHistory: selectedAppointment.medicalHistory || '',
        allergies: selectedAppointment.allergies || ''
      })
      
      if (response.success) {
        console.log('✅ AI prescription generated:', response.data)
        
        setPrescriptionData({
          diagnosis: response.data.diagnosis,
          medications: response.data.medications,
          instructions: response.data.generalInstructions,
          followUpDate: response.data.followUpDate,
          aiGenerated: true
        })
        
        toast.success('AI prescription generated successfully!')
      } else {
        throw new Error(response.message || 'Failed to generate AI prescription')
      }
    } catch (error) {
      console.error('❌ Error generating AI prescription:', error)
      toast.error(error.response?.data?.message || 'Failed to generate AI prescription')
      
      // Fallback to mock data if AI fails
      const mockAIPrescription = {
        diagnosis: 'Dental pain management',
        medications: [
          {
            name: 'Ibuprofen 400mg',
            dosage: '1 tablet',
            duration: '5 days',
            instructions: 'Take after meals',
            frequency: 'Every 6-8 hours as needed'
          }
        ],
        instructions: 'Maintain good oral hygiene. Avoid hard foods for 24 hours. Apply cold compress if swelling occurs.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        aiGenerated: true
      }
      
      setPrescriptionData(mockAIPrescription)
      toast.info('Using fallback prescription due to AI service error')
    } finally {
      setGeneratingPrescription(false)
    }
  }

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', duration: '', instructions: '' }
      ]
    }))
  }

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const savePrescription = async () => {
    try {
      console.log('💾 Saving prescription:', prescriptionData)
      
      const prescriptionPayload = {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId || 'temp-patient-id', // You may need to get this from appointment
        patientName: selectedAppointment.patientName,
        patientAge: selectedAppointment.patientAge,
        diagnosis: prescriptionData.diagnosis,
        symptoms: selectedAppointment.symptoms,
        medications: prescriptionData.medications,
        generalInstructions: prescriptionData.instructions,
        followUpDate: prescriptionData.followUpDate,
        isAIGenerated: prescriptionData.aiGenerated || false,
        notes: prescriptionData.notes || ''
      }
      
      const response = await apiService.post('/prescriptions', prescriptionPayload)
      
      if (response.success) {
        toast.success('Prescription saved successfully!')
        setShowPrescriptionModal(false)
        setSelectedAppointment(null)
        // Optionally refresh appointments
        fetchAppointments()
      } else {
        throw new Error(response.message || 'Failed to save prescription')
      }
    } catch (error) {
      console.error('❌ Error saving prescription:', error)
      toast.error(error.response?.data?.message || 'Failed to save prescription')
    }
  }

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      newDate: '',
      newTimeSlot: '',
      reason: ''
    })
    setAvailableTimeSlots([])
    setShowRescheduleModal(true)
  }

  const fetchAvailableSlots = async (date) => {
    if (!date) return
    
    setLoadingTimeSlots(true)
    setSlotError('') // Clear previous errors
    try {
      console.log(`🔍 Fetching slots for date: ${date}`)
      const response = await apiService.get(`/appointments/doctor/available-slots?date=${date}`)
      
      console.log(`📅 API Response:`, response)
      
      if (response.success) {
        const slots = response.data?.availableSlots || []
        console.log(`✅ Found ${slots.length} available slots:`, slots)
        setAvailableTimeSlots(slots)
        
        if (slots.length === 0) {
          setSlotError('No available time slots for the selected date. The doctor may not be working or all slots are booked.')
        }
      } else {
        console.log(`❌ API Error:`, response.message)
        setAvailableTimeSlots([])
        setSlotError(response.message || 'Failed to fetch available time slots')
      }
    } catch (error) {
      console.error('❌ Error fetching available slots:', error)
      console.error('❌ Error details:', error.response?.data)
      setAvailableTimeSlots([])
      
      if (error.response?.status === 401) {
        setSlotError('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        setSlotError('Doctor schedule not found. Please contact admin to set up your schedule.')
      } else {
        setSlotError(error.response?.data?.message || error.message || 'Failed to fetch available time slots. Please try again.')
      }
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  const handleDateChange = (newDate) => {
    console.log('📅 Date changed to:', newDate)
    setRescheduleData(prev => ({
      ...prev,
      newDate: newDate,
      newTimeSlot: '' // Reset time slot when date changes
    }))
    
    // Add validation for date format
    if (newDate && new Date(newDate).toString() !== 'Invalid Date') {
      fetchAvailableSlots(newDate)
    } else {
      console.error('❌ Invalid date format:', newDate)
      setSlotError('Invalid date format')
    }
  }

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment || !rescheduleData.newDate || !rescheduleData.newTimeSlot) {
      setError('Please select both date and time slot')
      return
    }

    try {
      const response = await apiService.patch(`/appointments/doctor/reschedule/${selectedAppointment.id}`, {
        newDate: rescheduleData.newDate,
        newTimeSlot: rescheduleData.newTimeSlot,
        reason: rescheduleData.reason || 'Rescheduled by doctor'
      })
      
      if (response.success) {
        // Close modal and refresh appointments from server
        setShowRescheduleModal(false)
        setSelectedAppointment(null)
        setRescheduleData({
          newDate: '',
          newTimeSlot: '',
          reason: ''
        })
        
        // Show success message
        console.log('✅ Appointment rescheduled successfully')
        
        // Refresh appointments to get updated data from server
        await fetchAppointments()
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      setError(error.response?.data?.message || 'Failed to reschedule appointment')
    }
  }

  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setCompleteFormData({
      notes: appointment.notes || ''
    })
    setShowCompleteModal(true)
  }

  const handleMarkComplete = async () => {
    try {
      const response = await apiService.patch(
        `/appointments/doctor/complete/${selectedAppointment.id}`,
        completeFormData
      )
      
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === selectedAppointment.id 
              ? { ...apt, status: 'completed', notes: completeFormData.notes }
              : apt
          )
        )
        setShowCompleteModal(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error('Error completing appointment:', error)
      setError('Failed to complete appointment')
    }
  }

  const getTabCounts = () => {
    // For pending tab, only count upcoming appointments
    const pendingCount = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length
    
    return {
      pending: pendingCount,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    }
  }

  const tabs = [
    { id: 'pending', label: 'Pending', count: getTabCounts().pending },
    { id: 'completed', label: 'Completed', count: getTabCounts().completed },
    { id: 'cancelled', label: 'Cancelled', count: getTabCounts().cancelled }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients, symptoms, or reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="all">All Dates</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'pending' ? 'No upcoming pending appointments found.' :
               activeTab === 'completed' ? 'No completed appointments found.' :
               'No cancelled appointments found.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {appointment.patientName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                        {appointment.isEmergency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Emergency
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.timeRange}
                        </div>
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          {appointment.slotType}
                        </div>
                      </div>
                      {appointment.symptoms && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.patientPhone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {appointment.patientEmail}
                        </div>
                        {appointment.patientAge && (
                          <div>
                            Age: {appointment.patientAge}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <>
                        <div className="relative">
                          <button
                            onClick={() => handleOpenPrescription(appointment)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Prescription
                          </button>
                        </div>
                        <button
                          onClick={() => handleCompleteAppointment(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleReschedule(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reschedule
                        </button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Pending Appointments Section - Only show when on pending tab and have past appointments */}
      {activeTab === 'pending' && filteredPastPending.length > 0 && (
        <div className="bg-white shadow rounded-lg mt-6 border-t-4 border-orange-400">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-orange-900">Past Pending Appointments</h3>
                  <p className="text-sm text-orange-700">
                    These appointments were scheduled for past dates but haven't been marked as completed
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-800">
                {filteredPastPending.length} {filteredPastPending.length === 1 ? 'appointment' : 'appointments'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredPastPending.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-orange-25 transition-colors bg-orange-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {appointment.patientName}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="ml-1 capitalize">Past Due</span>
                        </span>
                        {appointment.isEmergency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Emergency
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center text-orange-600 font-medium">
                          <Calendar className="w-4 h-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.timeRange}
                        </div>
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          {appointment.slotType}
                        </div>
                      </div>
                      {appointment.symptoms && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.patientPhone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {appointment.patientEmail}
                        </div>
                        {appointment.patientAge && (
                          <div>
                            Age: {appointment.patientAge}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={() => handleOpenPrescription(appointment)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Prescription
                      </button>
                    </div>
                    <button
                      onClick={() => handleCompleteAppointment(appointment)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleReschedule(appointment)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Appointment Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Complete Appointment
                </h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient: {selectedAppointment?.patientName}
                  </label>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment?.date} at {selectedAppointment?.timeRange}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Notes
                  </label>
                  <textarea
                    value={completeFormData.notes}
                    onChange={(e) => setCompleteFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Add treatment notes, observations, or follow-up instructions..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-4/5 max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Create Prescription - {selectedAppointment?.patientName}
                </h3>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Prescription Mode Toggle */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Prescription Mode:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPrescriptionMode('ai')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      prescriptionMode === 'ai'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Generated
                  </button>
                  <button
                    onClick={() => setPrescriptionMode('manual')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      prescriptionMode === 'manual'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Manual Entry
                  </button>
                </div>
              </div>

              {/* AI Generation Section */}
              {prescriptionMode === 'ai' && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-purple-900">AI Prescription Generator</h4>
                    <button
                      onClick={generateAIPrescription}
                      disabled={generatingPrescription}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {generatingPrescription ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Prescription
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-purple-700">
                    Based on patient symptoms: "{selectedAppointment?.symptoms || 'No symptoms recorded'}"
                  </p>
                </div>
              )}

              {/* Prescription Form */}
              <div className="space-y-6">
                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Medications
                    </label>
                    <button
                      onClick={addMedication}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Medication
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {prescriptionData.medications.map((medication, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">Medication {index + 1}</h5>
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Medication Name
                            </label>
                            <input
                              type="text"
                              value={medication.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Ibuprofen 400mg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Dosage
                            </label>
                            <input
                              type="text"
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 1 tablet twice daily"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 5 days"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Instructions
                            </label>
                            <input
                              type="text"
                              value={medication.instructions}
                              onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Take after meals"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {prescriptionData.medications.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No medications added yet</p>
                        <p className="text-sm">Click "Add Medication" to start</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* General Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Instructions
                  </label>
                  <textarea
                    value={prescriptionData.instructions}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="General care instructions, precautions, or additional notes..."
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={savePrescription}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Reschedule Appointment
                </h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Current Appointment Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-medium text-blue-900 mb-2">Current Appointment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Patient:</span>
                    <span className="ml-2 text-blue-600">{selectedAppointment?.patientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Current Date:</span>
                    <span className="ml-2 text-blue-600">{selectedAppointment?.date}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Current Time:</span>
                    <span className="ml-2 text-blue-600">{selectedAppointment?.timeRange}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Type:</span>
                    <span className="ml-2 text-blue-600">{selectedAppointment?.slotType}</span>
                  </div>
                </div>
                {selectedAppointment?.symptoms && (
                  <div className="mt-2">
                    <span className="font-medium text-blue-700">Symptoms:</span>
                    <span className="ml-2 text-blue-600">{selectedAppointment.symptoms}</span>
                  </div>
                )}
              </div>

              {/* Reschedule Form */}
              <div className="space-y-6">
                {/* New Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleData.newDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {loadingTimeSlots ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading available slots...</span>
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableTimeSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setRescheduleData(prev => ({ ...prev, newTimeSlot: slot }))}
                          className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                            rescheduleData.newTimeSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : rescheduleData.newDate ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No available slots for selected date</p>
                      <p className="text-sm">Please choose a different date</p>
                      {slotError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                          <div className="text-red-800 font-medium text-sm mb-2">Error Details:</div>
                          <div className="text-red-700 text-xs">{slotError}</div>
                          <div className="mt-3 text-xs text-gray-600">
                            <strong>Troubleshooting:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Ensure the doctor has a schedule set up for this day</li>
                              <li>Check if the selected date is a working day</li>
                              <li>Verify all time slots aren't already booked</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Select a date to see available time slots</p>
                    </div>
                  )}
                </div>

                {/* Reason for Reschedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Reschedule (Optional)
                  </label>
                  <textarea
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Explain why the appointment is being rescheduled..."
                  />
                </div>

                {/* Selected New Schedule Summary */}
                {rescheduleData.newDate && rescheduleData.newTimeSlot && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">New Schedule Summary</h5>
                    <div className="text-sm text-green-700">
                      <p><span className="font-medium">Date:</span> {new Date(rescheduleData.newDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><span className="font-medium">Time:</span> {rescheduleData.newTimeSlot}</p>
                      <p><span className="font-medium">Patient:</span> {selectedAppointment?.patientName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={!rescheduleData.newDate || !rescheduleData.newTimeSlot}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
