import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import pdIcon from '../assets/images/pd.png'
import dentistImage from '../assets/images/dentist.jpg'
import doctorAPIService from '../services/doctorAPI'

const Home = () => {
  const [topDentists, setTopDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDoctors, setTotalDoctors] = useState(50); // Default fallback

  // Fetch doctors on component mount
  useEffect(() => {
    fetchTopDoctors();
  }, []);

  const fetchTopDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await doctorAPIService.getAllDoctors();
      
      if (result.success && result.doctors) {
        // Set total doctors count
        setTotalDoctors(result.doctors.filter(doctor => doctor.availability === 'active').length);
        
        // Format doctors for display and limit to top 4
        const formattedDoctors = result.doctors
          .filter(doctor => doctor.availability === 'active') // Only show active doctors
          .slice(0, 4) // Limit to 4 doctors
          .map(doctor => doctorAPIService.formatDoctorForDisplay(doctor));
        
        setTopDentists(formattedDoctors);
      } else {
        setError('Failed to load doctors');
        console.error('Failed to fetch doctors:', result.error);
      }
    } catch (error) {
      setError('Failed to load doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    {
      name: "General Dentistry",
      description: "Comprehensive oral health care for all ages",
      icon: "🦷"
    },
    {
      name: "Orthodontics",
      description: "Teeth alignment and bite correction",
      icon: "🔧"
    },
    {
      name: "Cosmetic Dentistry",
      description: "Enhancing your smile's appearance",
      icon: "✨"
    },
    {
      name: "Pediatric Dentistry",
      description: "Specialized care for children's dental needs",
      icon: <img src={pdIcon} alt="Pediatric Dentistry" className="w-16 h-16 mx-auto" />
    },
    {
      name: "Periodontics",
      description: "Gum disease treatment and prevention",
      icon: "🌱"
    },
    {
      name: "Prosthodontics",
      description: "Dental prosthetics and restoration",
      icon: "🔄"
    },
    {
      name: "Endodontics",
      description: "Root canal treatment and therapy",
      icon: "🎯"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Book Appointment With <span className="text-dental-primary">Trusted Dental Experts</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with experienced dental professionals and get the quality care you deserve. 
                Easy booking, trusted specialists, exceptional results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-lg animate-bounce-gentle inline-block text-center">
                  Sign Up
                </Link>
                <Link to="/login" className="btn-primary text-lg inline-block text-center">
                  Login
                </Link>
              </div>
            </div>
            <div className="animate-slide-up">
              <div className="relative">
                <img
                  src={dentistImage}
                  alt="Professional Dentist"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover dental-shadow"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl dental-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">1000+ Happy Patients</p>
                      <p className="text-sm text-gray-600">Trusted by families</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find by Specialization */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find by Specialization
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of dental specialties and connect with the right expert for your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 card-hover dental-shadow cursor-pointer group">
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {spec.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-dental-primary transition-colors duration-300">
                    {spec.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {spec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Dentists */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dental-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top Dentists to Book
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our highly qualified dental professionals with years of experience and exceptional patient care.
            </p>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dental-primary"></div>
              <p className="mt-4 text-gray-600">Loading our top dentists...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchTopDoctors}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Doctors Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {topDentists.length > 0 ? (
                topDentists.map((dentist) => (
                  <div key={dentist.id} className="bg-white rounded-xl p-6 card-hover dental-shadow">
                    <div className="text-center">
                      <img
                        src={dentist.image}
                        alt={dentist.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-dental-light"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face&auto=format&q=80';
                        }}
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">{dentist.name}</h3>
                      <p className="text-dental-primary font-medium mb-2">{dentist.specialization}</p>
                      <p className="text-sm text-gray-600 mb-2">{dentist.experience} Experience</p>
                      
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{dentist.rating}</span>
                      </div>
                      
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          dentist.availability === 'Available Today' 
                            ? 'bg-green-100 text-green-800' 
                            : dentist.availability === 'Available Tomorrow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {dentist.availability}
                        </span>
                      </div>
                      
                      <Link to="/register" className="w-full btn-secondary text-sm inline-block text-center">
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center">
                  <p className="text-gray-600">No doctors available at the moment. Please check back later.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dental-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Book Appointment With {totalDoctors}+ Trusted Dental Specialists
          </h2>
          <p className="text-xl text-black mb-8 leading-relaxed">
            Join thousands of satisfied patients who trust Neurodent for their dental care. 
            Easy scheduling, verified specialists, and exceptional results guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-dental-primary font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-lg inline-block text-center">
              Sign Up
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-dental-primary font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-lg inline-block text-center">
              Login
            </Link>
            <Link to="/about" className="border-2 border-white text-white hover:bg-white hover:text-dental-primary font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-lg inline-block text-center">
              Learn More
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black mb-2">{totalDoctors}+</div>
              <div className="text-black">Dental Specialists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">1000+</div>
              <div className="text-black">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">98%</div>
              <div className="text-black">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home