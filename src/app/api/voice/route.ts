import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadToCOS } from '@/lib/cos'
import { config } from '@/lib/config'
import { v4 as uuidv4 } from 'uuid'

// 上传语音克隆样本
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const name = formData.get('name') as string

    if (!audioFile) {
      return NextResponse.json({ error: '缺少音频文件' }, { status: 400 })
    }

    const userId = session.user.id
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const ext = audioFile.name.split('.').pop() || 'wav'
    const key = `voices/${userId}/${uuidv4()}.${ext}`

    // 上传到 COS
    const audioUrl = await uploadToCOS(key, buffer)

    // 调用火山引擎语音克隆 API（需要实际对接）
    // 这里先保存记录，voiceId 后续填充
    const voiceProfile = await prisma.voiceProfile.create({
      data: {
        userId,
        name: name || '我的声音',
        voiceType: 'cloned',
        audioUrl,
      },
    })

    return NextResponse.json(voiceProfile)
  } catch (error) {
    console.error('Voice upload error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// TTS 语音合成
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { text, voiceProfileId } = await req.json()

    if (!text) {
      return NextResponse.json({ error: '文本不能为空' }, { status: 400 })
    }

    // 查找语音配置
    let voiceId = ''
    if (voiceProfileId) {
      const profile = await prisma.voiceProfile.findUnique({
        where: { id: voiceProfileId },
      })
      voiceId = profile?.voiceId || ''
    }

    // 调用火山引擎 TTS API
    const ttsResponse = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer;${config.tts.accessToken}`,
      },
      body: JSON.stringify({
        app: {
          appid: config.tts.appId,
          token: config.tts.accessToken,
          cluster: config.tts.cluster,
        },
        user: { uid: session.user.id },
        audio: {
          voice_type: voiceId || 'zh_female_qingxin',
          encoding: 'mp3',
          speed_ratio: 1.0,
        },
        request: {
          reqid: uuidv4(),
          text,
          operation: 'query',
        },
      }),
    })

    if (!ttsResponse.ok) {
      return NextResponse.json({ error: '语音合成失败' }, { status: 502 })
    }

    const ttsData = await ttsResponse.json()

    if (ttsData.code !== 3000 || !ttsData.data) {
      return NextResponse.json({ error: ttsData.message || '语音合成失败' }, { status: 502 })
    }

    // TTS返回base64音频，上传到COS
    const audioBuffer = Buffer.from(ttsData.data, 'base64')
    const key = `tts/${session.user.id}/${uuidv4()}.mp3`
    const audioUrl = await uploadToCOS(key, audioBuffer)

    return NextResponse.json({ audioUrl })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
