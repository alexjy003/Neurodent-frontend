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
  Eye,
  Download,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight,
  User
} from 'lucide-react'
import apiService from '../../services/api'
import toast from 'react-hot-toast'
import { getUserType, redirectToCorrectDashboard, validateUserAccess } from '../../utils/navigationGuard'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [todaysAppointments, setTodaysAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [revenueData, setRevenueData] = useState({ months: [], currentMonth: { label: '', total: 0, count: 0 }, change: 0 })

  // Check authentication and load doctor data
  useEffect(() => {
    const checkAuth = () => {
      // First verify user type
      const userType = getUserType();
      if (!validateUserAccess('doctor', userType)) {
        console.warn(`🚫 Unauthorized access to doctor dashboard by ${userType} user`);
        redirectToCorrectDashboard(navigate);
        return;
      }

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

      // Fetch appointments - get all appointments to have complete data
      const appointmentsResponse = await apiService.get('/appointments/doctor/my-appointments?limit=100&status=all&appointmentType=all')
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

      // Fetch ratings
      try {
        const ratingsResponse = await apiService.get('/doctors/my-ratings')
        if (ratingsResponse.success) {
          setRatingData(ratingsResponse)
          console.log('⭐ Loaded ratings:', ratingsResponse)
        }
      } catch (ratingsError) {
        console.log('⚠️ Could not load ratings:', ratingsError.message)
      }

      // Fetch revenue
      try {
        const revenueResponse = await apiService.get('/appointments/doctor/revenue')
        if (revenueResponse.success) {
          setRevenueData(revenueResponse)
        }
      } catch (revenueError) {
        console.log('⚠️ Could not load revenue:', revenueError.message)
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

  // Debug: Log all unique status values to understand what's in the data
  const uniqueStatuses = [...new Set(appointments.map(apt => apt.status))];
  console.log('🔍 Unique appointment statuses found:', uniqueStatuses);
  console.log('📊 Total appointments loaded:', appointments.length);

  const stats = {
    todayAppointments: todaysAppointments.length,
    pendingAppointments: appointments.filter(apt => 
      apt.status === 'pending' || 
      apt.status === 'scheduled' || 
      apt.status === 'confirmed' ||
      apt.status === 'booked' ||
      (apt.status !== 'completed' && apt.status !== 'cancelled')
    ).length,
    completedAppointments: appointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'done' || apt.status === 'finished'
    ).length,
    cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
    totalPatients: patients.length,
    patientSatisfaction: ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '—'
  }

  // Debug: Log calculated stats
  console.log('📊 Calculated stats:', stats);

  // Compute next upcoming appointment from ALL appointments (not just today)
  const nextAppointment = appointments
    .filter(apt => {
      const aptDate = apt.appointmentDate || apt.date
      return aptDate >= today && (
        apt.status === 'pending' ||
        apt.status === 'scheduled' ||
        apt.status === 'confirmed' ||
        apt.status === 'booked'
      )
    })
    .sort((a, b) => {
      const dateA = a.appointmentDate || a.date || ''
      const dateB = b.appointmentDate || b.date || ''
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return (a.startTime || '').localeCompare(b.startTime || '')
    })[0] || null

  // Weekly appointments data (Sun–Sat of current week)
  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyData = weekDayLabels.map((label, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + idx)
    const dateStr = d.toISOString().split('T')[0]
    const dayAppts = appointments.filter(apt => (apt.appointmentDate || apt.date) === dateStr)
    return {
      label,
      dateStr,
      total: dayAppts.length,
      completed: dayAppts.filter(a => a.status === 'completed' || a.status === 'done' || a.status === 'finished').length,
      isToday: dateStr === today
    }
  })
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.total), 1)



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
                      style={{ width: `${appointments.length > 0 ? (stats.pendingAppointments / appointments.length) * 100 : 0}%` }}
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
                      style={{ width: `${appointments.length > 0 ? (stats.completedAppointments / appointments.length) * 100 : 0}%` }}
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
                      style={{ width: `${appointments.length > 0 ? (stats.cancelledAppointments / appointments.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-green-600">
                ₹{revenueData.currentMonth.total.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{revenueData.currentMonth.count} appointment{revenueData.currentMonth.count !== 1 ? 's' : ''} this month</span>
                {revenueData.months.length >= 2 && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    revenueData.change > 0 ? 'bg-green-100 text-green-700' :
                    revenueData.change < 0 ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {revenueData.change > 0 ? '+' : ''}{revenueData.change}% vs last month
                  </span>
                )}
              </div>
            </div>
            {/* 6-month bar chart */}
            {revenueData.months.length > 0 && (() => {
              const maxRev = Math.max(...revenueData.months.map(m => m.total), 1);
              return (
                <div className="flex items-end justify-between space-x-1" style={{ height: '60px' }}>
                  {revenueData.months.map((m, i) => {
                    const isCurrentMonth = i === revenueData.months.length - 1;
                    const heightPct = m.total > 0 ? Math.max((m.total / maxRev) * 100, 8) : 4;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div className="w-full flex flex-col justify-end" style={{ height: '48px' }}>
                          <div
                            className={`w-full rounded-t-sm transition-all duration-500 ${
                              isCurrentMonth ? 'bg-green-500' : 'bg-green-200'
                            }`}
                            style={{ height: `${heightPct}%` }}
                            title={`${m.label}: ₹${m.total.toLocaleString('en-IN')}`}
                          />
                        </div>
                        <span className={`text-[10px] mt-1 font-medium ${
                          isCurrentMonth ? 'text-green-600' : 'text-gray-400'
                        }`}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Patient Feedback Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Feedback</h3>
              <Star className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-yellow-600">{ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '—'}</span>
                <Star className="w-6 h-6 text-yellow-500 ml-2 fill-current" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Average Rating</p>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingData.distribution[rating] || 0;
                  const pct = ratingData.totalRatings > 0 ? Math.round((count / ratingData.totalRatings) * 100) : 0;
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 w-2">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-3">Based on {ratingData.totalRatings} patient review{ratingData.totalRatings !== 1 ? 's' : ''}</p>
            </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {todaysAppointments.length > 0
                    ? `${todaysAppointments.filter(a => a.status === 'completed' || a.status === 'done').length} of ${todaysAppointments.length} completed`
                    : 'No appointments today'}
                </p>
              </div>
              {/* Weekly mini bar chart */}
              <div className="flex items-end space-x-1.5">
                {weeklyData.map((d) => (
                  <div key={d.dateStr} className="flex flex-col items-center">
                    <div className="relative flex flex-col justify-end" style={{ height: '36px', width: '18px' }}>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          d.isToday ? 'bg-blue-500' : 'bg-blue-200'
                        }`}
                        style={{ height: `${d.total > 0 ? Math.max((d.total / maxWeeklyCount) * 100, 15) : 4}%` }}
                        title={`${d.label}: ${d.total} appointments`}
                      />
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${
                      d.isToday ? 'text-blue-600' : 'text-gray-400'
                    }`}>{d.label[0]}</span>
                  </div>
                ))}
              </div>
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
            {/* Next Appointment - real upcoming data */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Next Appointment</h3>
              {nextAppointment ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg leading-tight">{nextAppointment.patientName}</p>
                      <p className="text-blue-100 text-xs">{nextAppointment.patientPhone || nextAppointment.patientEmail || ''}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-200" />
                      <span className="text-sm">
                        {(nextAppointment.appointmentDate || nextAppointment.date) === today
                          ? 'Today'
                          : new Date((nextAppointment.appointmentDate || nextAppointment.date) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-200" />
                      <span className="text-sm">{formatTime(nextAppointment.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-200" />
                      <span className="text-sm">{nextAppointment.symptoms || nextAppointment.reason || nextAppointment.slotType || 'General Consultation'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="w-full mt-1 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <span>View All Appointments</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                  <p className="text-blue-100 text-sm">No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/doctor/prescriptions')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3"
                >
                  <FileText className="w-5 h-5" />
                  <span>Prescriptions</span>
                </button>
                <button
                  onClick={() => navigate('/doctor/patient-records')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3"
                >
                  <Users className="w-5 h-5" />
                  <span>Patient Records</span>
                </button>
                <button
                  onClick={() => navigate('/doctor/patient-records')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-3"
                >
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
