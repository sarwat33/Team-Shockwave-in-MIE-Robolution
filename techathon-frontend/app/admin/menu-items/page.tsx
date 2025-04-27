'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
}

export default function MenuItemsPage() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [error, setError] = useState('')

  console.log({menuItems})
  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuItems()
    }
  }, [isAuthenticated])

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('http://localhost:4000/menu-items')
      const data = await res.json()

      console.log({
        data
      })
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch menu items')
      }
      
      setMenuItems(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load menu items')
    } finally {
      setIsLoadingItems(false)
    }
  }

  const handleCreateNew = () => {
    router.push('/admin/menu-items/new')
  }

  const handleEdit = (id: number) => {
    router.push(`/admin/menu-items/edit/${id}`)
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
        <h1 className="text-2xl font-bold">Menu Items Management</h1>
        <button 
          onClick={handleCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add New Item
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {isLoadingItems ? (
        <p>Loading menu items...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Category</th>
                <th className="py-2 px-4 border-b text-right">Price</th>
    
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.category}</td>
                  <td className="py-2 px-4 border-b text-right">{item.price} tk</td>

                  <td className="py-2 px-4 border-b text-center">
                    <button 
                      onClick={() => handleEdit(item.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No menu items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}