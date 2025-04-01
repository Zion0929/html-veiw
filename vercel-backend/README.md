# AI代码生成器 - Vercel后端

这是AI代码生成器的Vercel后端部分，提供代码生成API、状态检查和API密钥测试等功能。

## 功能列表

1. 代码生成 API (`/api/generate`)：接收用户的需求描述，生成HTML代码
2. 流式代码生成 API (`/api/generate-stream`)：实时流式返回生成的代码
3. 状态检查 API (`/api/status`)：检查后端服务状态
4. API密钥测试 API (`/api/test-api-key`)：验证API密钥是否有效

## 技术栈

- Node.js
- Vercel Serverless Functions
- 派欧云API (deepseek-v3-0324模型)

## 目录结构

```
vercel-backend/
├── api/
│   └── generate.js  # 代码生成API
├── .env.example     # 环境变量示例
├── package.json     # 项目依赖
├── vercel.json      # Vercel配置
└── README.md        # 说明文档
```

## 环境变量配置

在部署到Vercel之前，需要设置以下环境变量：

- `PIAO_API_KEY`: 你的派欧云API密钥

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量示例文件，并添加你的派欧云API密钥：

```bash
cp .env.example .env
```

3. 启动本地开发服务器：

```bash
npm run dev
```

## 部署到Vercel

### 前置条件

1. 注册 [Vercel](https://vercel.com) 账号
2. 安装 [Node.js](https://nodejs.org) (推荐 v18 或更高版本)
3. 安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```
4. 获取派欧云API密钥 (https://piaoapionline.com)

### 部署步骤

1. 克隆项目或创建vercel-backend目录：
   ```bash
   mkdir -p vercel-backend/api
   ```

2. 进入vercel-backend目录：
   ```bash
   cd vercel-backend
   ```

3. 登录到Vercel：
   ```bash
   vercel login
   ```

4. 创建.env文件（基于.env.example）：
   ```bash
   cp .env.example .env
   ```

5. 在.env文件中设置你的派欧云API密钥：
   ```
   PIAO_API_KEY=your_piao_api_key_here
   ```

6. 部署到Vercel预览环境：
   ```bash
   vercel
   ```

7. 部署到Vercel生产环境：
   ```bash
   vercel --prod
   ```

8. 在Vercel控制台添加环境变量：
   - 登录到 [Vercel控制台](https://vercel.com)
   - 选择你的项目
   - 进入 "Settings" > "Environment Variables"
   - 添加 `PIAO_API_KEY` 变量并填入你的派欧云API密钥
   - 点击"Save"保存设置

### 本地开发

1. 启动本地开发服务器：
   ```bash
   vercel dev
   ```

2. 测试API端点：
   - 状态检查: http://localhost:3000/api/status
   - 代码生成: POST http://localhost:3000/api/generate
   - 流式代码生成: POST http://localhost:3000/api/generate-stream
   - API密钥测试: POST http://localhost:3000/api/test-api-key

## API使用指南

### 代码生成 API

**端点**: `/api/generate`

**方法**: POST

**请求体**:
```json
{
  "prompt": "用户输入的需求描述",
  "model": "deepseek"  // 可选，默认为deepseek
}
```

**响应**:
```json
{
  "code": "生成的HTML代码",
  "success": true
}
```

### 流式代码生成 API

**端点**: `/api/generate-stream`

**方法**: POST

**请求体**:
```json
{
  "prompt": "用户输入的需求描述",
  "model": "deepseek"  // 可选，默认为deepseek
}
```

**响应**: Server-Sent Events (SSE)流，每个事件包含：
```json
{
  "content": "代码片段" // 流式传输的代码片段
}
```

或结束时：
```json
{
  "done": true
}
```

### 状态检查 API

**端点**: `/api/status`

**方法**: GET

**响应**:
```json
{
  "status": "ok",
  "service": "AI代码生成器API",
  "version": "1.0.0",
  "timestamp": "2023-03-31T10:00:00.000Z"
}
```

### API密钥测试 API

**端点**: `/api/test-api-key`

**方法**: POST

**请求体**:
```json
{
  "apiKey": "your_piao_api_key_here"
}
```

**响应**:
```json
{
  "success": true,
  "message": "API密钥有效",
  "models": [...]  // 可用模型列表
}
```

## 故障排除

1. **部署失败**:
   - 检查package.json和vercel.json文件是否正确
   - 确保所有依赖已正确列出

2. **API调用失败**:
   - 确保PIAO_API_KEY环境变量已正确设置
   - 检查API密钥是否有效（可使用`/api/test-api-key`端点测试）
   - 检查网络连接和Vercel服务状态

3. **流式传输问题**:
   - 确保前端正确处理SSE事件
   - 检查网络连接是否稳定

## 安全注意事项

1. 不要在前端代码中硬编码API密钥
2. 使用环境变量存储敏感信息
3. 限制API访问权限（可在Vercel控制台设置）
4. 定期更新依赖以修复安全问题

## 常见问题

1. **API请求超时**:
   - 派欧云API可能需要较长时间响应
   - 默认超时设置为60秒，可根据需要调整

2. **响应格式不正确**:
   - 检查前端代码是否正确处理API响应
   - 使用错误处理来捕获和处理异常情况 