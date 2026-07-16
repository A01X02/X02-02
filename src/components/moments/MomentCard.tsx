'use client'

import { useState } from 'react'
import type { Moment } from '@/types'

interface MomentCardProps {
  moment: Moment
  onLike: () => void
  onComment: (content: string) => void
}

export default function MomentCard({ moment, onLike, onComment }: MomentCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<any[]>([])

  const loadComments = async () => {
    const res = await fetch(`/api/moments/comments?momentId=${moment.id}`)
    if (res.ok) {
      setComments(await res.json())
    }
  }

  const handleToggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(!showComments)
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    onComment(commentText.trim())
    setComments((prev) => [
      ...prev,
      { content: commentText.trim(), user: { nickname: '我' }, createdAt: new Date().toISOString() },
    ])
    setCommentText('')
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="px-4 py-3 border-b border-neutral-50">
      <div className="flex gap-3">
        {/* 头像 */}
        <div className="w-10 h-10 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center">
          {moment.user?.avatar ? (
            <img src={moment.user.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
          ) : (
            <span className="text-lg">{moment.isAI ? '📊' : '🙂'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* 昵称 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">
              {moment.user?.nickname || '用户'}
            </span>
            {moment.isAI && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-500">
                AI
              </span>
            )}
          </div>

          {/* 内容 */}
          <p className="text-sm text-neutral-800 mt-1 leading-relaxed whitespace-pre-wrap">
            {moment.content}
          </p>

          {/* 图片 */}
          {moment.images && moment.images.length > 0 && (
            <div className="grid grid-cols-3 gap-1 mt-2">
              {moment.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* 时间 */}
          <p className="text-xs text-neutral-400 mt-2">{formatTime(moment.createdAt)}</p>

          {/* 操作栏 */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 text-xs transition ${
                moment.liked ? 'text-primary-400' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <svg className="w-4 h-4" fill={moment.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {moment.likeCount || 0}
            </button>
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {moment.commentCount || 0}
            </button>
          </div>

          {/* 评论区 */}
          {showComments && (
            <div className="mt-3 bg-neutral-50 rounded-xl p-3 space-y-2">
              {comments.map((c, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-neutral-600">
                    {c.isAI && <span className="text-[10px] px-1 py-0.5 rounded bg-primary-50 text-primary-500 mr-1">AI</span>}
                    {c.user?.nickname || '用户'}:
                  </span>
                  <span className="text-neutral-700 ml-1">{c.content}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="写评论..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm focus:outline-none focus:border-primary-300"
                />
                <button
                  onClick={handleSubmitComment}
                  className="px-3 py-1.5 rounded-lg bg-primary-300 text-white text-sm"
                >
                  发送
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
