import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import ShoppingListPage from './pages/ShoppingListPage'
import SignPage from './pages/SignPage'
import MembersPage from './pages/MembersPage'
import ShoppingListsPage from './pages/ShoppingListsPage'
import { NavBar } from './components/NavBar.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/sign" element={<SignPage />} />
            <Route
              path="/shoppingLists"
              element={
                <ProtectedRoute>
                  <ShoppingListsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shoppingList/:shoppingListId"
              element={
                <ProtectedRoute>
                  <ShoppingListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shoppingList/:shoppingListId/members"
              element={
                <ProtectedRoute>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/shoppingLists" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
