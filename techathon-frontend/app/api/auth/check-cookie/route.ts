import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookie = await cookies()
    // Check if the admin-token cookie exists
    const adminToken =cookie.get('admin-token')
    
    return NextResponse.json({ 
      authenticated: !!adminToken
    })
  } catch (error) {
    console.error('Error checking cookie:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}