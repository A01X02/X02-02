import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { config, AI_SYSTEM_PROMPT } from '@/lib/config'
import { retrieveRelevantMemories, buildMemoryContext, extractMemories, generateSummary } from '@/lib/memory'

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

    // 1. 保存用户消息
    const userMsg = await prisma.message.create({
      data: {
        conversationId,
        userId,
        role: 'user',
        content: message,
      },
    })

    // 2. 获取历史消息（最近20条）
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
      ? `\n\n=== 之前的对话摘要 ===\n${summaries[0].content}\n`
      : ''

    // 5. 构建消息列表
    const messages = [
      { role: 'system', content: AI_SYSTEM_PROMPT + memoryContext + summaryContext },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // 6. 调用豆包 API
    const response = await fetch(`${config.doubao.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.modelId,
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Doubao API error:', errText)
      return NextResponse.json({ error: 'AI回复失败，请稍后重试' }, { status: 502 })
    }

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || '...'

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

    // 9. 每6轮对话自动提取记忆
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
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
