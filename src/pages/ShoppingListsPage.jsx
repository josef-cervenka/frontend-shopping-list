import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api.js'

export default function ShoppingListsPage() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newListName, setNewListName] = useState('')

  async function fetchLists() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getShoppingLists()
      setLists(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load shopping lists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists()
  }, [])

  async function submit(e) {
    e.preventDefault()
    const trimmedName = newListName.trim()
    if (!trimmedName) return
    setCreating(true)
    try {
      await api.createShoppingList(trimmedName)
      setNewListName('')
      await fetchLists()
    } catch (err) {
      setError(err.message || 'Unable to create shopping list')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2 className="page-heading">Your shopping lists</h2>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-inline" onSubmit={submit} style={{ marginBottom: '1.5rem' }}>
        <input
          className="text-input"
          placeholder="List name (unique)"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create list'}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading lists...</p>
      ) : lists.length === 0 ? (
        <p className="muted">No shopping lists available yet.</p>
      ) : (
        <ul className="stack-list">
          {lists.map((list) => {
            const encodedName = encodeURIComponent(list.name)
            return (
              <li className="list-tile" key={list.name}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{list.name}</strong>
                    <div className="muted" style={{ fontSize: '0.9rem' }}>Owner: {list.owner}</div>
                  </div>
                  <div className="chip-links">
                  <Link className="chip-link" to={`/shoppingList/${encodedName}`}>
                    View list
                  </Link>
                  <Link className="chip-link" to={`/shoppingList/${encodedName}/members`}>
                    Manage members
                  </Link>
                </div>
                </div>
                <div className="list-tile__meta">
                  Members: {Array.isArray(list.members) ? list.members.length : 0}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
