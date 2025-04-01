// 导入依赖模块
const axios = require('axios');
require('dotenv').config();

// 派欧云API配置
const PIAO_API_URL = 'https://api.ppinfra.com/v3/openai/chat/completions';
const PIAO_API_KEY = process.env.PIAO_API_KEY;
const MODEL = process.env.MODEL || 'deepseek/deepseek-v3-0324';

/**
 * 流式代码生成的Serverless函数
 * @param {object} req - HTTP请求对象
 * @param {object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }
  
  // 设置响应头，支持流式传输
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    // 获取请求体中的提示内容
    const { prompt, model = 'deepseek' } = req.body;
    
    // 验证请求参数
    if (!prompt || typeof prompt !== 'string') {
      res.write(`data: ${JSON.stringify({ error: '请提供有效的prompt参数' })}\n\n`);
      return res.end();
    }
    
    // 准备发送给派欧云API的数据
    const promptText = `
我需要你生成一个完整的HTML程序，基于以下需求:
${prompt}

要求:
1. 生成一个完整可运行的HTML文件，包含必要的CSS和JavaScript
2. 代码必须适配移动设备，使用响应式设计
3. 设计必须美观、现代，有良好的用户体验
4. 代码必须高效、无错误，能直接运行
5. 只返回完整的HTML代码，不要添加任何解释或说明

请直接返回完整的HTML代码，不要有任何前缀或后缀说明:
`;
    
    // 调用派欧云API，启用流式传输
    const response = await axios.post(
      PIAO_API_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: "你是一名专业的前端开发工程师，精通HTML、CSS和JavaScript。你的任务是根据用户的需求生成完整可运行的HTML代码。生成的HTML代码应该是移动端友好的，使用现代CSS和JavaScript功能，确保代码结构清晰、运行高效。" },
          { role: "user", content: promptText }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PIAO_API_KEY}`
        },
        responseType: 'stream',
        timeout: 120000 // 2分钟超时
      }
    );
    
    // 监听数据流
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // 处理[DONE]消息
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            continue;
          }
          
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.choices && parsedData.choices.length > 0) {
              const delta = parsedData.choices[0].delta;
              if (delta && delta.content) {
                // 发送数据给客户端
                res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
              }
            }
          } catch (e) {
            console.error('解析流数据失败:', e);
          }
        }
      }
    });
    
    // 处理流结束
    response.data.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });
    
    // 错误处理
    response.data.on('error', (err) => {
      console.error('流处理错误:', err);
      res.write(`data: ${JSON.stringify({ error: '处理流时发生错误', details: err.message })}\n\n`);
      res.end();
    });
    
  } catch (error) {
    console.error('调用派欧云API出错:', error);
    
    // 构建详细的错误信息
    const errorMessage = error.response 
      ? `状态码: ${error.response.status}, 详情: ${JSON.stringify(error.response.data)}`
      : error.message;
      
    res.write(`data: ${JSON.stringify({ 
      error: '生成代码时发生错误', 
      details: errorMessage 
    })}\n\n`);
    
    res.end();
  }
}; 