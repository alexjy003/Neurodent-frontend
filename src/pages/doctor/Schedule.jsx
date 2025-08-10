import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Save,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Coffee,
  AlertCircle
} from 'lucide-react'

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingDay, setEditingDay] = useState(null)
  const [tempTimeSlots, setTempTimeSlots] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const sampleSchedule = {
    'Monday': [
      { id: 1, startTime: '09:00', endTime: '12:00', type: 'available', label: 'Morning Consultations' },
      { id: 2, startTime: '13:00', endTime: '17:00', type: 'available', label: 'Afternoon Procedures' }
    ],
    'Tuesday': [
      { id: 1, startTime: '09:00', endTime: '12:00', type: 'available', label: 'Morning Session' },
      { id: 2, startTime: '14:00', endTime: '18:00', type: 'available', label: 'Extended Afternoon' }
    ],
    'Wednesday': [
      { id: 1, startTime: '10:00', endTime: '16:00', type: 'available', label: 'Full Day Clinic' }
    ],
    'Thursday': [
      { id: 1, startTime: '09:00', endTime: '12:00', type: 'available', label: 'Morning Session' },
      { id: 2, startTime: '13:00', endTime: '15:00', type: 'available', label: 'Short Afternoon' }
    ],
    'Friday': [
      { id: 1, startTime: '09:00', endTime: '13:00', type: 'available', label: 'Half Day' }
    ],
    'Saturday': [
      { id: 1, startTime: '09:00', endTime: '12:00', type: 'available', label: 'Weekend Morning' }
    ],
    'Sunday': [
      { id: 1, startTime: '00:00', endTime: '00:00', type: 'off', label: 'Day Off' }
    ]
  }

  useEffect(() => {
    setTimeout(() => {
      setSchedule(sampleSchedule)
      setLoading(false)
    }, 1000)
  }, [])

  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatWeekRange = (dates) => {
    const start = dates[0]
    const end = dates[6]
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const startEditingDay = (dayName) => {
    setEditingDay(dayName)
    setTempTimeSlots([...(schedule[dayName] || [])])
  }

  const cancelEditing = () => {
    setEditingDay(null)
    setTempTimeSlots([])
  }

  const saveDay = () => {
    setSchedule(prev => ({
      ...prev,
      [editingDay]: [...tempTimeSlots]
    }))
    setEditingDay(null)
    setTempTimeSlots([])
    setHasUnsavedChanges(true)
  }

  const addTimeSlot = () => {
    const newSlot = {
      id: Date.now(),
      startTime: '09:00',
      endTime: '17:00',
      type: 'available',
      label: 'New Time Slot'
    }
    setTempTimeSlots([...tempTimeSlots, newSlot])
  }

  const updateTimeSlot = (id, field, value) => {
    setTempTimeSlots(prev =>
      prev.map(slot =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    )
  }

  const removeTimeSlot = (id) => {
    setTempTimeSlots(prev => prev.filter(slot => slot.id !== id))
  }

  const markDayOff = () => {
    setTempTimeSlots([{
      id: Date.now(),
      startTime: '00:00',
      endTime: '00:00',
      type: 'off',
      label: 'Day Off'
    }])
  }

  const saveSchedule = () => {
    console.log('Saving schedule:', schedule)
    setHasUnsavedChanges(false)
    alert('Schedule saved successfully!')
  }

  const getSlotTypeIcon = (type) => {
    switch (type) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'off':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'break':
        return <Coffee className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getSlotTypeColor = (type) => {
    switch (type) {
      case 'available':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'off':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'break':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const weekDates = getWeekDates(currentWeek)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Set your available time slots and manage your weekly schedule</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {hasUnsavedChanges && (
            <div className="flex items-center text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={saveSchedule}
            disabled={!hasUnsavedChanges}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Schedule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{formatWeekRange(weekDates)}</h2>
            <p className="text-sm text-gray-600">Weekly Schedule</p>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((dayName, index) => {
              const dayDate = weekDates[index]
              const daySchedule = schedule[dayName] || []
              const isEditing = editingDay === dayName
              const isToday = dayDate.toDateString() === new Date().toDateString()

              return (
                <div key={dayName} className={`border rounded-lg p-4 ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {dayName}
                      </h3>
                      <p className={`text-sm ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                        {formatDate(dayDate)}
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEditingDay(dayName)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      {tempTimeSlots.map((slot) => (
                        <div key={slot.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={slot.label}
                              onChange={(e) => updateTimeSlot(slot.id, 'label', e.target.value)}
                              className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0 flex-1"
                              placeholder="Slot label"
                            />
                            <button
                              onClick={() => removeTimeSlot(slot.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            />
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          
                          <select
                            value={slot.type}
                            onChange={(e) => updateTimeSlot(slot.id, 'type', e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                          >
                            <option value="available">Available</option>
                            <option value="off">Day Off</option>
                            <option value="break">Break</option>
                          </select>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={addTimeSlot}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Slot
                        </button>
                        <button
                          onClick={markDayOff}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Day Off
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={saveDay}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySchedule.length === 0 ? (
                        <div className="text-center py-4">
                          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No schedule set</p>
                        </div>
                      ) : (
                        daySchedule.map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg border ${getSlotTypeColor(slot.type)}`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {getSlotTypeIcon(slot.type)}
                              <span className="text-sm font-medium">{slot.label}</span>
                            </div>
                            {slot.type !== 'off' && (
                              <p className="text-xs opacity-75">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schedule
