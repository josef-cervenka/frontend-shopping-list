import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api.js'
import { useI18n } from '../contexts/useI18n'
import { getItemStats } from '../utils/stats'

export default function ShoppingListsPage() {
  const { t } = useI18n()
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
      setError(err.message || t('lists.loadError'))
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
      setError(err.message || t('lists.createError'))
    } finally {
      setCreating(false)
    }
  }

  const summary = useMemo(() => {
    return lists.reduce(
      (acc, list) => {
        const stats = getItemStats(list?.items)
        acc.totalLists += 1
        acc.totalItems += stats.total
        acc.completedItems += stats.completed
        acc.pendingItems += stats.pending
        return acc
      },
      { totalLists: 0, totalItems: 0, completedItems: 0, pendingItems: 0 },
    )
  }, [lists])

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('lists.eyebrow')}</p>
          <h2 className="page-heading">{t('lists.heading')}</h2>
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
            {key === 'all'
              ? t('lists.filterAll')
              : key === 'active'
                ? t('lists.filterActive')
                : t('lists.filterArchived')}
          </button>
        ))}
      </div>

      <form className="form-inline" onSubmit={submit} style={{ marginBottom: '1.5rem' }}>
        <input
          className="text-input"
          placeholder={t('lists.createPlaceholder')}
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit" disabled={creating}>
          {creating ? t('lists.createLoading') : t('lists.createButton')}
        </button>
      </form>

      <div className="section-heading">
        <h3 className="section-title">{t('lists.statsTitle')}</h3>
      </div>
      <section className="stats-grid" aria-label={t('lists.statsTitle')}>
        <div className="stat-card">
          <p className="stat-label">{t('lists.totalLists')}</p>
          <p className="stat-value">{summary.totalLists}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">{t('lists.totalItems')}</p>
          <p className="stat-value">{summary.totalItems}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">{t('lists.completedItems')}</p>
          <p className="stat-value">{summary.completedItems}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">{t('lists.pendingItems')}</p>
          <p className="stat-value">{summary.pendingItems}</p>
        </div>
      </section>

      {loading ? (
        <p className="muted">{t('lists.loading')}</p>
      ) : lists.length === 0 ? (
        <p className="muted">{t('lists.empty')}</p>
      ) : (
        <ul className="stack-list">
          {lists.map((list) => {
            const encodedName = encodeURIComponent(list.name)
            const stats = getItemStats(list?.items)
            const completedPercent = stats.total
              ? Math.round((stats.completed / stats.total) * 100)
              : 0
            return (
              <li className="list-tile" key={list.name}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{list.name}</strong>
                    <div className="muted" style={{ fontSize: '0.9rem' }}>
                      {t('lists.owner')}: {list.owner}
                    </div>
                    {list.archived && (
                      <span
                        className="chip-link chip-link-active"
                        style={{ marginTop: '0.35rem', display: 'inline-flex' }}
                      >
                        {t('lists.archivedTag')}
                      </span>
                    )}
                  </div>
                  <div className="chip-links">
                    <Link className="chip-link" to={`/shoppingList/${encodedName}`}>
                      {t('lists.viewList')}
                    </Link>
                    <Link className="chip-link" to={`/shoppingList/${encodedName}/members`}>
                      {t('lists.manageMembers')}
                    </Link>
                  </div>
                </div>
                <div className="list-tile__meta">
                  {t('lists.members')}: {Array.isArray(list.members) ? list.members.length : 0}
                </div>
                <div className="list-stats">
                  <div className="list-stats__row">
                    <span className="muted">
                      {t('lists.completedItems')}: {stats.completed} / {stats.total}
                    </span>
                    <span className="list-stats__value">{completedPercent}%</span>
                  </div>
                  <div className="stats-bar">
                    <div className="stats-bar__fill" style={{ width: `${completedPercent}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
