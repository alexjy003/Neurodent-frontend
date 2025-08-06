import React from 'react'
import { Link } from 'react-router-dom'
import happyDentistsImage from '../assets/images/happy-dentists-with-patient.jpg'

const About = () => {
  const features = [
    {
      title: "EFFICIENCY",
      description: "Faster scheduling and digital patient records streamline your dental care experience",
      icon: "⚡",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "SPECIALIZED CARE",
      description: "Access to top dental specialists in various fields ensures you get the right treatment",
      icon: "🎯",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "TRUST & SAFETY",
      description: "Verified dentists and secure health data protection give you peace of mind",
      icon: "🛡️",
      color: "bg-purple-100 text-purple-600"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <img
                src={happyDentistsImage}
                alt="Happy Dentists with Patient"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover dental-shadow"
              />
            </div>
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                About <span className="text-dental-primary">Neurodent</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                We're revolutionizing dental healthcare by connecting patients with trusted dental experts 
                through our innovative digital platform.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our mission is to simplify dental healthcare access and digitize dental clinic workflows, 
                making quality dental care more accessible, efficient, and patient-centered than ever before.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Our Vision
          </h2>
          <div className="bg-dental-light rounded-2xl p-8 md:p-12">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              To build seamless dental experiences that benefit both patients and clinics, 
              creating a world where quality dental care is accessible to everyone.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We envision a future where technology bridges the gap between patients and dental professionals, 
              enabling personalized care, efficient workflows, and better health outcomes for communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dental-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes Neurodent the preferred choice for dental care and clinic management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 card-hover dental-shadow text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.color} text-3xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <div className="text-4xl font-bold text-dental-primary mb-2">50+</div>
              <div className="text-gray-700 font-medium">Certified Dentists</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-8">
              <div className="text-4xl font-bold text-dental-secondary mb-2">1000+</div>
              <div className="text-gray-700 font-medium">Happy Patients</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8">
              <div className="text-4xl font-bold text-dental-accent mb-2">7</div>
              <div className="text-gray-700 font-medium">Specializations</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8">
              <div className="text-4xl font-bold text-dental-secondary mb-2">98%</div>
              <div className="text-gray-700 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dental-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Patient-Centered Care</h3>
              <p className="text-gray-200">
                Every decision we make prioritizes patient comfort, safety, and satisfaction.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-gray-200">
                We continuously embrace new technologies to improve dental care delivery.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Transparency</h3>
              <p className="text-gray-200">
                Clear communication and honest practices build trust with patients and partners.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Excellence</h3>
              <p className="text-gray-200">
                We strive for the highest standards in everything we do, from technology to care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Experience Better Dental Care?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of patients who trust Neurodent for their dental healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary text-lg">
              Book Your Appointment
            </Link>
            <button className="btn-secondary text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About