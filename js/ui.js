/**
 * ui.js - 负责UI交互和组件管理相关功能
 */

// 选中的图标
let selectedIcon = '';
let currentAppId = null;
let longPressTimer = null;
let isViewingFromAI = false; // 标记是否是从AI生成界面进入预览

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加设置按钮到页面
    addSettingsButton();
});

// 添加设置按钮
function addSettingsButton() {
    // 创建设置按钮
    const settingsButton = document.createElement('div');
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = '⚙️';
    settingsButton.onclick = openSettings;
    
    // 添加到页面
    document.body.appendChild(settingsButton);
    
    // 添加设置模态窗口
    if (!document.getElementById('settings-modal')) {
        const settingsModal = document.createElement('div');
        settingsModal.id = 'settings-modal';
        settingsModal.className = 'modal';
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">应用设置</div>
                    <div class="close-button" onclick="closeModal('settings-modal')">×</div>
                </div>
                
                <div class="form-group">
                    <label for="api-endpoint">Vercel API端点</label>
                    <input type="text" id="api-endpoint" placeholder="例如: https://your-app.vercel.app/api/generate">
                    <p class="hint">确保包含完整路径，包括/api/generate</p>
                </div>
                
                <div class="save-button-container">
                    <button class="save-app-button" onclick="saveSettings()">
                        <span class="icon">💾</span> 保存设置
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .settings-button {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                cursor: pointer;
                z-index: 200;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            .hint {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }
}

// 打开设置
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) {
        addSettingsButton();
        return setTimeout(openSettings, 100);
    }
    
    // 填充当前设置
    document.getElementById('api-endpoint').value = CONFIG.API_ENDPOINT;
    
    // 显示设置模态窗口
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 保存设置
function saveSettings() {
    const apiEndpoint = document.getElementById('api-endpoint').value;
    
    if (!apiEndpoint) {
        showToast('请输入有效的API端点');
        return;
    }
    
    if (CONFIG.setApiEndpoint(apiEndpoint)) {
        showToast('设置已保存');
        closeModal('settings-modal');
    } else {
        showToast('保存设置失败');
    }
}

// 切换标签页
function switchTab(tabId) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签页
    const selectedTab = document.getElementById(`${tabId}-tab`);
    selectedTab.classList.add('active');
    
    // 更新底部标签栏
    document.querySelectorAll('.tabbar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`.tabbar-item[onclick="switchTab('${tabId}')"]`).classList.add('active');
    
    // 如果是应用标签页，加载应用
    if (tabId === 'desktop') {
        loadApps();
    }
}

// 打开预览
function openPreview(fromAppId = null) {
    if (!currentGeneratedCode && !fromAppId) return;
    
    isViewingFromAI = !fromAppId; // 标记预览来源
    
    const previewFrame = document.getElementById('preview-frame');
    const previewContainer = document.getElementById('preview-container');
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    const previewFooter = document.getElementById('preview-from-ai');
    
    // 根据来源决定是否显示保存按钮
    if (fromAppId) {
        // 来自应用列表，不显示保存按钮
        previewFooter.style.display = 'none';
    } else {
        // 来自AI生成，显示保存按钮
        previewFooter.style.display = 'flex';
    }
    
    previewFrame.onload = function() {
        previewFrame.classList.add('loaded');
    };
    
    // 如果是从应用列表打开，需要获取应用代码
    let codeToShow = currentGeneratedCode;
    if (fromAppId) {
        const apps = JSON.parse(localStorage.getItem('htmlApps'));
        const app = apps.find(a => a.id === parseInt(fromAppId));
        if (app) {
            codeToShow = app.code;
            document.querySelector('.preview-title').textContent = app.name;
        } else {
            return; // 应用不存在
        }
    } else {
        document.querySelector('.preview-title').textContent = '预览';
    }
    
    previewDoc.open();
    previewDoc.write(codeToShow);
    previewDoc.close();
    
    previewContainer.style.display = 'flex';
    setTimeout(() => {
        previewContainer.classList.add('show');
    }, 10);
}

// 关闭预览
function closePreview() {
    const previewContainer = document.getElementById('preview-container');
    const previewFrame = document.getElementById('preview-frame');
    
    previewContainer.classList.remove('show');
    previewFrame.classList.remove('loaded');
    
    setTimeout(() => {
        previewContainer.style.display = 'none';
    }, 300);
    
    // 重置预览来源标记
    isViewingFromAI = false;
}

// 清空输入
function clearPrompt() {
    document.getElementById('prompt-input').value = '';
    document.getElementById('prompt-input').focus();
}

// 初始化图标选择器
function initIconSelector() {
    const iconSelector = document.getElementById('icon-selector');
    if (!iconSelector) return;
    
    // 移除旧的事件处理器
    const iconOptions = iconSelector.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.onclick = null;
    });
    
    // 添加新的事件处理器
    iconOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            const icon = this.getAttribute('data-icon');
            selectIcon(icon);
        });
    });
}

// 选择图标
function selectIcon(icon) {
    selectedIcon = icon;
    
    // 移除所有选中状态
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 为匹配的图标添加选中状态
    document.querySelectorAll(`.icon-option[data-icon="${icon}"]`).forEach(option => {
        option.classList.add('selected');
        
        // 添加高亮提示信息
        showToast(`已选择 ${icon} 图标`);
    });
}

