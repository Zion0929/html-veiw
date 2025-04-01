/**
 * 状态检查API，用于检查后端服务是否正常运行
 * @param {object} req - HTTP请求对象
 * @param {object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查服务状态
  return res.status(200).json({
    status: 'ok',
    service: 'AI代码生成器API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}; 