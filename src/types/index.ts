export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  imageUrl?: string
  voiceUrl?: string
  createdAt?: string
}

export interface Conversation {
  id: string
  title: string
  lastMsgAt: string
  messageCount?: number
}

export interface Moment {
  id: string
  userId: string
  content: string
  images: string[]
  isAI: boolean
  createdAt: string
  user?: {
    nickname: string
    avatar: string | null
  }
  commentCount?: number
  likeCount?: number
  liked?: boolean
}

export interface MemoryItem {
  id: string
  type: 'preference' | 'fact' | 'event' | 'summary'
  content: string
  tags: string[]
  importance: number
  createdAt: string
}

export interface VoiceProfile {
  id: string
  name: string
  voiceType: 'preset' | 'cloned'
  voiceId: string | null
  audioUrl: string | null
}

export interface UserSettings {
  theme: string
  fontSize: 'small' | 'medium' | 'large'
  chatBackground: string | null
  avatar: string | null
  voiceProfileId: string | null
}
