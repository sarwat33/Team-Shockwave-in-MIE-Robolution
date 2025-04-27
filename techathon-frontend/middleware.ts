
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get path and check if it's an admin route that needs protection
  const path = request.nextUrl.pathname
  
  // Define which paths should be protected
  const isAdminPath = path.startsWith('/admin') && path !== '/admin/login'
  
  // Check for the admin token in cookies or localStorage
  // Note: middleware can only access cookies, not localStorage
  const adminToken = request.cookies.get('admin-token')?.value
  
  // If trying to access protected admin route without token, redirect to login
  if (isAdminPath && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  // Continue with the request if authenticated or accessing public routes
  return NextResponse.next()
}

// Configure which paths this middleware should run on
export const config = {
  matcher: ['/admin/:path*']
}