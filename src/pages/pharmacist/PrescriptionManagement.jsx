import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  User,
  Calendar,
  Pill,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/config'

const PrescriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [allocationPrescription, setAllocationPrescription] = useState(null)
  const [availableMedicines, setAvailableMedicines] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [allocating, setAllocating] = useState(false)

  // Fetch prescriptions from API
  useEffect(() => {
    fetchPrescriptions()
  }, [statusFilter])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('pharmacistToken')
      
      if (!token) {
        toast.error('Please login to view prescriptions')
        return
      }

      const params = new URLSearchParams({
        page: 1,
        limit: 50
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(
        `${API_BASE_URL}/prescriptions/pharmacist/my-prescriptions?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success && data.prescriptions) {
        // Auto-fix prescriptions that are paid but not yet marked as dispensed
        const fixedPrescriptions = await Promise.all(
          data.prescriptions.map(async (prescription) => {
            if (prescription.paymentStatus === 'paid' && prescription.status === 'processing') {
              // Auto-update status to dispensed
              try {
                await updatePrescriptionStatus(prescription._id, 'dispensed', true)
                return { ...prescription, status: 'dispensed' }
              } catch (error) {
                console.error('Failed to auto-update prescription status:', error)
                return prescription
              }
            }
            return prescription
          })
        )
        setPrescriptions(fixedPrescriptions)
      } else {
        toast.error(data.message || 'Failed to fetch prescriptions')
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast.error('Error loading prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPrescriptions()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Check if prescription is expired (more than 1 day old)
  const isPrescriptionExpired = (prescription) => {
    const sentDate = new Date(prescription.sentToPharmacyAt || prescription.createdAt)
    const currentDate = new Date()
    const daysDifference = (currentDate - sentDate) / (1000 * 60 * 60 * 24)
    return daysDifference > 1
  }

  const filteredPrescriptions = prescriptions

  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed':
      case 'dispensed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDisplayStatus = (status) => {
    switch(status) {
      case 'active': return 'Pending'
      case 'completed': return 'Dispensed'
      case 'pending': return 'Pending'
      case 'processing': return 'Processing'
      case 'dispensed': return 'Dispensed'
      case 'cancelled': return 'Cancelled'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updatePrescriptionStatus = async (id, newStatus, silent = false) => {
    try {
      const token = localStorage.getItem('pharmacistToken')
      
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setPrescriptions(prev => prev.map(prescription => 
          prescription._id === id 
            ? { ...prescription, status: newStatus }
            : prescription
        ))
        
        if (!silent) {
          const statusMessage = {
            'processing': 'Prescription marked as processing',
            'dispensed': 'Prescription dispensed successfully',
            'cancelled': 'Prescription cancelled'
          }
          
          toast.success(statusMessage[newStatus] || 'Status updated')
        }
      } else {
        if (!silent) {
          toast.error(data.message || 'Failed to update status')
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update prescription status')
    }
  }

  const downloadPrescription = (prescription) => {
    // In a real app, this would generate and download a PDF
    toast.success(`Prescription ${prescription.id} downloaded`)
  }

  // Fetch available medicines for allocation
  const fetchAvailableMedicines = async () => {
    try {
      setLoadingMedicines(true)
      const token = localStorage.getItem('pharmacistToken')
      
      const response = await fetch(`${API_BASE_URL}/medicines?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Medicine fetch error:', errorData)
        toast.error(errorData.message || 'Failed to fetch medicines')
        return
      }

      const data = await response.json()
      console.log('Medicines fetched:', data)

      if (data.success && data.data && data.data.medicines) {
        setAvailableMedicines(data.data.medicines)
      } else {
        console.error('Invalid response structure:', data)
        toast.error(data.message || 'Failed to fetch medicines')
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Failed to load medicine inventory: ' + error.message)
    } finally {
      setLoadingMedicines(false)
    }
  }

  // Open allocation modal
  const openAllocationModal = async (prescription) => {
    setAllocationPrescription(prescription)
    setShowAllocationModal(true)
    
    // Fetch available medicines first
    await fetchAvailableMedicines()
  }

  // Helper function to normalize medicine names for matching
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters
  }

  // Auto-match medicines after fetching - using useEffect
  useEffect(() => {
    if (allocationPrescription && availableMedicines.length > 0 && allocations.length === 0) {
      // Initialize allocations array and try to auto-match medicines by name
      const initialAllocations = allocationPrescription.medications.map((med, index) => {
        const normalizedMedName = normalizeName(med.name)
        
        // Try to find matching medicine in inventory by name (case-insensitive, space-insensitive)
        const matchingMedicine = availableMedicines.find(m => {
          const normalizedInventoryName = normalizeName(m.name)
          return normalizedInventoryName.includes(normalizedMedName) || 
                 normalizedMedName.includes(normalizedInventoryName)
        })
        
        return {
          medicationIndex: index,
          medicationName: med.name,
          medicationDosage: med.dosage,
          medicationDuration: med.duration,
          medicineId: matchingMedicine?._id || '',
          quantity: 1,
          allocated: false
        }
      })
      
      setAllocations(initialAllocations)
    }
  }, [availableMedicines, allocationPrescription])

  // Handle medicine selection for a medication
  const handleMedicineSelection = (index, medicineId) => {
    const updatedAllocations = [...allocations]
    updatedAllocations[index].medicineId = medicineId
    setAllocations(updatedAllocations)
  }

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const updatedAllocations = [...allocations]
    updatedAllocations[index].quantity = parseInt(quantity) || 0
    setAllocations(updatedAllocations)
  }

  // Submit allocation
  const handleAllocateSubmit = async () => {
    try {
      // Validate all allocations
      const invalidAllocations = allocations.filter(a => !a.medicineId || a.quantity <= 0)
      
      if (invalidAllocations.length > 0) {
        toast.error('Please select medicine and quantity for all medications')
        return
      }

      setAllocating(true)
      const token = localStorage.getItem('pharmacistToken')
      
      // Prepare allocation data
      const allocationData = allocations.map(a => ({
        medicationIndex: a.medicationIndex,
        medicineId: a.medicineId,
        quantity: a.quantity
      }))

      const response = await fetch(
        `${API_BASE_URL}/prescriptions/${allocationPrescription._id}/allocate-medicines`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ allocations: allocationData })
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Medicines allocated successfully')
        setShowAllocationModal(false)
        setAllocationPrescription(null)
        setAllocations([])
        // Refresh prescriptions
        await fetchPrescriptions()
      } else {
        toast.error(data.message || 'Failed to allocate medicines')
      }
    } catch (error) {
      console.error('Error allocating medicines:', error)
      toast.error('Failed to allocate medicines')
    } finally {
      setAllocating(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalQuantity = (medicines) => {
    return medicines.reduce((total, med) => total + (med.quantity || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and dispense doctor prescriptions for patients
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Total: {filteredPrescriptions.length} prescriptions
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {prescriptions.filter(p => p.status === 'pending' || p.status === 'active').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {prescriptions.filter(p => p.status === 'pending' || p.status === 'active').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dispensed Today</p>
              <p className="text-2xl font-bold text-green-600">
                {prescriptions.filter(p => (p.status === 'dispensed' || p.status === 'completed') && 
                  p.sentToPharmacyAt && new Date(p.sentToPharmacyAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {prescriptions.filter(p => p.priority === 'urgent' && p.status !== 'dispensed').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C33764] focus:border-[#C33764]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C33764] focus:border-[#C33764]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="dispensed">Dispensed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrescriptions.map((prescription) => {
          const isExpired = isPrescriptionExpired(prescription)
          return (
          <div key={prescription.id} className={`rounded-lg border p-6 transition-shadow ${
            isExpired 
              ? 'bg-gray-100 border-gray-300 opacity-60' 
              : 'bg-white border-gray-200 hover:shadow-md'
          }`}>
            {/* Expired Warning Banner */}
            {isExpired && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  This prescription is more than 1 day old and can no longer be processed
                </p>
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className={`text-lg font-semibold ${
                  isExpired ? 'text-gray-500' : 'text-gray-900'
                }`}>{prescription.id}</h3>
                {isExpired && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    Expired
                  </span>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                  {getDisplayStatus(prescription.status)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(prescription.priority)}`}>
                  {prescription.priority}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedPrescription(prescription)
                    setShowModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-[#C33764] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadPrescription(prescription)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Patient and Doctor Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{prescription.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {prescription.patientId?.email || prescription.patientId?.firstName || 'Patient'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {prescription.doctorId ? 
                      `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}` : 
                      'Doctor'}
                  </p>
                  <p className="text-xs text-gray-500">{prescription.doctorId?.specialization || 'Doctor'}</p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center mb-4">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {prescription.sentToPharmacyAt ? formatDate(prescription.sentToPharmacyAt) : formatDate(prescription.createdAt)}
              </span>
            </div>

            {/* Medicines */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Pill className="w-4 h-4 mr-1" />
                Medicines ({prescription.medications?.length || 0})
              </h4>
              <div className="space-y-2">
                {prescription.medications?.slice(0, 2).map((medicine, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-600">
                      {medicine.dosage} - {medicine.frequency || 'As prescribed'} for {medicine.duration}
                    </p>
                    {medicine.instructions && (
                      <p className="text-xs text-gray-500 italic mt-1">{medicine.instructions}</p>
                    )}
                  </div>
                ))}
                {prescription.medications?.length > 2 && (
                  <p className="text-xs text-gray-500">+{prescription.medications.length - 2} more medicines</p>
                )}
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Diagnosis:</strong> {prescription.diagnosis}
                </p>
              </div>
            )}

            {/* General Instructions */}
            {prescription.generalInstructions && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Instructions:</strong> {prescription.generalInstructions.slice(0, 60)}
                  {prescription.generalInstructions.length > 60 && '...'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Total: {prescription.medications?.length || 0} items
              </div>
              <div className="flex space-x-2">
                {prescription.status === 'pending' || prescription.status === 'active' ? (
                  <>
                    <button
                      onClick={() => !isExpired && openAllocationModal(prescription)}
                      disabled={isExpired}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isExpired 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Start Processing
                    </button>
                    <button
                      onClick={() => !isExpired && updatePrescriptionStatus(prescription._id, 'dispensed')}
                      disabled={isExpired}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isExpired 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Mark Dispensed
                    </button>
                  </>
                ) : prescription.status === 'processing' ? (
                  prescription.paymentStatus === 'paid' ? (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                      ✓ Paid - Auto Dispensing
                    </span>
                  ) : (
                    <button
                      onClick={() => !isExpired && updatePrescriptionStatus(prescription._id, 'dispensed')}
                      disabled={isExpired}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isExpired 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Mark Dispensed
                    </button>
                  )
                ) : (prescription.status === 'completed' || prescription.status === 'dispensed') ? (
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                    ✓ Dispensed
                  </span>
                ) : null}
              </div>
            </div>

            {/* Dispensed Info */}
            {prescription.dispensedAt && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Dispensed by {prescription.dispensedBy} on {prescription.dispensedAt}
                </p>
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Prescription Detail Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Prescription Details - {selectedPrescription.id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                    <p><strong>Name:</strong> {selectedPrescription.patientName}</p>
                    <p><strong>ID:</strong> {selectedPrescription.patientId}</p>
                    <p><strong>Allergies:</strong> {selectedPrescription.allergies}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                    <p><strong>Name:</strong> {selectedPrescription.doctorName}</p>
                    <p><strong>Date:</strong> {formatDate(selectedPrescription.date)}</p>
                    <p><strong>Time:</strong> {selectedPrescription.time}</p>
                  </div>
                </div>

                {/* Medicines */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prescribed Medicines</h4>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900">{medicine.name}</h5>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <p><strong>Dosage:</strong> {medicine.dosage}</p>
                          <p><strong>Frequency:</strong> {medicine.frequency}</p>
                          <p><strong>Duration:</strong> {medicine.duration}</p>
                          <p><strong>Quantity:</strong> {medicine.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Doctor's Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedPrescription.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                  {selectedPrescription.status !== 'dispensed' && (
                    <button
                      onClick={() => {
                        updatePrescriptionStatus(selectedPrescription.id, 'dispensed')
                        setShowModal(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark as Dispensed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Allocation Modal */}
      {showAllocationModal && allocationPrescription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Allocate Medicines from Inventory
              </h3>
              <button
                onClick={() => {
                  setShowAllocationModal(false)
                  setAllocationPrescription(null)
                  setAllocations([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Prescription ID:</strong> {allocationPrescription.id || allocationPrescription._id}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Patient:</strong> {allocationPrescription.patientName}
              </p>
            </div>

            {loadingMedicines ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading medicines...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allocations.map((allocation, index) => {
                  const selectedMedicine = availableMedicines.find(m => m._id === allocation.medicineId)
                  
                  return (
                    <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900">{allocation.medicationName}</h4>
                        <p className="text-sm text-gray-600">
                          {allocation.medicationDosage} - {allocation.medicationDuration}
                        </p>
                        {!allocation.medicineId && availableMedicines.length > 0 && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            No exact match found in inventory - please select manually
                          </p>
                        )}
                      </div>

                      {/* Medicine Selection with Images */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Medicine from Inventory
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {availableMedicines.length > 0 ? (
                            availableMedicines.map((medicine) => (
                              <div
                                key={medicine._id}
                                onClick={() => medicine.stockQuantity > 0 && handleMedicineSelection(index, medicine._id)}
                                className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                                  allocation.medicineId === medicine._id
                                    ? 'bg-purple-100 border-2 border-purple-500'
                                    : medicine.stockQuantity === 0
                                    ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {/* Medicine Image */}
                                <div className="flex-shrink-0 w-12 h-12 mr-3">
                                  {medicine.image?.url ? (
                                    <img
                                      src={medicine.image.url}
                                      alt={medicine.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                      <Pill className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Medicine Info */}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {medicine.stockQuantity > 0 ? (
                                      <>Stock: {medicine.stockQuantity} • ₹{medicine.unitPrice}</>
                                    ) : (
                                      <span className="text-red-600">Unavailable - Out of Stock</span>
                                    )}
                                  </p>
                                </div>
                                
                                {/* Selection Indicator */}
                                {allocation.medicineId === medicine._id && (
                                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No medicines in inventory</p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Allocate
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={selectedMedicine?.stockQuantity || 999}
                            value={allocation.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {selectedMedicine && (
                            <p className="text-xs text-gray-500 mt-1">
                              Available: {selectedMedicine.stockQuantity} units
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {selectedMedicine && allocation.quantity > selectedMedicine.stockQuantity && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-700">
                            ⚠️ Insufficient stock! Only {selectedMedicine.stockQuantity} units available.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAllocationModal(false)
                  setAllocationPrescription(null)
                  setAllocations([])
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={allocating}
              >
                Cancel
              </button>
              <button
                onClick={handleAllocateSubmit}
                disabled={allocating || loadingMedicines}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {allocating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Allocating...
                  </>
                ) : (
                  'Allocate & Start Processing'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionManagement