import React, { useState } from 'react'
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart
} from 'lucide-react'
import { Link } from 'react-router-dom'

const PatientRecords = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      dateOfBirth: '1985-06-15',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25',
      assignedDoctor: 'Dr. Sarah Johnson',
      treatments: ['Root Canal', 'Cleaning'],
      totalVisits: 8,
      status: 'active',
      medicalHistory: ['Hypertension', 'Allergic to Penicillin'],
      insurance: 'BlueCross BlueShield',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 2,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, City, State 12345',
      dateOfBirth: '1990-03-22',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-02-15',
      assignedDoctor: 'Dr. Michael Smith',
      treatments: ['Orthodontics', 'Whitening'],
      totalVisits: 12,
      status: 'active',
      medicalHistory: ['Diabetes Type 2'],
      insurance: 'Aetna',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 3,
      name: 'Michael Johnson',
      email: 'michael.johnson@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine St, City, State 12345',
      dateOfBirth: '1978-11-30',
      lastVisit: '2023-12-20',
      nextAppointment: null,
      assignedDoctor: 'Dr. Emily Williams',
      treatments: ['Cleaning', 'Filling'],
      totalVisits: 6,
      status: 'inactive',
      medicalHistory: ['No known allergies'],
      insurance: 'Humana',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm Dr, City, State 12345',
      dateOfBirth: '1995-09-12',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-30',
      assignedDoctor: 'Dr. Robert Brown',
      treatments: ['Extraction', 'Implant'],
      totalVisits: 4,
      status: 'active',
      medicalHistory: ['Anxiety', 'Lactose Intolerant'],
      insurance: 'Cigna',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600">Manage patient information and medical history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Upcoming Visits</p>
              <p className="text-2xl font-bold text-gray-900">{patients.filter(p => p.nextAppointment).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Recent Visits</p>
              <p className="text-2xl font-bold text-gray-900">{patients.filter(p => {
                const lastVisit = new Date(p.lastVisit)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return lastVisit >= weekAgo
              }).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={patient.image}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">Age: {calculateAge(patient.dateOfBirth)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(patient.lastVisit)}</div>
                    <div className="text-sm text-gray-500">{patient.totalVisits} total visits</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {patient.nextAppointment ? formatDate(patient.nextAppointment) : 'Not scheduled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.assignedDoctor}</div>
                    <div className="text-sm text-gray-500">{patient.treatments.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Edit Patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                        title="Medical Records"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Patient Profile</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Info */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                  <img
                    src={selectedPatient.image}
                    alt={selectedPatient.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
                  />
                  <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-teal-100">Age: {calculateAge(selectedPatient.dateOfBirth)}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedPatient.phone}
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedPatient.email}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Visits:</span>
                      <span className="font-semibold">{selectedPatient.totalVisits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-semibold">{formatDate(selectedPatient.lastVisit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance:</span>
                      <span className="font-semibold">{selectedPatient.insurance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Date of Birth:</span>
                        <p className="font-semibold">{formatDate(selectedPatient.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="font-semibold">{selectedPatient.address}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedPatient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedPatient.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Medical Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Assigned Doctor:</span>
                        <p className="font-semibold">{selectedPatient.assignedDoctor}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Medical History:</span>
                        <div className="mt-1">
                          {selectedPatient.medicalHistory.map((condition, index) => (
                            <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Treatment History</h4>
                    <div className="space-y-2">
                      {selectedPatient.treatments.map((treatment, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{treatment}</span>
                          <span className="text-xs text-gray-500">Completed</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Appointments</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Next Appointment:</span>
                        <p className="font-semibold">
                          {selectedPatient.nextAppointment 
                            ? formatDate(selectedPatient.nextAppointment)
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                      <button className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors duration-200">
                        Schedule New Appointment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Edit Patient
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    View Medical Records
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientRecords