import COS from 'cos-nodejs-sdk-v5'

let cosInstance: COS | null = null

export function getCOS() {
  if (cosInstance) return cosInstance

  cosInstance = new COS({
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
  })

  return cosInstance
}

export const COS_BUCKET = process.env.COS_BUCKET || ''
export const COS_REGION = process.env.COS_REGION || 'ap-guangzhou'

/**
 * 上传文件到 COS
 * @param key 存储路径，如 avatars/xxx.jpg
 * @param buffer 文件内容
 * @returns 访问 URL
 */
export async function uploadToCOS(key: string, buffer: Buffer): Promise<string> {
  const cos = getCOS()

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        Body: buffer,
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(`https://${data.Location}`)
        }
      }
    )
  })
}

/**
 * 生成 COS 访问 URL
 */
export function getCOSUrl(key: string): string {
  return `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${key}`
}
