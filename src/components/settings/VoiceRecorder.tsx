'use client'

import { useState, useRef } from 'react'

interface VoiceRecorderProps {
  onUploaded: (profile: any) => void
}

export default function VoiceRecorder({ onUploaded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
    } catch (error) {
      console.error('Recording failed:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleUpload = async () => {
    if (!audioBlob) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice.webm')
      formData.append('name', name || '我的声音')

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const profile = await res.json()
        onUploaded(profile)
        setAudioBlob(null)
        setAudioUrl('')
        setName('')
      }
    } catch (error) {
      console.error('Upload voice failed:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            recording
              ? 'bg-red-500 animate-pulse'
              : 'bg-primary-300 hover:bg-primary-400'
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {recording ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>

        <div className="flex-1">
          <p className="text-sm text-neutral-600">
            {recording ? '正在录音...' : '点击录音，录制你的声音'}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            录制10-20秒效果最佳
          </p>
        </div>
      </div>

      {/* 录音预览 */}
      {audioUrl && (
        <div className="mt-3 space-y-2">
          <audio controls src={audioUrl} className="w-full h-10" />

          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给声音取个名字"
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-primary-300 text-white text-sm disabled:opacity-50"
            >
              {uploading ? '上传中...' : '上传'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
