import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { user } = await auth()
  
  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title } = await request.json()

    const newItem = await prisma.item.create({
      data: {
        title,
        status: 'INBOX',
        userId: user.id,
      },
    })

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

