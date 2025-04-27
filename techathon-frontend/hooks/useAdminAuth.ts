'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check admin in localStorage
        const adminLocalStorage = localStorage.getItem('admin')
        
        // Check cookie via API endpoint
        const response = await fetch('/api/auth/check-cookie')
        const cookieCheck = await response.json()
        
        if (!cookieCheck.authenticated || !adminLocalStorage) {
          // If either is missing, consider not authenticated
          setIsAuthenticated(false)
          router.push('/admin/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        setIsAuthenticated(false)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  return { isAuthenticated, isLoading }
}