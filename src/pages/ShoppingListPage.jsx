import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import * as api from '../api.js'
import { useAuth } from '../contexts/useAuth.js'

export default function ShoppingListPage() {
  const { shoppingListId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const encodedListId = encodeURIComponent(shoppingListId)
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [listName, setListName] = useState(shoppingListId)
  const [owner, setOwner] = useState('')
  const [archived, setArchived] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(shoppingListId)
  const [renameLoading, setRenameLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const isOwner = user?.username === owner
  const canRename = Boolean(owner && isOwner)
  const canArchive = Boolean(owner && isOwner)
  const canDelete = Boolean(owner && isOwner)

  useEffect(() => {
    setListName(shoppingListId)
    setRenameValue(shoppingListId)
    setArchived(false)
  }, [shoppingListId])

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
          setItems(Array.isArray(list?.items) ? list.items : [])
          setListName(list?.name || shoppingListId)
          setRenameValue(list?.name || shoppingListId)
          setOwner(list?.owner || '')
          setArchived(Boolean(list?.archived))
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
    if (archived) {
      setError('This shopping list is archived. Items cannot be changed.')
      return
    }
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
    if (archived) {
      setError('This shopping list is archived. Items cannot be changed.')
      return
    }
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
    if (archived) {
      setError('This shopping list is archived. Items cannot be changed.')
      return
    }
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

  function startRename() {
    if (!canRename) return
    setRenameValue(listName)
    setIsRenaming(true)
  }

  function cancelRename() {
    setRenameValue(listName)
    setIsRenaming(false)
  }

  async function submitRename(e) {
    e.preventDefault()
    if (!canRename || renameLoading) return
    const next = renameValue.trim()
    if (!next || next === listName) {
      setIsRenaming(false)
      setRenameValue(listName)
      return
    }
    setRenameLoading(true)
    try {
      const updated = await api.renameShoppingList(shoppingListId, next)
      const resolvedName = updated?.name || next
      if (Array.isArray(updated?.items)) {
        setItems(updated.items)
      }
      setListName(resolvedName)
      setOwner(updated?.owner || owner)
      if (typeof updated?.archived === 'boolean') {
        setArchived(updated.archived)
      }
      setIsRenaming(false)
      setError(null)
      if (shoppingListId !== resolvedName) {
        navigate(`/shoppingList/${encodeURIComponent(resolvedName)}`)
      }
    } catch (err) {
      setError(err.message || 'Unable to rename list')
    } finally {
      setRenameLoading(false)
    }
  }

  async function toggleArchivedState() {
    if (!canArchive || archiveLoading) return
    setArchiveLoading(true)
    try {
      const updated = await api.setShoppingListArchived(shoppingListId, !archived)
      setArchived(Boolean(updated?.archived))
      if (Array.isArray(updated?.items)) {
        setItems(updated.items)
      }
      setListName(updated?.name || listName)
      setOwner(updated?.owner || owner)
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to update archive status')
    } finally {
      setArchiveLoading(false)
    }
  }

  async function deleteList() {
    if (!canDelete || deleteLoading) return
    const confirmed = window.confirm('Delete this shopping list? This cannot be undone.')
    if (!confirmed) return
    setDeleteLoading(true)
    try {
      await api.deleteShoppingList(shoppingListId)
      navigate('/shoppingLists')
    } catch (err) {
      setError(err.message || 'Unable to delete list')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Shopping list</p>
          {canRename && isRenaming ? (
            <form
              className="form-inline"
              onSubmit={submitRename}
              style={{ gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}
            >
              <input
                className="text-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="List name"
                disabled={renameLoading}
                autoFocus
              />
              <button
                className="btn-primary"
                type="submit"
                disabled={renameLoading || !renameValue.trim()}
              >
                {renameLoading ? 'Saving...' : 'Save'}
              </button>
              <button className="btn-text" type="button" onClick={cancelRename} disabled={renameLoading}>
                Cancel
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 className="page-heading">{listName}</h2>
              {canRename && (
                <button className="btn-text chip-link" type="button" onClick={startRename}>
                  Rename
                </button>
              )}
              {archived && (
                <span className="chip-link chip-link-active" aria-label="Archived list">
                  Archived
                </span>
              )}
            </div>
          )}
        </div>
        <div className="page-actions chip-links">
          <Link className="chip-link" to="/shoppingLists">
            All lists
          </Link>
          <Link className="chip-link" to={`/shoppingList/${encodedListId}/members`}>
            Manage members
          </Link>
          {canArchive && (
            <button
              className={`chip-link ${archived ? 'chip-link-active' : ''}`}
              type="button"
              onClick={toggleArchivedState}
              disabled={archiveLoading}
            >
              {archiveLoading ? 'Saving...' : archived ? 'Unarchive list' : 'Archive list'}
            </button>
          )}
          {canDelete && (
            <button
              className="chip-link"
              type="button"
              onClick={deleteList}
              disabled={deleteLoading}
              style={{ color: '#b91c1c' }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete list'}
            </button>
          )}
        </div>
      </div>

      {archived && (
        <div className="alert" style={{ marginBottom: '1rem' }}>
          This list is archived. Items are read-only until you unarchive it.
        </div>
      )}

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
              disabled={archived}
            />
            <button className="btn-primary" type="submit" disabled={archived}>
              {archived ? 'Archived' : 'Add'}
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
                    <input
                      type="checkbox"
                      checked={it.checked}
                      onChange={() => toggle(it.name)}
                      disabled={archived}
                    />
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
                  <button
                    className="btn-text"
                    type="button"
                    onClick={() => removeItem(it.name)}
                    disabled={archived}
                  >
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
