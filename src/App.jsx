import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import DoctorProtectedRoute from './components/DoctorProtectedRoute'
import PharmacistProtectedRoute from './components/PharmacistProtectedRoute'
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
import PharmacistLogin from './pages/auth/PharmacistLogin'

// Dashboard pages
import PatientDashboard from './pages/PatientDashboard'

// Admin Components
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorsManagement from './pages/admin/DoctorsManagement'
import EmployeesManagement from './pages/admin/EmployeesManagement'
import AdminPatientRecords from './pages/admin/PatientRecords'
import AppointmentsAnalytics from './pages/admin/AppointmentsAnalytics'
import PayrollManagement from './pages/admin/PayrollManagement'
import MedicineInventory from './pages/admin/MedicineInventory'
import NotificationsCenter from './pages/admin/NotificationsCenter'
import AdminSettings from './pages/admin/AdminSettings'

// Doctor Components
import DoctorLayout from './components/doctor/DoctorLayout'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import Appointments from './pages/doctor/Appointments'
import DoctorPatientRecords from './pages/doctor/PatientRecords'
import Prescriptions from './pages/doctor/Prescriptions'
import TreatmentNotes from './pages/doctor/TreatmentNotes'
import Schedule from './pages/doctor/Schedule'

// Pharmacist Components
import PharmacistLayout from './components/pharmacist/PharmacistLayout'
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard'
import InventoryManagement from './pages/pharmacist/InventoryManagement'
import PrescriptionManagement from './pages/pharmacist/PrescriptionManagement'
import MedicineLogs from './pages/pharmacist/MedicineLogs'
import PharmacistNotifications from './pages/pharmacist/PharmacistNotifications'
import PharmacistProfile from './pages/pharmacist/PharmacistProfile'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-white">
        <Routes>
          {/* Role selection page */}
          <Route path="/role-selection" element={<RoleSelection />} />
          
          {/* Auth pages without navbar/footer - redirect to dashboard if already authenticated */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPasswordOTP />
            </ProtectedRoute>
          } />
          <Route path="/reset-password-token" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          } />

          {/* Role-specific login pages */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/pharmacist" element={<PharmacistLogin />} />

          {/* Dashboard pages - require authentication */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard Routes - Protected with admin authentication */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<DoctorsManagement />} />
            <Route path="employees" element={<EmployeesManagement />} />
            <Route path="patients" element={<AdminPatientRecords />} />
            <Route path="appointments" element={<AppointmentsAnalytics />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="inventory" element={<MedicineInventory />} />
            <Route path="notifications" element={<NotificationsCenter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Doctor Dashboard Routes - Protected with doctor authentication */}
          <Route path="/doctor" element={
            <DoctorProtectedRoute>
              <DoctorLayout />
            </DoctorProtectedRoute>
          }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patient-records" element={<DoctorPatientRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="treatment-notes" element={<TreatmentNotes />} />
            <Route path="schedule" element={<Schedule />} />
          </Route>

          {/* Pharmacist Dashboard Routes - Protected with pharmacist authentication */}
          <Route path="/pharmacist" element={
            <PharmacistProtectedRoute>
              <PharmacistLayout />
            </PharmacistProtectedRoute>
          }>
            <Route path="dashboard" element={<PharmacistDashboard />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="prescriptions" element={<PrescriptionManagement />} />
            <Route path="logs" element={<MedicineLogs />} />
            <Route path="notifications" element={<PharmacistNotifications />} />
            <Route path="profile" element={<PharmacistProfile />} />
          </Route>

          {/* Admin Dashboard Routes with Authentication (Commented out for testing)
          <Route path="/admin" element={
            <ProtectedRoute requireAuth={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<DoctorsManagement />} />
            <Route path="employees" element={<EmployeesManagement />} />
            <Route path="patients" element={<AdminPatientRecords />} />
            <Route path="appointments" element={<AppointmentsAnalytics />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="inventory" element={<MedicineInventory />} />
            <Route path="notifications" element={<NotificationsCenter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          */}
          
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