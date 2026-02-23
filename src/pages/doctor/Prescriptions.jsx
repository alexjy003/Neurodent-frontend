import React, { useState, useEffect } from 'react'
import {
  Search,
  User,
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
  Check,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import apiService from '../../services/api'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', instructions: '' }])
  const [patients, setPatients] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPharmacistModal, setShowPharmacistModal] = useState(false)
  const [pharmacists, setPharmacists] = useState([])
  const [selectedPharmacist, setSelectedPharmacist] = useState(null)
  const [loadingPharmacists, setLoadingPharmacists] = useState(false)
  const [prescriptionToSend, setPrescriptionToSend] = useState(null)

  // Fetch prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        page: 1,
        limit: 50
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await apiService.getPrescriptions(Object.fromEntries(params))
      
      if (response && response.prescriptions) {
        setPrescriptions(response.prescriptions)
      } else {
        setPrescriptions([])
      }
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error)
      if (error.response) {
        setError(`Failed to load prescriptions: ${error.message}`)
      } else {
        setError('Failed to load prescriptions. Please try again.')
      }
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }  // Fetch patients for dropdown
  const fetchPatients = async () => {
    try {
      // For now, skip patient fetching since the endpoint might not exist
      // or we might need to implement it differently
      setPatients([])
    } catch (error) {
      console.error('❌ Error fetching patients:', error)
      setPatients([])
    }
  }

  // Fetch pharmacists for selection
  const fetchPharmacists = async () => {
    try {
      setLoadingPharmacists(true)
      const response = await apiService.get('/pharmacists')
      
      if (response.success && response.data.pharmacists) {
        // Filter only active pharmacists
        const activePharmacists = response.data.pharmacists.filter(
          pharmacist => pharmacist.availability === 'Active'
        )
        setPharmacists(activePharmacists)
      } else {
        setPharmacists([])
      }
    } catch (error) {
      console.error('❌ Error fetching pharmacists:', error)
      toast.error('Failed to load pharmacists')
      setPharmacists([])
    } finally {
      setLoadingPharmacists(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
    fetchPatients()
  }, [searchTerm])

  useEffect(() => {
    fetchPrescriptions()
  }, [searchTerm])

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

  const handleSavePrescription = async () => {
    try {
      if (!selectedPatient || !diagnosis || medications.every(med => !med.name)) {
        toast.error('Please fill in all required fields')
        return
      }

      const selectedPatientData = patients.find(p => p._id === selectedPatient)
      if (!selectedPatientData) {
        toast.error('Please select a valid patient')
        return
      }

      const prescriptionData = {
        patientId: selectedPatient,
        patientName: `${selectedPatientData.firstName} ${selectedPatientData.lastName}`,
        patientAge: selectedPatientData.age,
        diagnosis,
        symptoms,
        medications: medications.filter(med => med.name && med.dosage),
        generalInstructions: '',
        isAIGenerated: false
      }

      const response = await apiService.post('/prescriptions', prescriptionData)
      
      if (response.success) {
        toast.success('Prescription saved successfully!')
        resetForm()
        setShowCreateForm(false)
        fetchPrescriptions() // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to save prescription')
      }
    } catch (error) {
      console.error('❌ Error saving prescription:', error)
      toast.error(error.response?.data?.message || 'Failed to save prescription')
    }
  }

  const handleDownloadPDF = async (prescriptionId) => {
    try {
      // Call API to generate and download prescription file
      const response = await apiService.downloadPrescriptionPDF(prescriptionId);
      
      let blob;
      let filename;
      
      if (response.type === 'text') {
        // Handle text response
        blob = new Blob([response.data], { type: 'text/plain' });
        filename = `prescription-${prescriptionId}.txt`;
      } else {
        // Handle blob response (PDF)
        blob = response.data;
        filename = `prescription-${prescriptionId}.pdf`;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Prescription downloaded successfully!');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription. Please try again.');
    }
  }

  const handleSendToPharmacy = async (prescriptionId) => {
    // Open modal to select pharmacist
    setPrescriptionToSend(prescriptionId)
    setShowPharmacistModal(true)
    fetchPharmacists()
  }

  const handleConfirmSendToPharmacy = async () => {
    if (!selectedPharmacist) {
      toast.error('Please select a pharmacist')
      return
    }

    try {
      // Send prescription to selected pharmacist
      const response = await apiService.post(
        `/prescriptions/${prescriptionToSend}/send-to-pharmacy`,
        { pharmacistId: selectedPharmacist._id }
      )
      
      if (response.success) {
        // Update the prescription in state to reflect it was sent
        setPrescriptions(prev => 
          prev.map(p => 
            p._id === prescriptionToSend 
              ? { ...p, sentToPharmacy: true, pharmacist: selectedPharmacist }
              : p
          )
        )
        
        toast.success(`Prescription sent to ${selectedPharmacist.firstName} ${selectedPharmacist.lastName} successfully!`)
        setShowPharmacistModal(false)
        setSelectedPharmacist(null)
        setPrescriptionToSend(null)
      }
    } catch (error) {
      console.error('❌ Error sending to pharmacy:', error)
      toast.error(error.response?.data?.message || 'Failed to send prescription to pharmacy')
    }
  }

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

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
          <p className="text-gray-600 mt-1">View and manage patient prescriptions</p>
        </div>
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
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading prescriptions...</h3>
              <p className="text-gray-600">Please wait while we fetch your prescriptions</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600">Create your first prescription from the Appointments section</p>
              <p className="text-sm text-gray-500 mt-2">Go to Appointments → Select a patient → Generate prescription</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        {(prescription.patientId?.profilePicture || prescription.patientId?.profileImage?.url) ? (
                          <img 
                            src={prescription.patientId.profilePicture || prescription.patientId.profileImage.url} 
                            alt="Patient"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{display: (prescription.patientId?.profilePicture || prescription.patientId?.profileImage?.url) ? 'none' : 'flex'}}
                        >
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.patientName || 
                           (prescription.patientId ? 
                             `${prescription.patientId.firstName} ${prescription.patientId.lastName}` : 
                             'Unknown Patient')}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{prescription.diagnosis}</span>
                          {prescription.isAIGenerated && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                AI Generated
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {prescription.sentToPharmacy && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Sent to Pharmacy
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    {prescription.symptoms && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Symptoms:</strong> {prescription.symptoms}
                      </p>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Medications:</p>
                      <div className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{med.name}</p>
                                <p className="text-sm text-gray-600">
                                  {med.dosage} • {med.duration}
                                  {med.frequency && ` • ${med.frequency}`}
                                </p>
                                {med.instructions && (
                                  <p className="text-sm text-gray-500 italic">{med.instructions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {prescription.generalInstructions && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>General Instructions:</strong> {prescription.generalInstructions}
                        </p>
                      </div>
                    )}
                    {prescription.followUpDate && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <strong>Follow-up Date:</strong> {new Date(prescription.followUpDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDownloadPDF(prescription._id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    {!prescription.sentToPharmacy && (
                      <button
                        onClick={() => handleSendToPharmacy(prescription._id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Pharmacy
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(prescription)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
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

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Info */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {(selectedPrescription.patientId?.profilePicture || selectedPrescription.patientId?.profileImage?.url) ? (
                      <img 
                        src={selectedPrescription.patientId.profilePicture || selectedPrescription.patientId.profileImage.url} 
                        alt="Patient"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPrescription.patientName || 
                       (selectedPrescription.patientId ? 
                         `${selectedPrescription.patientId.firstName} ${selectedPrescription.patientId.lastName}` : 
                         'Unknown Patient')}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Prescription Date: {new Date(selectedPrescription.prescriptionDate || selectedPrescription.createdAt).toLocaleDateString()}
                      </p>
                      {selectedPrescription.patientId?.age && (
                        <p>Age: {selectedPrescription.patientId.age} years</p>
                      )}
                      {selectedPrescription.isAIGenerated && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          AI Generated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPrescription.diagnosis}</p>
                </div>

                {/* Symptoms */}
                {selectedPrescription.symptoms && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Symptoms</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPrescription.symptoms}</p>
                  </div>
                )}

                {/* Medications */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Medications</h4>
                  <div className="space-y-3">
                    {selectedPrescription.medications.map((med, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{med.name}</h5>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {med.dosage}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Duration:</span> {med.duration}
                          </div>
                          {med.frequency && (
                            <div>
                              <span className="font-medium">Frequency:</span> {med.frequency}
                            </div>
                          )}
                        </div>
                        {med.instructions && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-900">Instructions:</span>
                            <p className="text-gray-700 italic mt-1">{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Instructions */}
                {selectedPrescription.generalInstructions && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">General Instructions</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPrescription.generalInstructions}</p>
                  </div>
                )}

                {/* Follow-up Date */}
                {selectedPrescription.followUpDate && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Follow-up Date</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedPrescription.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadPDF(selectedPrescription._id)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  {!selectedPrescription.sentToPharmacy && (
                    <button
                      onClick={() => {
                        handleSendToPharmacy(selectedPrescription._id);
                        setShowDetailsModal(false);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Pharmacy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacist Selection Modal */}
      {showPharmacistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Select Pharmacist</h3>
              <button
                onClick={() => {
                  setShowPharmacistModal(false)
                  setSelectedPharmacist(null)
                  setPrescriptionToSend(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingPharmacists ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pharmacists...</p>
                  </div>
                </div>
              ) : pharmacists.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No active pharmacists available</p>
                  <p className="text-gray-500 text-sm mt-2">Please try again later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a pharmacist to send the prescription to:
                  </p>
                  {pharmacists.map((pharmacist) => (
                    <div
                      key={pharmacist._id}
                      onClick={() => setSelectedPharmacist(pharmacist)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPharmacist?._id === pharmacist._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                            {pharmacist.profileImage ? (
                              <img
                                src={pharmacist.profileImage}
                                alt={`${pharmacist.firstName} ${pharmacist.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {pharmacist.firstName} {pharmacist.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{pharmacist.email}</p>
                            {pharmacist.specialization && (
                              <p className="text-xs text-gray-500 mt-1">
                                {pharmacist.specialization}
                              </p>
                            )}
                            {pharmacist.shift && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                {pharmacist.shift} Shift
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedPharmacist?._id === pharmacist._id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowPharmacistModal(false)
                  setSelectedPharmacist(null)
                  setPrescriptionToSend(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendToPharmacy}
                disabled={!selectedPharmacist}
                className={`px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${
                  selectedPharmacist
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prescriptions
