import { useState, useCallback } from 'react'
import { AuthContext } from './AuthContext.js'

function loadStoredUser() {
  const raw = localStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('bearerToken')
  })
  const [user, setUser] = useState(() => loadStoredUser())

  const login = useCallback((newToken, userData) => {
    setToken(newToken)
    localStorage.setItem('bearerToken', newToken)
    setUser(userData ?? null)
    if (userData) {
      localStorage.setItem('authUser', JSON.stringify(userData))
    } else {
      localStorage.removeItem('authUser')
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bearerToken')
    localStorage.removeItem('authUser')
  }, [])

  const isSignedIn = useCallback(() => token !== null, [token])

  const value = { token, user, login, logout, isSignedIn }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
