# AI代码生成器部署指南

本文档提供了详细的部署步骤，帮助你将AI代码生成器部署到Vercel并将前端打包为安卓应用程序。

## 目录
1. [前端部署](#前端部署)
2. [后端部署](#后端部署)
3. [配置前端与后端的连接](#配置前端与后端的连接)

## 前端部署

前端是一个纯静态网站，可以部署到任何静态托管服务，包括Vercel、Netlify、GitHub Pages等。

### 部署到Vercel

1. 注册/登录Vercel账号：https://vercel.com/signup
2. 安装Vercel CLI工具：
   ```bash
   npm install -g vercel
   ```
3. 登录Vercel CLI：
   ```bash
   vercel login
   ```
4. 在项目根目录下执行：
   ```bash
   vercel
   ```
5. 按照提示完成部署

## 后端部署流程

### 1. 准备工作

在开始部署前，请确保你已准备好以下内容：

- [Vercel](https://vercel.com) 账号
- [派欧云](https://piaoapionline.com) API密钥
- [Node.js](https://nodejs.org) 开发环境 (推荐 v18 或更高版本)
- [Git](https://git-scm.com) (可选，用于版本控制)

### 2. 部署后端到Vercel

#### 2.1 安装Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 登录Vercel

```bash
vercel login
```

#### 2.3 进入后端目录

```bash
cd vercel-backend
```

#### 2.4 设置环境变量

创建一个`.env`文件（基于`.env.example`），填入你的派欧云API密钥：

```
PIAO_API_KEY=your_piao_api_key_here
MODEL=deepseek/deepseek-v3-0324
IS_DEV=false
ENABLE_STREAM=true
```

#### 2.5 部署到Vercel

```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

#### 2.6 在Vercel控制台设置环境变量

1. 登录 [Vercel控制台](https://vercel.com)
2. 选择你的项目
3. 进入 "Settings" > "Environment Variables"
4. 添加以下环境变量：
   - `PIAO_API_KEY`: 你的派欧云API密钥
   - `MODEL`: deepseek/deepseek-v3-0324
   - `ENABLE_STREAM`: true
5. 点击"Save"保存设置

#### 2.7 获取后端URL

部署完成后，Vercel会提供一个URL（例如：`https://your-app-name.vercel.app`）。记录此URL，后续需要在前端配置中使用。

### 3. 验证后端部署

访问以下URL检查后端是否正常工作：

```
https://your-app-name.vercel.app/api/status
```

如果返回类似以下内容，则表示后端部署成功：

```json
{
  "status": "ok",
  "service": "AI代码生成器API",
  "version": "1.0.0",
  "timestamp": "2023-03-31T10:00:00.000Z"
}
```

## 配置前端与后端的连接

部署完成后，需要将前端与后端连接起来。

1. 编辑前端配置文件 `js/config.js`：
   - 更新`API_ENDPOINT`变量为后端URL：
   ```javascript
   API_ENDPOINT: 'https://your-app-name.vercel.app/api/generate',
   API_STREAM_ENDPOINT: 'https://your-app-name.vercel.app/api/generate-stream',
   ```
   - 将`your-app-name.vercel.app`替换为第2.7步中的实际URL

2. 重新部署前端
   ```bash
   vercel --prod
   ```

## 验证部署

1. 访问前端URL（例如：https://ai-code-generator.vercel.app）
2. 输入一个简单的请求（如："创建一个显示当前时间的网页"）
3. 点击"生成"按钮，确认一切工作正常

## 高级配置

### 自定义API端点

如果你需要自定义API端点或支持用户自定义API端点，可以在应用中添加设置界面，允许用户输入自定义的API端点URL。

### 优化性能

1. **缓存生成结果**：在前端缓存生成的代码，减少重复请求
2. **延迟加载**：对非关键资源使用延迟加载
3. **压缩资源**：压缩HTML、CSS和JavaScript文件

### 支持离线使用

1. **实现离线模式**：当网络不可用时，提供基本功能
2. **本地存储**：将生成的代码保存在本地存储中

## 故障排除

### 后端部署问题

1. **环境变量未设置**：
   - 检查Vercel控制台中是否正确设置了`PIAO_API_KEY`
   - 确保环境变量名称大小写正确

2. **API密钥无效**：
   - 检查派欧云API密钥是否有效
   - 确认API密钥有足够的额度

3. **部署失败**：
   - 查看Vercel部署日志找出错误原因
   - 确保package.json和vercel.json配置正确

### 前端问题

1. **API连接失败**：
   - 确保配置了正确的API端点URL
   - 检查网络连接是否正常
   - 使用浏览器开发者工具查看请求详情

2. **安卓打包失败**：
   - 确保manifest.json配置正确
   - 检查应用权限设置
   - 查看HBuilderX控制台日志

### 其他常见问题

1. **代码生成超时**：
   - 尝试减少请求的复杂度
   - 检查网络连接稳定性

2. **样式或布局问题**：
   - 确保CSS媒体查询配置正确
   - 测试不同屏幕尺寸下的显示效果

## 升级与维护

1. **定期更新依赖**：
   - 在vercel-backend目录中运行：`npm update`

2. **监控API使用情况**：
   - 定期检查派欧云API使用量和额度

3. **备份重要数据**：
   - 定期备份用户生成的重要代码或项目

## 更新部署

1. 修改代码后，重新部署：
   ```bash
   vercel --prod
   ```

2. 如果只需要更新前端，可以只部署前端：
   ```bash
   # 在前端目录
   vercel --prod
   ```

3. 如果只需要更新后端，可以只部署后端：
   ```bash
   # 在后端目录
   cd vercel-backend
   vercel --prod
   ``` 