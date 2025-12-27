import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import * as api from '../api.js'
import { useAuth } from '../contexts/useAuth'
import { useI18n } from '../contexts/useI18n'

export default function MembersPage() {
  const { shoppingListId } = useParams()
  const encodedListId = encodeURIComponent(shoppingListId)
  const [members, setMembers] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [owner, setOwner] = useState('')
  const { user } = useAuth()
  const { t } = useI18n()
  const canManageMembers = Boolean(owner && user?.username === owner)

  useEffect(() => {
    let mounted = true
    Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })
    api
      .getShoppingList(shoppingListId)
      .then((list) => {
        if (mounted) {
          setMembers(Array.isArray(list?.members) ? list.members : [])
          setOwner(list?.owner || '')
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || t('members.loadError'))
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [shoppingListId])

  async function addMember(e) {
    e.preventDefault()
    if (!canManageMembers) return
    if (!text.trim()) return
    try {
      const updatedMembers = await api.addMember(shoppingListId, text.trim())
      setMembers(updatedMembers)
      setText('')
      setError(null)
    } catch (err) {
      setError(err.message || t('members.addError'))
    }
  }

  async function removeMember(name) {
    if (!canManageMembers && user?.username !== name) return
    try {
      const updatedMembers = await api.removeMember(shoppingListId, name)
      setMembers(updatedMembers)
      setError(null)
    } catch (err) {
      setError(err.message || t('members.removeError'))
    }
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('members.eyebrow')}</p>
          <h2 className="page-heading">{t('members.heading', { name: shoppingListId })}</h2>
        </div>
        <div className="page-actions chip-links">
          <Link className="chip-link" to={`/shoppingList/${encodedListId}`}>
            {t('members.backToList')}
          </Link>
          <Link className="chip-link" to="/shoppingLists">
            {t('members.allLists')}
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">{t('members.loading')}</p>
      ) : (
        <>
          {canManageMembers ? (
            <form className="form-inline" onSubmit={addMember} style={{ marginBottom: '1rem' }}>
              <input
                className="text-input"
                value={text}
                placeholder={t('members.addPlaceholder')}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn-primary" type="submit">
                {t('members.addButton')}
              </button>
            </form>
          ) : (
            <p className="muted" style={{ marginBottom: '1rem' }}>
              {t('members.ownerOnly')}
            </p>
          )}

          {members.length === 0 ? (
            <p className="muted">{t('members.empty')}</p>
          ) : (
            <ul className="members-list">
              {members.map((m, i) => (
                <li key={`${m}-${i}`}>
                  <div className="checkbox-row" style={{ gap: '0.35rem' }}>
                    <span>{m}</span>
                    {m === owner && <span className="tag-owner">{t('members.ownerTag')}</span>}
                  </div>
                  {(canManageMembers && m !== owner) && (
                    <button className="btn-text" type="button" onClick={() => removeMember(m)}>
                      {t('members.remove')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
