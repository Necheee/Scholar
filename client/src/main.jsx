import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/design-tokens.css'
import AppShell from './app/AppShell.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student/*" element={<AppShell role="student" />} />
        <Route path="/sponsor/*" element={<AppShell role="sponsor" />} />
        <Route path="/admin/*" element={<AppShell role="admin" />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
