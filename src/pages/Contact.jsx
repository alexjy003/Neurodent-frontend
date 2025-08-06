import React from 'react'
import { Link } from 'react-router-dom'
import contactImage from '../assets/images/dentist-cleaning-child-teeth.jpg'

const Contact = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact <span className="text-dental-primary">Neurodent</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with us for appointments, questions, or support. We're here to help you achieve optimal dental health.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Details */}
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-8 dental-shadow border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-dental-light rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-dental-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Clinic Address</h3>
                      <p className="text-gray-600">
                        123 Dental Street<br />
                        Medical Plaza, Suite 200<br />
                        City, State 12345
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-dental-light rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-dental-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-dental-light rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-dental-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
                      <p className="text-gray-600">info@neurodent.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-dental-light rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-dental-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/register" className="w-full btn-primary inline-block text-center">
                    Book Appointment Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Image */}
            <div className="animate-slide-up">
              <img
                src={contactImage}
                alt="Dentist cleaning child's teeth"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover dental-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dental-gray">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12 dental-shadow">
            <div className="mb-8">
              <div className="w-16 h-16 bg-dental-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Careers at <span className="text-dental-primary">Neurodent</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Join our mission to revolutionize dental healthcare. We're looking for passionate individuals 
                who want to make a difference in patients' lives through innovative technology and exceptional care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-dental-primary mb-2">50+</div>
                <div className="text-gray-600">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dental-primary mb-2">15+</div>
                <div className="text-gray-600">Open Positions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dental-primary mb-2">98%</div>
                <div className="text-gray-600">Employee Satisfaction</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Competitive salary and benefits</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Flexible working arrangements</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Professional development opportunities</span>
              </div>
            </div>

            <button className="btn-primary text-lg">
              Explore Job Openings
            </button>
          </div>
        </div>
      </section>

      {/* Quick Contact Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-gray-600">
              Have a question or need assistance? Fill out the form below and we'll get back to you shortly.
            </p>
          </div>

          <form className="bg-white rounded-2xl p-8 dental-shadow border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent">
                <option value="">Select a subject</option>
                <option value="appointment">Book Appointment</option>
                <option value="general">General Inquiry</option>
                <option value="emergency">Emergency</option>
                <option value="insurance">Insurance Questions</option>
                <option value="careers">Careers</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <button type="submit" className="w-full btn-primary">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Contact