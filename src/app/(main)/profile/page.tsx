'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ conversations: 0, messages: 0, memories: 0, moments: 0 })

  useEffect(() => {
    // TODO: 获取用户统计数据
  }, [])

  const menuItems = [
    { label: '设置', href: '/settings', icon: '⚙️' },
    { label: '语音配置', href: '/settings', icon: '🎙️' },
    { label: '主题更换', href: '/settings', icon: '🎨' },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3">
        <h1 className="text-base font-medium text-neutral-800 text-center">我的</h1>
      </header>

      {/* 用户信息 */}
      <div className="flex flex-col items-center py-6 px-4 bg-white border-b border-neutral-100">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mb-3">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="text-3xl">🙂</span>
          )}
        </div>
        <h2 className="text-lg font-medium text-neutral-800">{session?.user?.name || '用户'}</h2>
        <p className="text-sm text-neutral-400">{session?.user?.email}</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-4 px-4 py-4 bg-white border-b border-neutral-100">
        {[
          { label: '对话', count: stats.conversations },
          { label: '消息', count: stats.messages },
          { label: '记忆', count: stats.memories },
          { label: '动态', count: stats.moments },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-medium text-neutral-800">{s.count}</div>
            <div className="text-xs text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 菜单 */}
      <div className="mt-2 bg-white">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-neutral-700">{item.label}</span>
            </div>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* 退出登录 */}
      <div className="mt-4 px-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3 rounded-xl bg-white text-red-500 text-sm font-medium hover:bg-red-50 transition"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
