import { prisma } from './db'
import { config, MEMORY_EXTRACTION_PROMPT } from './config'

/**
 * 检索与当前对话相关的记忆
 */
export async function retrieveRelevantMemories(userId: string, query: string, limit = 5) {
  const memories = await prisma.memory.findMany({
    where: { userId },
    orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  })

  if (memories.length === 0) return []

  // 关键词匹配 + 时间衰减评分
  const queryLower = query.toLowerCase()
  const now = Date.now()

  const scored = memories.map((m) => {
    let score = 0

    // 标签匹配（权重 3.0）
    for (const tag of m.tags) {
      if (queryLower.includes(tag.toLowerCase())) {
        score += 3.0
      }
    }

    // 内容关键词匹配（权重 2.0）
    const contentLower = m.content.toLowerCase()
    const words = queryLower.split(/[\s,，。.!！?？]+/).filter((w) => w.length > 1)
    for (const word of words) {
      if (contentLower.includes(word)) {
        score += 2.0
      }
    }

    // 重要度加权（权重 0.4）
    score += m.importance * 0.4

    // 时间衰减
    const daysSince = (now - m.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 7) score += 3.0
    else if (daysSince < 30) score += 2.0
    else if (daysSince < 90) score += 1.0

    return { ...m, score }
  })

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * 构建记忆上下文，注入到 system prompt
 */
export function buildMemoryContext(memories: any[]): string {
  if (memories.length === 0) return ''

  const lines = memories.map((m) => {
    const typeLabels: Record<string, string> = { preference: '偏好', fact: '事实', event: '事件', summary: '摘要' }
    const typeLabel = typeLabels[m.type] || m.type
    return `[${typeLabel}] ${m.content}`
  })

  return `\n\n=== 你记得关于米米的事情 ===\n${lines.join('\n')}\n=== 记忆结束 ===\n\n在对话中自然地运用这些记忆，但不要刻意提到"我记得"之类的话。`
}

/**
 * 调用豆包API提取记忆
 */
export async function extractMemories(userId: string, messages: any[]) {
  try {
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? '米米' : '夏以昼'}: ${m.content}`)
      .join('\n')

    const response = await fetch(`${config.doubao.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.modelId,
        messages: [
          { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
          { role: 'user', content: conversationText },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) return []

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // 解析JSON（兼容markdown代码块包裹）
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const memories = JSON.parse(jsonStr)

    if (!Array.isArray(memories) || memories.length === 0) return []

    // 存入数据库
    const created = await Promise.all(
      memories.slice(0, 5).map((m: any) =>
        prisma.memory.create({
          data: {
            userId,
            type: m.type || 'fact',
            content: m.content,
            tags: m.tags || [],
            importance: Math.min(Math.max(m.importance || 0.5, 0), 1),
          },
        })
      )
    )

    return created
  } catch (error) {
    console.error('Memory extraction failed:', error)
    return []
  }
}

/**
 * 生成对话摘要
 */
export async function generateSummary(conversationId: string, userId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    if (messages.length < 15) return null

    const conversationText = messages
      .slice(-20)
      .map((m) => `${m.role === 'user' ? '米米' : '夏以昼'}: ${m.content}`)
      .join('\n')

    const response = await fetch(`${config.doubao.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.modelId,
        messages: [
          {
            role: 'system',
            content: '将以下对话总结为一段简洁的摘要（100字以内），保留关键信息。',
          },
          { role: 'user', content: conversationText },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    const summary = await prisma.conversationSummary.create({
      data: {
        conversationId,
        content,
        msgCount: messages.length,
      },
    })

    return summary
  } catch (error) {
    console.error('Summary generation failed:', error)
    return null
  }
}
