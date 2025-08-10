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
  CalendarDays
} from 'lucide-react'

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [loading, setLoading] = useState(true)

  // Sample appointments data
  const sampleAppointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah.johnson@email.com',
      patientPhone: '+1 234-567-8900',
      date: '2025-08-10',
      time: '09:00 AM',
      reason: 'Routine Checkup',
      status: 'pending',
      duration: '30 min',
      notes: 'Regular dental cleaning and examination',
      patientAge: 28,
      lastVisit: '2025-05-15'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      patientEmail: 'michael.chen@email.com',
      patientPhone: '+1 234-567-8901',
      date: '2025-08-10',
      time: '10:30 AM',
      reason: 'Tooth Pain',
      status: 'pending',
      duration: '45 min',
      notes: 'Patient reports severe pain in upper left molar',
      patientAge: 35,
      lastVisit: '2025-03-20'
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      patientEmail: 'emily.davis@email.com',
      patientPhone: '+1 234-567-8902',
      date: '2025-08-10',
      time: '02:00 PM',
      reason: 'Follow-up',
      status: 'completed',
      duration: '30 min',
      notes: 'Post-treatment checkup for root canal',
      patientAge: 42,
      lastVisit: '2025-07-25'
    },
    {
      id: 4,
      patientName: 'David Wilson',
      patientEmail: 'david.wilson@email.com',
      patientPhone: '+1 234-567-8903',
      date: '2025-08-10',
      time: '03:30 PM',
      reason: 'Cleaning',
      status: 'cancelled',
      duration: '30 min',
      notes: 'Patient cancelled due to emergency',
      patientAge: 29,
      lastVisit: '2025-02-10'
    },
    {
      id: 5,
      patientName: 'Lisa Anderson',
      patientEmail: 'lisa.anderson@email.com',
      patientPhone: '+1 234-567-8904',
      date: '2025-08-11',
      time: '09:00 AM',
      reason: 'Consultation',
      status: 'pending',
      duration: '60 min',
      notes: 'New patient consultation for orthodontic treatment',
      patientAge: 16,
      lastVisit: null
    },
    {
      id: 6,
      patientName: 'Robert Brown',
      patientEmail: 'robert.brown@email.com',
      patientPhone: '+1 234-567-8905',
      date: '2025-08-11',
      time: '11:00 AM',
      reason: 'Filling',
      status: 'completed',
      duration: '45 min',
      notes: 'Composite filling for cavity in tooth #14',
      patientAge: 45,
      lastVisit: '2025-07-20'
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setAppointments(sampleAppointments)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = appointments.filter(appointment => {
      const matchesStatus = appointment.status === activeTab
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = appointment.date === '2025-08-10'
      } else if (dateFilter === 'tomorrow') {
        matchesDate = appointment.date === '2025-08-11'
      } else if (dateFilter === 'week') {
        matchesDate = true
      }
      
      return matchesStatus && matchesSearch && matchesDate
    })
    
    setFilteredAppointments(filtered)
  }, [appointments, activeTab, searchTerm, dateFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
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
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleStartConsultation = (appointmentId) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completed' }
          : apt
      )
    )
  }

  const handleReschedule = (appointmentId) => {
    console.log('Reschedule appointment:', appointmentId)
  }

  const handleMarkComplete = (appointmentId) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completed' }
          : apt
      )
    )
  }

  const tabs = [
    { id: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
    { id: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length }
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
              placeholder="Search patients or reasons..."
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
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-1">⏱</span>
                          {appointment.duration}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.patientPhone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {appointment.patientEmail}
                        </div>
                        <div>
                          Age: {appointment.patientAge}
                        </div>
                        {appointment.lastVisit && (
                          <div>
                            Last visit: {appointment.lastVisit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStartConsultation(appointment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
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
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors">
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
    </div>
  )
}

export default Appointments
