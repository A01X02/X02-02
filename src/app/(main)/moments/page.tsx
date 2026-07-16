'use client'

import { useState, useEffect } from 'react'
import MomentCard from '@/components/moments/MomentCard'
import CreateMomentButton from '@/components/moments/CreateMomentButton'
import type { Moment } from '@/types'

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadMoments = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/moments?page=${p}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        if (p === 1) {
          setMoments(data.moments)
        } else {
          setMoments((prev) => [...prev, ...data.moments])
        }
        setHasMore(data.moments.length === 10)
      }
    } catch (e) {
      console.error('Load moments failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMoments(1)
  }, [])

  const handleLike = async (momentId: string) => {
    const res = await fetch('/api/moments/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ momentId }),
    })
    if (res.ok) {
      const data = await res.json()
      setMoments((prev) =>
        prev.map((m) =>
          m.id === momentId
            ? {
                ...m,
                liked: data.liked,
                likeCount: (m.likeCount || 0) + (data.liked ? 1 : -1),
              }
            : m
        )
      )
    }
  }

  const handleComment = async (momentId: string, content: string) => {
    const res = await fetch('/api/moments/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ momentId, content }),
    })
    if (res.ok) {
      setMoments((prev) =>
        prev.map((m) =>
          m.id === momentId
            ? { ...m, commentCount: (m.commentCount || 0) + 1 }
            : m
        )
      )
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3">
        <h1 className="text-base font-medium text-neutral-800 text-center">朋友圈</h1>
      </header>

      <div className="pb-4">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
            加载中...
          </div>
        ) : moments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <p className="text-sm text-neutral-400">还没有动态，发一条试试？</p>
          </div>
        ) : (
          <>
            {moments.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onLike={() => handleLike(moment.id)}
                onComment={(content) => handleComment(moment.id, content)}
              />
            ))}
            {hasMore && !loading && (
              <button
                onClick={() => {
                  setPage((p) => p + 1)
                  loadMoments(page + 1)
                }}
                className="w-full py-3 text-sm text-neutral-400"
              >
                加载更多
              </button>
            )}
          </>
        )}
      </div>

      <CreateMomentButton
        onCreated={() => {
          setPage(1)
          loadMoments(1)
        }}
      />
    </div>
  )
}
