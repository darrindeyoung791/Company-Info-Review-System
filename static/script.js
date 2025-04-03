document.addEventListener('DOMContentLoaded', function () {
    // DOM 元素
    const authScreen = document.getElementById('auth-screen');
    const reviewScreen = document.getElementById('review-screen');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const attemptsCounter = document.getElementById('attempts-counter');
    const togglePassword = document.getElementById('toggle-password');

    const companyName = document.getElementById('company-name');
    const companyLocation = document.getElementById('company-location');
    const companyLicense = document.getElementById('company-license');
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');

    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    const completeDialog = document.getElementById('complete-dialog');
    const closeBtn = document.getElementById('close-btn');

    // 状态变量
    let currentCompanyIndex = 0;
    let companies = [];
    let currentAction = null; // 'approve' or 'reject'

    // 初始化
    initEventListeners();

    function initEventListeners() {
        // 密码显示/隐藏切换
        togglePassword.addEventListener('click', togglePasswordVisibility);

        // 登录逻辑
        loginBtn.addEventListener('click', attemptLogin);
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') attemptLogin();
        });

        // 审核按钮事件
        approveBtn.addEventListener('click', () => showConfirmDialog('approve'));
        rejectBtn.addEventListener('click', () => showConfirmDialog('reject'));

        // 键盘快捷键
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // 对话框按钮事件
        confirmBtn.addEventListener('click', confirmAction);
        cancelBtn.addEventListener('click', cancelAction);
        closeBtn.addEventListener('click', () => {
            completeDialog.classList.add('hidden');
            // 重新加载未审核的公司
            loadCompanies();
        });

        // 复制功能
        document.addEventListener('click', handleCopyAction);
    }

    function togglePasswordVisibility() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.textContent = 'visibility';
        } else {
            passwordInput.type = 'password';
            togglePassword.textContent = 'visibility_off';
        }
    }

    function attemptLogin() {
        const password = passwordInput.value.trim();

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `password=${encodeURIComponent(password)}`
        })
        .then(response => {
            if (response.status === 429) {
                // 尝试次数过多
                return response.json().then(data => {
                    throw new Error(data.message);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                handleSuccessfulLogin();
            } else {
                throw new Error(data.message || '登录失败');
            }
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            if (error.message.includes('尝试次数')) {
                attemptsCounter.textContent = '';
            } else {
                // 显示剩余尝试次数
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `password=check_attempts`  // 特殊值仅用于获取尝试次数
                })
                .then(response => response.json())
                .then(data => {
                    if (data.remaining_attempts !== undefined) {
                        attemptsCounter.textContent = `剩余尝试次数: ${data.remaining_attempts}`;
                    }
                });
            }
        });
    }

    function handleSuccessfulLogin() {
        authScreen.classList.add('hidden');
        reviewScreen.classList.remove('hidden');
        
        // 重置密码输入状态
        passwordInput.value = '';
        errorMessage.textContent = '';
        attemptsCounter.textContent = '';
        
        // 加载企业数据
        loadCompanies();
    }

    function loadCompanies() {
        fetch('/api/companies')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    companies = data.companies;
                    currentCompanyIndex = 0;
                    
                    if (companies.length > 0) {
                        updateCompanyDisplay();
                    } else {
                        showCompleteDialog();
                    }
                } else {
                    throw new Error(data.message || '无法加载企业数据');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showSnackbar(error.message);
            });
    }

    function updateCompanyDisplay() {
        if (currentCompanyIndex >= companies.length) {
            showCompleteDialog();
            return;
        }

        const company = companies[currentCompanyIndex];
        companyName.textContent = company.company_name;
        companyLocation.textContent = company.company_location;
        companyLicense.textContent = company.company_LicenseNumber;

        // 更新进度
        progressText.textContent = `${currentCompanyIndex + 1}/${companies.length}`;
        progressFill.style.width = `${((currentCompanyIndex + 1) / companies.length) * 100}%`;
    }

    function handleKeyboardShortcuts(e) {
        if (reviewScreen.classList.contains('hidden')) return;

        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            showConfirmDialog('approve');
        } else if (e.ctrlKey && e.key === 'Backspace') {
            e.preventDefault();
            showConfirmDialog('reject');
        }
    }

    function showConfirmDialog(action) {
        currentAction = action;
        confirmDialog.classList.remove('hidden');
        confirmBtn.focus();

        if (action === 'approve') {
            confirmTitle.textContent = '确认通过审核';
            confirmMessage.textContent = '您确定要通过该企业的审核吗？';
        } else {
            confirmTitle.textContent = '确认不通过审核';
            confirmMessage.textContent = '您确定要不通过该企业的审核吗？';
        }
    }

    function confirmAction() {
        confirmDialog.classList.add('hidden');

        const companyId = companies[currentCompanyIndex].company_id;
        const isVerified = currentAction === 'approve';
        
        fetch(`/api/companies/${companyId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_verified: isVerified })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 移动到下一家企业
                currentCompanyIndex++;
                updateCompanyDisplay();
            } else {
                throw new Error(data.message || '更新审核状态失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showSnackbar(error.message);
        });
    }

    function cancelAction() {
        confirmDialog.classList.add('hidden');
        currentAction = null;
    }

    function showCompleteDialog() {
        completeDialog.classList.remove('hidden');
        closeBtn.focus();
    }

    function handleCopyAction(e) {
        if (!e.target.closest('.copy-btn')) return;
        
        const button = e.target.closest('.copy-btn');
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        const textToCopy = targetElement.textContent;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showSnackbar('复制成功'))
                .catch(err => {
                    fallbackCopy(textToCopy);
                    showSnackbar('复制成功');
                });
        } else {
            fallbackCopy(textToCopy);
            showSnackbar('复制成功');
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // 搜索功能
    document.addEventListener('click', function (e) {
        if (e.target.closest('.search-link')) {
            e.preventDefault();
            const link = e.target.closest('.search-link');
            const site = link.getAttribute('data-site');
            const type = link.getAttribute('data-type');
            let text = '';

            if (type === 'company') {
                text = document.getElementById('company-name').textContent;
            } else if (type === 'license') {
                text = document.getElementById('company-license').textContent;
            } else if (type === 'map') {
                text = document.getElementById('company-location').textContent;
            }

            performSearch(site, type, text);
        }
    });

    function performSearch(site, type, text) {
        let url = '';
        const encodedText = encodeURIComponent(text);

        if (type === 'company' || type === 'license') {
            switch (site) {
                case 'tianyancha':
                    url = `https://www.tianyancha.com/search?key=${encodedText}`;
                    break;
                case 'qichacha':
                    url = `https://www.qcc.com/web/search?key=${encodedText}`;
                    break;
                case 'baidu':
                    url = `https://www.baidu.com/s?wd=${encodedText}`;
                    break;
                case 'bing':
                    url = `https://www.bing.com/search?q=${encodedText}`;
                    break;
            }
        } else if (type === 'map') {
            url = `https://map.baidu.com/search/${encodedText}`;
        }

        if (url) {
            window.open(url, '_blank');
        }
    }

    function showSnackbar(message) {
        const snackbar = document.getElementById('snackbar');
        if (message) {
            snackbar.querySelector('span:not(.material-icons)').textContent = message;
        }
        snackbar.classList.add('show');
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 3000);
    }
});