import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import * as api from '../api.js'
import { useI18n } from '../contexts/useI18n'

export default function SignPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useI18n()

  async function submit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError(t('sign.errorRequired'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { token, user } = await api.login(username.trim(), password)
      login(token, user)
      navigate('/shoppingLists')
    } catch (err) {
      setError(err.message || t('sign.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-card" style={{ maxWidth: 420, margin: '3rem auto' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <p className="eyebrow">{t('sign.eyebrow')}</p>
          <h2 className="page-heading">{t('sign.heading')}</h2>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="form-stack" onSubmit={submit}>
        <input
          className="text-input"
          placeholder={t('sign.usernamePlaceholder')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="text-input"
          placeholder={t('sign.passwordPlaceholder')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? t('sign.submitting') : t('sign.submit')}
        </button>
        {t('sign.demoHint')}
      </form>
    </div>
  )
}
