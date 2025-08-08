import React, { useState } from 'react'
import { 
  Send, 
  Bell,
  Users,
  UserCheck,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Appointment Reminder',
      message: 'You have 5 appointments scheduled for tomorrow',
      recipient: 'All Doctors',
      type: 'reminder',
      status: 'sent',
      timestamp: '2024-01-15 09:30:00',
      readBy: ['Dr. Sarah Johnson', 'Dr. Michael Smith']
    },
    {
      id: 2,
      title: 'Medicine Stock Alert',
      message: 'Paracetamol stock is running low (12 units remaining)',
      recipient: 'Pharmacist',
      type: 'alert',
      status: 'sent',
      timestamp: '2024-01-15 08:15:00',
      readBy: ['James Wilson']
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'Scheduled system maintenance tonight from 12:00 AM to 2:00 AM',
      recipient: 'All Staff',
      type: 'info',
      status: 'draft',
      timestamp: '2024-01-15 07:45:00',
      readBy: []
    },
    {
      id: 4,
      title: 'New Patient Registration',
      message: '3 new patients registered today. Please update their records.',
      recipient: 'Receptionists',
      type: 'info',
      status: 'sent',
      timestamp: '2024-01-14 16:20:00',
      readBy: ['Lisa Anderson', 'Sarah Thompson']
    },
    {
      id: 5,
      title: 'Equipment Maintenance Due',
      message: 'Dental chair in Room 3 requires scheduled maintenance',
      recipient: 'Maintenance Team',
      type: 'reminder',
      status: 'sent',
      timestamp: '2024-01-14 14:10:00',
      readBy: []
    }
  ])

  const [showSendForm, setShowSendForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipient: '',
    type: 'info',
    urgent: false
  })

  const recipients = [
    'All Staff',
    'All Doctors',
    'Receptionists',
    'Pharmacist',
    'Maintenance Team',
    'Specific Doctor',
    'Specific Employee'
  ]

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus
    const matchesType = filterType === 'all' || notification.type === filterType
    return matchesStatus && matchesType
  })

  const handleSendNotification = (e) => {
    e.preventDefault()
    const notification = {
      id: Date.now(),
      ...newNotification,
      status: 'sent',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      readBy: []
    }
    setNotifications([notification, ...notifications])
    setNewNotification({
      title: '',
      message: '',
      recipient: '',
      type: 'info',
      urgent: false
    })
    setShowSendForm(false)
    toast.success('Notification sent successfully!')
  }

  const handleDeleteNotification = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notification => notification.id !== id))
      toast.success('Notification deleted successfully!')
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-800'
      case 'reminder':
        return 'bg-orange-100 text-orange-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const sentNotifications = notifications.filter(n => n.status === 'sent').length
  const draftNotifications = notifications.filter(n => n.status === 'draft').length
  const totalReadRate = notifications.length > 0 
    ? Math.round((notifications.reduce((sum, n) => sum + n.readBy.length, 0) / 
        (notifications.filter(n => n.status === 'sent').length * 5)) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-600">Send and manage internal notifications</p>
        </div>
        <button
          onClick={() => setShowSendForm(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200"
        >
          <Send className="w-4 h-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{sentNotifications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{draftNotifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">{totalReadRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Recipients</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="alert">Alerts</option>
                <option value="reminder">Reminders</option>
                <option value="info">Information</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>To: {notification.recipient}</span>
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                      {notification.status === 'sent' && (
                        <span>
                          Read by {notification.readBy.length} recipient(s)
                          {notification.readBy.length > 0 && (
                            <span className="ml-1">
                              ({notification.readBy.slice(0, 2).join(', ')}
                              {notification.readBy.length > 2 && ` +${notification.readBy.length - 2} more`})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send New Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification title..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message..."
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipients</label>
                  <select
                    required
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification({...newNotification, recipient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Recipients</option>
                    {recipients.map(recipient => (
                      <option key={recipient} value={recipient}>{recipient}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="info">Information</option>
                    <option value="alert">Alert</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={newNotification.urgent}
                  onChange={(e) => setNewNotification({...newNotification, urgent: e.target.checked})}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700">
                  Mark as urgent (will send immediate push notification)
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSendForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Save as draft logic here
                    toast.success('Notification saved as draft!')
                    setShowSendForm(false)
                  }}
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setNewNotification({
                ...newNotification,
                title: 'Daily Appointment Reminder',
                message: 'Please check your appointments for today and prepare accordingly.',
                recipient: 'All Doctors',
                type: 'reminder'
              })
              setShowSendForm(true)
            }}
            className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors duration-200"
          >
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Daily Reminder</h4>
            <p className="text-sm text-gray-600">Send appointment reminders</p>
          </button>

          <button
            onClick={() => {
              setNewNotification({
                ...newNotification,
                title: 'Emergency Alert',
                message: 'Immediate attention required. Please check your tasks.',
                recipient: 'All Staff',
                type: 'alert'
              })
              setShowSendForm(true)
            }}
            className="p-4 border-2 border-dashed border-red-300 rounded-xl hover:bg-red-50 transition-colors duration-200"
          >
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Emergency Alert</h4>
            <p className="text-sm text-gray-600">Send urgent notifications</p>
          </button>

          <button
            onClick={() => {
              setNewNotification({
                ...newNotification,
                title: 'General Information',
                message: 'Important information for all staff members.',
                recipient: 'All Staff',
                type: 'info'
              })
              setShowSendForm(true)
            }}
            className="p-4 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors duration-200"
          >
            <Info className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">General Info</h4>
            <p className="text-sm text-gray-600">Send informational updates</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCenter