import React, { useState, useEffect } from 'react'
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye,
  Edit,
  Plus,
  Filter,
  ChevronRight,
  Activity,
  Pill,
  Stethoscope,
  Heart,
  Users
} from 'lucide-react'

const PatientRecords = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Sample patient data
  const samplePatients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 234-567-8900',
      age: 28,
      gender: 'Female',
      lastVisit: '2025-08-05',
      nextAppointment: '2025-08-15',
      status: 'Active',
      totalVisits: 12,
      treatmentHistory: [
        {
          id: 1,
          date: '2025-08-05',
          treatment: 'Routine Cleaning',
          doctor: 'Dr. Smith',
          notes: 'Regular cleaning completed. No issues found.',
          cost: '$120'
        },
        {
          id: 2,
          date: '2025-05-15',
          treatment: 'Cavity Filling',
          doctor: 'Dr. Smith',
          notes: 'Filled cavity in upper right molar. Patient responded well.',
          cost: '$180'
        }
      ],
      prescriptions: [
        {
          id: 1,
          date: '2025-08-05',
          medication: 'Fluoride Rinse',
          dosage: '10ml twice daily',
          duration: '2 weeks',
          status: 'Active'
        }
      ],
      notes: [
        {
          id: 1,
          date: '2025-08-05',
          note: 'Patient maintains good oral hygiene. Recommend continued regular cleanings.',
          doctor: 'Dr. Smith'
        }
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 234-567-8901',
      age: 35,
      gender: 'Male',
      lastVisit: '2025-07-20',
      nextAppointment: '2025-08-10',
      status: 'Active',
      totalVisits: 8,
      treatmentHistory: [
        {
          id: 1,
          date: '2025-07-20',
          treatment: 'Root Canal',
          doctor: 'Dr. Smith',
          notes: 'Root canal procedure completed successfully on tooth #19.',
          cost: '$800'
        }
      ],
      prescriptions: [
        {
          id: 1,
          date: '2025-07-20',
          medication: 'Ibuprofen',
          dosage: '400mg every 6 hours',
          duration: '5 days',
          status: 'Completed'
        }
      ],
      notes: [
        {
          id: 1,
          date: '2025-07-20',
          note: 'Patient experienced severe pain. Root canal was necessary.',
          doctor: 'Dr. Smith'
        }
      ]
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 234-567-8902',
      age: 42,
      gender: 'Female',
      lastVisit: '2025-06-10',
      nextAppointment: null,
      status: 'Inactive',
      totalVisits: 15,
      treatmentHistory: [
        {
          id: 1,
          date: '2025-06-10',
          treatment: 'Teeth Whitening',
          doctor: 'Dr. Smith',
          notes: 'Professional whitening treatment completed.',
          cost: '$300'
        }
      ],
      prescriptions: [],
      notes: [
        {
          id: 1,
          date: '2025-06-10',
          note: 'Patient satisfied with whitening results.',
          doctor: 'Dr. Smith'
        }
      ]
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setPatients(samplePatients)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.phone.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || patient.status.toLowerCase() === statusFilter
      
      return matchesSearch && matchesStatus
    })
    
    setFilteredPatients(filtered)
  }, [patients, searchTerm, statusFilter])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setActiveTab('overview')
  }

  const handleDownloadReport = (patientId) => {
    console.log('Download report for patient:', patientId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient records...</p>
        </div>
      </div>
    )
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedPatient(null)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Back to Patients
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h1>
            <p className="text-gray-600">Patient ID: #{selectedPatient.id}</p>
          </div>
          <button
            onClick={() => handleDownloadReport(selectedPatient.id)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Age & Gender</p>
                <p className="font-semibold">{selectedPatient.age} years, {selectedPatient.gender}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{selectedPatient.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm">{selectedPatient.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="font-semibold">{selectedPatient.totalVisits}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'history', label: 'Treatment History', icon: Stethoscope },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'notes', label: 'Doctor Notes', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Last Visit</h3>
                  <p className="text-blue-700">{selectedPatient.lastVisit}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Next Appointment</h3>
                  <p className="text-green-700">{selectedPatient.nextAppointment || 'Not scheduled'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Status</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Treatment History Timeline</h3>
                {selectedPatient.treatmentHistory.map((treatment) => (
                  <div key={treatment.id} className="border-l-4 border-blue-500 pl-4 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{treatment.treatment}</h4>
                        <p className="text-sm text-gray-600">{treatment.date} • {treatment.doctor}</p>
                        <p className="text-sm mt-2">{treatment.notes}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{treatment.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Past Prescriptions</h3>
                {selectedPatient.prescriptions.length === 0 ? (
                  <p className="text-gray-600">No prescriptions found.</p>
                ) : (
                  selectedPatient.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{prescription.medication}</h4>
                          <p className="text-sm text-gray-600">{prescription.dosage} • {prescription.duration}</p>
                          <p className="text-sm text-gray-500">Prescribed on {prescription.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Doctor Notes</h3>
                {selectedPatient.notes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">{note.date} • {note.doctor}</span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600 mt-1">Search and manage patient information</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
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
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{patient.age} years, {patient.gender}</span>
                          <span>•</span>
                          <span>{patient.phone}</span>
                          <span>•</span>
                          <span>Last visit: {patient.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
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

export default PatientRecords
