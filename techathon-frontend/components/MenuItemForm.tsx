'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id?: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
}

interface MenuItemFormProps {
  menuItem?: MenuItem
  isEdit?: boolean
}

const INITIAL_FORM_STATE: MenuItem = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image_url: '',
  is_available: true
}

const CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Beverage',
  'Side Dish'
]

export default function MenuItemForm({ menuItem, isEdit = false }: MenuItemFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<MenuItem>(menuItem || INITIAL_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (menuItem) {
      setFormData(menuItem)
    }
  }, [menuItem])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const url = isEdit 
        ? `http://localhost:4000/menu-items/${menuItem?.id}`
        : 'http://localhost:4000/menu-items'
      
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save menu item')
      }
      
      setSuccess(isEdit ? 'Menu item updated successfully!' : 'Menu item created successfully!')
      
      if (!isEdit) {
        // Reset form after successful creation
        setFormData(INITIAL_FORM_STATE)
      }
      
      // Redirect back to menu items list after a brief delay to show success message
      setTimeout(() => {
        router.push('/admin/menu-items')
      }, 1500)
    } catch (err) {
      console.error(err)
      setError((err as Error).message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (tk) *
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
            Available for ordering
          </label>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/menu-items')}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  )
}