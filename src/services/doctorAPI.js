import { API_BASE_URL } from '../utils/config';

class DoctorAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get all doctors
  async getAllDoctors() {
    try {
      const response = await fetch(`${this.baseURL}/doctors`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          doctors: result.data.doctors
        };
      } else {
        throw new Error(result.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        success: false,
        error: error.message,
        doctors: []
      };
    }
  }

  // Get doctor by ID
  async getDoctorById(doctorId) {
    try {
      const response = await fetch(`${this.baseURL}/doctors/${doctorId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          doctor: result.data.doctor
        };
      } else {
        throw new Error(result.message || 'Failed to fetch doctor');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return {
        success: false,
        error: error.message,
        doctor: null
      };
    }
  }

  // Get doctors by specialization
  async getDoctorsBySpecialization(specialization) {
    try {
      const result = await this.getAllDoctors();
      
      if (result.success) {
        const filteredDoctors = result.doctors.filter(
          doctor => doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
        );
        
        return {
          success: true,
          doctors: filteredDoctors
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      return {
        success: false,
        error: error.message,
        doctors: []
      };
    }
  }

  // Helper method to format availability based on nextAvailableSlot
  formatAvailability(nextAvailableSlot) {
    if (!nextAvailableSlot || nextAvailableSlot === 'Not available') {
      return 'Not available';
    }

    // Parse the date from nextAvailableSlot (format: "MM/DD/YYYY HH:MM AM/PM")
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const tomorrowStr = tomorrow.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });

    if (nextAvailableSlot.includes(todayStr)) {
      return 'Available Today';
    } else if (nextAvailableSlot.includes(tomorrowStr)) {
      return 'Available Tomorrow';
    } else {
      // Check if within this week (next 7 days)
      try {
        const slotDate = new Date(nextAvailableSlot.split(' ')[0]);
        const daysDiff = Math.ceil((slotDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          return 'Available This Week';
        } else {
          return 'Limited Availability';
        }
      } catch (error) {
        return 'Limited Availability';
      }
    }
  }

  // Helper method to format doctor data for display
  formatDoctorForDisplay(doctor) {
    // Calculate years of experience
    let experienceYears = 'New';
    if (doctor.experience) {
      const expMatch = doctor.experience.match(/(\d+)/);
      if (expMatch) {
        experienceYears = `${expMatch[1]}+ years`;
      } else {
        experienceYears = doctor.experience;
      }
    }

    // Determine availability status using real schedule data
    const availabilityText = this.formatAvailability(doctor.nextAvailableSlot);

    // Generate a placeholder rating (in production, this would come from actual reviews)
    const rating = (4.5 + Math.random() * 0.4).toFixed(1);

    // Default professional images for different specializations
    const defaultImages = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      'https://images.unsplash.com/photo-1594824723662-1b93d3bb5ec5?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face&auto=format&q=80'
    ];

    // Select a default image based on doctor ID for consistency
    const imageIndex = parseInt(doctor._id.slice(-1), 16) % defaultImages.length;
    const defaultImage = defaultImages[imageIndex];

    return {
      id: doctor._id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      experience: experienceYears,
      rating: parseFloat(rating),
      availability: availabilityText,
      image: doctor.profileImage || defaultImage,
      position: doctor.position,
      bio: doctor.bio,
      nextAvailableSlot: doctor.nextAvailableSlot
    };
  }
}

// Create singleton instance
const doctorAPIService = new DoctorAPIService();

export default doctorAPIService;