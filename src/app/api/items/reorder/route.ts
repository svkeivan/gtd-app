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
    const { items } = await request.json()

    await prisma.$transaction(
      items.map((item: { id: string; priority: number }) =>
        prisma.item.update({
          where: { id: item.id },
          data: { priority: item.priority },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering items:', error)
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 })
  }
}

