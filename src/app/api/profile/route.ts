import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.enum(['en', 'es', 'fr', 'de']),
  theme: z.enum(['light', 'dark', 'system']),
  timezone: z.string(),
  avatar: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const { user: authUser } = await auth()
    
    if (!authUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // Start a transaction to handle both update and audit log
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id: authUser.id },
        data: {
          ...validatedData,
          profileComplete: true,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'PROFILE_UPDATE',
          details: JSON.stringify({
            previous: await tx.user.findUnique({
              where: { id: authUser.id },
              select: {
                name: true,
                language: true,
                theme: true,
                timezone: true,
                avatar: true,
              },
            }),
            new: validatedData,
          }),
        },
      })

      return user
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        language: updatedUser.language,
        theme: updatedUser.theme,
        timezone: updatedUser.timezone,
        avatar: updatedUser.avatar,
        profileComplete: updatedUser.profileComplete,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { user: authUser } = await auth()
    
    if (!authUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        language: true,
        theme: true,
        timezone: true,
        avatar: true,
        profileComplete: true,
      },
    })

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
