'use client'

import type { ChatMessage } from '@/types'

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex message-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary-300 flex-shrink-0 flex items-center justify-center mr-2">
          <span className="text-sm">📊</span>
        </div>
      )}
      <div
        className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
          isUser
            ? 'bg-primary-300 text-white rounded-tr-sm'
            : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center ml-2">
          <span className="text-sm">🙂</span>
        </div>
      )}
    </div>
  )
}
