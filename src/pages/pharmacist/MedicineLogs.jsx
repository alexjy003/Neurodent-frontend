import React, { useState, useEffect } from 'react'
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Package,
  FileText,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const MedicineLogs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayActivities: 0,
    dispensedPrescriptions: 0,
    stockAdditions: 0
  })
  const [loading, setLoading] = useState(true)

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'stock_added', label: 'Stock Added' },
    { value: 'stock_updated', label: 'Stock Updated' },
    { value: 'prescription_dispensed', label: 'Prescription Dispensed' },
    { value: 'medicine_added', label: 'Medicine Added' },
    { value: 'expired_removed', label: 'Expired Removed' },
    { value: 'stock_adjustment', label: 'Stock Adjustment' }
  ]

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  // Fetch logs from API
  useEffect(() => {
    fetchLogs()
  }, [actionFilter, dateFilter, searchTerm, sortBy])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('pharmacistToken')

      if (!token) {
        toast.error('Please login to view logs')
        return
      }

      const params = new URLSearchParams({
        action: actionFilter,
        dateFilter: dateFilter,
        search: searchTerm,
        sortBy: sortBy,
        limit: 100
      })

      const response = await fetch(
        `${API_BASE_URL}/medicine-logs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        toast.error(data.message || 'Failed to fetch logs')
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Error loading medicine logs')
    } finally {
      setLoading(false)
    }
  }

  const handleExportLogs = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      const response = await fetch(`${API_BASE_URL}/medicine-logs/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `medicine-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Logs exported successfully')
      } else {
        toast.error('Failed to export logs')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Error exporting logs')
    }
  }

  const getActionIcon = (action) => {
    switch(action) {
      case 'stock_added': return <Plus className="w-4 h-4 text-green-500" />
      case 'stock_updated': return <RefreshCw className="w-4 h-4 text-blue-500" />
      case 'prescription_dispensed': return <FileText className="w-4 h-4 text-purple-500" />
      case 'medicine_added': return <Package className="w-4 h-4 text-[#C33764]" />
      case 'expired_removed': return <Minus className="w-4 h-4 text-red-500" />
      case 'stock_adjustment': return <RefreshCw className="w-4 h-4 text-orange-500" />
      default: return <History className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionColor = (action) => {
    switch(action) {
      case 'stock_added': return 'bg-green-100 text-green-800'
      case 'stock_updated': return 'bg-blue-100 text-blue-800'
      case 'prescription_dispensed': return 'bg-purple-100 text-purple-800'
      case 'medicine_added': return 'bg-pink-100 text-[#C33764]'
      case 'expired_removed': return 'bg-red-100 text-red-800'
      case 'stock_adjustment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action) => {
    return actionTypes.find(type => type.value === action)?.label || action
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Medicine', 'Quantity Change', 'Previous Stock', 'New Stock', 'Pharmacist', 'Reason', 'Prescription ID'],
      ...logs.map(log => [
        log.timestamp,
        getActionLabel(log.action),
        log.medicineName,
        log.quantity,
        log.previousStock,
        log.newStock,
        log.pharmacistName,
        log.reason,
        log.prescriptionId || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medicine_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Logs exported successfully!')
  }

  const getStockChangeText = (quantity, previousStock, newStock) => {
    if (quantity > 0) {
      return `+${quantity} (${previousStock} → ${newStock})`
    } else {
      return `${quantity} (${previousStock} → ${newStock})`
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medicine logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Logs & Stock Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all inventory changes, stock movements, and prescription activities
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            onClick={handleExportLogs}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
            </div>
            <History className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Activities</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.todayActivities}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prescriptions Dispensed</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.dispensedPrescriptions}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Additions</p>
              <p className="text-2xl font-bold text-[#C33764]">
                {stats.stockAdditions}
              </p>
            </div>
            <Package className="w-8 h-8 text-[#C33764]" />
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
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {actionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="medicine">Sort by Medicine</option>
            <option value="action">Sort by Action</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
          <p className="text-sm text-gray-500">Showing {logs.length} log entries</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {logs.map((log) => (
            <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.medicineName}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{log.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        Stock Change: {getStockChangeText(log.quantity, log.previousStock, log.newStock)}
                      </span>
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {log.pharmacistName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.prescriptionId && (
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {log.prescriptionId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-medium ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.quantity > 0 ? '+' : ''}{log.quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    Batch: {log.batchNumber}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Pagination (if needed for large datasets) */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{logs.length}</span> of{' '}
                <span className="font-medium">{logs.length}</span> results
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineLogs