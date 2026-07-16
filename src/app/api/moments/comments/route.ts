import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 获取评论
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const momentId = searchParams.get('momentId')

  if (!momentId) {
    return NextResponse.json({ error: '缺少 momentId' }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { momentId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { nickname: true, avatar: true } },
    },
  })

  return NextResponse.json(comments)
}

// 发表评论
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { momentId, content, isAI } = await req.json()

    if (!content) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        momentId,
        userId: session.user.id,
        content,
        isAI: isAI || false,
      },
      include: {
        user: { select: { nickname: true, avatar: true } },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 点赞/取消点赞
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { momentId } = await req.json()

    const existing = await prisma.like.findUnique({
      where: {
        momentId_userId: {
          momentId,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: { momentId, userId: session.user.id },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
