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
import apiService from '../../services/api'
import { timeUtils, scheduleUtils } from '../../utils/scheduleUtils'

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingDay, setEditingDay] = useState(null)
  const [tempTimeSlots, setTempTimeSlots] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [totalHours, setTotalHours] = useState(0)
  const [error, setError] = useState('')

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load schedule data from backend
  useEffect(() => {
    loadCurrentWeekSchedule()
  }, [currentWeek])

  const loadCurrentWeekSchedule = async () => {
    try {
      setLoading(true)
      setError('')
      
      const weekStart = scheduleUtils.getCurrentWeekStart()
      weekStart.setDate(weekStart.getDate() + (Math.floor((currentWeek.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 7))

      const response = await apiService.getWeekSchedule(scheduleUtils.formatDateForAPI(weekStart))
      
      if (response.success && response.data.schedule) {
        const scheduleData = response.data.schedule
        setSchedule(scheduleData.weeklySchedule || {})
        setTotalHours(scheduleData.totalHours || 0)
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
      
      // Better error handling for authentication
      if (error.message.includes('401') || error.message.includes('token')) {
        setError('Please log in again to access your schedule.')
      } else {
        setError('Failed to load schedule. Please try again.')
      }
      
      // Set empty schedule as fallback
      setSchedule(scheduleUtils.createEmptyWeeklySchedule())
    } finally {
      setLoading(false)
    }
  }

  const isPastDate = (date) => {
    const today = new Date()
    return date < today.setHours(0, 0, 0, 0)
  }

  const weekDates = React.useMemo(() => {
    const startOfWeek = new Date(currentWeek)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }, [currentWeek])

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatWeekRange = (dates) => {
    const start = dates[0]
    const end = dates[6]
    return `${formatDate(start)} - ${formatDate(end)}, ${start.getFullYear()}`
  }

  const editDay = (dayName) => {
    const daySchedule = schedule[dayName.toLowerCase()] || []
    
    // Convert to editable format with 12-hour times
    const editableSlots = daySchedule.map((slot, index) => ({
      id: Date.now() + index,
      startTime: timeUtils.formatTo12Hour(slot.startTime),
      endTime: timeUtils.formatTo12Hour(slot.endTime),
      type: slot.type || slot.label || 'Consultation',
      label: slot.label || slot.type || 'Consultation'
    }))
    
    setEditingDay(dayName)
    setTempTimeSlots(editableSlots.length > 0 ? editableSlots : [{
      id: Date.now(),
      startTime: '9:00 AM',
      endTime: '12:00 PM',
      type: 'Morning Consultations',
      label: 'Morning Consultations'
    }])
  }

  const cancelEdit = () => {
    setEditingDay(null)
    setTempTimeSlots([])
  }

  const isValidTimeSlot = (slot) => {
    if (!slot.startTime || !slot.endTime || !slot.type.trim()) {
      return { valid: false, message: 'All fields are required' }
    }

    if (slot.type !== 'Day Off') {
      // Convert to 24-hour format for validation
      const startTime24 = timeUtils.formatTo24Hour(slot.startTime)
      const endTime24 = timeUtils.formatTo24Hour(slot.endTime)
      
      // Check business hours (9 AM to 5 PM)
      if (startTime24 < '09:00' || endTime24 > '17:00') {
        return { valid: false, message: 'Schedule must be within business hours (9 AM - 5 PM)' }
      }
      
      if (startTime24 >= endTime24) {
        return { valid: false, message: 'End time must be after start time' }
      }
    }

    return { valid: true }
  }

  const saveDaySchedule = async () => {
    try {
      setError('')
      
      // Validate all time slots
      for (const slot of tempTimeSlots) {
        const validation = isValidTimeSlot(slot)
        if (!validation.valid) {
          setError(validation.message)
          return
        }
      }

      const weekStart = scheduleUtils.getCurrentWeekStart()
      weekStart.setDate(weekStart.getDate() + (Math.floor((currentWeek.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 7))

      // Convert 12-hour times back to 24-hour format for API
      const formattedSlots = tempTimeSlots.map(slot => ({
        startTime: timeUtils.formatTo24Hour(slot.startTime),
        endTime: timeUtils.formatTo24Hour(slot.endTime),
        type: slot.type,
        label: slot.label
      }))

      const scheduleData = {
        weekStartDate: scheduleUtils.formatDateForAPI(weekStart),
        slots: formattedSlots
      }

      const response = await apiService.updateDaySchedule(editingDay.toLowerCase(), scheduleData)
      
      if (response.success) {
        // Update local state
        setSchedule(prev => ({
          ...prev,
          [editingDay.toLowerCase()]: formattedSlots
        }))
        
        setEditingDay(null)
        setTempTimeSlots([])
        setHasUnsavedChanges(true)  // Mark as having unsaved changes for overall save
        
        // Reload to get updated total hours
        await loadCurrentWeekSchedule()
      }
      
    } catch (error) {
      console.error('Error saving day schedule:', error)
      
      // Better error handling
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to save schedule. Please try again.')
      }
    }
  }

  const addTimeSlot = () => {
    const newSlot = {
      id: Date.now() + Math.random(),
      startTime: '9:00 AM',
      endTime: '12:00 PM',
      type: 'Morning Consultations',
      label: 'Morning Consultations'
    }
    setTempTimeSlots([...tempTimeSlots, newSlot])
    setHasUnsavedChanges(true)
  }

  const updateTimeSlot = (id, field, value) => {
    setTempTimeSlots(prev =>
      prev.map(slot =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    )
    setHasUnsavedChanges(true)
  }

  const removeTimeSlot = (id) => {
    setTempTimeSlots(prev => prev.filter(slot => slot.id !== id))
    setHasUnsavedChanges(true)
  }

  const markDayOff = () => {
    setTempTimeSlots([{
      id: Date.now(),
      startTime: '12:00 AM',
      endTime: '12:00 AM',
      type: 'Day Off',
      label: 'Day Off'
    }])
    setHasUnsavedChanges(true)
  }

  const saveSchedule = async (e) => {
    try {
      // Prevent any default behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      setError('')
      console.log('Save button clicked, starting save process...');
      
      const weekStart = scheduleUtils.getCurrentWeekStart()
      weekStart.setDate(weekStart.getDate() + (Math.floor((currentWeek.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 7))

      const scheduleData = {
        weekStartDate: scheduleUtils.formatDateForAPI(weekStart),
        weeklySchedule: schedule,
        notes: ''
      }

      console.log('Sending schedule data:', scheduleData);

      const response = await apiService.updateWeekSchedule(scheduleData);
      console.log('Schedule save response:', response);
      
      setHasUnsavedChanges(false);
      alert('Schedule saved successfully!');
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule. Please try again.');
    }
  }

  const getSlotTypeIcon = (type) => {
    if (type === 'Day Off') {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  const getSlotTypeColor = (type) => {
    if (type === 'Day Off') {
      return 'bg-red-50 border-red-200 text-red-800'
    }
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">Manage your weekly appointments</p>
            {totalHours > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Total weekly hours: {totalHours}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <button
            type="button"
            onClick={(e) => saveSchedule(e)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

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
              const daySchedule = schedule[dayName.toLowerCase()] || []
              const isEditing = editingDay === dayName
              const isPast = isPastDate(dayDate)

              return (
                <div
                  key={dayName}
                  className={`border rounded-lg p-4 ${
                    isPast ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  } ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${
                        isPast ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {dayName}
                      </h3>
                      <p className={`text-sm ${
                        isPast ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatDate(dayDate)}
                      </p>
                    </div>
                    {!isPast && !isEditing && (
                      <button
                        onClick={() => editDay(dayName)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      {tempTimeSlots.map((slot) => (
                        <div key={slot.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={slot.type}
                              onChange={(e) => {
                                updateTimeSlot(slot.id, 'type', e.target.value)
                                updateTimeSlot(slot.id, 'label', e.target.value)
                              }}
                              placeholder="e.g., Morning Consultations"
                              className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1 mr-2"
                            />
                            <button
                              onClick={() => removeTimeSlot(slot.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {slot.type !== 'Day Off' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">Start Time</label>
                                <select
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  {timeUtils.getBusinessHours().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">End Time</label>
                                <select
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  {timeUtils.getBusinessHours().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={addTimeSlot}
                          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Slot
                        </button>
                        <button
                          onClick={markDayOff}
                          className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Mark Off
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <button
                          onClick={saveDaySchedule}
                          className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySchedule.length === 0 ? (
                        <p className={`text-sm text-center py-4 ${
                          isPast ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No schedule
                        </p>
                      ) : (
                        daySchedule.map((slot, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm ${getSlotTypeColor(slot.type)}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getSlotTypeIcon(slot.type)}
                                <span className="ml-2 font-medium">{slot.type || slot.label}</span>
                              </div>
                            </div>
                            {slot.type !== 'Day Off' && (
                              <div className="text-xs mt-1 opacity-75">
                                {timeUtils.formatTo12Hour(slot.startTime)} - {timeUtils.formatTo12Hour(slot.endTime)}
                              </div>
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
