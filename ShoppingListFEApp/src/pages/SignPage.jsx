import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import * as api from '../api.js'

export default function SignPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function submit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { token, user } = await api.login(username.trim(), password)
      login(token, user)
      navigate('/shoppingLists')
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-card" style={{ maxWidth: 420, margin: '3rem auto' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2 className="page-heading">Sign in / Sign up</h2>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="form-stack" onSubmit={submit}>
        <input
          className="text-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="text-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Enter'}
        </button>
        User/password: demo/demo, admin/admin, franta/franta
      </form>
    </div>
  )
}
