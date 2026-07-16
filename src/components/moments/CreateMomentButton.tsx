'use client'

import { useState } from 'react'

export default function CreateMomentButton({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, images }),
      })

      if (res.ok) {
        setContent('')
        setImages([])
        setOpen(false)
        onCreated()
      }
    } catch (e) {
      console.error('Create moment failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setImages((prev) => [...prev, data.url])
      }
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 w-12 h-12 rounded-full bg-primary-300 text-white shadow-lg flex items-center justify-center hover:bg-primary-400 transition z-30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-neutral-800">发动态</h2>
              <button onClick={() => setOpen(false)} className="text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享点什么..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-300"
            />

            {/* 图片预览 */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </label>

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                className="px-4 py-1.5 rounded-lg bg-primary-300 text-white text-sm font-medium disabled:opacity-30"
              >
                {loading ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