// 自定义contains选择器
document.querySelectorAll = document.querySelectorAll || function(selector) {
    if (selector.includes(':contains')) {
        const parts = selector.split(':contains');
        const baseSelector = parts[0];
        const text = parts[1].replace(/['"()]/g, '');
        
        const elements = document.querySelectorAll(baseSelector);
        return Array.from(elements).filter(el => el.textContent.includes(text));
    }
    return document.querySelectorAll(selector);
};

// 打开模态框
function openSaveModal() {
    if (!currentGeneratedCode && !isViewingFromAI) {
        showToast('没有可保存的代码');
        return;
    }
    
    const modal = document.getElementById('save-modal');
    modal.style.display = 'flex';
    
    // 设置高层级，确保在预览界面之上显示
    modal.style.zIndex = '300';
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    document.getElementById('app-name').focus();
    
    // 初始化图标选择器
    initIconSelector();
    
    // 默认选中第一个图标
    const firstIcon = document.querySelector('.icon-option');
    if (firstIcon) {
        const iconText = firstIcon.getAttribute('data-icon');
        selectIcon(iconText);
    } else {
        selectIcon('🚀');
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// 分享应用
function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: document.querySelector('.preview-title').textContent,
            text: '查看我使用AI程序生成器创建的应用',
            url: window.location.href
        })
        .then(() => console.log('分享成功'))
        .catch((error) => console.log('分享失败', error));
    } else {
        // 不支持Web Share API
        copyCode();
        showToast('代码已复制，您可以将其粘贴到文本编辑器中保存');
    }
}

// 长按事件处理
function setupLongPressEvents() {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
}

function handleTouchStart(e) {
    const appIcon = e.target.closest('.app-icon');
    if (appIcon) {
        currentAppId = appIcon.dataset.appId;
        longPressTimer = setTimeout(() => {
            showContextMenu(e, appIcon);
        }, 500); // 500毫秒长按触发
    }
}

function handleTouchEnd(e) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
}

function handleTouchMove(e) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
}

// 显示上下文菜单
function showContextMenu(e, targetElement) {
    e.preventDefault();
    
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    
    // 计算位置
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    menu.style.left = `${centerX - 80}px`;
    menu.style.top = `${centerY - 60}px`;
    
    setTimeout(() => {
        menu.classList.add('show');
    }, 10);
    
    // 点击其他地方关闭菜单
    const closeMenu = () => {
        menu.classList.remove('show');
        setTimeout(() => {
            menu.style.display = 'none';
        }, 300);
        document.removeEventListener('click', closeMenu);
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
}

// 显示Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '24px';
    toast.style.zIndex = '1000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * 处理生成按钮点击事件
 */
async function handleGenerateClick() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showToast('请输入应用描述');
        return;
    }
    
    try {
        // 显示代码生成框
        const codeGenerationBox = document.getElementById('code-generation-box');
        codeGenerationBox.style.display = 'block';
        
        // 禁用生成按钮
        toggleGenerateButton(true);
        
        // 调用代码生成函数
        const generatedCode = await generateCode(prompt);
        
        // 保存生成的代码
        currentGeneratedCode = generatedCode;
        
        // 将代码保存到代码内容区域
        document.getElementById('code-content').innerHTML = highlightCode(currentGeneratedCode);
        
        // 自动显示预览
        setTimeout(() => {
            openPreview();
        }, 1000);
    } catch (error) {
        console.error('代码生成失败:', error);
        showToast('代码生成失败，请重试');
    } finally {
        // 恢复生成按钮状态
        toggleGenerateButton(false);
    }
}

/**
 * 切换生成按钮状态
 * @param {boolean} isLoading - 是否正在加载
 */
function toggleGenerateButton(isLoading) {
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.disabled = isLoading;
        generateBtn.innerHTML = isLoading 
            ? '<span class="loading"></span> 生成中...' 
            : '<span class="icon">✨</span> 生成';
    }
}

/**
 * 切换生成状态
 * @param {boolean} isGenerating - 是否正在生成
 */
function toggleGenerateState(isGenerating) {
    // 显示或隐藏代码生成框
    const codeGenerationBox = document.getElementById('code-generation-box');
    if (codeGenerationBox) {
        codeGenerationBox.style.display = isGenerating ? 'block' : 'none';
    }
    
    // 切换生成按钮状态
    toggleGenerateButton(isGenerating);
}

/**
 * 高亮显示代码片段
 * @param {string} code - 代码字符串 
 * @returns {string} 高亮后的HTML
 */
function highlightCode(code) {
    if (!code) return '';
    
    // 简单的语法高亮，可以用更复杂的库替换
    return code
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span class="string">$1</span>')
        .replace(/(&lt;\/?\w+(&gt;)?)/g, '<span class="tag">$1</span>')
        .replace(/(&lt;style&gt;[\s\S]*?&lt;\/style&gt;)/g, '<span class="style">$1</span>')
        .replace(/(&lt;script&gt;[\s\S]*?&lt;\/script&gt;)/g, '<span class="script">$1</span>');
}

/**
 * 转义HTML特殊字符
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}