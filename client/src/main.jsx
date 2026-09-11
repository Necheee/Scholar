import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/design-tokens.css'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './app/AppShell.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import StudentSponsorships from './pages/student/StudentSponsorships.jsx'
import StudentApplicationPage from './pages/student/StudentApplicationPage.jsx'
import StudentApplicationHistory from './pages/student/StudentApplicationHistory.jsx'
import StudentProfile from './pages/student/StudentProfile.jsx'
import StudentNotifications from './pages/student/StudentNotifications.jsx'
import SponsorDashboard from './pages/sponsor/SponsorDashboard.jsx'
import SponsorOpportunities from './pages/sponsor/SponsorOpportunities.jsx'
import SponsorApplications from './pages/sponsor/SponsorApplications.jsx'
import SponsorStudentsDirectory from './pages/sponsor/SponsorStudentsDirectory.jsx'
import SponsorNotifications from './pages/sponsor/SponsorNotifications.jsx'
import SponsorProfile from './pages/sponsor/SponsorProfile.jsx'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/student" element={<ProtectedRoute requiredRole="student"><AppShell role="student" /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="sponsorships" element={<StudentSponsorships />} />
            <Route path="sponsorships/:id" element={<StudentApplicationPage />} />
            <Route path="application" element={<StudentApplicationPage />} />
            <Route path="application/new" element={<StudentApplicationPage />} />
            <Route path="application/:appId" element={<StudentApplicationPage />} />
            <Route path="application/draft/:appId" element={<StudentApplicationPage />} />
            <Route path="history" element={<StudentApplicationHistory />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Route>
          
          <Route path="/sponsor" element={<ProtectedRoute requiredRole="sponsor"><AppShell role="sponsor" /></ProtectedRoute>}>
            <Route index element={<SponsorDashboard />} />
            <Route path="opportunities" element={<SponsorOpportunities />} />
            <Route path="applications" element={<SponsorApplications />} />
            <Route path="students" element={<SponsorStudentsDirectory />} />
            <Route path="notifications" element={<SponsorNotifications />} />
            <Route path="profile" element={<SponsorProfile />} />
            <Route path="*" element={<Navigate to="/sponsor" replace />} />
          </Route>
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AppShell role="admin" /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
