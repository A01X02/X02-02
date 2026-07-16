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
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: any = { userId: session.user.id }
    if (type) where.type = type
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const [memories, stats] = await Promise.all([
      prisma.memory.findMany({
        where,
        orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.memory.groupBy({
        by: ['type'],
        where: { userId: session.user.id },
        _count: true,
      }),
    ])

    const statMap: Record<string, number> = {}
    stats.forEach((s) => { statMap[s.type] = s._count })

    return NextResponse.json({
      memories,
      stats: {
        total: memories.length,
        preference: statMap.preference || 0,
        fact: statMap.fact || 0,
        event: statMap.event || 0,
        summary: statMap.summary || 0,
      },
    })
  } catch (error) {
    console.error('Get memories error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { type, content, tags, importance } = await req.json()

    if (!type || !content) {
      return NextResponse.json({ error: '类型和内容不能为空' }, { status: 400 })
    }

    const memory = await prisma.memory.create({
      data: {
        userId: session.user.id,
        type,
        content,
        tags: tags || [],
        importance: importance ?? 0.5,
      },
    })

    return NextResponse.json(memory)
  } catch (error) {
    console.error('Create memory error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    }

    await prisma.memory.deleteMany({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete memory error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
