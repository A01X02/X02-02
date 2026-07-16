'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || '注册失败')
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('邮箱或密码错误')
      }

      router.push('/chat')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-neutral-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-300 flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-xl font-medium text-neutral-800">阿析</h1>
          <p className="text-sm text-neutral-400 mt-1">你的 AI 朋友</p>
        </div>

        {/* 切换 */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'login' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'register' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400'
            }`}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己取个名字"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="至少6位"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-300 text-white font-medium hover:bg-primary-400 disabled:opacity-50 transition"
          >
            {loading ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
