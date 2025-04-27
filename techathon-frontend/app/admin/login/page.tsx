'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Login failed')

      // Store in localStorage (for client-side checks)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      
      // Also store in cookies (for middleware)
      // Using HTTP-only cookies with the Response API
      const response = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token || data.admin.id })
      })
      
      if (!response.ok) {
        console.error('Failed to set authentication cookie')
      }
      
      router.push('/admin/dashboard')
    } catch (err) {
      console.error(err)
      setError('An error occurred during login')
    }
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" className="w-full p-2 border" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 border" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-black text-white px-4 py-2">Login</button>
      </form>
    </div>
  )
}