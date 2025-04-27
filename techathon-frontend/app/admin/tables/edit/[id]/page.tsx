'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface Table {
  id: number
  table_number: string
  status: string
}

const STATUS_OPTIONS = ['available', 'occupied', 'reserved', 'out-of-service']

export default function EditTablePage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [table, setTable] = useState<Table | null>(null)
  const [isLoadingTable, setIsLoadingTable] = useState(true)
  const [error, setError] = useState('')
  
  // Form state
  const [tableNumber, setTableNumber] = useState('')
  const [status, setStatus] = useState('available')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTable()
    }
  }, [isAuthenticated, params.id])

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number)
      setStatus(table.status)
    }
  }, [table])

  const fetchTable = async () => {
    try {
      const res = await fetch(`http://localhost:4000/tables/${params.id}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch table')
      }
      
      setTable(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load table')
    } finally {
      setIsLoadingTable(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError('')
    setSuccess('')

    try {
      const res = await fetch(`http://localhost:4000/tables/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          table_number: tableNumber,
          status 
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update table')
      }
      
      setSuccess('Table updated successfully!')
      
      // Redirect back to tables list after a brief delay
      setTimeout(() => {
        router.push('/admin/tables')
      }, 1500)
    } catch (err) {
      console.error(err)
      setFormError((err as Error).message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
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
      <h1 className="text-2xl font-bold mb-6">Edit Table</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {isLoadingTable ? (
        <p>Loading table...</p>
      ) : table ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="table_number" className="block text-sm font-medium text-gray-700 mb-1">
                Table Number *
              </label>
              <input
                type="text"
                id="table_number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            

            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/tables')}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
              >
                {isSubmitting ? 'Saving...' : 'Update Table'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-red-500">Table not found</p>
      )}
    </div>
  )
}