import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function NavBar() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/sign')
  }

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        Shopping Buddy
      </Link>

      {token ? (
        <>
          <nav className="nav-links">
            <NavLink
              to="/shoppingLists"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              My Lists
            </NavLink>
          </nav>
          <div className="user-controls">
            {user?.username && <span className="user-name">Hi, {user.username}</span>}
            <button className="btn-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="user-controls">
          <Link className="chip-link" to="/sign">
            Sign in
          </Link>
        </div>
      )}
    </header>
  )
}
