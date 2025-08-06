import React, { useState } from 'react'

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState('treatments')
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Mock data - in real app, this would come from API
  const medicalData = {
    treatments: [
      {
        id: 1,
        date: '2024-01-08',
        doctor: 'Dr. Sarah Johnson',
        type: 'Cleaning & Examination',
        description: 'Routine dental cleaning and comprehensive oral examination',
        findings: 'Overall good oral health. Minor plaque buildup removed.',
        treatment: 'Professional cleaning, fluoride treatment',
        nextVisit: '2024-07-08',
        status: 'completed',
        cost: '$180.00',
        attachments: ['xray_2024_01_08.pdf', 'treatment_notes.pdf']
      },
      {
        id: 2,
        date: '2023-12-20',
        doctor: 'Dr. Michael Chen',
        type: 'Orthodontic Consultation',
        description: 'Initial consultation for orthodontic treatment',
        findings: 'Mild crowding in lower front teeth. Upper arch normal.',
        treatment: 'Discussed Invisalign treatment options',
        nextVisit: '2024-01-22',
        status: 'completed',
        cost: '$150.00',
        attachments: ['orthodontic_assessment.pdf']
      },
      {
        id: 3,
        date: '2023-12-05',
        doctor: 'Dr. Robert Smith',
        type: 'Wisdom Tooth Extraction',
        description: 'Surgical extraction of impacted wisdom tooth',
        findings: 'Impacted wisdom tooth causing crowding',
        treatment: 'Surgical extraction under local anesthesia',
        nextVisit: '2023-12-12',
        status: 'completed',
        cost: '$450.00',
        attachments: ['surgical_notes.pdf', 'post_op_instructions.pdf']
      }
    ],
    prescriptions: [
      {
        id: 1,
        date: '2023-12-05',
        doctor: 'Dr. Robert Smith',
        medication: 'Amoxicillin',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '7 days',
        instructions: 'Take with food to avoid stomach upset',
        purpose: 'Post-surgical infection prevention',
        status: 'completed',
        refills: 0
      },
      {
        id: 2,
        date: '2023-12-05',
        doctor: 'Dr. Robert Smith',
        medication: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Every 6 hours as needed',
        duration: '5 days',
        instructions: 'Take with food. Do not exceed 6 tablets per day',
        purpose: 'Pain management',
        status: 'completed',
        refills: 1
      },
      {
        id: 3,
        date: '2024-01-08',
        doctor: 'Dr. Sarah Johnson',
        medication: 'Fluoride Gel',
        dosage: '0.4%',
        frequency: 'Daily before bedtime',
        duration: '30 days',
        instructions: 'Apply after brushing. Do not eat or drink for 30 minutes',
        purpose: 'Cavity prevention',
        status: 'active',
        refills: 2
      }
    ],
    labResults: [
      {
        id: 1,
        date: '2023-11-15',
        type: 'Bacterial Culture',
        orderedBy: 'Dr. Sarah Johnson',
        results: 'No pathogenic bacteria detected',
        status: 'normal',
        notes: 'Sample taken from periodontal pocket'
      },
      {
        id: 2,
        date: '2023-10-20',
        type: 'Oral Cancer Screening',
        orderedBy: 'Dr. Sarah Johnson',
        results: 'No abnormal cells detected',
        status: 'normal',
        notes: 'Annual screening completed'
      }
    ],
    images: [
      {
        id: 1,
        date: '2024-01-08',
        type: 'Bitewing X-rays',
        doctor: 'Dr. Sarah Johnson',
        description: 'Routine bitewing radiographs for cavity detection',
        findings: 'No cavities detected. Good bone levels.',
        image: '/api/placeholder/300/200'
      },
      {
        id: 2,
        date: '2023-12-20',
        type: 'Panoramic X-ray',
        doctor: 'Dr. Michael Chen',
        description: 'Full mouth panoramic radiograph for orthodontic assessment',
        findings: 'All permanent teeth present. Mild crowding noted.',
        image: '/api/placeholder/300/200'
      },
      {
        id: 3,
        date: '2023-12-05',
        type: 'Pre-surgical X-ray',
        doctor: 'Dr. Robert Smith',
        description: 'Periapical radiograph of wisdom tooth',
        findings: 'Impacted third molar with adequate bone for extraction.',
        image: '/api/placeholder/300/200'
      }
    ]
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      active: { color: 'bg-blue-100 text-blue-800', text: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      normal: { color: 'bg-green-100 text-green-800', text: 'Normal' },
      abnormal: { color: 'bg-red-100 text-red-800', text: 'Abnormal' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const downloadFile = (filename) => {
    // Mock download functionality
    console.log('Downloading file:', filename)
    alert(`Downloading ${filename}...`)
  }

  const tabs = [
    { id: 'treatments', name: 'Treatment History', icon: '🦷', count: medicalData.treatments.length },
    { id: 'prescriptions', name: 'Prescriptions', icon: '💊', count: medicalData.prescriptions.length },
    { id: 'lab', name: 'Lab Results', icon: '🔬', count: medicalData.labResults.length },
    { id: 'images', name: 'X-rays & Images', icon: '📷', count: medicalData.images.length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-600 mt-1">Access your complete dental health history</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-dental-primary text-dental-primary rounded-md text-sm font-medium hover:bg-dental-primary hover:text-white transition-colors duration-200">
              Export Records
            </button>
            <button className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200">
              Request Records
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-dental-primary text-dental-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Treatment History Tab */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              {medicalData.treatments.map((treatment) => (
                <div key={treatment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{treatment.type}</h3>
                      <p className="text-dental-primary font-medium">{treatment.doctor}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(treatment.status)}
                      <p className="text-sm text-gray-600 mt-1">{formatDate(treatment.date)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{treatment.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Findings</h4>
                      <p className="text-sm text-gray-600">{treatment.findings}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                      <p className="text-sm text-gray-600">{treatment.treatment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cost</h4>
                      <p className="text-sm text-gray-600 font-semibold">{treatment.cost}</p>
                      {treatment.nextVisit && (
                        <p className="text-sm text-gray-500 mt-1">Next visit: {formatDate(treatment.nextVisit)}</p>
                      )}
                    </div>
                  </div>
                  
                  {treatment.attachments && treatment.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                      <div className="flex flex-wrap gap-2">
                        {treatment.attachments.map((file, index) => (
                          <button
                            key={index}
                            onClick={() => downloadFile(file)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {file}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {medicalData.prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
                      <p className="text-dental-primary font-medium">{prescription.doctor}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(prescription.status)}
                      <p className="text-sm text-gray-600 mt-1">{formatDate(prescription.date)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Dosage & Frequency</h4>
                      <p className="text-sm text-gray-600">{prescription.dosage}</p>
                      <p className="text-sm text-gray-600">{prescription.frequency}</p>
                      <p className="text-sm text-gray-600">Duration: {prescription.duration}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Purpose</h4>
                      <p className="text-sm text-gray-600">{prescription.purpose}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Refills</h4>
                      <p className="text-sm text-gray-600">{prescription.refills} remaining</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Instructions</h4>
                    <p className="text-sm text-gray-700">{prescription.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lab Results Tab */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              {medicalData.labResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{result.type}</h3>
                      <p className="text-dental-primary font-medium">{result.orderedBy}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(result.status)}
                      <p className="text-sm text-gray-600 mt-1">{formatDate(result.date)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                      <p className="text-sm text-gray-600">{result.results}</p>
                    </div>
                    {result.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{result.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* X-rays & Images Tab */}
          {activeTab === 'images' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicalData.images.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{image.type}</h3>
                    <p className="text-sm text-dental-primary font-medium mb-2">{image.doctor}</p>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(image.date)}</p>
                    <p className="text-sm text-gray-600 mb-3">{image.description}</p>
                    
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">Findings</h4>
                      <p className="text-sm text-gray-600">{image.findings}</p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedRecord(image)}
                      className="w-full px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
                    >
                      View Full Size
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedRecord(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedRecord.type}</h3>
                    <p className="text-sm text-gray-600">{formatDate(selectedRecord.date)} - {selectedRecord.doctor}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedRecord.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Findings</h4>
                    <p className="text-sm text-gray-600">{selectedRecord.findings}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => downloadFile(`${selectedRecord.type}_${selectedRecord.date}.pdf`)}
                    className="px-4 py-2 bg-dental-primary text-white rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
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

export default MedicalRecords