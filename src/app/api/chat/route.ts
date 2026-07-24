import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { retrieveRelevantMemories, buildMemoryContext, extractMemories, generateSummary } from '@/lib/memory'
import { chatWithCoze } from '@/lib/coze'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = session.user.id
    const { conversationId, message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    if (!conversationId) {
      return NextResponse.json({ error: '缺少 conversationId' }, { status: 400 })
    }

    // 1. 保存用户消息
    const userMsg = await prisma.message.create({
      data: {
        conversationId,
        userId,
        role: 'user',
        content: message,
      },
    })

    // 2. 获取历史消息（用于记忆提取、摘要和上下文增强）
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    // 3. 检索相关记忆
    const memories = await retrieveRelevantMemories(userId, message)
    const memoryContext = buildMemoryContext(memories)

    // 4. 获取对话摘要作为额外上下文
    const summaries = await prisma.conversationSummary.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    const summaryContext = summaries.length > 0
      ? `=== 之前的对话摘要 ===\n${summaries[0].content}`
      : ''

    // 5. 把记忆和摘要拼到当前用户消息里（扣子后台已有人设，这里只补充外部记忆）
    const enhancedMessage = [memoryContext, summaryContext, message]
      .filter((part) => part.trim().length > 0)
      .join('\n\n')

    // 6. 调用扣子智能体
    const aiContent = await chatWithCoze(userId, conversationId, [
      { role: 'user', content: enhancedMessage },
    ])

    // 7. 保存AI回复
    const aiMsg = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiContent,
      },
    })

    // 8. 更新对话的最后消息时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMsgAt: new Date() },
    })

    // 9. 每6轮对话自动提取记忆（基于当前历史）
    const msgCount = history.length
    if (msgCount > 0 && msgCount % 6 === 0) {
      extractMemories(userId, history.slice(-6)).catch(() => {})
    }

    // 10. 每15条消息生成摘要
    if (msgCount > 0 && msgCount % 15 === 0) {
      generateSummary(conversationId, userId).catch(() => {})
    }

    return NextResponse.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errMsg = error instanceof Error ? error.message : '服务器错误'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
