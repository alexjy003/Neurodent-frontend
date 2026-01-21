import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Download,
  Loader2,
  X,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/config'

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [medicines, setMedicines] = useState([])
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockMedicines: 0,
    outOfStockMedicines: 0,
    expiringSoonMedicines: 0
  })

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    stockQuantity: '',
    expiryDate: '',
    unitPrice: '',
    manufacturer: '',
    batchNumber: '',
    minStockLevel: '',
    description: '',
    imageFile: null,
    imagePreview: null
  })

  const categories = [
    'Antibiotics', 'Painkillers', 'Anti-inflammatory', 'Antiseptic',
    'Anesthetic', 'Dental Filling', 'Dental Cement', 'Oral Care',
    'Surgical', 'Vitamins', 'Other'
  ]

  // Fetch medicines and stats on component mount
  useEffect(() => {
    fetchMedicines()
    fetchStats()
  }, [])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('pharmacistToken')
      
      if (!token) {
        toast.error('Please login to view inventory')
        return
      }

      const response = await fetch(`${API_BASE_URL}/medicines?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.data.medicines) {
        setMedicines(data.data.medicines)
      } else {
        toast.error(data.message || 'Failed to fetch medicines')
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Error loading medicines')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      const response = await fetch(`${API_BASE_URL}/medicines/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.data) {
        setStats({
          totalMedicines: data.data.totalMedicines,
          lowStockMedicines: data.data.lowStockMedicines,
          outOfStockMedicines: data.data.outOfStockMedicines,
          expiringSoonMedicines: data.data.expiringSoonMedicines
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleImageUploadForAdd = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setNewMedicine({
        ...newMedicine,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      })
    }
  }

  const handleImageUploadForEdit = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setSelectedMedicine({
        ...selectedMedicine,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      })
    }
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      // Create FormData with all medicine data and image
      const formData = new FormData()
      formData.append('name', newMedicine.name)
      formData.append('category', newMedicine.category)
      formData.append('stockQuantity', parseInt(newMedicine.stockQuantity))
      formData.append('unitPrice', parseFloat(newMedicine.unitPrice))
      formData.append('minStockLevel', parseInt(newMedicine.minStockLevel))
      formData.append('expiryDate', newMedicine.expiryDate)
      formData.append('manufacturer', newMedicine.manufacturer)
      formData.append('batchNumber', newMedicine.batchNumber)
      formData.append('description', newMedicine.description)
      
      // Add image if selected
      if (newMedicine.imageFile) {
        formData.append('image', newMedicine.imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Medicine added successfully!')
        setShowAddModal(false)
        setNewMedicine({
          name: '',
          category: '',
          stockQuantity: '',
          expiryDate: '',
          unitPrice: '',
          manufacturer: '',
          batchNumber: '',
          minStockLevel: '',
          description: '',
          imageFile: null,
          imagePreview: null
        })
        fetchMedicines()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to add medicine')
      }
    } catch (error) {
      console.error('Error adding medicine:', error)
      toast.error('Error adding medicine')
    }
  }

  const handleUpdateMedicine = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      // Create FormData with all medicine data
      const formData = new FormData()
      formData.append('name', selectedMedicine.name)
      formData.append('category', selectedMedicine.category)
      formData.append('stockQuantity', parseInt(selectedMedicine.stockQuantity))
      formData.append('unitPrice', parseFloat(selectedMedicine.unitPrice))
      formData.append('minStockLevel', parseInt(selectedMedicine.minStockLevel))
      formData.append('expiryDate', selectedMedicine.expiryDate)
      formData.append('manufacturer', selectedMedicine.manufacturer)
      formData.append('batchNumber', selectedMedicine.batchNumber || '')
      formData.append('description', selectedMedicine.description || '')
      
      // Add new image if selected
      if (selectedMedicine.imageFile) {
        formData.append('image', selectedMedicine.imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/medicines/${selectedMedicine._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Medicine updated successfully!')
        setShowEditModal(false)
        setSelectedMedicine(null)
        fetchMedicines()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to update medicine')
      }
    } catch (error) {
      console.error('Error updating medicine:', error)
      toast.error('Error updating medicine')
    }
  }

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return
    }

    try {
      const token = localStorage.getItem('pharmacistToken')
      
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Medicine deleted successfully!')
        fetchMedicines()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to delete medicine')
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
      toast.error('Error deleting medicine')
    }
  }

  // Filter and sort medicines
  const filteredMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'stock': return b.stockQuantity - a.stockQuantity
        case 'expiry': return new Date(a.expiryDate) - new Date(b.expiryDate)
        case 'price': return b.unitPrice - a.unitPrice
        default: return 0
      }
    })

  const getStatusColor = (stockQuantity, expiryDate, minStockLevel) => {
    const daysToExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    if (stockQuantity === 0) return 'bg-red-100 text-red-800'
    if (stockQuantity < minStockLevel) return 'bg-yellow-100 text-yellow-800'
    if (daysToExpiry < 30) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (stockQuantity, expiryDate, minStockLevel) => {
    const daysToExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    if (stockQuantity === 0) return 'Out of Stock'
    if (stockQuantity < minStockLevel) return 'Low Stock'
    if (daysToExpiry < 30) return 'Near Expiry'
    return 'In Stock'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysLeft = (expiryDate) => {
    return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const exportInventory = () => {
    const csvContent = [
      ['Name', 'Category', 'Stock', 'Min Stock', 'Expiry Date', 'Price', 'Manufacturer', 'Batch', 'Status'],
      ...filteredMedicines.map(med => [
        med.name, med.category, med.stockQuantity, med.minStockLevel, med.expiryDate, 
        med.unitPrice, med.manufacturer || '', med.batchNumber || '', 
        getStatusText(med.stockQuantity, med.expiryDate, med.minStockLevel)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Inventory exported successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#C33764]" />
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy inventory, track stock levels, and monitor expiry dates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            onClick={exportInventory}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-[#C33764] text-white rounded-lg hover:bg-[#1d2671] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalMedicines}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.lowStockMedicines}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStockMedicines}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Near Expiry</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.expiringSoonMedicines}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="expiry">Sort by Expiry</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No medicines found</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {medicine.image?.url ? (
                          <img 
                            src={medicine.image.url} 
                            alt={medicine.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                          {medicine.batchNumber && (
                            <div className="text-xs text-gray-500">Batch: {medicine.batchNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{medicine.stockQuantity} units</div>
                      <div className="text-xs text-gray-500">Min: {medicine.minStockLevel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(medicine.expiryDate)}</div>
                      <div className="text-xs text-gray-500">{getDaysLeft(medicine.expiryDate)} days left</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">₹{medicine.unitPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medicine.stockQuantity, medicine.expiryDate, medicine.minStockLevel)}`}>
                        {getStatusText(medicine.stockQuantity, medicine.expiryDate, medicine.minStockLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedMedicine({
                              ...medicine,
                              expiryDate: medicine.expiryDate.split('T')[0]
                            })
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine._id)}
                          className="text-red-600 hover:text-red-800"
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Amoxicillin 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newMedicine.stockQuantity}
                    onChange={(e) => setNewMedicine({...newMedicine, stockQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newMedicine.minStockLevel}
                    onChange={(e) => setNewMedicine({...newMedicine, minStockLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newMedicine.unitPrice}
                    onChange={(e) => setNewMedicine({...newMedicine, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newMedicine.expiryDate}
                    onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., PharmaCorp Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newMedicine.batchNumber}
                    onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., AMX001"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMedicine.description}
                  onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Additional information about the medicine..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image</label>
                <div className="flex items-center space-x-4">
                  {newMedicine.imagePreview && (
                    <img
                      src={newMedicine.imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                    <Upload className="w-5 h-5 mr-2" />
                    {newMedicine.imageFile ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadForAdd}
                      className="hidden"
                    />
                  </label>
                  {newMedicine.imageFile && (
                    <span className="text-sm text-gray-600">{newMedicine.imageFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, WEBP</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C33764] text-white rounded-lg hover:bg-[#1d2671]"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Medicine</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={selectedMedicine.name}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={selectedMedicine.category}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={selectedMedicine.stockQuantity}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, stockQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={selectedMedicine.minStockLevel}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, minStockLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={selectedMedicine.unitPrice}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={selectedMedicine.expiryDate}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={selectedMedicine.manufacturer}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={selectedMedicine.batchNumber || ''}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, batchNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedMedicine.description || ''}
                  onChange={(e) => setSelectedMedicine({...selectedMedicine, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image</label>
                <div className="flex items-center space-x-4">
                  {(selectedMedicine.imagePreview || selectedMedicine.image?.url) && (
                    <img
                      src={selectedMedicine.imagePreview || selectedMedicine.image.url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                    <Upload className="w-5 h-5 mr-2" />
                    {selectedMedicine.imageFile || selectedMedicine.image?.url ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadForEdit}
                      className="hidden"
                    />
                  </label>
                  {selectedMedicine.imageFile && (
                    <span className="text-sm text-gray-600">{selectedMedicine.imageFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, WEBP</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C33764] text-white rounded-lg hover:bg-[#1d2671]"
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

export default InventoryManagement
