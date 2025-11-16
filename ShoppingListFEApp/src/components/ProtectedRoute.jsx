import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function ProtectedRoute({ children }) {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/sign" replace />
  }

  return children
}
