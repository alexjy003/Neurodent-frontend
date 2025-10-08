import React, { useState, useEffect } from "react"
import apiService from "../services/api"

const MedicalRecords = ({ user }) => {
  const [activeTab, setActiveTab] = useState("treatments")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [medicalData, setMedicalData] = useState({
    treatments: [],
    prescriptions: [],
    images: []
  })

  useEffect(() => {
    if (user) {
      loadMedicalRecords()
    }
  }, [user])

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      console.log("Loading medical records for patient:", user?._id)

      const appointmentsResponse = await apiService.get("/appointments/my-appointments?limit=50")
      console.log("Appointments response:", appointmentsResponse)
      
      let treatments = []
      if (appointmentsResponse && appointmentsResponse.success && appointmentsResponse.appointments) {
        treatments = appointmentsResponse.appointments
          .filter(apt => apt.status === "completed")
          .map(apt => ({
            id: apt.id || apt._id,
            date: apt.appointmentDate || apt.date,
            doctor: apt.doctorName || "Doctor",
            type: apt.slotType || "General Appointment",
            description: apt.symptoms || "Routine dental appointment",
            findings: "Treatment completed successfully",
            treatment: apt.slotType || "General treatment",
            status: "completed",
            cost: "N/A",
            attachments: []
          }))
        console.log("Processed treatments:", treatments.length)
      }

      const prescriptions = []
      const images = []

      setMedicalData({
        treatments,
        prescriptions,
        images
      })

    } catch (error) {
      console.error("Error loading medical records:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case "completed":
        return React.createElement("span", {className: `${baseClasses} bg-green-100 text-green-800`}, "Completed")
      case "active":
        return React.createElement("span", {className: `${baseClasses} bg-blue-100 text-blue-800`}, "Active")
      case "pending":
        return React.createElement("span", {className: `${baseClasses} bg-yellow-100 text-yellow-800`}, "Pending")
      default:
        return React.createElement("span", {className: `${baseClasses} bg-gray-100 text-gray-800`}, status)
    }
  }

  const downloadFile = (filename) => {
    console.log("Downloading file:", filename)
  }

  const tabs = [
    { id: "treatments", name: "Treatment History", icon: "", count: medicalData.treatments.length },
    { id: "prescriptions", name: "Prescriptions", icon: "", count: medicalData.prescriptions.length },
    { id: "images", name: "X-rays & Images", icon: "", count: medicalData.images.length }
  ]

  return React.createElement("div", {className: "space-y-6"}, [
    React.createElement("div", {key: "header", className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6"}, 
      React.createElement("div", {className: "flex items-center justify-between"}, 
        React.createElement("div", {}, [
          React.createElement("h2", {key: "title", className: "text-2xl font-bold text-gray-900"}, "Medical Records"),
          React.createElement("p", {key: "subtitle", className: "text-gray-600 mt-1"}, "Access your complete dental health history")
        ])
      )
    ),
    React.createElement("div", {key: "content", className: "bg-white rounded-lg shadow-sm border border-gray-200"}, [
      React.createElement("div", {key: "tabs-nav", className: "border-b border-gray-200"}, 
        React.createElement("nav", {className: "-mb-px flex space-x-8 px-6 overflow-x-auto"}, 
          tabs.map((tab) => 
            React.createElement("button", {
              key: tab.id,
              onClick: () => setActiveTab(tab.id),
              className: `py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-dental-primary text-dental-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }, [
              React.createElement("span", {key: "icon", className: "mr-2"}, tab.icon),
              `${tab.name} (${tab.count})`
            ])
          )
        )
      ),
      React.createElement("div", {key: "tabs-content", className: "p-6"}, 
        loading ? 
          React.createElement("div", {className: "flex items-center justify-center py-12"}, 
            React.createElement("div", {className: "text-center"}, [
              React.createElement("div", {key: "spinner", className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"}),
              React.createElement("p", {key: "loading-text", className: "text-gray-600"}, "Loading medical records...")
            ])
          ) :
          activeTab === "treatments" ?
            React.createElement("div", {className: "space-y-4"}, 
              medicalData.treatments.length === 0 ?
                React.createElement("div", {className: "text-center py-12"}, [
                  React.createElement("h3", {key: "no-data-title", className: "text-lg font-medium text-gray-900 mb-2"}, "No Treatment History"),
                  React.createElement("p", {key: "no-data-text", className: "text-gray-600"}, "Your completed appointments will appear here.")
                ]) :
                medicalData.treatments.map((treatment) => 
                  React.createElement("div", {
                    key: treatment.id,
                    className: "border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
                  }, [
                    React.createElement("div", {key: "header", className: "flex items-center justify-between mb-4"}, [
                      React.createElement("div", {key: "info"}, [
                        React.createElement("h3", {key: "type", className: "text-lg font-semibold text-gray-900"}, treatment.type),
                        React.createElement("p", {key: "doctor", className: "text-dental-primary font-medium"}, treatment.doctor)
                      ]),
                      React.createElement("div", {key: "status", className: "text-right"}, [
                        getStatusBadge(treatment.status),
                        React.createElement("p", {key: "date", className: "text-sm text-gray-600 mt-1"}, formatDate(treatment.date))
                      ])
                    ]),
                    React.createElement("div", {key: "details", className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"}, [
                      React.createElement("div", {key: "description"}, [
                        React.createElement("h4", {className: "font-medium text-gray-900 mb-2"}, "Description"),
                        React.createElement("p", {className: "text-sm text-gray-600"}, treatment.description)
                      ]),
                      React.createElement("div", {key: "findings"}, [
                        React.createElement("h4", {className: "font-medium text-gray-900 mb-2"}, "Findings"),
                        React.createElement("p", {className: "text-sm text-gray-600"}, treatment.findings)
                      ]),
                      React.createElement("div", {key: "treatment-type"}, [
                        React.createElement("h4", {className: "font-medium text-gray-900 mb-2"}, "Treatment"),
                        React.createElement("p", {className: "text-sm text-gray-600"}, treatment.treatment)
                      ]),
                      React.createElement("div", {key: "cost"}, [
                        React.createElement("h4", {className: "font-medium text-gray-900 mb-2"}, "Cost"),
                        React.createElement("p", {className: "text-sm text-gray-600 font-semibold"}, treatment.cost)
                      ])
                    ])
                  ])
                )
            ) :
            activeTab === "prescriptions" ?
              React.createElement("div", {className: "text-center py-12"}, [
                React.createElement("h3", {key: "no-prescriptions-title", className: "text-lg font-medium text-gray-900 mb-2"}, "No Prescriptions"),
                React.createElement("p", {key: "no-prescriptions-text", className: "text-gray-600"}, "Your prescription history will appear here.")
              ]) :
              React.createElement("div", {className: "text-center py-12"}, [
                React.createElement("h3", {key: "no-images-title", className: "text-lg font-medium text-gray-900 mb-2"}, "No Images Available"),
                React.createElement("p", {key: "no-images-text", className: "text-gray-600"}, "X-rays and dental images will appear here.")
              ])
      )
    ])
  ])
}

export default MedicalRecords
