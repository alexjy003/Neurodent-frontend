import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Package,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import apiService from '../../services/api'

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [imagePreview, setImagePreview] = useState(null)

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    description: '',
    stockQuantity: '',
    minStockLevel: '',
    unitPrice: '',
    expiryDate: '',
    manufacturer: '',
    image: null
  })

  const categories = [
    'Antibiotics',
    'Painkillers', 
    'Anti-inflammatory',
    'Antiseptic',
    'Anesthetic',
    'Dental Filling',
    'Dental Cement',
    'Oral Care',
    'Surgical',
    'Vitamins',
    'Other'
  ]

  // Fetch medicines from API
  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await apiService.get(`/medicines?${params}`)
      
      if (response.success) {
        setMedicines(response.data.medicines)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.get('/medicines/stats')
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchMedicines()
    fetchStats()
  }, [currentPage, filterCategory, searchTerm])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when searching
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return 'out-of-stock'
    if (stock < minStock * 0.5) return 'critical'
    if (stock < minStock) return 'low'
    return 'good'
  }

  const isExpiringSoon = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setNewMedicine(prev => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear image
  const clearImage = () => {
    setNewMedicine(prev => ({ ...prev, image: null }))
    setImagePreview(null)
  }

  // Handle image change for editing
  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setEditingMedicine(prev => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear edit image
  const clearEditImage = () => {
    setEditingMedicine(prev => ({ ...prev, image: null }))
    setImagePreview(null)
  }

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  const calculateMedicineStatus = (medicine) => {
    if (isExpired(medicine.expiryDate)) {
      return 'expired'
    }
    if (medicine.stockQuantity === 0) {
      return 'out-of-stock'
    }
    if (medicine.stockQuantity <= medicine.minStockLevel) {
      return 'critical'
    }
    if (medicine.stockQuantity <= medicine.minStockLevel * 1.5) {
      return 'low'
    }
    return 'active'
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring duplicate request')
      return
    }
    
    try {
      setIsSubmitting(true)
      console.log('🚀 Starting medicine submission...')
      
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', newMedicine.name)
      formData.append('category', newMedicine.category)
      formData.append('description', newMedicine.description)
      formData.append('stockQuantity', parseInt(newMedicine.stockQuantity))
      formData.append('minStockLevel', parseInt(newMedicine.minStockLevel))
      formData.append('unitPrice', parseFloat(newMedicine.unitPrice))
      formData.append('expiryDate', newMedicine.expiryDate)
      formData.append('manufacturer', newMedicine.manufacturer)
      
      // Add image if selected
      if (newMedicine.image) {
        formData.append('image', newMedicine.image)
        console.log('📸 Image added to form:', newMedicine.image.name)
      }

      console.log('📤 Sending request to API...')
      const response = await apiService.post('/medicines', formData)
      
      if (response.success) {
        console.log('✅ Medicine created successfully!')
        toast.success('Medicine added successfully!')
        setNewMedicine({
          name: '',
          category: '',
          description: '',
          stockQuantity: '',
          minStockLevel: '',
          unitPrice: '',
          expiryDate: '',
          manufacturer: '',
          image: null
        })
        setImagePreview(null)
        setShowAddForm(false)
        fetchMedicines()
        fetchStats()
      }
    } catch (error) {
      console.error('❌ Error adding medicine:', error)
      toast.error(error.response?.data?.message || 'Failed to add medicine')
    } finally {
      setIsSubmitting(false)
      console.log('🏁 Submission completed, resetting state')
    }
  }

  const handleEditMedicine = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', editingMedicine.name)
      formData.append('category', editingMedicine.category)
      formData.append('description', editingMedicine.description)
      formData.append('stockQuantity', parseInt(editingMedicine.stockQuantity))
      formData.append('minStockLevel', parseInt(editingMedicine.minStockLevel))
      formData.append('unitPrice', parseFloat(editingMedicine.unitPrice))
      formData.append('expiryDate', editingMedicine.expiryDate)
      formData.append('manufacturer', editingMedicine.manufacturer)
      
      // Add image if selected (new image)
      if (editingMedicine.image && editingMedicine.image instanceof File) {
        formData.append('image', editingMedicine.image)
      }

      const response = await apiService.put(`/medicines/${editingMedicine._id}`, formData)
      
      if (response.success) {
        toast.success('Medicine updated successfully!')
        setEditingMedicine(null)
        setImagePreview(null)
        fetchMedicines()
        fetchStats()
      }
    } catch (error) {
      console.error('Error updating medicine:', error)
      toast.error(error.response?.data?.message || 'Failed to update medicine')
    }
  }

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const response = await apiService.delete(`/medicines/${id}`)
        
        if (response.success) {
          toast.success('Medicine deleted successfully!')
          fetchMedicines()
          fetchStats()
        }
      } catch (error) {
        console.error('Error deleting medicine:', error)
        toast.error(error.response?.data?.message || 'Failed to delete medicine')
      }
    }
  }

  const handleRestockMedicine = async (id, quantity) => {
    try {
      const response = await apiService.patch(`/medicines/${id}/restock`, { 
        quantity: parseInt(quantity)
      })
      
      if (response.success) {
        toast.success(`Restocked ${quantity} units successfully!`)
        fetchMedicines()
        fetchStats()
      }
    } catch (error) {
      console.error('Error restocking medicine:', error)
      toast.error(error.response?.data?.message || 'Failed to restock medicine')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  const criticalItems = medicines.filter(med => med.status === 'critical' || med.status === 'out-of-stock')
  const lowStockItems = medicines.filter(med => med.status === 'low')
  const expiringItems = medicines.filter(med => isExpiringSoon(med.expiryDate))
  const expiredItems = medicines.filter(med => isExpired(med.expiryDate))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1>
          <p className="text-gray-600">Track and manage medicine stock levels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchMedicines()
              fetchStats()
            }}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMedicines || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-red-900">{(stats.outOfStockMedicines || 0) + (stats.lowStockMedicines || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-900">{stats.lowStockMedicines || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.expiringSoonMedicines || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(criticalItems.length > 0 || expiringItems.length > 0 || expiredItems.length > 0) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Inventory Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2">Critical Stock</h4>
                <div className="space-y-1">
                  {criticalItems.slice(0, 3).map(item => (
                    <p key={item.id} className="text-sm text-red-700">
                      {item.name}: {item.stock} units
                    </p>
                  ))}
                  {criticalItems.length > 3 && (
                    <p className="text-xs text-red-600">+{criticalItems.length - 3} more</p>
                  )}
                </div>
              </div>
            )}

            {expiringItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Expiring Soon</h4>
                <div className="space-y-1">
                  {expiringItems.slice(0, 3).map(item => (
                    <p key={item.id} className="text-sm text-yellow-700">
                      {item.name}: {formatDate(item.expiryDate)}
                    </p>
                  ))}
                  {expiringItems.length > 3 && (
                    <p className="text-xs text-yellow-600">+{expiringItems.length - 3} more</p>
                  )}
                </div>
              </div>
            )}

            {expiredItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2">Expired</h4>
                <div className="space-y-1">
                  {expiredItems.slice(0, 3).map(item => (
                    <p key={item.id} className="text-sm text-red-700">
                      {item.name}: {formatDate(item.expiryDate)}
                    </p>
                  ))}
                  {expiredItems.length > 3 && (
                    <p className="text-xs text-red-600">+{expiredItems.length - 3} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '25%'}}>Medicine</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>Stock Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '12%'}}>Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>Expiry Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '18%'}}>Manufacturer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>Actions</th>
              </tr>
            </thead>
          </table>
        </div>
        
        {/* Scrollable Body */}
        <div className="overflow-y-auto max-h-96">
          <table className="w-full table-fixed">
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Loading medicines...</span>
                    </div>
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Package className="w-12 h-12 text-gray-300" />
                      <p>No medicines found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                medicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '25%'}}>
                      <div className="flex items-center space-x-3">
                        {medicine.image && medicine.image.url ? (
                          <img
                            src={medicine.image.url}
                            alt={medicine.name}
                            className="h-10 w-10 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{medicine.name}</div>
                          <div className="text-xs text-gray-400">{medicine.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <div className="text-sm text-gray-900">{medicine.stockQuantity} units</div>
                      <div className="text-xs text-gray-500">Min: {medicine.minStockLevel} units</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            calculateMedicineStatus(medicine) === 'critical' || calculateMedicineStatus(medicine) === 'out-of-stock' ? 'bg-red-500' :
                            calculateMedicineStatus(medicine) === 'low' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((medicine.stockQuantity / (medicine.minStockLevel * 3)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '12%'}}>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(medicine.unitPrice)}</div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <div className={`text-sm ${
                        isExpired(medicine.expiryDate) ? 'text-red-600 font-semibold' :
                        isExpiringSoon(medicine.expiryDate) ? 'text-yellow-600 font-semibold' :
                        'text-gray-900'
                      }`}>
                        {formatDate(medicine.expiryDate)}
                      </div>
                      {isExpired(medicine.expiryDate) && (
                        <div className="text-xs text-red-500">EXPIRED</div>
                      )}
                      {isExpiringSoon(medicine.expiryDate) && !isExpired(medicine.expiryDate) && (
                        <div className="text-xs text-yellow-500">Expires soon</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '18%'}}>
                      <div className="text-sm text-gray-900">{medicine.manufacturer}</div>
                      {medicine.supplier && (
                        <div className="text-xs text-gray-500">Supplier: {medicine.supplier}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <div className="flex items-center justify-start space-x-3">
                        <button
                          onClick={() => {
                            const quantity = prompt('Enter restock quantity:')
                            if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                              handleRestockMedicine(medicine._id, parseInt(quantity))
                            }
                          }}
                          className="px-3 py-1 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-600 transition-colors duration-200 flex-shrink-0"
                        >
                          Restock
                        </button>
                        <button 
                          onClick={() => setEditingMedicine(medicine)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex-shrink-0"
                          title="Edit Medicine"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex-shrink-0"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Medicine</h2>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newMedicine.stockQuantity}
                    onChange={(e) => setNewMedicine({...newMedicine, stockQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newMedicine.minStockLevel}
                    onChange={(e) => setNewMedicine({...newMedicine, minStockLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={newMedicine.unitPrice}
                    onChange={(e) => setNewMedicine({...newMedicine, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="25.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newMedicine.expiryDate}
                    onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="GSK Pharmaceuticals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Image (Optional)</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    rows="3"
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Brief description of the medicine..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setImagePreview(null)
                    setNewMedicine({
                      name: '',
                      category: '',
                      description: '',
                      stockQuantity: '',
                      minStockLevel: '',
                      unitPrice: '',
                      expiryDate: '',
                      manufacturer: '',
                      image: null
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Medicine</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {editingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Medicine</h2>
            <form onSubmit={handleEditMedicine} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={editingMedicine.name}
                    onChange={(e) => setEditingMedicine({...editingMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={editingMedicine.category}
                    onChange={(e) => setEditingMedicine({...editingMedicine, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingMedicine.stockQuantity}
                    onChange={(e) => setEditingMedicine({...editingMedicine, stockQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingMedicine.minStockLevel}
                    onChange={(e) => setEditingMedicine({...editingMedicine, minStockLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={editingMedicine.unitPrice}
                    onChange={(e) => setEditingMedicine({...editingMedicine, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editingMedicine.expiryDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingMedicine({...editingMedicine, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={editingMedicine.manufacturer}
                    onChange={(e) => setEditingMedicine({...editingMedicine, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {/* Show current image or new preview */}
                    {(imagePreview || (editingMedicine.image && editingMedicine.image.url)) && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || editingMedicine.image.url}
                          alt="Medicine"
                          className="h-20 w-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={clearEditImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    rows="3"
                    value={editingMedicine.description || ''}
                    onChange={(e) => setEditingMedicine({...editingMedicine, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMedicine(null)
                    setImagePreview(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
                >
                  Update Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineInventory