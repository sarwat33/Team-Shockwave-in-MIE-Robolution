import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Delete the cookie
    const co = await cookies()
    co.delete('admin-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing cookie:', error)
    return NextResponse.json(
      { error: 'Failed to remove authentication cookie' },
      { status: 500 }
    )
  }
}