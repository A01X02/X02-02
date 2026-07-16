'use client'

import { useState, useEffect } from 'react'
import type { MemoryItem } from '@/types'

const typeLabels: Record<string, { label: string; color: string }> = {
  preference: { label: '偏好', color: 'bg-primary-50 text-primary-500' },
  fact: { label: '事实', color: 'bg-blue-50 text-blue-500' },
  event: { label: '事件', color: 'bg-green-50 text-green-500' },
  summary: { label: '摘要', color: 'bg-neutral-100 text-neutral-500' },
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [stats, setStats] = useState({ total: 0, preference: 0, fact: 0, event: 0, summary: 0 })
  const [filter, setFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newMemory, setNewMemory] = useState({ type: 'fact', content: '', tags: '', importance: 0.5 })

  const loadMemories = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/memory?${params}`)
    if (res.ok) {
      const data = await res.json()
      setMemories(data.memories)
      setStats(data.stats)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMemories()
  }, [filter])

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/memory?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMemories((prev) => prev.filter((m) => m.id !== id))
    }
  }

  const handleAdd = async () => {
    if (!newMemory.content.trim()) return

    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newMemory.type,
        content: newMemory.content,
        tags: newMemory.tags.split(',').map((t) => t.trim()).filter(Boolean),
        importance: parseFloat(String(newMemory.importance)),
      }),
    })

    if (res.ok) {
      setNewMemory({ type: 'fact', content: '', tags: '', importance: 0.5 })
      setShowAdd(false)
      loadMemories()
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3">
        <h1 className="text-base font-medium text-neutral-800 text-center">记忆</h1>
      </header>

      {/* 统计卡片 */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {[
          { key: '', label: '全部', count: stats.total },
          { key: 'preference', label: '偏好', count: stats.preference },
          { key: 'fact', label: '事实', count: stats.fact },
          { key: 'event', label: '事件', count: stats.event },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-xl py-2 text-center transition ${
              filter === s.key ? 'bg-primary-300 text-white' : 'bg-white text-neutral-500'
            }`}
          >
            <div className="text-lg font-medium">{s.count}</div>
            <div className="text-[10px]">{s.label}</div>
          </button>
        ))}
      </div>

      {/* 搜索 */}
      <div className="px-4 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadMemories()}
          placeholder="搜索记忆..."
          className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm focus:outline-none focus:border-primary-300"
        />
      </div>

      {/* 记忆列表 */}
      <div className="px-4 pb-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-sm text-neutral-400">加载中...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-400">
            {filter ? '该分类下暂无记忆' : '还没有记忆，聊聊天就会自动积累'}
          </div>
        ) : (
          memories.map((m) => {
            const typeInfo = typeLabels[m.type] || typeLabels.fact
            return (
              <div key={m.id} className="bg-white rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-neutral-300 hover:text-red-400 text-xs"
                  >
                    删除
                  </button>
                </div>
                <p className="text-sm text-neutral-700">{m.content}</p>
                {m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-4 bottom-20 w-12 h-12 rounded-full bg-primary-300 text-white shadow-lg flex items-center justify-center hover:bg-primary-400 transition z-30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 添加记忆弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-medium text-neutral-800 mb-3">添加记忆</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500">类型</label>
                <select
                  value={newMemory.type}
                  onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 text-sm mt-1"
                >
                  <option value="preference">偏好</option>
                  <option value="fact">事实</option>
                  <option value="event">事件</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-500">内容</label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  placeholder="例如：喜欢吃火锅"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 text-sm mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary-300"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                  placeholder="食物, 偏好"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500">重要度: {newMemory.importance}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory({ ...newMemory, importance: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newMemory.content.trim()}
                className="w-full py-2.5 rounded-xl bg-primary-300 text-white text-sm font-medium disabled:opacity-30"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
