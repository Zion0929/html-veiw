/**
 * app.js - 主应用入口文件，初始化应用并绑定事件
 */

// 页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('应用正在初始化...');
        
        // 验证API配置
        validateApiConfig();
        
        // 初始化应用组件
        initUI();
        
        // 初始化本地存储
        initStorage();
        
        // 初始化配置
        initConfig();
        
        // 绑定事件处理
        bindEvents();
        
        // 检查浏览器功能
        checkBrowserFeatures();
        
        // 设置长按事件
        setupLongPressEvents();
        
        // 加载应用列表
        loadApps();
        
        // 移动端表单处理（防止滚动）
        setupFormBehavior();
        
        // 初始化图标选择器
        initIconSelector();
        
        // 记录最后访问的标签页
        try {
            const lastTab = localStorage.getItem('lastTab');
            if (lastTab) {
                switchTab(lastTab);
            }
        } catch (e) {
            console.warn('无法读取上次访问的标签页:', e);
        }
        
        console.log('AI程序生成器已初始化完成');
    } catch (error) {
        console.error('应用初始化错误:', error);
        showErrorMessage(`应用初始化失败: ${error.message}。请检查API配置和网络连接后刷新页面。`);
    }
});

/**
 * 验证API配置是否正确
 */
function validateApiConfig() {
    const apiEndpoint = CONFIG.getApiEndpoint();
    
    if (!apiEndpoint) {
        throw new Error('API端点未配置');
    }
    
    if (!apiEndpoint.includes('/api/generate')) {
        console.warn('API端点可能配置不正确，未包含/api/generate路径');
    }
    
    console.log('当前API端点:', apiEndpoint);
}

/**
 * 初始化配置
 * 创建配置界面并设置初始值
 */
function initConfig() {
    // 添加设置按钮到头部
    const headerRight = document.querySelector('.header-right') || document.querySelector('header');
    
    if (headerRight) {
        const settingsButton = document.createElement('button');
        settingsButton.className = 'icon-button settings-button';
        settingsButton.innerHTML = '<span class="icon">⚙️</span>';
        settingsButton.setAttribute('aria-label', '设置');
        settingsButton.onclick = showSettingsModal;
        
        headerRight.appendChild(settingsButton);
    }
    
    // 创建设置模态窗口
    const settingsModal = document.createElement('div');
    settingsModal.id = 'settings-modal';
    settingsModal.className = 'modal';
    settingsModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>应用设置</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="api-endpoint">Vercel API端点:</label>
                    <input type="text" id="api-endpoint" class="full-width" 
                           placeholder="https://your-app-name.vercel.app/api/generate" 
                           value="${CONFIG.API_ENDPOINT}">
                    <small>设置你的Vercel后端API地址 (必须包含/api/generate)</small>
                </div>
                <div class="environment-info">
                    <p>当前环境: <span id="current-env">${CONFIG.isLocalDevelopment() ? '本地开发' : '生产环境'}</span></p>
                    <p>使用的API端点: <span id="current-endpoint">${CONFIG.getApiEndpoint()}</span></p>
                </div>
            </div>
            <div class="modal-footer">
                <button id="save-settings" class="primary-button">保存</button>
                <button id="cancel-settings" class="secondary-button">取消</button>
            </div>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(settingsModal);
    
    // 绑定设置事件
    bindSettingsEvents();
}

/**
 * 显示设置模态窗口
 */
function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        // 更新当前值
        document.getElementById('api-endpoint').value = CONFIG.API_ENDPOINT;
        document.getElementById('current-env').textContent = CONFIG.isLocalDevelopment() ? '本地开发' : '生产环境';
        document.getElementById('current-endpoint').textContent = CONFIG.getApiEndpoint();
        
        modal.style.display = 'block';
    }
}

/**
 * 隐藏设置模态窗口
 */
function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 绑定设置相关事件
 */
function bindSettingsEvents() {
    // 关闭按钮
    const closeButton = document.querySelector('#settings-modal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', hideSettingsModal);
    }
    
    // 取消按钮
    const cancelButton = document.getElementById('cancel-settings');
    if (cancelButton) {
        cancelButton.addEventListener('click', hideSettingsModal);
    }
    
    // 保存按钮
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const apiEndpoint = document.getElementById('api-endpoint').value.trim();
            
            if (apiEndpoint) {
                if (CONFIG.setApiEndpoint(apiEndpoint)) {
                    showToast('设置已保存');
                    
                    // 更新显示的信息
                    document.getElementById('current-endpoint').textContent = CONFIG.getApiEndpoint();
                    
                    hideSettingsModal();
                } else {
                    showToast('API端点无效，未保存');
                }
            } else {
                showToast('请输入有效的API端点');
            }
        });
    }
}

// 检查浏览器必要功能
function checkBrowserFeatures() {
    // 检查localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        console.error('localStorage不可用:', e);
        showErrorMessage('浏览器存储功能不可用，应用可能无法正常工作');
    }
    
    // 检查其他必要功能
    if (!window.JSON) {
        console.error('JSON不支持');
        showErrorMessage('您的浏览器不支持JSON，应用可能无法正常工作');
    }
}

// 显示错误信息
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.style.position = 'fixed';
    errorElement.style.top = '0';
    errorElement.style.left = '0';
    errorElement.style.right = '0';
    errorElement.style.background = '#f44336';
    errorElement.style.color = 'white';
    errorElement.style.padding = '12px 24px';
    errorElement.style.textAlign = 'center';
    errorElement.style.zIndex = '9999';
    errorElement.innerHTML = message;
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '50%';
    closeBtn.style.transform = 'translateY(-50%)';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        document.body.removeChild(errorElement);
    };
    
    errorElement.appendChild(closeBtn);
    document.body.appendChild(errorElement);
    
    // 点击设置按钮
    const settingsBtn = document.createElement('button');
    settingsBtn.innerHTML = '打开设置';
    settingsBtn.style.marginLeft = '10px';
    settingsBtn.style.padding = '4px 8px';
    settingsBtn.style.background = 'white';
    settingsBtn.style.color = '#f44336';
    settingsBtn.style.border = 'none';
    settingsBtn.style.borderRadius = '4px';
    settingsBtn.style.cursor = 'pointer';
    settingsBtn.onclick = function() {
        showSettingsModal();
    };
    
    errorElement.appendChild(settingsBtn);
}

// 设置表单行为
function setupFormBehavior() {
    // 防止输入框自动聚焦引起的滚动问题
    document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('focus', function() {
            // 记录当前滚动位置
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            
            // 输入框聚焦后恢复原来的滚动位置
            setTimeout(() => {
                window.scrollTo(0, scrollTop);
            }, 10);
        });
    });
    
    // 处理虚拟键盘显示/隐藏时的布局调整
    const originalHeight = window.innerHeight;
    window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        if (currentHeight < originalHeight) {
            // 键盘可能已经打开
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
    });
}

// 保存最后访问的标签页
function saveLastTab(tabId) {
    try {
        localStorage.setItem('lastTab', tabId);
    } catch (e) {
        console.warn('无法保存标签页状态:', e);
    }
}

// 扩展switchTab函数，保存最后访问的标签页
const originalSwitchTab = switchTab;
switchTab = function(tabId) {
    originalSwitchTab(tabId);
    saveLastTab(tabId);
};

// 错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('应用错误:', message, source, lineno, colno, error);
    
    // 在开发环境中显示错误
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast(`错误: ${message}`);
    } else {
        // 生产环境只显示通用错误
        showToast('应用发生错误，请刷新页面重试');
    }
    
    return true; // 阻止默认错误处理
}; 