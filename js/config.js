/**
 * config.js - 应用配置文件
 */

/**
 * 全局配置
 * 包含API端点和其他配置选项
 */
const CONFIG = {
    // Vercel API端点
    API_ENDPOINT: 'https://html-view-navy.vercel.app/api/generate',
    
    // 本地开发API端点
    LOCAL_API_ENDPOINT: 'http://localhost:3000/api/generate',
    
    // 判断是否为本地开发环境
    isLocalDevelopment: function() {
        // 通过URL判断，如果在localhost或使用file://协议，则视为本地环境
        return window.location.hostname === 'localhost' 
            || window.location.hostname === '127.0.0.1'
            || window.location.protocol === 'file:';
    },
    
    // 获取当前环境下应使用的API端点
    getApiEndpoint: function() {
        return this.isLocalDevelopment() ? this.LOCAL_API_ENDPOINT : this.API_ENDPOINT;
    },
    
    // 用户可以在此处更改API端点
    setApiEndpoint: function(endpoint) {
        if (endpoint && typeof endpoint === 'string') {
            // 确保API端点包含/api/generate路径
            if (!endpoint.endsWith('/api/generate')) {
                // 如果不是以/api/generate结尾，添加该路径
                endpoint = endpoint.endsWith('/') ? endpoint + 'api/generate' : endpoint + '/api/generate';
            }
            this.API_ENDPOINT = endpoint;
            // 存储到本地，以便下次使用
            localStorage.setItem('custom_api_endpoint', endpoint);
            console.log('API端点已更新:', endpoint);
            return true;
        }
        return false;
    },
    
    // 验证API端点配置
    validateApiConfig: function() {
        const currentEndpoint = this.getApiEndpoint();
        // 检查是否包含完整API路径
        if (!currentEndpoint.includes('/api/generate')) {
            console.error('API端点配置错误: 缺少/api/generate路径');
            return false;
        }
        return true;
    },
    
    // 初始化配置，从本地存储加载自定义设置
    init: function() {
        const savedEndpoint = localStorage.getItem('custom_api_endpoint');
        if (savedEndpoint) {
            this.API_ENDPOINT = savedEndpoint;
        }
        this.validateApiConfig();
    }
};

// 初始化配置
CONFIG.init(); 