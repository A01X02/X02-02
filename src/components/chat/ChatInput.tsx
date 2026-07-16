'use client'

import { useState, useRef } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  const handleVoiceStart = () => {
    setIsRecording(true)
    // TODO: 调用浏览器录音API
  }

  const handleVoiceEnd = () => {
    setIsRecording(false)
    // TODO: 停止录音并发送
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-end gap-2">
        {/* 语音/文字切换 */}
        <button
          onClick={() => setShowVoice(!showVoice)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-400 transition"
        >
          {showVoice ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {showVoice ? (
          <button
            onTouchStart={handleVoiceStart}
            onTouchEnd={handleVoiceEnd}
            onMouseDown={handleVoiceStart}
            onMouseUp={handleVoiceEnd}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
              isRecording
                ? 'voice-btn-active'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {isRecording ? '松开 发送' : '按住 说话'}
          </button>
        ) : (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="输入消息..."
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-300 max-h-[100px]"
          />
        )}

        {/* 发送按钮 */}
        {!showVoice && (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-300 text-white disabled:opacity-30 transition hover:bg-primary-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
