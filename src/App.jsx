import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordOTP from './pages/ResetPasswordOTP'
import Footer from './components/Footer'

// Role selection and auth pages
import RoleSelection from './pages/RoleSelection'
import DoctorLogin from './pages/auth/DoctorLogin'
import AdminLogin from './pages/auth/AdminLogin'
import EmployeeLogin from './pages/auth/EmployeeLogin'

// Dashboard pages
import PatientDashboard from './pages/PatientDashboard'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-white">
        <Routes>
          {/* Role selection page */}
          <Route path="/role-selection" element={<RoleSelection />} />
          
          {/* Auth pages without navbar/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordOTP />} />
          <Route path="/reset-password-token" element={<ResetPassword />} />

          {/* Role-specific login pages */}
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/employee" element={<EmployeeLogin />} />

          {/* Dashboard pages */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          
          {/* Main pages with navbar/footer */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App