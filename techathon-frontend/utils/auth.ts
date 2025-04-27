import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server-side authentication check for protected routes
 * Call this function at the top of your server component
 */
export async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')
  
  if (!token) {
    redirect('/admin/login')
  }
  
  return true
}