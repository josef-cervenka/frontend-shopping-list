import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api.js'

export default function ShoppingListsPage() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [filter, setFilter] = useState('all')

  async function fetchLists(selectedFilter = filter) {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getShoppingLists({
        archived: selectedFilter === 'archived' ? true : selectedFilter === 'active' ? false : undefined,
      })
      setLists(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load shopping lists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists(filter)
  }, [filter])

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

      <div className="chip-links" style={{ marginBottom: '1rem' }}>
        {['all', 'active', 'archived'].map((key) => (
          <button
            key={key}
            type="button"
            className={`chip-link ${filter === key ? 'chip-link-active' : ''}`}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            {key === 'all' ? 'All' : key === 'active' ? 'Active (not archived)' : 'Archived'}
          </button>
        ))}
      </div>

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
                    <div className="muted" style={{ fontSize: '0.9rem' }}>
                      Owner: {list.owner}
                    </div>
                    {list.archived && (
                      <span
                        className="chip-link chip-link-active"
                        style={{ marginTop: '0.35rem', display: 'inline-flex' }}
                      >
                        Archived
                      </span>
                    )}
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
