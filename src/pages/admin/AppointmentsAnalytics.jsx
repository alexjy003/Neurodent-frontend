import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const AppointmentsAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState('all-time')
  
  // Analytics state
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    cancelled: 0,
    revenue: 0,
    completionRate: 0
  })
  const [weeklyOverview, setWeeklyOverview] = useState({ labels: [], scheduled: [], completed: [], cancelled: [] })
  const [monthlyRevenue, setMonthlyRevenue] = useState({ labels: [], values: [] })
  const [appointmentTypes, setAppointmentTypes] = useState({ labels: [], values: [] })
  const [doctorPerformance, setDoctorPerformance] = useState({ labels: [], completed: [], revenue: [] })
  const [insights, setInsights] = useState({ peakHour: '10:00', avgDuration: 30, noShowRate: 0 })

  useEffect(() => {
    fetchAllData()
  }, [selectedDateRange])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        toast.error('Please login to access analytics')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all data in parallel
      const [
        statsRes,
        weeklyRes,
        revenueRes,
        typesRes,
        doctorRes,
        insightsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/stats?dateRange=${selectedDateRange}`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/weekly-overview`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/monthly-revenue`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/types`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/doctor-performance`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/appointments/insights`, { headers })
      ])

      const statsData = await statsRes.json()
      const weeklyData = await weeklyRes.json()
      const revenueData = await revenueRes.json()
      const typesData = await typesRes.json()
      const doctorData = await doctorRes.json()
      const insightsData = await insightsRes.json()

      console.log('📊 Stats Response:', statsData)
      console.log('📊 Stats Data:', statsData.stats)
      
      if (statsData.success) {
        setStats(statsData.stats)
        console.log('✅ Stats set:', statsData.stats)
      }
      if (weeklyData.success) setWeeklyOverview(weeklyData.data)
      if (revenueData.success) setMonthlyRevenue(revenueData.data)
      if (typesData.success) setAppointmentTypes(typesData.data)
      if (doctorData.success) setDoctorPerformance(doctorData.data)
      if (insightsData.success) setInsights(insightsData.insights)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Analytics data
  const weeklyAppointmentsData = {
    labels: weeklyOverview.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Scheduled',
        data: weeklyOverview.scheduled || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Completed',
        data: weeklyOverview.completed || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Cancelled',
        data: weeklyOverview.cancelled || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  }

  const revenueChartData = {
    labels: monthlyRevenue.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthlyRevenue.values || [0, 0, 0, 0],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const appointmentTypesData = {
    labels: appointmentTypes.labels || [],
    datasets: [
      {
        data: appointmentTypes.values || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
        ],
        borderWidth: 0,
      },
    ],
  }

  const doctorPerformanceData = {
    labels: doctorPerformance.labels || [],
    datasets: [
      {
        label: 'Completed Appointments',
        data: doctorPerformance.completed || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        yAxisID: 'y',
      },
      {
        label: 'Revenue Generated (₹)',
        data: doctorPerformance.revenue || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        yAxisID: 'y1',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Completed Appointments'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const chartOptionsSimple = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments & Analytics</h1>
          <p className="text-gray-600">Track appointment metrics and performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all-time">All Time</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">Selected period</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">
                  {stats.completionRate}% completion rate
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">Upcoming appointments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">Selected period</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Appointments Overview</h3>
          <div className="h-80">
            <Bar data={weeklyAppointmentsData} options={chartOptionsSimple} />
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptionsSimple} />
          </div>
        </div>
      </div>

      {/* Doctor Performance and Appointment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Performance</h3>
          <div className="h-80">
            <Bar data={doctorPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Appointment Types Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Types</h3>
          <div className="h-80">
            <Doughnut 
              data={appointmentTypesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Peak Hours</h4>
              <p className="text-3xl font-bold mt-2">{insights.peakHour}</p>
              <p className="text-blue-100">Highest appointment volume</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Avg Duration</h4>
              <p className="text-3xl font-bold mt-2">{insights.avgDuration} min</p>
              <p className="text-green-100">Per appointment</p>
            </div>
            <Clock className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">No-Show Rate</h4>
              <p className="text-3xl font-bold mt-2">{insights.noShowRate}%</p>
              <p className="text-purple-100">Cancellation rate</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsAnalytics