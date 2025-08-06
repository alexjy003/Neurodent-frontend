import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImage from '../assets/images/neurodent-logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 !cursor-pointer">
              <img 
                src={logoImage} 
                alt="Neurodent Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-2xl font-bold text-dental-primary">Neurodent</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 !cursor-pointer ${
                isActive('/') ? 'text-dental-primary' : 'text-gray-700 hover:text-dental-primary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors duration-200 !cursor-pointer ${
                isActive('/about') ? 'text-dental-primary' : 'text-gray-700 hover:text-dental-primary'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors duration-200 !cursor-pointer ${
                isActive('/contact') ? 'text-dental-primary' : 'text-gray-700 hover:text-dental-primary'
              }`}
            >
              Contact
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/role-selection" className="btn-primary cursor-pointer">
                Create Account
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-dental-primary transition-colors duration-200 cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 !cursor-pointer ${
                isActive('/') ? 'text-dental-primary bg-dental-light' : 'text-gray-700 hover:text-dental-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 !cursor-pointer ${
                isActive('/about') ? 'text-dental-primary bg-dental-light' : 'text-gray-700 hover:text-dental-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 cursor-pointer ${
                isActive('/contact') ? 'text-dental-primary bg-dental-light' : 'text-gray-700 hover:text-dental-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <div className="px-3 pt-2 space-y-2">
              <Link 
                to="/role-selection" 
                className="w-full btn-primary block text-center !cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar