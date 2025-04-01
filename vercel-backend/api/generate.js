// 导入依赖模块
const axios = require('axios');
require('dotenv').config();

// 派欧云API配置
const PIAO_API_URL = 'https://api.ppinfra.com/v3/openai/chat/completions';
const PIAO_API_KEY = process.env.PIAO_API_KEY;
const MODEL = process.env.MODEL || 'deepseek/deepseek-v3-0324';

/**
 * 代码生成的Serverless函数
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

  try {
    // 获取请求体中的提示内容
    const { prompt, model = 'deepseek' } = req.body;

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: '请提供有效的prompt参数' });
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

    // 调用派欧云API
    const piaoResponse = await axios.post(
      PIAO_API_URL, 
      {
        model: MODEL,
        messages: [
          { role: "system", content: "你是一名专业的前端开发工程师，精通HTML、CSS和JavaScript。你的任务是根据用户的需求生成完整可运行的HTML代码。生成的HTML代码应该是移动端友好的，使用现代CSS和JavaScript功能，确保代码结构清晰、运行高效。" },
          { role: "user", content: promptText }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PIAO_API_KEY}`
        },
        timeout: 60000 // 60秒超时，防止长时间等待
      }
    );

    // 提取生成的代码
    const generatedCode = piaoResponse.data.choices[0].message.content.trim();
    
    // 如果返回的内容包含代码块标记(```html和```)，则提取其中的代码
    let cleanCode = generatedCode;
    if (generatedCode.includes('```html')) {
      cleanCode = generatedCode.split('```html')[1].split('```')[0].trim();
    } else if (generatedCode.includes('```')) {
      cleanCode = generatedCode.split('```')[1].split('```')[0].trim();
    }

    // 返回生成的代码
    return res.status(200).json({ 
      code: cleanCode,
      success: true
    });
  } catch (error) {
    console.error('调用派欧云API出错:', error);
    
    // 构建详细的错误信息
    const errorMessage = error.response 
      ? `状态码: ${error.response.status}, 详情: ${JSON.stringify(error.response.data)}`
      : error.message;
      
    return res.status(500).json({ 
      error: '生成代码时发生错误', 
      details: errorMessage,
      success: false
    });
  }
}; 