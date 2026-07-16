import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadToCOS } from '@/lib/cos'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'image'  // image | avatar | theme

    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    }

    // 限制文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件不能超过10MB' }, { status: 400 })
    }

    const userId = session.user.id
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'jpg'
    const key = `${type}s/${userId}/${uuidv4()}.${ext}`

    const url = await uploadToCOS(key, buffer)

    // 如果是头像，更新用户信息
    if (type === 'avatar') {
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: url },
      })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
