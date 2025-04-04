document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('toggle-password');
    const attemptsCounter = document.getElementById('attempts-counter');

    // 显示/隐藏密码
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.textContent = 'visibility';
        } else {
            passwordInput.type = 'password';
            togglePassword.textContent = 'visibility_off';
        }
    });

    // 登录按钮点击事件
    loginBtn.addEventListener('click', function() {
        performLogin();
    });

    // 密码输入框回车事件
    passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performLogin();
        }
    });

    // 登录请求函数
    function performLogin() {
        const password = passwordInput.value.trim();
        
        // 发送登录请求到后端验证
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 登录成功，跳转到审批页面
                window.location.href = '/review';
            } else {
                // 显示错误信息和剩余尝试次数（如果有）
                errorMessage.textContent = data.message;
                if (data.remaining_attempts !== undefined) {
                    attemptsCounter.textContent = `剩余尝试次数: ${data.remaining_attempts}`;
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = '登录失败，请重试';
        });
    }
});
