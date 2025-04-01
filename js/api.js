/**
 * api.js - 负责API请求和代码生成相关功能
 */

// 当前生成的代码
let currentGeneratedCode = '';

// 生成代码
async function generateCode(prompt) {
    try {
        // 显示生成状态
        toggleGenerateState(true);
        
        // 模拟代码生成中的状态消息
        const generatingMessages = [
            "正在分析需求...",
            "思考最佳实现方案...",
            "组织代码结构...",
            "编写HTML结构...",
            "设计CSS样式...",
            "实现JavaScript功能...",
            "优化移动端体验...",
            "代码即将完成..."
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            document.getElementById('generatedCode').innerHTML = 
                `<div class="loading-message">${generatingMessages[messageIndex]}</div>`;
            document.getElementById('progress-text').innerText = generatingMessages[messageIndex];
            document.getElementById('progress-percent').innerText = `${Math.floor((messageIndex + 1) / generatingMessages.length * 100)}%`;
            messageIndex = (messageIndex + 1) % generatingMessages.length;
        }, 1500);
        
        // 获取API端点
        const apiEndpoint = CONFIG.getApiEndpoint();
        
        // 验证API端点
        if (!CONFIG.validateApiConfig()) {
            clearInterval(messageInterval);
            document.getElementById('generatedCode').innerHTML = 
                `<div class="error-message">
                    <p>API端点配置错误</p>
                    <p>当前API端点: ${apiEndpoint}</p>
                    <p>必须包含完整路径: /api/generate</p>
                    <button class="button" onclick="openSettings()">打开设置</button>
                </div>`;
            document.getElementById('progress-text').innerText = "API配置错误";
            document.getElementById('progress-percent').innerText = "0%";
            toggleGenerateState(false);
            return getSampleCode(prompt);
        }
        
        // 如果在本地环境且没有可用后端，使用样例代码
        if (CONFIG.isLocalDevelopment() && !navigator.onLine) {
            // 关闭消息提示
            clearInterval(messageInterval);
            
            // 延迟返回示例代码以模拟API调用时间
            return new Promise(resolve => {
                setTimeout(() => {
                    toggleGenerateState(false);
                    resolve(getSampleCode(prompt));
                }, 3000);
            });
        }
        
        // 调用API
        console.log(`正在调用API: ${apiEndpoint}`);
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'deepseek'
            })
        });
        
        // 关闭消息提示
        clearInterval(messageInterval);
        
        if (!response.ok) {
            // 处理错误，显示错误消息
            console.error(`API错误: ${response.status}`);
            
            let errorMessage = `API响应错误 (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage += `: ${errorData.error}`;
                }
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            
            // 显示错误消息
            document.getElementById('generatedCode').innerHTML = 
                `<div class="error-message">
                    <p>${errorMessage}</p>
                    <p>使用备用代码</p>
                    <button class="button" onclick="openSettings()">检查API设置</button>
                </div>`;
            document.getElementById('progress-text').innerText = "生成失败";
            document.getElementById('progress-percent').innerText = "0%";
            
            // 延迟后返回样例代码
            return new Promise(resolve => {
                setTimeout(() => {
                    toggleGenerateState(false);
                    resolve(getSampleCode(prompt));
                }, 1000);
            });
        }
        
        // 解析响应
        const data = await response.json();
        
        // 高亮显示生成的代码
        const generatedCodeElement = document.getElementById('generatedCode');
        generatedCodeElement.innerHTML = `<pre><code class="language-html">${escapeHtml(data.code)}</code></pre>`;
        document.getElementById('progress-text').innerText = "代码生成完成";
        document.getElementById('progress-percent').innerText = "100%";
        
        // 应用代码高亮
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
        
        // 关闭生成状态
        toggleGenerateState(false);
        
        return data.code;
    } catch (error) {
        console.error('代码生成错误:', error);
        
        // 错误处理，使用备用代码
        const generatedCodeElement = document.getElementById('generatedCode');
        generatedCodeElement.innerHTML = `
            <div class="error-message">
                <p>生成代码时出现错误</p>
                <p>错误详情: ${error.message}</p>
                <p>请检查网络连接或API配置</p>
                <button class="button" onclick="openSettings()">检查API设置</button>
            </div>
        `;
        document.getElementById('progress-text').innerText = "生成失败";
        document.getElementById('progress-percent').innerText = "0%";
        
        // 关闭生成状态并返回备用代码
        toggleGenerateState(false);
        return getSampleCode(prompt);
    }
}

// 关闭生成视图
function closeGenerateView() {
    const generateContainer = document.getElementById('generate-container');
    generateContainer.classList.remove('show');
    setTimeout(() => {
        generateContainer.style.display = 'none';
    }, 300);
}

// 单行代码高亮
function highlightLine(line) {
    // 简单的HTML高亮
    return line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span style="color:#e67e80;">$1</span>')
        .replace(/(&lt;\/?\w+(?:\s+\w+(?:\s*=\s*(?:".*?"|\'.*?\'|[^\'">\s]+))?)*\s*\/?\s*&gt;)/g, '<span style="color:#7fbbb3;">$1</span>')
        .replace(/(&lt;style\b[^>]*&gt;)([\s\S]*?)(&lt;\/style&gt;)/gi, '<span style="color:#7fbbb3;">$1</span>')
        .replace(/(&lt;script\b[^>]*&gt;)([\s\S]*?)(&lt;\/script&gt;)/gi, '<span style="color:#7fbbb3;">$1</span>')
        .replace(/(function|var|let|const|if|else|for|while|return|class|import|export)/g, '<span style="color:#d699b6;">$1</span>')
        .replace(/(\/\/.*)$/gm, '<span style="color:#859289;">$1</span>');
}

// 复制代码
function copyCode() {
    if (!currentGeneratedCode) return;
    
    navigator.clipboard.writeText(currentGeneratedCode)
        .then(() => {
            showToast('代码已复制到剪贴板');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            
            // 备用复制方法
            const textarea = document.createElement('textarea');
            textarea.value = currentGeneratedCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('代码已复制到剪贴板');
        });
}

// 代码高亮
function highlightCode(code) {
    // 简单的HTML高亮
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span class="token string">$1</span>')
        .replace(/(&lt;\/?\w+(?:\s+\w+(?:\s*=\s*(?:".*?"|\'.*?\'|[^\'">\s]+))?)*\s*\/?\s*&gt;)/g, '<span class="token tag">$1</span>')
        .replace(/(&lt;style\b[^>]*&gt;)([\s\S]*?)(&lt;\/style&gt;)/gi, function(match, p1, p2, p3) {
            return '<span class="token tag">' + p1 + '</span><span class="token attr-value">' + p2 + '</span><span class="token tag">' + p3 + '</span>';
        })
        .replace(/(&lt;script\b[^>]*&gt;)([\s\S]*?)(&lt;\/script&gt;)/gi, function(match, p1, p2, p3) {
            return '<span class="token tag">' + p1 + '</span><span class="token attr-value">' + p2 + '</span><span class="token tag">' + p3 + '</span>';
        });
        
    return highlighted;
}

/**
 * 获取示例代码
 * 当API不可用时使用此函数生成示例代码
 * 
 * @param {string} prompt - 用户输入的需求描述
 * @returns {string} 生成的示例HTML代码
 */
function getSampleCode(prompt) {
    // 使用模板字符串生成简单示例
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>生成的应用</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        
        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-top: 0;
            margin-bottom: 20px;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI生成的示例应用</h1>
        <p>根据您的描述：<strong>${prompt}</strong></p>
        <p>这是一个通过AI自动生成的HTML应用。您可以根据需要修改或扩展这个代码。</p>
        <button class="btn" onclick="alert('按钮点击事件')">点击我</button>
    </div>
    
    <script>
        // 页面加载完成时执行
        document.addEventListener('DOMContentLoaded', function() {
            console.log('应用已加载');
        });
    </script>
</body>
</html>`;
}