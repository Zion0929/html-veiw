/**
 * storage.js - 负责本地存储和应用管理相关功能
 */

// 初始化存储
function initStorage() {
    if (!localStorage.getItem('htmlApps')) {
        localStorage.setItem('htmlApps', JSON.stringify([]));
    }
}

// 保存应用
function saveApp() {
    const appName = document.getElementById('app-name').value;
    
    if (!appName.trim()) {
        showToast('请输入应用名称');
        return;
    }
    
    if (!currentGeneratedCode.trim()) {
        showToast('没有可保存的代码');
        return;
    }
    
    if (!selectedIcon) {
        showToast('请选择一个图标');
        return;
    }
    
    const apps = JSON.parse(localStorage.getItem('htmlApps'));
    const newApp = {
        id: Date.now(),
        name: appName,
        icon: selectedIcon,
        code: currentGeneratedCode,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
    };
    
    apps.push(newApp);
    localStorage.setItem('htmlApps', JSON.stringify(apps));
    
    // 关闭模态框和预览界面
    closeModal('save-modal');
    if (isViewingFromAI) {
        closePreview();
    }
    
    document.getElementById('app-name').value = '';
    loadApps();
    switchTab('desktop');
    
    showToast('应用保存成功!');
}

// 加载所有应用
function loadApps() {
    const apps = JSON.parse(localStorage.getItem('htmlApps'));
    const desktop = document.getElementById('app-desktop');
    const emptyState = document.getElementById('empty-state');
    
    desktop.innerHTML = '';
    
    if (apps.length === 0) {
        emptyState.style.display = 'flex';
        setTimeout(() => {
            emptyState.classList.add('show');
        }, 10);
        desktop.classList.remove('show');
        return;
    }
    
    emptyState.classList.remove('show');
    setTimeout(() => {
        emptyState.style.display = 'none';
    }, 300);
    
    // 默认按最后使用时间排序
    apps.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    
    apps.forEach(app => {
        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon ripple';
        appIcon.dataset.appId = app.id;
        appIcon.innerHTML = `
            <div class="app-icon-image" style="background-color: ${getRandomColor()}">${app.icon || app.name.charAt(0).toUpperCase()}</div>
            <div class="app-icon-name">${app.name}</div>
        `;
        
        // 添加点击事件
        appIcon.addEventListener('click', (e) => {
            if (!longPressTimer) { // 如果不是长按事件
                runSavedApp(app.id, app.name);
            }
        });
        
        desktop.appendChild(appIcon);
    });
    
    // 显示应用网格动画
    setTimeout(() => {
        desktop.classList.add('show');
    }, 100);
}

// 运行已保存的应用
function runSavedApp(appId) {
    const apps = JSON.parse(localStorage.getItem('htmlApps'));
    const app = apps.find(a => a.id === parseInt(appId));
    
    if (app) {
        // 更新最后使用时间
        app.lastUsed = new Date().toISOString();
        localStorage.setItem('htmlApps', JSON.stringify(apps));
        
        // 直接调用openPreview，传入appId，表明是从应用列表打开
        openPreview(appId);
    }
}

// 编辑应用
function editApp() {
    if (!currentAppId) return;
    
    const apps = JSON.parse(localStorage.getItem('htmlApps'));
    const app = apps.find(a => a.id === parseInt(currentAppId));
    
    if (app) {
        currentGeneratedCode = app.code;
        
        // 显示代码
        const codeGeneration = document.getElementById('code-generation');
        const codeContent = document.getElementById('code-content');
        
        codeContent.innerHTML = highlightCode(app.code);
        codeGeneration.style.display = 'block';
        setTimeout(() => {
            codeGeneration.classList.add('show');
        }, 10);
        
        // 切换到生成标签页
        switchTab('ai');
        
        // 填充提示
        document.getElementById('prompt-input').value = `编辑应用: ${app.name}`;
        
        showToast('应用已加载到编辑器');
    }
}

// 删除应用
function deleteApp() {
    if (!currentAppId) return;
    
    if (confirm('确定要删除这个应用吗？')) {
        const apps = JSON.parse(localStorage.getItem('htmlApps'));
        const updatedApps = apps.filter(a => a.id !== parseInt(currentAppId));
        localStorage.setItem('htmlApps', JSON.stringify(updatedApps));
        
        loadApps();
        showToast('应用已删除');
    }
}

// 搜索应用
function filterApps(searchTerm) {
    const apps = document.querySelectorAll('.app-icon');
    let hasResults = false;
    
    apps.forEach(app => {
        const appName = app.querySelector('.app-icon-name').textContent.toLowerCase();
        if (appName.includes(searchTerm.toLowerCase())) {
            app.style.display = 'flex';
            hasResults = true;
        } else {
            app.style.display = 'none';
        }
    });
    
    const emptyState = document.getElementById('empty-state');
    if (!hasResults && searchTerm) {
        emptyState.style.display = 'flex';
        emptyState.querySelector('h3').textContent = '没有找到匹配的应用';
        emptyState.querySelector('p').textContent = '尝试不同的搜索词';
        setTimeout(() => {
            emptyState.classList.add('show');
        }, 10);
    } else if (!hasResults) {
        emptyState.style.display = 'flex';
        emptyState.querySelector('h3').textContent = '还没有应用';
        emptyState.querySelector('p').textContent = '使用AI生成并保存你的第一个HTML应用';
        setTimeout(() => {
            emptyState.classList.add('show');
        }, 10);
    } else {
        emptyState.classList.remove('show');
        setTimeout(() => {
            emptyState.style.display = 'none';
        }, 300);
    }
}

// 生成随机颜色
function getRandomColor() {
    const colors = [
        '#d4b483', '#7a7a72', '#a8c3bc', 
        '#e8b9ab', '#c6c8ca', '#f3d7ca',
        '#a2b38b', '#e6ba95', '#9cb4cc'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
} 