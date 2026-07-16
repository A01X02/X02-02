'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import VoiceRecorder from '@/components/settings/VoiceRecorder'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [fontSize, setFontSize] = useState('medium')
  const [theme, setTheme] = useState('default')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [voiceProfiles, setVoiceProfiles] = useState<any[]>([])

  useEffect(() => {
    // 加载设置
    loadSettings()
    loadVoiceProfiles()
  }, [])

  const loadSettings = async () => {
    // TODO: 从API加载用户设置
  }

  const loadVoiceProfiles = async () => {
    // TODO: 从API加载语音配置
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      setAvatar(data.url)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3">
        <h1 className="text-base font-medium text-neutral-800 text-center">设置</h1>
      </header>

      <div className="space-y-2 mt-2">
        {/* 头像 */}
        <div className="bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">头像</span>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🙂</span>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* 字体大小 */}
        <div className="bg-white px-4 py-3">
          <div className="text-sm text-neutral-700 mb-2">字体大小</div>
          <div className="flex gap-2">
            {[
              { value: 'small', label: '小' },
              { value: 'medium', label: '中' },
              { value: 'large', label: '大' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setFontSize(s.value)}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  fontSize === s.value
                    ? 'bg-primary-300 text-white'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 主题 */}
        <div className="bg-white px-4 py-3">
          <div className="text-sm text-neutral-700 mb-2">聊天主题</div>
          <div className="flex gap-2">
            {[
              { value: 'default', label: '默认橙', color: '#E8A87C' },
              { value: 'blue', label: '蓝色', color: '#3B82F6' },
              { value: 'purple', label: '紫色', color: '#8B5CF6' },
              { value: 'gray', label: '灰色', color: '#6B7280' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex-1 py-2 rounded-lg text-sm transition flex items-center justify-center gap-1 ${
                  theme === t.value
                    ? 'ring-2 ring-offset-1'
                    : ''
                }`}
                style={{ backgroundColor: t.color + '20', color: t.color }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 语音配置 */}
        <div className="bg-white px-4 py-3">
          <div className="text-sm text-neutral-700 mb-3">语音配置</div>
          <VoiceRecorder onUploaded={(profile) => {
            setVoiceProfiles((prev) => [...prev, profile])
          }} />

          {voiceProfiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {voiceProfiles.map((vp) => (
                <div key={vp.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm text-neutral-700">{vp.name}</span>
                    <span className="text-xs text-neutral-400 ml-2">
                      {vp.voiceType === 'cloned' ? '克隆声音' : '预设声音'}
                    </span>
                  </div>
                  {vp.audioUrl && (
                    <audio controls src={vp.audioUrl} className="h-8" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
