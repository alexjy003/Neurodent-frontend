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
  // Initialize currentWeek to the start of this week (Monday)
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday-based week
    const weekStart = new Date(today)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  })
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingDay, setEditingDay] = useState(null)
  const [tempTimeSlots, setTempTimeSlots] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [totalHours, setTotalHours] = useState(0)
  const [error, setError] = useState('')
  const [deletingSlotId, setDeletingSlotId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Function to get available time options for a specific day
  const getAvailableTimeOptions = (dayName) => {
    const allTimes = timeUtils.getBusinessHours()
    
    // Block all scheduling on Sundays (clinic holiday)
    if (dayName === 'Sunday') {
      return []
    }
    
    // Get the date for the day being edited
    const dayIndex = daysOfWeek.findIndex(d => d === dayName)
    const dayDate = weekDates[dayIndex]
    const today = new Date()
    
    // If this is today, filter out past times
    if (dayDate.toDateString() === today.toDateString()) {
      const currentTime = new Date()
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      
      return allTimes.filter(time => {
        const time24 = timeUtils.formatTo24Hour(time)
        const [timeHour, timeMinute] = time24.split(':').map(Number)
        
        // Filter out times that are in the past (with only 5-minute buffer)
        const timeInMinutes = timeHour * 60 + timeMinute
        const currentInMinutes = currentHour * 60 + currentMinute + 5 // 5 minute buffer
        
        return timeInMinutes > currentInMinutes
      })
    }
    
    // For future dates, return all business hours
    return allTimes
  }

  // Function to check if a time option should be disabled
  const isTimeOptionDisabled = (time, dayName) => {
    // Block all scheduling on Sundays (clinic holiday)
    if (dayName === 'Sunday') {
      return true
    }
    
    const dayIndex = daysOfWeek.findIndex(d => d === dayName)
    const dayDate = weekDates[dayIndex]
    const today = new Date()
    
    // If this is today, disable past times
    if (dayDate.toDateString() === today.toDateString()) {
      const currentTime = new Date()
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      
      const time24 = timeUtils.formatTo24Hour(time)
      const [timeHour, timeMinute] = time24.split(':').map(Number)
      
      // Disable times that are in the past (with only 5-minute buffer)
      const timeInMinutes = timeHour * 60 + timeMinute
      const currentInMinutes = currentHour * 60 + currentMinute + 5 // 5 minute buffer
      
      return timeInMinutes <= currentInMinutes
    }
    
    // For future dates, don't disable any times
    return false
  }

  // Function to determine slot type based on time
  const getSlotTypeByTime = (startTime, endTime) => {
    const startTime24 = timeUtils.formatTo24Hour(startTime)
    const endTime24 = timeUtils.formatTo24Hour(endTime)
    const [startHour, startMinute] = startTime24.split(':').map(Number)
    const [endHour, endMinute] = endTime24.split(':').map(Number)
    
    // Convert to minutes for more precise calculations
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const duration = endMinutes - startMinutes
    
    // Define time boundaries in minutes
    const morningStart = 9 * 60    // 9:00 AM
    const noonTime = 12 * 60       // 12:00 PM
    const afternoonEnd = 17 * 60   // 5:00 PM
    const eveningEnd = 20 * 60     // 8:00 PM
    
    // Pure Morning (9 AM - 12 PM)
    if (startMinutes >= morningStart && endMinutes <= noonTime) {
      return 'Morning Consultations'
    }
    
    // Pure Afternoon (12 PM - 5 PM)
    if (startMinutes >= noonTime && endMinutes <= afternoonEnd) {
      if (duration >= 180) { // 3+ hours
        return 'Extended Afternoon'
      } else {
        return 'Afternoon Procedures'
      }
    }
    
    // Pure Evening (5 PM - 8 PM)
    if (startMinutes >= afternoonEnd && endMinutes <= eveningEnd) {
      return 'Evening Consultations'
    }
    
    // Morning extending into Afternoon (9 AM - after 12 PM but before 5 PM)
    if (startMinutes >= morningStart && startMinutes < noonTime && endMinutes > noonTime && endMinutes <= afternoonEnd) {
      if (duration >= 300) { // 5+ hours
        return 'Extended Morning Session'
      } else {
        return 'Morning to Afternoon'
      }
    }
    
    // Afternoon extending into Evening (12 PM - after 5 PM)
    if (startMinutes >= noonTime && startMinutes < afternoonEnd && endMinutes > afternoonEnd && endMinutes <= eveningEnd) {
      return 'Afternoon to Evening'
    }
    
    // Full Day Sessions (6+ hours covering multiple periods)
    if (duration >= 360) { // 6+ hours
      if (startMinutes <= morningStart + 30 && endMinutes >= afternoonEnd - 30) { // Allow 30min buffer
        return 'Full Day Clinic'
      }
    }
    
    // Very long sessions spanning morning to evening
    if (startMinutes >= morningStart && startMinutes < noonTime && endMinutes > afternoonEnd) {
      return 'Extended Day Session'
    }
    
    // Default fallback for unusual combinations
    return 'Custom Session'
  }

  // Load schedule data from backend
  useEffect(() => {
    loadCurrentWeekSchedule()
  }, [currentWeek])

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadCurrentWeekSchedule = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Use the currentWeek state directly as it's already the week start
      const weekStart = new Date(currentWeek)
      weekStart.setHours(0, 0, 0, 0)

      console.log('Loading schedule for week starting:', weekStart.toISOString());
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
    const dateToCheck = new Date(date)
    
    // If it's a past date, always return true
    if (dateToCheck < today.setHours(0, 0, 0, 0)) {
      return true
    }
    
    // If it's today, check if it's after 5 PM
    if (dateToCheck.toDateString() === today.toDateString()) {
      const currentHour = new Date().getHours()
      return currentHour >= 17 // 5 PM or later
    }
    
    return false
  }

  const canEditDate = (date) => {
    const today = new Date()
    const dateToCheck = new Date(date)
    
    // Can't edit past dates
    if (dateToCheck < today.setHours(0, 0, 0, 0)) {
      return false
    }
    
    // For today, can only edit if it's before 5 PM
    if (dateToCheck.toDateString() === today.toDateString()) {
      const currentHour = new Date().getHours()
      return currentHour < 17 // Before 5 PM
    }
    
    // Can edit future dates
    return true
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
    const newWeekStart = new Date(currentWeek)
    newWeekStart.setDate(currentWeek.getDate() + (direction * 7))
    newWeekStart.setHours(0, 0, 0, 0)
    setCurrentWeek(newWeekStart)
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
    // Block editing on Sundays (clinic holiday)
    if (dayName === 'Sunday') {
      alert('Clinic is closed on Sundays. No scheduling is allowed on Sundays.')
      return
    }
    
    // Get the date for the day being edited
    const dayIndex = daysOfWeek.findIndex(d => d === dayName)
    const dayDate = weekDates[dayIndex]
    
    // Check if the date can be edited
    if (!canEditDate(dayDate)) {
      const today = new Date()
      const isToday = dayDate.toDateString() === today.toDateString()
      const currentHour = new Date().getHours()
      
      if (isToday && currentHour >= 17) {
        alert('Cannot edit today\'s schedule after 5 PM. Please schedule for tomorrow or later.')
      } else {
        alert('Cannot edit past schedules. Please select a future date.')
      }
      return
    }
    
    const daySchedule = schedule[dayName.toLowerCase()] || []
    
    // Convert to editable format with 12-hour times (no auto slot types)
    const editableSlots = daySchedule.map((slot, index) => {
      const startTime = timeUtils.formatTo12Hour(slot.startTime)
      const endTime = timeUtils.formatTo12Hour(slot.endTime)
      
      return {
        id: Date.now() + index, // For React keys and local operations
        _id: slot._id, // Preserve MongoDB _id for backend operations
        startTime,
        endTime,
        type: slot.type || 'Available', // Use stored type or default
        label: slot.label || 'Available'
      }
    })
    
    setEditingDay(dayName)
    setTempTimeSlots(editableSlots.length > 0 ? editableSlots : [{
      id: Date.now(),
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      type: 'Available',
      label: 'Available'
    }])
  }

  const cancelEdit = () => {
    setEditingDay(null)
    setTempTimeSlots([])
  }

  const isValidTimeSlot = (slot) => {
    if (!slot.startTime || !slot.endTime) {
      return { valid: false, message: 'Start time and end time are required' }
    }

    if (slot.type !== 'Day Off') {
      // Block scheduling on Sundays
      if (editingDay === 'Sunday') {
        return { valid: false, message: 'Clinic is closed on Sundays - no scheduling allowed' }
      }
      
      // Convert to 24-hour format for validation
      const startTime24 = timeUtils.formatTo24Hour(slot.startTime)
      const endTime24 = timeUtils.formatTo24Hour(slot.endTime)
      
      // Check business hours (9 AM to 8 PM)
      if (startTime24 < '09:00' || endTime24 > '20:00') {
        return { valid: false, message: 'Schedule must be within business hours (9 AM - 8 PM)' }
      }
      
      if (startTime24 >= endTime24) {
        return { valid: false, message: 'End time must be after start time' }
      }
      
      // Check if times are in the past for today only with minimal buffer
      if (editingDay) {
        const dayIndex = daysOfWeek.findIndex(d => d === editingDay)
        if (dayIndex !== -1) {
          const dayDate = weekDates[dayIndex]
          const today = new Date()
          
          // Only apply past time check if this is today
          if (dayDate.toDateString() === today.toDateString()) {
            const currentTime = new Date()
            const currentHour = currentTime.getHours()
            const currentMinute = currentTime.getMinutes()
            
            const [startHour, startMinute] = startTime24.split(':').map(Number)
            
            const startInMinutes = startHour * 60 + startMinute
            const currentInMinutes = currentHour * 60 + currentMinute + 5 // Only 5 minute buffer
            
            // Only check start time - if start time is okay, allow the scheduling
            if (startInMinutes <= currentInMinutes) {
              return { valid: false, message: `Start time cannot be in the past (current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')})` }
            }
          }
        }
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
        type: 'Available', // Simple type for all slots
        label: 'Available'
      }))

      const scheduleData = {
        weekStartDate: scheduleUtils.formatDateForAPI(weekStart),
        slots: formattedSlots
      }

      console.log('Updating local schedule data for', editingDay, ':', scheduleData);
      
      // Only update local state - don't save to database until "Save Schedule" is clicked
      setSchedule(prev => ({
        ...prev,
        [editingDay.toLowerCase()]: formattedSlots
      }))
      
      setEditingDay(null)
      setTempTimeSlots([])
      setHasUnsavedChanges(true)  // Mark as having unsaved changes for overall save
      
      // Calculate new total hours locally
      const newSchedule = {
        ...schedule,
        [editingDay.toLowerCase()]: formattedSlots
      }
      
      // Calculate total hours from all days using proper 24-hour format
      let totalMinutes = 0
      Object.values(newSchedule).forEach(daySlots => {
        if (Array.isArray(daySlots)) {
          daySlots.forEach(slot => {
            if (slot.type !== 'Day Off' && slot.startTime && slot.endTime) {
              // Ensure we're working with 24-hour format
              const start24 = slot.startTime.includes('M') ? timeUtils.formatTo24Hour(slot.startTime) : slot.startTime
              const end24 = slot.endTime.includes('M') ? timeUtils.formatTo24Hour(slot.endTime) : slot.endTime
              
              const [startHour, startMinute] = start24.split(':').map(Number)
              const [endHour, endMinute] = end24.split(':').map(Number)
              
              const startMinutes = startHour * 60 + startMinute
              const endMinutes = endHour * 60 + endMinute
              
              if (endMinutes > startMinutes) {
                totalMinutes += (endMinutes - startMinutes)
              }
            }
          })
        }
      })
      
      setTotalHours(Math.round(totalMinutes / 60 * 100) / 100)
      
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
    // Get available times for the current day being edited
    const availableTimes = getAvailableTimeOptions(editingDay)
    
    // Use the first available time, or default if no restrictions
    const startTime = availableTimes.length > 0 ? availableTimes[0] : '9:00 AM'
    
    // Default end time 1 hour later
    const startTime24 = timeUtils.formatTo24Hour(startTime)
    const [startHour, startMinute] = startTime24.split(':').map(Number)
    const endHour = Math.min(startHour + 1, 20) // 1 hour later or 8 PM max
    const endTime24 = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
    const endTime = timeUtils.formatTo12Hour(endTime24)
    
    const newSlot = {
      id: Date.now() + Math.random(),
      startTime,
      endTime,
      type: 'Available',
      label: 'Available'
    }
    setTempTimeSlots([...tempTimeSlots, newSlot])
    setHasUnsavedChanges(true)
  }

  const updateTimeSlot = (id, field, value) => {
    setTempTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === id) {
          const updatedSlot = { ...slot, [field]: value }
          // No auto-update of slot type - keep it simple
          return updatedSlot
        }
        return slot
      })
    )
    setHasUnsavedChanges(true)
  }

  const removeTimeSlot = async (id) => {
    try {
      const slotToRemove = tempTimeSlots.find(slot => slot.id === id);
      
      if (!slotToRemove) {
        setError('Time slot not found');
        return;
      }

      // Check if this is an existing slot (has a real MongoDB _id) or a new local slot
      const isExistingSlot = slotToRemove._id && slotToRemove._id !== slotToRemove.id;
      
      if (isExistingSlot) {
        // This is an existing slot in the database - delete from backend
        console.log('Deleting existing slot from backend:', slotToRemove._id, 'from day:', editingDay);
        
        setError(''); // Clear any previous errors
        
        // Pass the current week being viewed to the API
        const weekStart = new Date(currentWeek)
        weekStart.setHours(0, 0, 0, 0)
        const weekStartFormatted = scheduleUtils.formatDateForAPI(weekStart)
        
        const response = await apiService.deleteTimeSlot(editingDay.toLowerCase(), slotToRemove._id, weekStartFormatted);
        
        if (response.success) {
          // Remove from local state
          setTempTimeSlots(prev => prev.filter(slot => slot.id !== id));
          
          // Update the main schedule state with the updated data from backend
          if (response.data?.schedule?.weeklySchedule) {
            setSchedule(response.data.schedule.weeklySchedule);
            setTotalHours(response.data.schedule.totalHours || 0);
          }
          
          setHasUnsavedChanges(false); // Data is now saved
          
          console.log('Time slot deleted successfully from backend');
        }
      } else {
        // This is a new local slot - just remove from tempTimeSlots
        console.log('Removing new local slot:', id);
        setTempTimeSlots(prev => prev.filter(slot => slot.id !== id));
        setHasUnsavedChanges(true);
      }
      
    } catch (error) {
      console.error('Error deleting time slot:', error);
      if (error.response?.data?.message) {
        setError(`Error: ${error.response.data.message}`);
      } else {
        setError('Failed to delete time slot. Please try again.');
      }
    }
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
      
      // Use the currentWeek state directly as it's already the week start
      const weekStart = new Date(currentWeek)
      weekStart.setHours(0, 0, 0, 0)

      console.log('Debug date calculations:');
      console.log('Current week state:', currentWeek.toISOString());
      console.log('Week start for save:', weekStart.toISOString());
      console.log('Formatted for API:', scheduleUtils.formatDateForAPI(weekStart));

      const scheduleData = {
        weekStartDate: scheduleUtils.formatDateForAPI(weekStart),
        weeklySchedule: schedule
      }

      console.log('Sending schedule data:', scheduleData);
      const response = await apiService.updateWeekSchedule(scheduleData);
      
      setHasUnsavedChanges(false);
      alert('Schedule saved successfully!');
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      console.error('Error details:', error.response);
      if (error.response?.data?.message) {
        setError(`Server Error: ${error.response.data.message}`);
      } else if (error.message) {
        setError(`Network Error: ${error.message}`);
      } else {
        setError('Failed to save schedule. Please try again.');
      }
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
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Today's schedule can only be edited before 5:00 PM. Past schedules cannot be modified.
                </p>
              </div>
            </div>
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

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{successMessage}</p>
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
              const canEdit = canEditDate(dayDate)

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
                      {!canEdit && (
                        <p className="text-xs text-red-500 mt-1">
                          {isPast ? 'Past date' : 'Schedule locked after 5 PM'}
                        </p>
                      )}
                      {dayName === 'Sunday' && (
                        <p className="text-xs text-red-500 mt-1">
                          Clinic Holiday
                        </p>
                      )}
                    </div>
                    {canEdit && !isEditing && dayName !== 'Sunday' && (
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
                            <span className="text-sm font-medium text-gray-700">
                              Time Slot
                            </span>
                            <button
                              onClick={() => removeTimeSlot(slot.id)}
                              disabled={deletingSlotId === slot.id}
                              className={`${
                                deletingSlotId === slot.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-800'
                              }`}
                            >
                              {deletingSlotId === slot.id ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {slot.type !== 'Day Off' && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-gray-600">Start Time</label>
                                  <select
                                    value={slot.startTime}
                                    onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    {getAvailableTimeOptions(editingDay).map(time => (
                                      <option 
                                        key={time} 
                                        value={time}
                                        disabled={isTimeOptionDisabled(time, editingDay)}
                                        style={{
                                          color: isTimeOptionDisabled(time, editingDay) ? '#9CA3AF' : 'inherit',
                                          backgroundColor: isTimeOptionDisabled(time, editingDay) ? '#F3F4F6' : 'inherit'
                                        }}
                                      >
                                        {time} {isTimeOptionDisabled(time, editingDay) ? '(Past)' : ''}
                                      </option>
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
                                    {getAvailableTimeOptions(editingDay).map(time => (
                                      <option 
                                        key={time} 
                                        value={time}
                                        disabled={isTimeOptionDisabled(time, editingDay)}
                                        style={{
                                          color: isTimeOptionDisabled(time, editingDay) ? '#9CA3AF' : 'inherit',
                                          backgroundColor: isTimeOptionDisabled(time, editingDay) ? '#F3F4F6' : 'inherit'
                                        }}
                                      >
                                        {time} {isTimeOptionDisabled(time, editingDay) ? '(Past)' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </>
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
                      {dayName === 'Sunday' ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-red-600 font-medium">🏥 Clinic Holiday</p>
                          <p className="text-xs text-gray-500 mt-1">Closed on Sundays</p>
                        </div>
                      ) : daySchedule.length === 0 ? (
                        <p className={`text-sm text-center py-4 ${
                          isPast ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No schedule
                        </p>
                      ) : (
                        daySchedule.map((slot, index) => (
                          <div
                            key={index}
                            className="p-2 rounded text-sm bg-blue-50 border-blue-200 text-blue-800"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="ml-2 font-medium">Available</span>
                              </div>
                            </div>
                            {slot.type !== 'Day Off' && (
                              <div className="text-xs mt-1 opacity-75 font-medium">
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
