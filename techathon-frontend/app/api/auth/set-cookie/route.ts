import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    const cookie = await cookies()
    
    // Set the cookie
    cookie.set({
      name: 'admin-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting cookie:', error)
    return NextResponse.json(
      { error: 'Failed to set authentication cookie' },
      { status: 500 }
    )
  }
}