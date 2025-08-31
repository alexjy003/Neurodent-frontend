import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      stockQuantity: 150,
      expiryDate: '2025-12-15',
      price: 12.50,
      supplier: 'PharmaCorp Ltd',
      batchNumber: 'AMX001',
      minStockLevel: 20,
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Ibuprofen 400mg',
      category: 'Pain Relievers',
      stockQuantity: 8,
      expiryDate: '2025-03-20',
      price: 8.75,
      supplier: 'MediSupply Co',
      batchNumber: 'IBU002',
      minStockLevel: 15,
      status: 'Low Stock'
    },
    {
      id: 3,
      name: 'Vitamin D3 1000IU',
      category: 'Vitamins',
      stockQuantity: 200,
      expiryDate: '2026-08-10',
      price: 15.00,
      supplier: 'HealthPlus Inc',
      batchNumber: 'VTD003',
      minStockLevel: 25,
      status: 'In Stock'
    },
    {
      id: 4,
      name: 'Dental Fluoride Gel',
      category: 'Dental Care',
      stockQuantity: 45,
      expiryDate: '2025-01-30',
      price: 22.00,
      supplier: 'DentalCare Pro',
      batchNumber: 'DFG004',
      minStockLevel: 10,
      status: 'Near Expiry'
    },
    {
      id: 5,
      name: 'Paracetamol 500mg',
      category: 'Pain Relievers',
      stockQuantity: 0,
      expiryDate: '2025-06-15',
      price: 6.25,
      supplier: 'PharmaCorp Ltd',
      batchNumber: 'PAR005',
      minStockLevel: 30,
      status: 'Out of Stock'
    }
  ])

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    stockQuantity: '',
    expiryDate: '',
    price: '',
    supplier: '',
    batchNumber: '',
    minStockLevel: ''
  })

  const categories = ['all', 'Antibiotics', 'Pain Relievers', 'Vitamins', 'Dental Care', 'Others']

  // Filter and sort medicines
  const filteredMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'stock': return b.stockQuantity - a.stockQuantity
        case 'expiry': return new Date(a.expiryDate) - new Date(b.expiryDate)
        case 'price': return b.price - a.price
        default: return 0
      }
    })

  const getStatusColor = (status, stockQuantity, expiryDate) => {
    const daysToExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    if (stockQuantity === 0) return 'bg-red-100 text-red-800'
    if (stockQuantity < 15) return 'bg-yellow-100 text-yellow-800'
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

  const handleAddMedicine = (e) => {
    e.preventDefault()
    const id = medicines.length + 1
    const medicine = {
      ...newMedicine,
      id,
      stockQuantity: parseInt(newMedicine.stockQuantity),
      price: parseFloat(newMedicine.price),
      minStockLevel: parseInt(newMedicine.minStockLevel),
      status: 'In Stock'
    }
    setMedicines([...medicines, medicine])
    setNewMedicine({
      name: '',
      category: '',
      stockQuantity: '',
      expiryDate: '',
      price: '',
      supplier: '',
      batchNumber: '',
      minStockLevel: ''
    })
    setShowAddModal(false)
    toast.success('Medicine added successfully!')
  }

  const handleUpdateStock = (id, newStock) => {
    setMedicines(medicines.map(med => 
      med.id === id 
        ? { ...med, stockQuantity: newStock, status: getStatusText(newStock, med.expiryDate, med.minStockLevel) }
        : med
    ))
    toast.success('Stock updated successfully!')
  }

  const handleDeleteMedicine = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(med => med.id !== id))
      toast.success('Medicine deleted successfully!')
    }
  }

  const exportInventory = () => {
    const csvContent = [
      ['Name', 'Category', 'Stock', 'Expiry Date', 'Price', 'Supplier', 'Batch', 'Status'],
      ...filteredMedicines.map(med => [
        med.name, med.category, med.stockQuantity, med.expiryDate, 
        med.price, med.supplier, med.batchNumber, med.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory_report.csv'
    a.click()
    toast.success('Inventory exported successfully!')
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
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Import
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {medicines.filter(m => m.stockQuantity < m.minStockLevel && m.stockQuantity > 0).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {medicines.filter(m => m.stockQuantity === 0).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Near Expiry</p>
              <p className="text-2xl font-bold text-orange-600">
                {medicines.filter(m => {
                  const daysToExpiry = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                  return daysToExpiry < 30 && daysToExpiry > 0
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C33764] focus:border-[#C33764]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="expiry">Sort by Expiry</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const daysToExpiry = Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                const status = getStatusText(medicine.stockQuantity, medicine.expiryDate, medicine.minStockLevel)
                
                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">Batch: {medicine.batchNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.stockQuantity} units</div>
                      <div className="text-xs text-gray-500">Min: {medicine.minStockLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.expiryDate}</div>
                      <div className={`text-xs ${daysToExpiry < 30 ? 'text-red-500' : 'text-gray-500'}`}>
                        {daysToExpiry} days left
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${medicine.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status, medicine.stockQuantity, medicine.expiryDate)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedMedicine(medicine)
                            setShowEditModal(true)
                          }}
                          className="text-[#C33764] hover:text-[#1d2671]"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Medicine</h3>
              <form onSubmit={handleAddMedicine} className="space-y-4">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <select
                  value={newMedicine.category}
                  onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newMedicine.stockQuantity}
                  onChange={(e) => setNewMedicine({...newMedicine, stockQuantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={newMedicine.expiryDate}
                  onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newMedicine.price}
                  onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={newMedicine.supplier}
                  onChange={(e) => setNewMedicine({...newMedicine, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Batch Number"
                  value={newMedicine.batchNumber}
                  onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Minimum Stock Level"
                  value={newMedicine.minStockLevel}
                  onChange={(e) => setNewMedicine({...newMedicine, minStockLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  required
                />
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#C33764] text-white rounded-md hover:bg-[#1d2671]"
                  >
                    Add Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement