import React, { useState, useEffect } from 'react'
import {
  Search,
  User,
  Plus,
  Save,
  FileText,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  X,
  Stethoscope,
  ChevronDown,
  Filter,
  Link
} from 'lucide-react'

const TreatmentNotes = () => {
  const [treatmentNotes, setTreatmentNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [patientFilter, setPatientFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  
  // Form state
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [findings, setFindings] = useState('')
  const [procedures, setProcedures] = useState('')
  const [observations, setObservations] = useState('')
  const [followUpInstructions, setFollowUpInstructions] = useState('')
  const [nextAppointment, setNextAppointment] = useState('')

  // Sample treatment notes data
  const sampleTreatmentNotes = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientId: 1,
      appointmentId: 1,
      appointmentDate: '2025-08-05',
      appointmentTime: '09:00 AM',
      appointmentReason: 'Routine Checkup',
      date: '2025-08-05',
      findings: 'No cavities detected. Slight plaque buildup on lower molars. Gums appear healthy with no signs of inflammation.',
      procedures: 'Professional cleaning performed. Fluoride treatment applied. Oral hygiene instructions provided.',
      observations: 'Patient maintains good oral hygiene. Slight improvement since last visit. No pain or discomfort reported.',
      followUpInstructions: 'Continue regular brushing and flossing. Use fluoride rinse as prescribed. Avoid sugary drinks.',
      nextAppointment: '2025-11-05',
      doctorName: 'Dr. Smith',
      createdAt: '2025-08-05 09:45 AM',
      lastModified: '2025-08-05 09:45 AM'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      patientId: 2,
      appointmentId: 2,
      appointmentDate: '2025-07-20',
      appointmentTime: '10:30 AM',
      appointmentReason: 'Tooth Pain',
      date: '2025-07-20',
      findings: 'Severe decay in tooth #19. Infection present with visible swelling. Patient reports intense pain.',
      procedures: 'Root canal procedure initiated. Local anesthesia administered. Infected pulp removed. Temporary filling placed.',
      observations: 'Patient tolerated procedure well. Pain significantly reduced post-treatment. Swelling expected to decrease.',
      followUpInstructions: 'Take prescribed antibiotics as directed. Use pain medication as needed. Avoid chewing on affected side.',
      nextAppointment: '2025-08-10',
      doctorName: 'Dr. Smith',
      createdAt: '2025-07-20 11:15 AM',
      lastModified: '2025-07-20 11:15 AM'
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      patientId: 3,
      appointmentId: 3,
      appointmentDate: '2025-06-10',
      appointmentTime: '02:00 PM',
      appointmentReason: 'Teeth Cleaning',
      date: '2025-06-10',
      findings: 'Moderate tartar buildup. Some staining from coffee consumption. Overall dental health is good.',
      procedures: 'Deep cleaning performed. Tartar removal completed. Polishing applied. Whitening treatment discussed.',
      observations: 'Patient interested in cosmetic improvements. No underlying dental issues detected.',
      followUpInstructions: 'Reduce coffee intake or use straw. Consider whitening treatment options discussed.',
      nextAppointment: '2025-09-10',
      doctorName: 'Dr. Smith',
      createdAt: '2025-06-10 02:30 PM',
      lastModified: '2025-06-10 02:30 PM'
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

  // Sample appointments for linking
  const sampleAppointments = [
    { id: 1, patientId: 1, date: '2025-08-05', time: '09:00 AM', reason: 'Routine Checkup' },
    { id: 2, patientId: 2, date: '2025-08-10', time: '10:30 AM', reason: 'Follow-up' },
    { id: 3, patientId: 3, date: '2025-08-15', time: '02:00 PM', reason: 'Consultation' }
  ]

  useEffect(() => {
    setTimeout(() => {
      setTreatmentNotes(sampleTreatmentNotes)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = treatmentNotes.filter(note => {
      const matchesSearch = note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.findings.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.procedures.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.appointmentReason.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPatient = patientFilter === 'all' || note.patientId === parseInt(patientFilter)
      
      return matchesSearch && matchesPatient
    })
    
    setFilteredNotes(filtered)
  }, [treatmentNotes, searchTerm, patientFilter])

  const getAvailableAppointments = () => {
    if (!selectedPatient) return []
    return sampleAppointments.filter(apt => apt.patientId === parseInt(selectedPatient))
  }

  const handleSaveNote = () => {
    const selectedPatientData = samplePatients.find(p => p.id === parseInt(selectedPatient))
    const selectedAppointmentData = sampleAppointments.find(a => a.id === parseInt(selectedAppointment))
    
    const noteData = {
      patientName: selectedPatientData?.name || '',
      patientId: parseInt(selectedPatient),
      appointmentId: parseInt(selectedAppointment),
      appointmentDate: selectedAppointmentData?.date || '',
      appointmentTime: selectedAppointmentData?.time || '',
      appointmentReason: selectedAppointmentData?.reason || '',
      date: new Date().toISOString().split('T')[0],
      findings,
      procedures,
      observations,
      followUpInstructions,
      nextAppointment,
      doctorName: 'Dr. Smith',
      createdAt: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString()
    }

    if (editingNote) {
      setTreatmentNotes(prev => 
        prev.map(note => 
          note.id === editingNote.id 
            ? { ...noteData, id: editingNote.id, createdAt: editingNote.createdAt }
            : note
        )
      )
      setEditingNote(null)
    } else {
      const newNote = {
        ...noteData,
        id: treatmentNotes.length + 1
      }
      setTreatmentNotes([newNote, ...treatmentNotes])
    }
    
    resetForm()
    setShowCreateForm(false)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setSelectedPatient(note.patientId.toString())
    setSelectedAppointment(note.appointmentId.toString())
    setFindings(note.findings)
    setProcedures(note.procedures)
    setObservations(note.observations)
    setFollowUpInstructions(note.followUpInstructions)
    setNextAppointment(note.nextAppointment)
    setShowCreateForm(true)
  }

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this treatment note?')) {
      setTreatmentNotes(prev => prev.filter(note => note.id !== noteId))
    }
  }

  const resetForm = () => {
    setSelectedPatient('')
    setSelectedAppointment('')
    setFindings('')
    setProcedures('')
    setObservations('')
    setFollowUpInstructions('')
    setNextAppointment('')
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    setEditingNote(null)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading treatment notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treatment Notes</h1>
          <p className="text-gray-600 mt-1">Record and manage patient treatment notes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Treatment Note
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingNote ? 'Edit Treatment Note' : 'Create New Treatment Note'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => {
                    setSelectedPatient(e.target.value)
                    setSelectedAppointment('')
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a patient...</option>
                  {samplePatients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Appointment
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  disabled={!selectedPatient}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Choose an appointment...</option>
                  {getAvailableAppointments().map(appointment => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.date} - {appointment.time} ({appointment.reason})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Findings</label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Describe your clinical findings..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Procedures Performed</label>
              <textarea
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
                placeholder="List the procedures performed during this visit..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observations</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Additional observations and notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Instructions</label>
              <textarea
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.target.value)}
                placeholder="Instructions for the patient..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Appointment Date
                <span className="text-gray-500 text-xs ml-1">(optional)</span>
              </label>
              <input
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveNote}
                disabled={!selectedPatient || !findings || !procedures}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingNote ? 'Update Note' : 'Save Note'}
              </button>
              <button
                onClick={handleCloseForm}
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
              placeholder="Search treatment notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Patients</option>
              {samplePatients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No treatment notes found</h3>
              <p className="text-gray-600">Create your first treatment note or adjust your search criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{note.patientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {note.appointmentDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {note.appointmentTime}
                          </span>
                          <span>•</span>
                          <span>{note.appointmentReason}</span>
                          {note.appointmentId && (
                            <>
                              <span>•</span>
                              <span className="flex items-center text-blue-600">
                                <Link className="w-4 h-4 mr-1" />
                                Linked to Appointment
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Findings</h4>
                      <p className="text-sm text-gray-700">{note.findings}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Procedures Performed</h4>
                      <p className="text-sm text-gray-700">{note.procedures}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Observations</h4>
                      <p className="text-sm text-gray-700">{note.observations}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Follow-up Instructions</h4>
                      <p className="text-sm text-gray-700">{note.followUpInstructions}</p>
                    </div>

                    {note.nextAppointment && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Next Appointment</h4>
                        <p className="text-sm text-gray-700">{note.nextAppointment}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {note.createdAt} by {note.doctorName}</span>
                    <span>Last modified: {note.lastModified}</span>
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

export default TreatmentNotes
