'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import MenuItemForm from '@/components/MenuItemForm'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
}

export default function EditMenuItemPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [isLoadingItem, setIsLoadingItem] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuItem()
    }
  }, [isAuthenticated, params.id])

  const fetchMenuItem = async () => {
    try {
      let param = await params
      const res = await fetch(`http://localhost:4000/menu-items/${param.id}`)
      const data = await res.json()
 
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch menu item')
      }
      
      setMenuItem(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load menu item')
    } finally {
      setIsLoadingItem(false)
    }
  }

  if (isLoading) {
    return <div className="p-10">Checking authentication...</div>
  }

  if (!isAuthenticated) {
    return null // The hook will redirect
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Edit Menu Item</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {isLoadingItem ? (
        <p>Loading menu item...</p>
      ) : menuItem ? (
        <MenuItemForm menuItem={menuItem} isEdit={true} />
      ) : (
        <p className="text-red-500">Menu item not found</p>
      )}
    </div>
  )
}