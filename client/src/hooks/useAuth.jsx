import { createContext, useState, useContext } from 'react'

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

  function login(email, role) {
    const newUser = { email, role }
    setUser(newUser)
    try {
      localStorage.setItem('scholar_user', JSON.stringify(newUser))
    } catch (err) {
      console.error('Failed to save auth state', err)
    }
  }

  function logout() {
    setUser(null)
    try {
      localStorage.removeItem('scholar_user')
    } catch (err) {
      console.error('Failed to clear auth state', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
