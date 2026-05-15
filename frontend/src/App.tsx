import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import SharedNotePage from './pages/SharedNotePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }
  if (!session) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 transition-colors duration-300">
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/shared/:id" element={<SharedNotePage />} />
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/auth'} replace />} />
      </Routes>
    </div>
  )
}
