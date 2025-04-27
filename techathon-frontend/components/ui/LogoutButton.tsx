
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  
  const handleLogout = async () => {
    // Remove from localStorage
    localStorage.removeItem('admin')
    
    // Remove the cookie through API call
    await fetch('/api/auth/remove-cookie', {
      method: 'POST'
    })
    
    // Redirect to login page
    router.push('/admin/login')
  }

  return (
    <button 
      onClick={handleLogout} 
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  )
}