import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { ironOptions } from '@/lib/config'

export async function POST() {
  const session = await getIronSession(cookies(), ironOptions)
  session.destroy()

  return NextResponse.json({ success: true })
}

