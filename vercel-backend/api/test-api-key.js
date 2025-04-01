// 导入依赖模块
const axios = require('axios');
require('dotenv').config();

/**
 * API密钥测试，用于验证用户提供的派欧云API密钥是否有效
 * @param {object} req - HTTP请求对象
 * @param {object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  // 获取请求体中的API密钥
  const { apiKey } = req.body;

  // 验证请求参数
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ 
      error: '请提供有效的API密钥',
      success: false 
    });
  }

  // 派欧云API端点
  const PIAO_API_URL = 'https://api.ppinfra.com/v3/openai/models';

  try {
    // 发送测试请求到派欧云API
    const response = await axios.get(PIAO_API_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000 // 10秒超时
    });

    // 返回测试结果
    return res.status(200).json({
      success: true,
      message: 'API密钥有效',
      models: response.data.data || []
    });
  } catch (error) {
    console.error('API密钥测试失败:', error);
    
    // 构建详细的错误信息
    const errorMessage = error.response 
      ? `状态码: ${error.response.status}, 详情: ${JSON.stringify(error.response.data)}`
      : error.message;
      
    return res.status(error.response?.status || 500).json({ 
      error: 'API密钥无效或测试失败', 
      details: errorMessage,
      success: false
    });
  }
}; 