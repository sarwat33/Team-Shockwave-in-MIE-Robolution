'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import Metrics from './Matrics'

interface AdminData {
  email: string
  id: string | number
  name?: string
}

// Dashboard card component for admin actions
function DashboardCard({ 
  title, 
  description, 
  link, 
  icon 
}: { 
  title: string; 
  description: string; 
  link: string; 
  icon: string; 
}) {
  return (
    <Link href={link}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
            <span className="text-xl">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminData | null>(null)

  useEffect(() => {
    // Get admin data from localStorage once authenticated
    if (isAuthenticated) {
      const storedAdmin = localStorage.getItem('admin')
      if (storedAdmin) {
        setAdminData(JSON.parse(storedAdmin))
      }
    }
  }, [isAuthenticated])

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

  if (isLoading) {
    return <div className="p-10">Checking authentication...</div>
  }

  if (!isAuthenticated) {
    return null // The hook will redirect
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Restaurant Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      {adminData && (
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
          <p className="font-medium">Welcome, {adminData.name || adminData.email}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Menu Management"
          description="Add, edit, and manage menu items"
          link="/admin/menu-items"
          icon="🍽️"
        />
        
        <DashboardCard
          title="Tables Management"
          description="Add, edit, and manage restaurant tables"
          link="/admin/tables"
          icon="🪑"
        />
        
        <DashboardCard
          title="Orders"
          description="View and manage customer orders"
          link="/admin/kitchen"
          icon="📋"
        />
      </div>
      
      {/* <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Active Tables</h3>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Menu Items</h3>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Pending Orders</h3>
            <p className="text-2xl font-bold">--</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">Stats will be implemented in a future update.</p>
      </div> */}

      {/* pending orders */}
      <Metrics />
    </div>
  )