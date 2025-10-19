import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight,
  User
} from 'lucide-react'
import apiService from '../../services/api'
import toast from 'react-hot-toast'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [todaysAppointments, setTodaysAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)

  // Check authentication and load doctor data
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('doctorToken')
      const doctorInfo = localStorage.getItem('doctorInfo')

      if (!token || !doctorInfo) {
        navigate('/login') // Use main login instead of /doctor/login
        return
      }

      try {
        const parsedDoctor = JSON.parse(doctorInfo)
        setDoctor(parsedDoctor)
        // Load real data after authentication
        loadDashboardData()
      } catch (error) {
        console.error('Error parsing doctor info:', error)
        navigate('/login') // Use main login instead of /doctor/login
        return
      }
    }

    checkAuth()
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading dashboard data...')

      // Fetch appointments
      const appointmentsResponse = await apiService.get('/appointments/doctor/my-appointments?limit=50')
      console.log('📅 Appointments response:', appointmentsResponse)
      
      if (appointmentsResponse.success) {
        const allAppointments = appointmentsResponse.appointments || []
        setAppointments(allAppointments)
        
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0]
        const todaysAppts = allAppointments.filter(apt => {
          const appointmentDate = apt.appointmentDate || apt.date
          return appointmentDate === today
        })
        setTodaysAppointments(todaysAppts)
        
        console.log('✅ Loaded appointments:', allAppointments.length, 'Today:', todaysAppts.length)
      } else {
        console.error('❌ Failed to fetch appointments:', appointmentsResponse.message)
        toast.error('Failed to load appointments')
      }

      // Fetch patients (optional - for total count)
      try {
        const patientsResponse = await apiService.get('/patients')
        console.log('👥 Patients response:', patientsResponse)
        
        if (patientsResponse.success) {
          const patientsData = patientsResponse.data || patientsResponse.patients || []
          setPatients(patientsData)
          console.log('✅ Loaded patients:', patientsData.length)
        }
      } catch (patientsError) {
        console.log('⚠️ Could not load patients (optional):', patientsError.message)
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('doctorToken')
    localStorage.removeItem('doctorInfo')
    navigate('/login') // Use main login instead of /doctor/login
  }

  const today = new Date().toISOString().split('T')[0]

  const stats = {
    todayAppointments: todaysAppointments.length,
    pendingAppointments: todaysAppointments.filter(apt => 
      apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length,
    completedAppointments: todaysAppointments.filter(apt => apt.status === 'completed').length,
    cancelledAppointments: todaysAppointments.filter(apt => apt.status === 'cancelled').length,
    totalPatients: patients.length,
    patientSatisfaction: 4.8 // Keep as mock for now
  }



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
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
      case 'pending':
      case 'scheduled':
      case 'confirmed':
        return <AlertCircle className="w-4 h-4" />
      case 'completed': 
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled': 
        return <XCircle className="w-4 h-4" />
      default: 
        return <Clock className="w-4 h-4" />
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    // If it's already in 12-hour format, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString
    }
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {doctor?.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Good Morning, Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor'}
              </h1>
              <p className="text-gray-600 mt-1">Ready to make a difference in your patients' lives today?</p>
              {doctor && (
                <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patient Rating</p>
                <div className="flex items-center mt-2">
                  <p className="text-3xl font-bold text-purple-600">{stats.patientSatisfaction}</p>
                  <Star className="w-6 h-6 text-yellow-400 ml-2 fill-current" />
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
      </div>

      {/* Charts and Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments Status Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointments by Status</h3>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{stats.pendingAppointments}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{ width: `${(stats.pendingAppointments / stats.todayAppointments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{stats.completedAppointments}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${(stats.completedAppointments / stats.todayAppointments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{stats.cancelledAppointments}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{ width: `${stats.todayAppointments > 0 ? (stats.cancelledAppointments / stats.todayAppointments) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Upcoming Appointment */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Appointment</h3>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            {todaysAppointments.filter(apt => 
              apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
            ).length > 0 ? (
              <div className="space-y-4">
                {todaysAppointments
                  .filter(apt => apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed')
                  .slice(0, 1)
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                      <span className="text-sm text-blue-600 font-medium">
                        {formatTime(appointment.startTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{appointment.symptoms || appointment.reason || appointment.slotType}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{appointment.patientPhone || 'No phone'}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Patient Feedback Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Feedback</h3>
              <Star className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-yellow-600">{stats.patientSatisfaction}</span>
                <Star className="w-6 h-6 text-yellow-500 ml-2 fill-current" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Average Rating</p>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-2">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-yellow-500 rounded-full"
                        style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 8 : rating === 2 ? 2 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{rating === 5 ? '70%' : rating === 4 ? '20%' : rating === 3 ? '8%' : rating === 2 ? '2%' : '0%'}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">Based on 24 patient reviews</p>
            </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Appointment</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              ) : (
                todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                          {appointment.patientId?.profileImage?.url || appointment.patientProfilePicture ? (
                            <img 
                              src={appointment.patientId?.profileImage?.url || appointment.patientProfilePicture} 
                              alt={appointment.patientName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallbackIcon = e.target.parentElement.querySelector('.fallback-icon');
                                if (fallbackIcon) fallbackIcon.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <Users className={`fallback-icon w-6 h-6 text-blue-600 ${appointment.patientId?.profileImage?.url || appointment.patientProfilePicture ? 'hidden' : 'block'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.symptoms || appointment.reason || appointment.slotType}</p>
                          <p className="text-sm text-gray-500">{appointment.patientPhone || appointment.patientEmail || 'No contact'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatTime(appointment.startTime)}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      {(appointment.status === 'pending' || appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                          <button className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                            Start Consultation
                          </button>
                          <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            Reschedule
                          </button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <button className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Next Appointment */}
          <div className="space-y-6">
            {/* Next Appointment */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Next Appointment</h3>
              {todaysAppointments.filter(apt => 
                apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
              )[0] ? (
                <div>
                  <p className="text-blue-100 text-sm">Patient</p>
                  <p className="font-semibold text-lg">
                    {todaysAppointments.filter(apt => 
                      apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
                    )[0].patientName}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">Time</p>
                  <p className="font-semibold">
                    {formatTime(todaysAppointments.filter(apt => 
                      apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
                    )[0].startTime)}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">Reason</p>
                  <p className="font-semibold">
                    {todaysAppointments.filter(apt => 
                      apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
                    )[0].symptoms || todaysAppointments.filter(apt => 
                      apt.status === 'pending' || apt.status === 'scheduled' || apt.status === 'confirmed'
                    )[0].slotType || 'General Consultation'}
                  </p>
                </div>
              ) : (
                <p className="text-blue-100">No upcoming appointments</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>New Prescription</span>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>Patient Records</span>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span>Download Reports</span>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
