import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Package,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Paracetamol',
      category: 'Pain Relief',
      stock: 12,
      minStock: 20,
      maxStock: 100,
      unitPrice: 0.50,
      expiryDate: '2024-03-15',
      supplier: 'MedSupply Co.',
      batchNumber: 'PARA001',
      status: 'low'
    },
    {
      id: 2,
      name: 'Ibuprofen',
      category: 'Anti-inflammatory',
      stock: 5,
      minStock: 15,
      maxStock: 80,
      unitPrice: 0.75,
      expiryDate: '2024-02-28',
      supplier: 'PharmaCorp',
      batchNumber: 'IBU002',
      status: 'critical'
    },
    {
      id: 3,
      name: 'Amoxicillin',
      category: 'Antibiotic',
      stock: 45,
      minStock: 25,
      maxStock: 150,
      unitPrice: 1.20,
      expiryDate: '2024-08-20',
      supplier: 'MedSupply Co.',
      batchNumber: 'AMX003',
      status: 'good'
    },
    {
      id: 4,
      name: 'Lidocaine',
      category: 'Anesthetic',
      stock: 8,
      minStock: 15,
      maxStock: 60,
      unitPrice: 2.50,
      expiryDate: '2024-04-10',
      supplier: 'DentalMeds Inc.',
      batchNumber: 'LID004',
      status: 'low'
    },
    {
      id: 5,
      name: 'Fluoride Toothpaste',
      category: 'Preventive',
      stock: 75,
      minStock: 30,
      maxStock: 200,
      unitPrice: 3.99,
      expiryDate: '2024-12-31',
      supplier: 'OralCare Ltd.',
      batchNumber: 'FLU005',
      status: 'good'
    },
    {
      id: 6,
      name: 'Chlorhexidine',
      category: 'Antiseptic',
      stock: 25,
      minStock: 20,
      maxStock: 100,
      unitPrice: 4.50,
      expiryDate: '2024-06-15',
      supplier: 'PharmaCorp',
      batchNumber: 'CHL006',
      status: 'good'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    stock: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    expiryDate: '',
    supplier: '',
    batchNumber: ''
  })

  const categories = [...new Set(medicines.map(med => med.category))]

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory
    const matchesStatus = filterStatus === 'all' || medicine.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return 'out'
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

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  const handleAddMedicine = (e) => {
    e.preventDefault()
    const medicine = {
      id: Date.now(),
      ...newMedicine,
      stock: parseInt(newMedicine.stock),
      minStock: parseInt(newMedicine.minStock),
      maxStock: parseInt(newMedicine.maxStock),
      unitPrice: parseFloat(newMedicine.unitPrice),
      status: getStockStatus(parseInt(newMedicine.stock), parseInt(newMedicine.minStock))
    }
    setMedicines([...medicines, medicine])
    setNewMedicine({
      name: '',
      category: '',
      stock: '',
      minStock: '',
      maxStock: '',
      unitPrice: '',
      expiryDate: '',
      supplier: '',
      batchNumber: ''
    })
    setShowAddForm(false)
    toast.success('Medicine added successfully!')
  }

  const handleDeleteMedicine = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(medicine => medicine.id !== id))
      toast.success('Medicine deleted successfully!')
    }
  }

  const handleRestockMedicine = (id, quantity) => {
    setMedicines(medicines.map(medicine => 
      medicine.id === id 
        ? { 
            ...medicine, 
            stock: medicine.stock + quantity,
            status: getStockStatus(medicine.stock + quantity, medicine.minStock)
          }
        : medicine
    ))
    toast.success(`Restocked ${quantity} units successfully!`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const criticalItems = medicines.filter(med => med.status === 'critical' || med.status === 'out')
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
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
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
              <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
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
              <p className="text-2xl font-bold text-red-900">{criticalItems.length}</p>
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
              <p className="text-2xl font-bold text-orange-900">{lowStockItems.length}</p>
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
              <p className="text-2xl font-bold text-yellow-900">{expiringItems.length}</p>
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
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="good">Good Stock</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.category}</div>
                      <div className="text-xs text-gray-400">Batch: {medicine.batchNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.stock} units</div>
                    <div className="text-xs text-gray-500">Min: {medicine.minStock} | Max: {medicine.maxStock}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          medicine.status === 'critical' ? 'bg-red-500' :
                          medicine.status === 'low' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((medicine.stock / medicine.maxStock) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${medicine.unitPrice}</div>
                    <div className="text-xs text-gray-500">per unit</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      medicine.status === 'good' ? 'bg-green-100 text-green-800' :
                      medicine.status === 'low' ? 'bg-orange-100 text-orange-800' :
                      medicine.status === 'critical' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {medicine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const quantity = prompt('Enter restock quantity:')
                          if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                            handleRestockMedicine(medicine.id, parseInt(quantity))
                          }
                        }}
                        className="px-2 py-1 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-600 transition-colors duration-200"
                      >
                        Restock
                      </button>
                      <div className="relative group">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(medicine.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Anti-inflammatory">Anti-inflammatory</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Anesthetic">Anesthetic</option>
                    <option value="Antiseptic">Antiseptic</option>
                    <option value="Preventive">Preventive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Stock</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.minStock}
                    onChange={(e) => setNewMedicine({...newMedicine, minStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Stock</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.maxStock}
                    onChange={(e) => setNewMedicine({...newMedicine, maxStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newMedicine.unitPrice}
                    onChange={(e) => setNewMedicine({...newMedicine, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="1.50"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.supplier}
                    onChange={(e) => setNewMedicine({...newMedicine, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="MedSupply Co."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.batchNumber}
                    onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="BATCH001"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
                >
                  Add Medicine
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