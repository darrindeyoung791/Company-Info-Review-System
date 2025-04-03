document.addEventListener('DOMContentLoaded', function () {
    // 模拟数据 - 实际应用中应从后端获取
    const mockCompanies = [
        {
            id: 1,
            name: '腾飞科技有限公司',
            location: '北京市海淀区中关村大街1号',
            license: '91110108MA1234ABCD',
            isReviewed: 0,
            isVerified: 0
        },
        {
            id: 2,
            name: '蓝天餐饮集团',
            location: '上海市浦东新区张江高科园区',
            license: '91310115MA6789EFGH',
            isReviewed: 0,
            isVerified: 0
        },
        {
            id: 3,
            name: '星辰教育咨询',
            location: '广州市天河区珠江新城',
            license: '91440101MA2468JKLM',
            isReviewed: 0,
            isVerified: 0
        },
        {
            id: 4,
            name: '名字特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长的公司',
            location: '名字特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长特别长的地点',
            license: '91510100MA1357NPQR',
            isReviewed: 0,
            isVerified: 0
        },
        {
            id: 5,
            name: '闪电物流有限公司',
            location: '深圳市南山区科技园',
            license: '91440300MA9876STUV',
            isReviewed: 0,
            isVerified: 0
        }
    ];

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
    const searchMenu = document.getElementById('search-menu');

    // 状态变量
    let currentCompanyIndex = 0;
    let companies = [];
    let failedAttempts = 0;
    let lastFailedTime = 0;
    let currentAction = null; // 'approve' or 'reject'
    let currentSearchType = '';
    let currentSearchText = '';

    // 创建工具提示元素
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

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
        closeBtn.addEventListener('click', () => completeDialog.classList.add('hidden'));

        // 复制和查询功能
        document.addEventListener('click', handleCopyAndSearchActions);
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

        // 检查是否被锁定
        if (checkLoginLock()) return;

        // 验证密码 - 实际应用中应与后端验证
        if (password === 'admin123') {
            handleSuccessfulLogin();
        } else {
            handleFailedLogin();
        }
    }

    function checkLoginLock() {
        if (failedAttempts >= 10) {
            const now = Date.now();
            const timeSinceLastFail = (now - lastFailedTime) / (1000 * 60); // 分钟

            if (timeSinceLastFail < 60) {
                const remainingTime = Math.ceil(60 - timeSinceLastFail);
                errorMessage.textContent = `尝试次数过多，请${remainingTime}分钟后再试`;
                return true;
            } else {
                // 一小时已过，重置计数器
                failedAttempts = 0;
            }
        }
        return false;
    }

    function handleSuccessfulLogin() {
        authScreen.classList.add('hidden');
        reviewScreen.classList.remove('hidden');

        // 加载企业数据 - 实际应用中应从后端获取
        companies = [...mockCompanies];
        updateCompanyDisplay();

        // 重置密码输入状态
        passwordInput.value = '';
        errorMessage.textContent = '';
        failedAttempts = 0;
        attemptsCounter.textContent = '';
    }

    function handleFailedLogin() {
        failedAttempts++;
        lastFailedTime = Date.now();
        errorMessage.textContent = '密码错误，请重试';
        attemptsCounter.textContent = `剩余尝试次数: ${10 - failedAttempts}`;

        if (failedAttempts >= 10) {
            errorMessage.textContent = '尝试次数过多，请一小时后重试';
        }
    }

    function updateCompanyDisplay() {
        if (currentCompanyIndex >= companies.length) {
            showCompleteDialog();
            return;
        }

        const company = companies[currentCompanyIndex];
        companyName.textContent = company.name;
        companyLocation.textContent = company.location;
        companyLicense.textContent = company.license;

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

        // 实际应用中应向后端发送请求更新审核状态
        if (currentAction === 'approve') {
            companies[currentCompanyIndex].isReviewed = 1;
            companies[currentCompanyIndex].isVerified = 1;
        } else {
            companies[currentCompanyIndex].isReviewed = 1;
            companies[currentCompanyIndex].isVerified = 0;
        }

        // 移动到下一家企业
        currentCompanyIndex++;
        updateCompanyDisplay();
    }

    function cancelAction() {
        confirmDialog.classList.add('hidden');
        currentAction = null;
    }

    function showCompleteDialog() {
        completeDialog.classList.remove('hidden');
        closeBtn.focus();

    }

    // 添加新的键盘事件处理函数
    function handleDialogKeyEvents(e) {
        // 只有在确认对话框显示时才处理这些按键
        if (confirmDialog.classList.contains('hidden')) return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                confirmAction();
                break;
            case 'Escape':
                e.preventDefault();
                cancelAction();
                break;
        }
    }
    function showTooltip(element, message) {
        const rect = element.getBoundingClientRect();
        tooltip.textContent = message;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    }

    function handleCopyAndSearchActions(e) {
        // 复制功能
        if (e.target.closest('.copy-btn')) {
            handleCopyAction(e);
            return;
        }

        // 查询功能
        if (e.target.closest('.search-btn')) {
            handleSearchAction(e);
            return;
        }

        // 查询菜单项
        if (e.target.closest('.menu-item')) {
            handleSearchMenuItem(e);
            return;
        }

        // 点击外部关闭菜单
        if (!e.target.closest('.search-btn') && !e.target.closest('.menu')) {
            searchMenu.classList.add('hidden');
        }
    }

    // 添加显示snackbar的函数
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

    // 修改复制功能
    function handleCopyAction(e) {
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

    // 修改搜索功能
    document.addEventListener('click', function (e) {
        // 复制功能
        if (e.target.closest('.copy-btn')) {
            handleCopyAction(e);
            return;
        }

        // 搜索功能
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
            // 统一使用百度地图
            url = `https://map.baidu.com/search/${encodedText}`;
        }

        if (url) {
            window.open(url, '_blank');
        }
    }

});