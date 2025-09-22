import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  Plus,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  ChevronDown,
  CalendarDays,
  Stethoscope,
  FileText
} from 'lucide-react'
import apiService from '../../services/api'

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    notes: '',
    symptoms: '',
    isEmergency: false
  })
  const [completeFormData, setCompleteFormData] = useState({
    notes: ''
  })

  useEffect(() => {
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
      
      const params = new URLSearchParams({
        status: activeTab === 'pending' ? 'pending' : activeTab,
        limit: '50'
      })
      
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        params.append('date', today)
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.append('date', tomorrow.toISOString().split('T')[0])
      }
      
      console.log('📡 Making API call to:', `/appointments/doctor/my-appointments?${params}`)
      const response = await apiService.get(`/appointments/doctor/my-appointments?${params}`)
      console.log('📡 API Response:', response)
      
      if (response.success) {
        setAppointments(response.appointments)
      } else {
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
  }, [appointments, searchTerm])

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

  const handleReschedule = (appointmentId) => {
    // TODO: Implement reschedule functionality
    console.log('Reschedule appointment:', appointmentId)
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditFormData({
      notes: appointment.notes || '',
      symptoms: appointment.symptoms || '',
      isEmergency: appointment.isEmergency || false
    })
    setShowEditModal(true)
  }

  const handleUpdateAppointment = async () => {
    try {
      const response = await apiService.patch(
        `/appointments/doctor/update/${selectedAppointment.id}`,
        editFormData
      )
      
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === selectedAppointment.id 
              ? { ...apt, ...editFormData }
              : apt
          )
        )
        setShowEditModal(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      setError('Failed to update appointment')
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
    const allAppointments = appointments // This would include all statuses if we fetch them
    return {
      pending: appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
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
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <CalendarDays className="w-4 h-4 mr-2" />
            Schedule New
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </button>
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
              {activeTab === 'pending' ? 'No pending appointments found.' :
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
                        <button
                          onClick={() => handleStartConsultation(appointment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </button>
                        <button
                          onClick={() => handleCompleteAppointment(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleReschedule(appointment.id)}
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
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Appointment
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <textarea
                    value={editFormData.symptoms}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Patient symptoms..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEmergency"
                    checked={editFormData.isEmergency}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isEmergency" className="ml-2 block text-sm text-gray-900">
                    Mark as Emergency
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAppointment}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update
                </button>
              </div>
            </div>
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
    </div>
  )
}

export default Appointments
