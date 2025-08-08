import React from 'react'
import { 
  Users, 
  UserCheck, 
  Calendar,
  DollarSign,
  TrendingUp,
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
  // Mock data for dashboard
  const stats = {
    appointmentsToday: 24,
    revenueThisMonth: 45620,
    activeDoctors: 8,
    patientsToday: 18
  }

  const appointmentsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 15, 25, 22, 18, 8],
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [32000, 35000, 42000, 38000, 45000, 48000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const doctorPerformanceData = {
    labels: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'],
    datasets: [
      {
        label: 'Patients Treated',
        data: [45, 38, 52, 41, 35],
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
    labels: ['Regular Checkup', 'Cleaning', 'Surgery', 'Emergency', 'Consultation'],
    datasets: [
      {
        data: [35, 25, 15, 12, 13],
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

  const inventoryAlerts = [
    { medicine: 'Paracetamol', stock: 12, status: 'low', expiry: '2024-03-15' },
    { medicine: 'Ibuprofen', stock: 5, status: 'critical', expiry: '2024-02-28' },
    { medicine: 'Amoxicillin', stock: 25, status: 'good', expiry: '2024-06-20' },
    { medicine: 'Lidocaine', stock: 8, status: 'low', expiry: '2024-04-10' },
  ]

  const recentActivities = [
    { action: 'New patient registered: Sarah Connor', time: '2 minutes ago', type: 'user' },
    { action: 'Dr. Smith completed surgery for John Doe', time: '15 minutes ago', type: 'medical' },
    { action: 'Payment received: $850 from Mary Johnson', time: '30 minutes ago', type: 'payment' },
    { action: 'Medicine restocked: Paracetamol (50 units)', time: '1 hour ago', type: 'inventory' },
    { action: 'Appointment scheduled: Tom Wilson with Dr. Brown', time: '2 hours ago', type: 'appointment' },
  ]

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white">
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
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12% from yesterday</span>
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
              <p className="text-3xl font-bold text-gray-900">${stats.revenueThisMonth.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8.5% from last month</span>
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
                <span className="text-sm text-orange-600 font-medium">6 waiting</span>
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
            {inventoryAlerts.map((item, index) => (
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
            ))}
          </div>
          <button className="mt-4 w-full bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors duration-200">
            View All Inventory
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
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
            ))}
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