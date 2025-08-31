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
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const PrescriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'PX-001',
      patientName: 'John Smith',
      patientId: 'P001',
      doctorName: 'Dr. Wilson',
      doctorId: 'D001',
      date: '2025-08-31',
      time: '09:30 AM',
      status: 'pending',
      priority: 'normal',
      medicines: [
        { name: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days', quantity: 14 },
        { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed', duration: '5 days', quantity: 10 }
      ],
      notes: 'Take with food. Complete the full course of antibiotics.',
      allergies: 'None known',
      dispensedBy: null,
      dispensedAt: null
    },
    {
      id: 'PX-002',
      patientName: 'Sarah Johnson',
      patientId: 'P002',
      doctorName: 'Dr. Martinez',
      doctorId: 'D002',
      date: '2025-08-31',
      time: '10:15 AM',
      status: 'processing',
      priority: 'urgent',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'Every 6 hours', duration: '3 days', quantity: 12 }
      ],
      notes: 'For pain relief post dental surgery.',
      allergies: 'Penicillin',
      dispensedBy: 'Sarah (Pharmacist)',
      dispensedAt: null
    },
    {
      id: 'PX-003',
      patientName: 'Michael Brown',
      patientId: 'P003',
      doctorName: 'Dr. Wilson',
      doctorId: 'D001',
      date: '2025-08-30',
      time: '02:45 PM',
      status: 'dispensed',
      priority: 'normal',
      medicines: [
        { name: 'Dental Fluoride Gel', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '14 days', quantity: 1 },
        { name: 'Chlorhexidine Mouthwash', dosage: '10ml', frequency: 'Twice daily', duration: '7 days', quantity: 1 }
      ],
      notes: 'For gum inflammation. Use fluoride gel after brushing.',
      allergies: 'None known',
      dispensedBy: 'Sarah (Pharmacist)',
      dispensedAt: '2025-08-30 03:15 PM'
    },
    {
      id: 'PX-004',
      patientName: 'Emma Davis',
      patientId: 'P004',
      doctorName: 'Dr. Rodriguez',
      doctorId: 'D003',
      date: '2025-08-30',
      time: '11:20 AM',
      status: 'pending',
      priority: 'high',
      medicines: [
        { name: 'Metronidazole 400mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days', quantity: 15 }
      ],
      notes: 'For dental abscess. Take with meals.',
      allergies: 'Sulfa drugs',
      dispensedBy: null,
      dispensedAt: null
    },
    {
      id: 'PX-005',
      patientName: 'David Wilson',
      patientId: 'P005',
      doctorName: 'Dr. Martinez',
      doctorId: 'D002',
      date: '2025-08-29',
      time: '04:30 PM',
      status: 'dispensed',
      priority: 'normal',
      medicines: [
        { name: 'Vitamin D3 1000IU', dosage: '1 capsule', frequency: 'Once daily', duration: '30 days', quantity: 30 }
      ],
      notes: 'Vitamin supplement for bone health.',
      allergies: 'None known',
      dispensedBy: 'Sarah (Pharmacist)',
      dispensedAt: '2025-08-29 04:45 PM'
    }
  ])

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'dispensed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const updatePrescriptionStatus = (id, newStatus) => {
    setPrescriptions(prev => prev.map(prescription => 
      prescription.id === id 
        ? { 
            ...prescription, 
            status: newStatus,
            dispensedBy: newStatus === 'dispensed' ? 'Sarah (Pharmacist)' : prescription.dispensedBy,
            dispensedAt: newStatus === 'dispensed' ? new Date().toLocaleString() : prescription.dispensedAt
          }
        : prescription
    ))
    
    const statusMessage = {
      'processing': 'Prescription marked as processing',
      'dispensed': 'Prescription dispensed successfully',
      'cancelled': 'Prescription cancelled'
    }
    
    toast.success(statusMessage[newStatus] || 'Status updated')
  }

  const downloadPrescription = (prescription) => {
    // In a real app, this would generate and download a PDF
    toast.success(`Prescription ${prescription.id} downloaded`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalQuantity = (medicines) => {
    return medicines.reduce((total, med) => total + med.quantity, 0)
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
                {prescriptions.filter(p => p.status === 'pending').length}
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
                {prescriptions.filter(p => p.status === 'processing').length}
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
                {prescriptions.filter(p => p.status === 'dispensed' && 
                  new Date(p.date).toDateString() === new Date().toDateString()).length}
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
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{prescription.id}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
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
                  <p className="text-xs text-gray-500">Patient ID: {prescription.patientId}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{prescription.doctorName}</p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center mb-4">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{formatDate(prescription.date)} at {prescription.time}</span>
            </div>

            {/* Medicines */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Pill className="w-4 h-4 mr-1" />
                Medicines ({prescription.medicines.length})
              </h4>
              <div className="space-y-2">
                {prescription.medicines.slice(0, 2).map((medicine, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-600">
                      {medicine.dosage} - {medicine.frequency} for {medicine.duration}
                    </p>
                    <p className="text-xs text-gray-500">Quantity: {medicine.quantity}</p>
                  </div>
                ))}
                {prescription.medicines.length > 2 && (
                  <p className="text-xs text-gray-500">+{prescription.medicines.length - 2} more medicines</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {prescription.notes.slice(0, 60)}
                  {prescription.notes.length > 60 && '...'}
                </p>
              </div>
            )}

            {/* Allergies Warning */}
            {prescription.allergies !== 'None known' && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Allergies: {prescription.allergies}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Total: {getTotalQuantity(prescription.medicines)} items
              </div>
              <div className="flex space-x-2">
                {prescription.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updatePrescriptionStatus(prescription.id, 'processing')}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Start Processing
                    </button>
                    <button
                      onClick={() => updatePrescriptionStatus(prescription.id, 'dispensed')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Mark Dispensed
                    </button>
                  </>
                )}
                {prescription.status === 'processing' && (
                  <button
                    onClick={() => updatePrescriptionStatus(prescription.id, 'dispensed')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    Mark Dispensed
                  </button>
                )}
                {prescription.status === 'dispensed' && (
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                    ✓ Dispensed
                  </span>
                )}
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
        ))}
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
    </div>
  )
}

export default PrescriptionManagement