import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

interface AdminPageProps {
  onLogout?: () => void
}

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if admin token exists in localStorage
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsLoggedIn(false)
    onLogout?.()
  }

  if (!isLoggedIn) {
    return <AdminLogin onSuccess={handleLoginSuccess} onCancel={() => {}} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
