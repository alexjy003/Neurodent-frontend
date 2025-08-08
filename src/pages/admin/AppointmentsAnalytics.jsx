import React, { useState } from 'react'
import { 
  Calendar, 
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Filter,
  Eye,
  Edit,
  Trash2
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

const AppointmentsAnalytics = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      doctor: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Regular Checkup',
      status: 'completed',
      duration: 45,
      revenue: 150
    },
    {
      id: 2,
      patientName: 'Emily Davis',
      doctor: 'Dr. Michael Smith',
      date: '2024-01-15',
      time: '11:30 AM',
      type: 'Root Canal',
      status: 'completed',
      duration: 90,
      revenue: 800
    },
    {
      id: 3,
      patientName: 'Michael Johnson',
      doctor: 'Dr. Emily Williams',
      date: '2024-01-15',
      time: '02:00 PM',
      type: 'Cleaning',
      status: 'completed',
      duration: 30,
      revenue: 100
    },
    {
      id: 4,
      patientName: 'Sarah Wilson',
      doctor: 'Dr. Robert Brown',
      date: '2024-01-16',
      time: '09:00 AM',
      type: 'Consultation',
      status: 'scheduled',
      duration: 30,
      revenue: 75
    },
    {
      id: 5,
      patientName: 'David Chen',
      doctor: 'Dr. Sarah Johnson',
      date: '2024-01-16',
      time: '10:30 AM',
      type: 'Orthodontics',
      status: 'scheduled',
      duration: 60,
      revenue: 300
    },
    {
      id: 6,
      patientName: 'Lisa Anderson',
      doctor: 'Dr. Michael Smith',
      date: '2024-01-16',
      time: '02:15 PM',
      type: 'Surgery',
      status: 'cancelled',
      duration: 120,
      revenue: 1200
    }
  ])

  const [selectedDateRange, setSelectedDateRange] = useState('this-week')
  const [filterStatus, setFilterStatus] = useState('all')

  // Analytics data
  const weeklyAppointments = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Scheduled',
        data: [8, 12, 15, 10, 14, 6, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Completed',
        data: [7, 10, 13, 9, 12, 5, 2],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Cancelled',
        data: [1, 2, 2, 1, 2, 1, 1],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  }

  const revenueData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [3200, 3800, 4200, 3900],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const appointmentTypes = {
    labels: ['Regular Checkup', 'Cleaning', 'Root Canal', 'Surgery', 'Orthodontics', 'Consultation'],
    datasets: [
      {
        data: [25, 20, 15, 10, 18, 12],
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

  const doctorPerformance = {
    labels: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'],
    datasets: [
      {
        label: 'Completed Appointments',
        data: [25, 28, 22, 20],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Revenue Generated ($)',
        data: [7500, 8200, 6600, 6000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    return matchesStatus
  })

  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length
  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length
  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + apt.revenue, 0)

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
              <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12% this week</span>
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
              <p className="text-2xl font-bold text-gray-900">{completedAppointments}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">
                  {Math.round((completedAppointments / totalAppointments) * 100)}% completion rate
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
              <p className="text-2xl font-bold text-gray-900">{scheduledAppointments}</p>
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
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8.5% this month</span>
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
            <Bar data={weeklyAppointments} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Doctor Performance and Appointment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Performance</h3>
          <div className="h-80">
            <Bar data={doctorPerformance} options={chartOptions} />
          </div>
        </div>

        {/* Appointment Types Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Types</h3>
          <div className="h-80">
            <Doughnut 
              data={appointmentTypes} 
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

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{appointment.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.doctor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.duration} min</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${appointment.revenue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      {appointment.status === 'scheduled' && (
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Peak Hours</h4>
              <p className="text-3xl font-bold mt-2">10-11 AM</p>
              <p className="text-blue-100">Highest appointment volume</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Avg Duration</h4>
              <p className="text-3xl font-bold mt-2">58 min</p>
              <p className="text-green-100">Per appointment</p>
            </div>
            <Clock className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">No-Show Rate</h4>
              <p className="text-3xl font-bold mt-2">5.2%</p>
              <p className="text-purple-100">Below industry average</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsAnalytics