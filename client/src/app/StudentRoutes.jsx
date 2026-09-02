import { Routes, Route, Navigate } from 'react-router-dom'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentSponsorships from '../pages/student/StudentSponsorships'
import StudentApplicationPage from '../pages/student/StudentApplicationPage'
import StudentApplicationHistory from '../pages/student/StudentApplicationHistory'
import StudentProfile from '../pages/student/StudentProfile'
import StudentNotifications from '../pages/student/StudentNotifications'

export default function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/sponsorships" element={<StudentSponsorships />} />
      <Route path="/application/new" element={<StudentApplicationPage />} />
      <Route path="/application/:appId" element={<StudentApplicationPage />} />
      <Route path="/application/draft/:appId" element={<StudentApplicationPage />} />
      <Route path="/history" element={<StudentApplicationHistory />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/notifications" element={<StudentNotifications />} />
      <Route path="*" element={<Navigate to="/student" replace />} />
    </Routes>
  )
}
