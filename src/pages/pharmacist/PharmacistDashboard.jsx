import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  AlertTriangle, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { getUserType, redirectToCorrectDashboard, validateUserAccess } from '../../utils/navigationGuard'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const PharmacistDashboard = () => {
  const navigate = useNavigate()
  
  // Verify user is actually a pharmacist and redirect if not
  useEffect(() => {
    const userType = getUserType();
    if (!validateUserAccess('pharmacist', userType)) {
      console.warn(`🚫 Unauthorized access to pharmacist dashboard by ${userType} user`);
      redirectToCorrectDashboard(navigate);
      return;
    }
  }, [navigate]);

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalMedicines: 0,
    lowStock: 0,
    pendingPrescriptions: 0,
    expiredMedicines: 0,
    todayDispensed: 0,
    weeklyRevenue: 0,
    stockAvailability: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState({
    labels: [],
    medicinesDispensed: [],
    prescriptionsProcessed: []
  })
  const [categories, setCategories] = useState({
    labels: [],
    data: [],
    colors: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('pharmacistToken')

      if (!token) {
        toast.error('Please login to view dashboard')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all dashboard data in parallel
      const [statsRes, activitiesRes, trendsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/pharmacist-dashboard/stats`, { headers }),
        fetch(`${API_BASE_URL}/pharmacist-dashboard/recent-activities?limit=10`, { headers }),
        fetch(`${API_BASE_URL}/pharmacist-dashboard/weekly-trends`, { headers }),
        fetch(`${API_BASE_URL}/pharmacist-dashboard/medicine-categories`, { headers })
      ])

      const [statsData, activitiesData, trendsData, categoriesData] = await Promise.all([
        statsRes.json(),
        activitiesRes.json(),
        trendsRes.json(),
        categoriesRes.json()
      ])

      if (statsData.success) {
        setDashboardData(statsData.data)
      }

      if (activitiesData.success) {
        setRecentActivities(activitiesData.activities)
      }

      if (trendsData.success) {
        setWeeklyTrends(trendsData.trends)
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (iconType) => {
    switch(iconType) {
      case 'prescription': return FileText
      case 'alert': return AlertTriangle
      case 'expired': return Clock
      case 'stock': return Package
      default: return CheckCircle
    }
  }

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Medicines',
      value: dashboardData.totalMedicines,
      icon: Package,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-white',
      trend: '+5.2%',
      trendDirection: 'up'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.lowStock,
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      textColor: 'text-white',
      trend: '-2.1%',
      trendDirection: 'down'
    },
    {
      title: 'Pending Prescriptions',
      value: dashboardData.pendingPrescriptions,
      icon: FileText,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-white',
      trend: '+12.3%',
      trendDirection: 'up'
    },
    {
      title: 'Expired Medicines',
      value: dashboardData.expiredMedicines,
      icon: Clock,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-white',
      trend: '-8.7%',
      trendDirection: 'down'
    }
  ]

  // Chart data for medicine dispensing trend
  const lineChartData = {
    labels: weeklyTrends.labels,
    datasets: [
      {
        label: 'Medicines Dispensed',
        data: weeklyTrends.medicinesDispensed,
        borderColor: '#C33764',
        backgroundColor: 'rgba(195, 55, 100, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Prescriptions Processed',
        data: weeklyTrends.prescriptionsProcessed,
        borderColor: '#1d2671',
        backgroundColor: 'rgba(29, 38, 113, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  // Doughnut chart data for medicine categories
  const doughnutChartData = {
    labels: categories.labels,
    datasets: [
      {
        data: categories.data,
        backgroundColor: categories.colors,
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C33764] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your pharmacy today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-[#C33764] to-[#1d2671] text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-xl p-6 ${card.textColor} relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  {card.trendDirection === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{card.trend} from last week</span>
                </div>
              </div>
              <div className="opacity-20">
                <card.icon className="w-12 h-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#C33764]">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Medicine Categories</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">View Details</button>
          </div>
          <div className="h-64">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-[#C33764] mr-3" />
                <span className="text-sm font-medium text-gray-900">Add New Medicine</span>
              </div>
              <span className="text-[#C33764] group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Process Prescription</span>
              </div>
              <span className="text-gray-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Check Low Stock</span>
              </div>
              <span className="text-gray-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View Schedule</span>
              </div>
              <span className="text-gray-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-sm text-[#C33764] hover:text-[#1d2671] font-medium">
              View All Activities →
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.icon)
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${activity.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
            {recentActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-gradient-to-r from-[#C33764] to-[#1d2671] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{dashboardData.todayDispensed}</p>
            <p className="text-pink-100 text-sm">Prescriptions Dispensed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">₹{dashboardData.weeklyRevenue.toLocaleString()}</p>
            <p className="text-pink-100 text-sm">Weekly Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{dashboardData.stockAvailability}%</p>
            <p className="text-pink-100 text-sm">Stock Availability</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacistDashboard