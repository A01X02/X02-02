# AI 智能体聊天机器人 — 国内架构版

> Next.js 14 + Prisma + PostgreSQL + NextAuth + 腾讯云COS + 火山引擎豆包

## 项目结构

```
ai-chatbot/
├── prisma/schema.prisma        # 数据库模型定义
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页（重定向到/chat）
│   │   ├── login/page.tsx       # 登录/注册页面
│   │   ├── (main)/              # 主应用（带底部导航）
│   │   │   ├── layout.tsx       # 布局（导航栏+登录守卫）
│   │   │   ├── chat/            # 聊天页面
│   │   │   ├── moments/         # 朋友圈
│   │   │   ├── memories/        # 记忆管理
│   │   │   ├── profile/         # 个人资料
│   │   │   └── settings/        # 设置（主题/字体/语音）
│   │   └── api/
│   │       ├── auth/            # NextAuth + 注册
│   │       ├── chat/            # 聊天API（豆包+记忆）
│   │       ├── moments/         # 朋友圈API
│   │       ├── memory/          # 记忆API
│   │       ├── voice/           # 语音API（TTS+克隆）
│   │       └── upload/          # 文件上传（COS）
│   ├── components/              # UI组件
│   ├── lib/
│   │   ├── db.ts                # Prisma客户端
│   │   ├── auth.ts              # NextAuth配置
│   │   ├── cos.ts               # 腾讯云COS
│   │   ├── config.ts            # 环境配置+AI Prompt
│   │   └── memory.ts            # 记忆系统核心
│   └── types/index.ts           # TypeScript类型
└── .env.local                   # 环境变量（不提交）
```

## 快速开始

### 1. 安装依赖

```bash
cd D:\Projects\ai-chatbot
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入：

```env
DATABASE_URL="postgresql://用户名:密码@数据库地址:5432/数据库名?schema=public"
NEXTAUTH_SECRET="随机字符串（运行 openssl rand -base64 32）"
NEXTAUTH_URL="http://localhost:3000"
COS_SECRET_ID="腾讯云SecretId"
COS_SECRET_KEY="腾讯云SecretKey"
COS_BUCKET="存储桶名称"
COS_REGION="ap-guangzhou"
DOUBAO_API_KEY="豆包API Key"
DOUBAO_MODEL_ID="ep-xxxxxxxxx"
TTS_APP_ID="语音AppID"
TTS_ACCESS_TOKEN="语音Token"
```

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 即可使用。

---

## 部署到腾讯云

### 第一步：创建腾讯云 PostgreSQL

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com)
2. 进入 **数据库 → PostgreSQL**
3. 点击 **新建**，选择配置：
   - 版本：PostgreSQL 15
   - 实例规格：基础版 1核1G（足够个人使用）
   - 存储：20GB
   - 地域：广州（或其他就近地区）
4. 创建完成后，在 **实例详情 → 账号管理** 创建数据库账号
5. 在 **实例详情 → 数据库管理** 创建数据库 `aichatbot`
6. 获取连接地址，填入 `.env.local` 的 `DATABASE_URL`

### 第二步：创建腾讯云 COS 存储桶

1. 进入 **对象存储 → 存储桶列表**
2. 点击 **创建存储桶**：
   - 名称：`ai-chatbot-随机数字`（如 ai-chatbot-1234567890）
   - 地域：与PostgreSQL一致
   - 访问权限：**公有读私有写**
3. 进入 **存储桶 → 权限管理 → 跨域访问CORS设置**，添加规则：
   - 来源：`*`
   - 操作：`GET, PUT, POST, DELETE, HEAD`
   - Headers：`*`
4. 获取 SecretId/SecretKey：
   - 进入 **访问管理 → API密钥管理**
   - 创建密钥，复制 SecretId 和 SecretKey

### 第三步：开通火山引擎豆包

1. 登录 [火山引擎控制台](https://console.volcengine.com/ark)
2. 进入 **方舟大模型平台**
3. 创建推理接入点，选择豆包模型
4. 获取 API Key 和推理接入点 ID

### 第四步：部署到 CloudBase

1. 登录 [腾讯云 CloudBase](https://console.cloud.tencent.com/tcb)
2. 点击 **新建环境**，选择免费或按量计费
3. 进入环境 → **静态网站托管**
4. 本地构建：
   ```bash
   npm run build
   ```
5. 上传 `.next/` 目录到 CloudBase
   - 或使用 CloudBase CLI：`npx @cloudbase/cli deploy`

### 第五步：配置域名（可选）

1. 在 CloudBase → **静态托管 → 域名管理**
2. 添加自定义域名
3. 配置 DNS 解析（CNAME指向CloudBase地址）
4. 开启 HTTPS（免费证书）

---

## 架构对比（海外 vs 国内）

| 组件 | 海外版 | 国内版 | 说明 |
|------|--------|--------|------|
| 前端部署 | Vercel | 腾讯云 CloudBase | CDN加速 |
| 数据库 | Supabase | 腾讯云 PostgreSQL | SQL完全兼容 |
| 文件存储 | Supabase Storage | 腾讯云 COS | 对象存储 |
| 用户认证 | Supabase Auth | NextAuth.js | 密码登录 |
| AI模型 | 豆包 | 豆包 | 保持不变 |
| 语音服务 | 待定 | 火山引擎 TTS | 同一平台 |
| 实时通信 | Supabase Realtime | 轮询/SSE | 暂不需要Realtime |

## 成本估算（月费）

| 服务 | 配置 | 预估费用 |
|------|------|----------|
| PostgreSQL | 基础版 1核1G | ¥35/月 |
| COS | 10GB存储+流量 | ¥5/月 |
| CloudBase | 免费额度 | ¥0 |
| 火山引擎豆包 | 按Token计费 | ¥10-50/月 |
| **合计** | | **约 ¥50-90/月** |
