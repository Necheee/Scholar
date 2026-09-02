import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/design-tokens.css'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './app/AppShell.jsx'
import StudentRoutes from './app/StudentRoutes.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

function App() {
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
            <Route path="*" element={<StudentRoutes />} />
          </Route>
          
          <Route path="/sponsor/*" element={<ProtectedRoute requiredRole="sponsor"><AppShell role="sponsor" /></ProtectedRoute>} />
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
