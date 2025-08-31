import React, { useState, useEffect } from 'react'
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
  const [dashboardData, setDashboardData] = useState({
    totalMedicines: 248,
    lowStock: 12,
    pendingPrescriptions: 8,
    expiredMedicines: 3,
    todayDispensed: 24,
    weeklyRevenue: 15420
  })

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'prescription',
      message: 'Prescription PX-001 dispensed for John Smith',
      time: '2 minutes ago',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'low_stock',
      message: 'Low stock alert: Aspirin 100mg (8 units left)',
      time: '15 minutes ago',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'expired',
      message: 'Expired medicines removed: Cough Syrup (Batch #CS-2024)',
      time: '45 minutes ago',
      icon: Clock,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'stock_update',
      message: 'Stock updated: Paracetamol 500mg (+50 units)',
      time: '1 hour ago',
      icon: Package,
      color: 'text-[#C33764]'
    }
  ])

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
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Medicines Dispensed',
        data: [28, 32, 24, 38, 42, 35, 29],
        borderColor: '#C33764',
        backgroundColor: 'rgba(195, 55, 100, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Prescriptions Processed',
        data: [15, 18, 12, 22, 25, 20, 16],
        borderColor: '#1d2671',
        backgroundColor: 'rgba(29, 38, 113, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  // Doughnut chart data for medicine categories
  const doughnutChartData = {
    labels: ['Analgesics', 'Antibiotics', 'Vitamins', 'Antiseptics', 'Others'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#C33764',
          '#1d2671',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1'
        ],
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacist Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your pharmacy today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button className="bg-[#C33764] text-white px-4 py-2 rounded-lg hover:bg-[#1d2671] transition-colors">
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
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
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
            <p className="text-2xl font-bold">98.5%</p>
            <p className="text-pink-100 text-sm">Stock Availability</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacistDashboard