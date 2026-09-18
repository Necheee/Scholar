import { createContext, useState, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('scholar_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  async function login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data)
      localStorage.setItem('scholar_user', JSON.stringify(data))
      return data
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }

  async function register(userData) {
    try {
      const { data } = await api.post('/auth/register', userData)
      setUser(data)
      localStorage.setItem('scholar_user', JSON.stringify(data))
      return data
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error', error)
    } finally {
      setUser(null)
      localStorage.removeItem('scholar_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
