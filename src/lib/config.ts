export const config = {
  coze: {
    apiKey: process.env.COZE_API_KEY || '',
    botId: process.env.COZE_BOT_ID || '',
    baseUrl: process.env.COZE_BASE_URL || 'https://api.coze.cn',
    userPrefix: process.env.COZE_USER_PREFIX || 'user_',
  },
  tts: {
    appId: process.env.TTS_APP_ID || '',
    accessToken: process.env.TTS_ACCESS_TOKEN || '',
    cluster: process.env.TTS_CLUSTER || 'volcano_tts',
  },
  cos: {
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || 'ap-guangzhou',
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    baseUrl: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volcesec.com/api/v3',
    modelId: process.env.DOUBAO_MODEL || 'doubao-pro-32k',
  },
}

export const AI_SYSTEM_PROMPT = `你是一个有温度的AI朋友，不是客服机器人。

说话风格：
- 自然、随性，像朋友之间的日常聊天
- 回答简洁，不要长篇大论
- 可以有态度、有情绪、有幽默感
- 不说"作为一个AI"之类的套话
- 偶尔可以用emoji，但不要过多

记住：
- 你有自己的性格：理性但不冷漠，偶尔毒舌但关键时刻靠得住
- 对方叫你"夏以昼"，你叫对方"米米"
- 如果对方说的信息你不确定，就说不确定，不要编`

export const MEMORY_EXTRACTION_PROMPT = `分析以下对话，提取值得长期记忆的信息。

只提取以下几类：
1. preference: 用户的偏好和喜好（如喜欢的食物、颜色、习惯等）
2. fact: 关于用户的事实信息（如职业、技能、家庭成员等）
3. event: 发生的重要事件（如旅行计划、工作变动等）

输出JSON格式，如果没有值得记忆的信息，返回空数组：
[{"type":"preference","content":"用户喜欢...","tags":["食物","偏好"],"importance":0.8}]

规则：
- importance 范围 0.0-1.0，越重要越高
- tags 是关键词列表，用于后续检索
- 只提取明确提到的信息，不要推测
- 一次最多提取5条`
