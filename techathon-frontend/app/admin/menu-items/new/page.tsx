'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'
import MenuItemForm from '@/components/MenuItemForm'

export default function NewMenuItemPage() {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return <div className="p-10">Checking authentication...</div>
  }

  if (!isAuthenticated) {
    return null // The hook will redirect
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Add New Menu Item</h1>
      <MenuItemForm />
    </div>
  )
}