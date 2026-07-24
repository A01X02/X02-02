'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { v4 as uuidv4 } from 'uuid'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import ConversationList from '@/components/chat/ConversationList'
import type { ChatMessage } from '@/types'

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 初始化：创建或恢复对话
  useEffect(() => {
    initConversation()
  }, [])

  const initConversation = async () => {
    try {
      // 获取对话列表
      // 临时用localStorage存储conversationId
      const savedId = localStorage.getItem('conversationId')
      if (savedId) {
        setConversationId(savedId)
        // 加载历史消息
        const res = await fetch(`/api/chat?conversationId=${savedId}`)
        if (res.ok) {
          // TODO: 加载历史消息
        }
      }
    } catch (e) {
      console.error('Init conversation failed:', e)
    }
  }

  const createConversation = async () => {
    // 由于没有单独的conversation API，在发送第一条消息时创建
    // 这里生成一个临时ID，实际由数据库cuid生成
    const newId = uuidv4()
    setConversationId(newId)
    localStorage.setItem('conversationId', newId)
    return newId
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      let convId = conversationId
      if (!convId) {
        convId = await createConversation()
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: text }),
      })

      if (!res.ok) {
        throw new Error('回复失败')
      }

      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: data.aiMessage?.id,
        role: 'assistant',
        content: data.aiMessage?.content || '...',
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      const errMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '抱歉，出了点问题，请稍后重试 🤔',
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container">
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-20">
        <button
          onClick={() => setShowSidebar(true)}
          className="p-1 -ml-1 text-neutral-500 hover:text-neutral-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-sm font-medium text-neutral-800">🍎 夏以昼</h1>
        <div className="w-7" />
      </header>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-neutral-400 text-sm">
              你好，米米。有什么想聊的？
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-neutral-400 text-sm px-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area bg-white border-t border-neutral-100">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>

      {/* 对话列表抽屉 */}
      <ConversationList
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        conversations={conversations}
        currentId={conversationId}
        onSelect={(id) => {
          setConversationId(id)
          localStorage.setItem('conversationId', id)
          setMessages([])
          setShowSidebar(false)
        }}
        onNew={() => {
          setConversationId('')
          localStorage.removeItem('conversationId')
          setMessages([])
          setShowSidebar(false)
        }}
      />
    </div>
  )
}
