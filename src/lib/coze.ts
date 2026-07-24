import { CozeAPI, COZE_CN_BASE_URL, RoleType, ChatStatus } from '@coze/api'
import { config } from './config'

/**
 * 扣子官方 SDK 客户端
 * 国内站：https://api.coze.cn
 * 国际站：https://api.coze.com
 */
export const cozeClient = new CozeAPI({
  token: config.coze.apiKey,
  baseURL: config.coze.baseUrl || COZE_CN_BASE_URL,
})

export interface CozeChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * 调用扣子智能体进行对话
 * @param userId 我们自己的用户ID
 * @param conversationId 我们自己的会话ID（复用为扣子的 conversation_id）
 * @param messages 要发送给扣子的消息（通常只传当前用户消息 + 可选历史）
 */
export async function chatWithCoze(
  userId: string,
  conversationId: string,
  messages: CozeChatMessage[]
): Promise<string> {
  if (!config.coze.apiKey || !config.coze.botId) {
    throw new Error('COZE_API_KEY 或 COZE_BOT_ID 未配置，请先检查 .env.local')
  }

  const additionalMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? RoleType.Assistant : RoleType.User,
    content: m.content,
    content_type: 'text' as const,
  }))

  const res = await cozeClient.chat.createAndPoll({
    bot_id: config.coze.botId,
    user_id: `user_${userId}`,
    conversation_id: conversationId,
    additional_messages: additionalMessages,
    auto_save_history: true,
  })

  if (res.chat.status !== ChatStatus.COMPLETED) {
    console.error('扣子智能体对话失败:', res.chat)
    throw new Error(`扣子智能体对话失败，状态：${res.chat.status}`)
  }

  // 扣子的回复可能拆成多条消息，筛选 assistant 的 answer 类型并拼接
  const answer = res.messages
    .filter((m: any) => m.role === RoleType.Assistant && m.type === 'answer')
    .map((m: any) => m.content)
    .join('')

  return answer || '...'
}

/**
 * 仅检查扣子配置是否完整，用于健康检查或启动提示
 */
export function checkCozeConfig(): boolean {
  return Boolean(config.coze.apiKey && config.coze.botId)
}
