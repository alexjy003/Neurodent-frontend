import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  FileText, 
  Calendar,
  Check,
  X,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const PharmacistNotifications = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState([])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Ibuprofen 400mg is running low with only 8 units remaining',
      medicineName: 'Ibuprofen 400mg',
      currentStock: 8,
      minStock: 15,
      priority: 'high',
      timestamp: '2025-08-31 09:15:00',
      isRead: false,
      actionRequired: true
    },
    {
      id: 2,
      type: 'near_expiry',
      title: 'Near Expiry Alert',
      message: 'Dental Fluoride Gel will expire in 30 days (January 30, 2025)',
      medicineName: 'Dental Fluoride Gel',
      expiryDate: '2025-01-30',
      currentStock: 45,
      priority: 'medium',
      timestamp: '2025-08-31 08:00:00',
      isRead: false,
      actionRequired: true
    },
    {
      id: 3,
      type: 'new_prescription',
      title: 'New Prescription Received',
      message: 'Dr. Wilson has sent a new prescription for John Smith',
      prescriptionId: 'PX-001',
      patientName: 'John Smith',
      doctorName: 'Dr. Wilson',
      priority: 'normal',
      timestamp: '2025-08-31 07:30:00',
      isRead: true,
      actionRequired: false
    },
    {
      id: 4,
      type: 'out_of_stock',
      title: 'Out of Stock Alert',
      message: 'Paracetamol 500mg is completely out of stock',
      medicineName: 'Paracetamol 500mg',
      currentStock: 0,
      minStock: 30,
      priority: 'urgent',
      timestamp: '2025-08-30 16:45:00',
      isRead: true,
      actionRequired: true
    },
    {
      id: 5,
      type: 'restock_reminder',
      title: 'Restock Reminder',
      message: 'Weekly restock reminder for medicines below minimum levels',
      priority: 'normal',
      timestamp: '2025-08-30 10:00:00',
      isRead: false,
      actionRequired: false
    },
    {
      id: 6,
      type: 'prescription_urgent',
      title: 'Urgent Prescription',
      message: 'Emergency prescription from Dr. Rodriguez for Emma Davis',
      prescriptionId: 'PX-004',
      patientName: 'Emma Davis',
      doctorName: 'Dr. Rodriguez',
      priority: 'urgent',
      timestamp: '2025-08-30 11:20:00',
      isRead: true,
      actionRequired: false
    },
    {
      id: 7,
      type: 'expired_medicine',
      title: 'Expired Medicine Alert',
      message: 'Aspirin 100mg has expired and was removed from inventory',
      medicineName: 'Aspirin 100mg',
      expiredQuantity: 15,
      priority: 'medium',
      timestamp: '2025-08-29 14:00:00',
      isRead: true,
      actionRequired: false
    },
    {
      id: 8,
      type: 'system_update',
      title: 'System Update',
      message: 'Pharmacy management system will undergo maintenance tonight at 2 AM',
      priority: 'low',
      timestamp: '2025-08-29 09:00:00',
      isRead: false,
      actionRequired: false
    }
  ])

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'near_expiry', label: 'Near Expiry' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'new_prescription', label: 'New Prescription' },
    { value: 'prescription_urgent', label: 'Urgent Prescription' },
    { value: 'expired_medicine', label: 'Expired Medicine' },
    { value: 'restock_reminder', label: 'Restock Reminder' },
    { value: 'system_update', label: 'System Update' }
  ]

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="w-5 h-5" />
      case 'near_expiry':
      case 'expired_medicine':
        return <Calendar className="w-5 h-5" />
      case 'new_prescription':
      case 'prescription_urgent':
        return <FileText className="w-5 h-5" />
      case 'restock_reminder':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'text-red-500 bg-red-50'
    if (priority === 'high') return 'text-orange-500 bg-orange-50'
    
    switch(type) {
      case 'low_stock':
      case 'out_of_stock':
        return 'text-yellow-500 bg-yellow-50'
      case 'near_expiry':
      case 'expired_medicine':
        return 'text-orange-500 bg-orange-50'
      case 'new_prescription':
      case 'prescription_urgent':
        return 'text-blue-500 bg-blue-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.medicineName && notification.medicineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notification.patientName && notification.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unread' && !notification.isRead) ||
      (statusFilter === 'read' && notification.isRead) ||
      (statusFilter === 'action_required' && notification.actionRequired)
    
    return matchesSearch && matchesType && matchesStatus
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true }
        : notification
    ))
    toast.success('Notification marked as read')
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    toast.success('Notification deleted')
  }

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification.id)))
    setSelectedNotifications([])
    toast.success('Selected notifications deleted')
  }

  const toggleSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification.id))
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with pharmacy alerts, stock notifications, and prescription updates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          {selectedNotifications.length > 0 && (
            <button 
              onClick={deleteSelected}
              className="flex items-center px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedNotifications.length})
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Action Required</p>
              <p className="text-2xl font-bold text-orange-600">{actionRequiredCount}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Alerts</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="action_required">Action Required</option>
          </select>

          {/* Select All */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAll}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select All</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>

                {/* Icon */}
                <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.actionRequired && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Action Required
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                  </div>

                  <p className={`text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'} mb-2`}>
                    {notification.message}
                  </p>

                  {/* Additional Details */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {notification.currentStock !== undefined && (
                      <span>Current Stock: {notification.currentStock}</span>
                    )}
                    {notification.minStock && (
                      <span>Min Stock: {notification.minStock}</span>
                    )}
                    {notification.prescriptionId && (
                      <span>Prescription: {notification.prescriptionId}</span>
                    )}
                    {notification.patientName && (
                      <span>Patient: {notification.patientName}</span>
                    )}
                    {notification.doctorName && (
                      <span>Doctor: {notification.doctorName}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Low Stock Alerts</h4>
              <p className="text-sm text-gray-500">Get notified when medicines fall below minimum stock levels</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Expiry Alerts</h4>
              <p className="text-sm text-gray-500">Get notified about medicines nearing expiry dates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">New Prescription Alerts</h4>
              <p className="text-sm text-gray-500">Get notified when new prescriptions are received</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacistNotifications