import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import Seo from '../components/Seo'

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
    return (
      <>
        <Seo
          title="Admin Login | PZM"
          description="Admin access for PZM Computers & Phones."
          canonicalPath="/admin"
          noindex={true}
        />
        <AdminLogin onSuccess={handleLoginSuccess} onCancel={() => {}} />
      </>
    )
  }

  return (
    <>
      <Seo
        title="Admin Dashboard | PZM"
        description="Admin dashboard for PZM Computers & Phones."
        canonicalPath="/admin"
        noindex={true}
      />
      <AdminDashboard onLogout={handleLogout} />
    </>
  )
}
