import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api.js'

export default function ShoppingListPage() {
  const { shoppingListId } = useParams()
  const encodedListId = encodeURIComponent(shoppingListId)
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let mounted = true
    Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })
    api
      .getItems(shoppingListId)
      .then((data) => {
        if (mounted) {
          setItems(Array.isArray(data) ? data : [])
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Unable to load items')
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [shoppingListId])

  async function addItem(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const added = await api.addItem(shoppingListId, text.trim())
      setItems((s) => [...s, added])
      setText('')
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to add item')
    }
  }

  async function toggle(itemName) {
    try {
      const updated = await api.toggleItem(shoppingListId, itemName)
      if (!updated) return
      setItems((s) => s.map((it) => (it.name === itemName ? updated : it)))
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to update item')
    }
  }

  async function removeItem(itemName) {
    try {
      await api.deleteItem(shoppingListId, itemName)
      setItems((s) => s.filter((it) => it.name !== itemName))
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to remove item')
    }
  }

  const filteredItems = items.filter((it) => {
    if (filter === 'active') return !it.checked
    if (filter === 'done') return it.checked
    return true
  })

  const filterLabelMap = {
    all: 'All items',
    active: 'Pending only',
    done: 'Completed only',
  }

  const filterOptions = ['all', 'active', 'done']

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Shopping list</p>
          <h2 className="page-heading">{shoppingListId}</h2>
        </div>
        <div className="page-actions chip-links">
          <Link className="chip-link" to="/shoppingLists">
            All lists
          </Link>
          <Link className="chip-link" to={`/shoppingList/${encodedListId}/members`}>
            Manage members
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Loading items.</p>
      ) : (
        <>
          <form className="form-inline" onSubmit={addItem} style={{ marginBottom: '1rem' }}>
            <input
              className="text-input"
              placeholder="Add item"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn-primary" type="submit">
              Add
            </button>
          </form>

          <div className="chip-links" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
            {filterOptions.map((key) => (
              <button
                key={key}
                type="button"
                className={`chip-link ${filter === key ? 'chip-link-active' : ''}`}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
              >
                {filterLabelMap[key]}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <p className="muted">No items yet. Start by adding your first product.</p>
          ) : filteredItems.length === 0 ? (
            <p className="muted">
              No items match the current filter ({filterLabelMap[filter].toLowerCase()}).
            </p>
          ) : (
            <ul className="items-list">
              {filteredItems.map((it) => (
                <li key={it.name}>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={it.checked} onChange={() => toggle(it.name)} />
                    <span
                      className="item-name"
                      style={{
                        textDecoration: it.checked ? 'line-through' : 'none',
                        color: it.checked ? '#9ca3af' : '',
                      }}
                    >
                      {it.name}
                    </span>
                  </label>
                  <button className="btn-text" type="button" onClick={() => removeItem(it.name)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
