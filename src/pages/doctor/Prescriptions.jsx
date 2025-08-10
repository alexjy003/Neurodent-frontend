import React, { useState, useEffect } from 'react'
import {
  Search,
  User,
  Plus,
  Download,
  Send,
  Save,
  Pill,
  Calendar,
  Clock,
  FileText,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X,
  Check
} from 'lucide-react'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', instructions: '' }])

  // Sample prescriptions data
  const samplePrescriptions = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientId: 1,
      date: '2025-08-05',
      symptoms: 'Tooth sensitivity, mild pain',
      diagnosis: 'Dental sensitivity',
      medications: [
        {
          name: 'Fluoride Rinse',
          dosage: '10ml',
          frequency: 'Twice daily',
          duration: '2 weeks',
          instructions: 'Rinse for 30 seconds after brushing'
        }
      ],
      status: 'Active',
      sentToPharmacy: true,
      pharmacyName: 'City Pharmacy'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      patientId: 2,
      date: '2025-07-20',
      symptoms: 'Severe tooth pain, swelling',
      diagnosis: 'Post-operative pain management',
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'Every 6 hours',
          duration: '5 days',
          instructions: 'Take with food to avoid stomach upset'
        },
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete full course even if symptoms improve'
        }
      ],
      status: 'Completed',
      sentToPharmacy: true,
      pharmacyName: 'MedPlus Pharmacy'
    }
  ]

  // Sample patients for dropdown
  const samplePatients = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 3, name: 'Emily Davis' },
    { id: 4, name: 'David Wilson' },
    { id: 5, name: 'Lisa Anderson' }
  ]

  // Common medications for autocomplete
  const commonMedications = [
    'Ibuprofen', 'Amoxicillin', 'Fluoride Rinse', 'Chlorhexidine Mouthwash',
    'Acetaminophen', 'Clindamycin', 'Lidocaine Gel', 'Benzocaine Gel',
    'Penicillin', 'Metronidazole', 'Hydrogen Peroxide Rinse'
  ]

  useEffect(() => {
    setTimeout(() => {
      setPrescriptions(samplePrescriptions)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = prescriptions.filter(prescription => {
      const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || prescription.status.toLowerCase() === statusFilter
      
      return matchesSearch && matchesStatus
    })
    
    setFilteredPrescriptions(filtered)
  }, [prescriptions, searchTerm, statusFilter])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }])
  }

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index, field, value) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updated)
  }

  const handleSavePrescription = () => {
    const newPrescription = {
      id: prescriptions.length + 1,
      patientName: samplePatients.find(p => p.id === parseInt(selectedPatient))?.name || '',
      patientId: parseInt(selectedPatient),
      date: new Date().toISOString().split('T')[0],
      symptoms,
      diagnosis,
      medications: medications.filter(med => med.name && med.dosage),
      status: 'Active',
      sentToPharmacy: false,
      pharmacyName: null
    }
    
    setPrescriptions([newPrescription, ...prescriptions])
    resetForm()
    setShowCreateForm(false)
  }

  const handleDownloadPDF = (prescriptionId) => {
    console.log('Download PDF for prescription:', prescriptionId)
  }

  const handleSendToPharmacy = (prescriptionId) => {
    setPrescriptions(prev => 
      prev.map(p => 
        p.id === prescriptionId 
          ? { ...p, sentToPharmacy: true, pharmacyName: 'Default Pharmacy' }
          : p
      )
    )
  }

  const resetForm = () => {
    setSelectedPatient('')
    setSymptoms('')
    setDiagnosis('')
    setMedications([{ name: '', dosage: '', duration: '', instructions: '' }])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-1">Create and manage patient prescriptions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Create New Prescription</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a patient...</option>
                {samplePatients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe the patient's symptoms..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Medications</label>
                <button
                  onClick={addMedication}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </button>
              </div>

              {medications.map((medication, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Enter medication name..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        list={`medications-${index}`}
                      />
                      <datalist id={`medications-${index}`}>
                        {commonMedications.map(med => (
                          <option key={med} value={med} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage & Frequency</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 400mg every 6 hours"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 5 days, 2 weeks"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <input
                        type="text"
                        value={medication.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="Special instructions..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSavePrescription}
                disabled={!selectedPatient || !diagnosis || medications.every(med => !med.name)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Prescription
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600">Create your first prescription or adjust your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prescription.patientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {prescription.date}
                          </span>
                          <span>•</span>
                          <span>{prescription.diagnosis}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                      {prescription.sentToPharmacy && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Sent to Pharmacy
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>Symptoms:</strong> {prescription.symptoms}</p>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Medications:</p>
                      <div className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{med.name}</p>
                                <p className="text-sm text-gray-600">{med.dosage} • {med.frequency} • {med.duration}</p>
                                {med.instructions && (
                                  <p className="text-sm text-gray-500 italic">{med.instructions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDownloadPDF(prescription.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    {!prescription.sentToPharmacy && (
                      <button
                        onClick={() => handleSendToPharmacy(prescription.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Pharmacy
                      </button>
                    )}
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Prescriptions
