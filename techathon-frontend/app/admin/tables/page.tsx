'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface Table {
  id: number
  table_number: string
  status: string
}

export default function TablesPage() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(true)
  const [error, setError] = useState('')

  // For creating a new table directly on this page
  const [newTableNumber, setNewTableNumber] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTables()
    }
  }, [isAuthenticated])

  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:4000/tables')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tables')
      }
      
      setTables(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load tables')
    } finally {
      setIsLoadingTables(false)
    }
  }

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError('')

    try {
      const res = await fetch('http://localhost:4000/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: newTableNumber })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create table')
      }
      
      // Add new table to the list
      setTables(prev => [...prev, data])
      
      // Reset form
      setNewTableNumber('')
      
    } catch (err) {
      console.error(err)
      setCreateError((err as Error).message || 'An error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditTable = (id: number) => {
    router.push(`/admin/tables/edit/${id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-500'
      case 'occupied':
        return 'bg-red-500'
      case 'reserved':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
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
      <h1 className="text-2xl font-bold mb-8">Tables Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-medium mb-4">Add New Table</h2>
        <form onSubmit={handleCreateTable} className="flex items-end gap-4">
          <div className="flex-grow">
            <label htmlFor="table_number" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number *
            </label>
            <input
              type="text"
              id="table_number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300"
          >
            {isCreating ? 'Creating...' : 'Add Table'}
          </button>
        </form>
        {createError && <p className="text-red-500 mt-2">{createError}</p>}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {isLoadingTables ? (
        <p>Loading tables...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Table #{table.table_number}</h3>
 
              </div>
   
              <button
                onClick={() => handleEditTable(table.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm w-full"
              >
                Edit
              </button>
            </div>
          ))}
          
          {tables.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No tables found. Add your first table above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}