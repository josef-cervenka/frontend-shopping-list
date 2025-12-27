import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useI18n } from '../contexts/useI18n'
import { useTheme } from '../contexts/useTheme'

export function NavBar() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, language, setLanguage } = useI18n()
  const { theme, toggleTheme } = useTheme()

  function handleLogout() {
    logout()
    navigate('/sign')
  }

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        {t('app.name')}
      </Link>

      {token ? (
        <nav className="nav-links">
          <NavLink
            to="/shoppingLists"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {t('nav.myLists')}
          </NavLink>
        </nav>
      ) : null}

      <div className="user-controls">
        <div className="toggle-group">
          <button className="btn-secondary btn-compact" type="button" onClick={toggleTheme}>
            {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          </button>
          <button
            className="btn-secondary btn-compact"
            type="button"
            onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
            aria-label={t('nav.languageLabel')}
          >
            {language === 'cs' ? 'EN' : 'CZ'}
          </button>
        </div>
        {token ? (
          <>
            {user?.username && (
              <span className="user-name">{t('nav.greeting', { name: user.username })}</span>
            )}
            <button className="btn-secondary" type="button" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <Link className="chip-link" to="/sign">
            {t('nav.signIn')}
          </Link>
        )}
      </div>
    </header>
  )
}
