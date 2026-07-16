import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [moments, total] = await Promise.all([
      prisma.moment.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { nickname: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.moment.count(),
    ])

    // 查当前用户点赞状态
    const likes = await prisma.like.findMany({
      where: { userId: session.user.id },
      select: { momentId: true },
    })
    const likedIds = new Set(likes.map((l) => l.momentId))

    const result = moments.map((m) => ({
      ...m,
      commentCount: m._count.comments,
      likeCount: m._count.likes,
      liked: likedIds.has(m.id),
      _count: undefined,
    }))

    return NextResponse.json({ moments: result, total, page })
  } catch (error) {
    console.error('Get moments error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { content, images, isAI } = await req.json()

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const moment = await prisma.moment.create({
      data: {
        userId: session.user.id,
        content,
        images: images || [],
        isAI: isAI || false,
      },
      include: {
        user: { select: { nickname: true, avatar: true } },
      },
    })

    return NextResponse.json(moment)
  } catch (error) {
    console.error('Create moment error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
