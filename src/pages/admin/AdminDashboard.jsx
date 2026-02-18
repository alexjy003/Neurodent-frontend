import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Clock
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
import { getUserType, redirectToCorrectDashboard, validateUserAccess } from '../../utils/navigationGuard'
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

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    appointmentChange: 0,
    revenueThisMonth: 0,
    revenueChange: 0,
    activeDoctors: 0,
    patientsToday: 0
  })
  const [weeklyAppointments, setWeeklyAppointments] = useState({ labels: [], values: [] })
  const [monthlyRevenue, setMonthlyRevenue] = useState({ labels: [], values: [] })
  const [doctorPerformance, setDoctorPerformance] = useState({ labels: [], values: [] })
  const [treatmentTypes, setTreatmentTypes] = useState({ labels: [], values: [] })
  const [inventoryAlerts, setInventoryAlerts] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  
  // Verify user is actually an admin and redirect if not
  useEffect(() => {
    const userType = getUserType();
    if (!validateUserAccess('admin', userType)) {
      console.warn(`🚫 Unauthorized access to admin dashboard by ${userType} user`);
      redirectToCorrectDashboard(navigate);
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData()
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        toast.error('Please login to access dashboard')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all dashboard data in parallel
      const [
        statsRes,
        weeklyRes,
        revenueRes,
        doctorRes,
        treatmentRes,
        inventoryRes,
        activityRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/admin-dashboard/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/weekly-appointments`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/monthly-revenue`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/doctor-performance`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/treatment-types`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/inventory-alerts`, { headers }),
        fetch(`${API_BASE_URL}/admin-dashboard/recent-activities`, { headers })
      ])

      const statsData = await statsRes.json()
      const weeklyData = await weeklyRes.json()
      const revenueData = await revenueRes.json()
      const doctorData = await doctorRes.json()
      const treatmentData = await treatmentRes.json()
      const inventoryData = await inventoryRes.json()
      const activityData = await activityRes.json()

      if (statsData.success) setStats(statsData.stats)
      if (weeklyData.success) setWeeklyAppointments(weeklyData.data)
      if (revenueData.success) setMonthlyRevenue(revenueData.data)
      if (doctorData.success) setDoctorPerformance(doctorData.data)
      if (treatmentData.success) setTreatmentTypes(treatmentData.data)
      if (inventoryData.success) setInventoryAlerts(inventoryData.data)
      if (activityData.success) setRecentActivities(activityData.data)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const appointmentsData = {
    labels: weeklyAppointments.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: weeklyAppointments.values || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const revenueData = {
    labels: monthlyRevenue.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthlyRevenue.values || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const doctorPerformanceData = {
    labels: doctorPerformance.labels || [],
    datasets: [
      {
        label: 'Patients Treated',
        data: doctorPerformance.values || [],
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  }

  const patientDistribution = {
    labels: treatmentTypes.labels || [],
    datasets: [
      {
        data: treatmentTypes.values || [],
        backgroundColor: [
          '#14b8a6',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 0,
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
        beginAtZero: true,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Neurodent Admin Dashboard</h1>
        <p className="text-teal-100">Manage your dental clinic operations efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Appointments Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.appointmentsToday}</p>
              <div className="flex items-center mt-1">
                {stats.appointmentChange >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+{stats.appointmentChange}% from yesterday</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600 font-medium">{stats.appointmentChange}% from yesterday</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Revenue This Month</p>
              <p className="text-3xl font-bold text-gray-900">₹{stats.revenueThisMonth.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {stats.revenueChange >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+{stats.revenueChange}% from last month</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600 font-medium">{stats.revenueChange}% from last month</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeDoctors}</p>
              <div className="flex items-center mt-1">
                <Activity className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 font-medium">All available today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Patients Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.patientsToday}</p>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">With appointments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Appointments</h3>
          <div className="h-80">
            <Bar data={appointmentsData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Performance and Patient Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Performance (This Month)</h3>
          <div className="h-80">
            <Bar data={doctorPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Patient Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Treatment Types</h3>
          <div className="h-80">
            <Doughnut 
              data={patientDistribution} 
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

      {/* Inventory Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Inventory Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {inventoryAlerts.length > 0 ? (
              inventoryAlerts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{item.medicine}</p>
                    <p className="text-sm text-gray-600">Stock: {item.stock} units</p>
                    <p className="text-xs text-gray-500">Expires: {item.expiry}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : item.status === 'low' 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No inventory alerts</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/inventory')}
            className="mt-4 w-full bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors duration-200"
          >
            View All Inventory
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'medical' ? 'bg-green-500' :
                    activity.type === 'payment' ? 'bg-yellow-500' :
                    activity.type === 'inventory' ? 'bg-purple-500' :
                    'bg-teal-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent activities</p>
            )}
          </div>
          <button className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors duration-200">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard