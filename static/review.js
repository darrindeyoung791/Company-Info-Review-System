document.addEventListener('DOMContentLoaded', () => {
    // 获取公司数据
    let companies = [];
    let currentIndex = 0;
    
    // 从数据库获取待审核公司
    fetch('/api/companies/unreviewed')
        .then(response => response.json())
        .then(data => {
            companies = data;
            updateProgress();
            if (companies.length > 0) {
                loadCompany(currentIndex);
            } else {
                showCompleteDialog();
            }
        })
        .catch(error => console.error('Error:', error));

    // 加载公司信息
    function loadCompany(index) {
        if (index >= 0 && index < companies.length) {
            const company = companies[index];
            document.getElementById('company-name').textContent = company.company_name || '未获取信息';
            document.getElementById('company-license').textContent = company.company_LicenseNumber || '未获取信息';
            document.getElementById('company-location').textContent = company.company_location || '未获取信息';
            
            // 更新搜索链接
            document.querySelectorAll('.search-link').forEach(link => {
                const site = link.dataset.site;
                const type = link.dataset.type;
                let query = '';
                
                if (type === 'company') {
                    query = company.company_name || '';
                } else if (type === 'license') {
                    query = company.company_LicenseNumber || '';
                } else if (type === 'map') {
                    query = company.company_location || '';
                }
                
                if (site === 'baidu') {
                    link.href = type === 'map' ? `https://map.baidu.com/search/${encodeURIComponent(query)}` : `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                } else if (site === 'bing') {
                    link.href = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                } else if (site === 'qichacha') {
                    link.href = `https://www.qcc.com/web/search?key=${encodeURIComponent(query)}`;
                } else if (site === 'tianyancha') {
                    link.href = `https://www.tianyancha.com/search?key=${encodeURIComponent(query)}`;
                }
            });
        }
    }

    // 更新进度条
    function updateProgress() {
        const total = companies.length;
        const reviewed = companies.filter(c => c.company_IsReviewed).length;
        const progressText = `${reviewed}/${total}`;
        const progressPercent = (reviewed / total) * 100;
        
        document.getElementById('progress-text').textContent = progressText;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    }

    // 复制功能
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const text = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                showSnackbar('复制成功');
            }).catch(err => {
                console.error('复制失败:', err);
            });
        });
    });

    // 显示snackbar
    function showSnackbar(message) {
        const snackbar = document.getElementById('snackbar');
        snackbar.querySelector('span:last-child').textContent = message;
        snackbar.classList.add('show');
        
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 3000);
    }

    // 显示完成对话框
    function showCompleteDialog() {
        const dialog = document.getElementById('complete-dialog');
        dialog.classList.remove('hidden');
        document.getElementById('close-btn').focus();
    }

    // 审核操作
    function reviewCompany(isApproved) {
        const companyId = companies[currentIndex].company_id;
        
        fetch('/api/companies/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                company_id: companyId,
                is_approved: isApproved
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                companies[currentIndex].company_IsReviewed = true;
                companies[currentIndex].company_IsVerified = isApproved;
                
                currentIndex++;
                if (currentIndex < companies.length) {
                    loadCompany(currentIndex);
                } else {
                    showCompleteDialog();
                }
                updateProgress();
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // 确认对话框
    function showConfirmDialog(isApproved) {
        const dialog = document.getElementById('confirm-dialog');
        dialog.classList.remove('hidden');
        
        document.getElementById('confirm-title').textContent = isApproved ? '确认通过' : '确认不通过';
        document.getElementById('confirm-message').textContent = isApproved 
            ? '您确定要通过此企业的审核吗？' 
            : '您确定要不通过此企业的审核吗？';
        
        // 自动聚焦到确认按钮
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.focus();
        
        confirmBtn.onclick = () => {
            dialog.classList.add('hidden');
            reviewCompany(isApproved);
        };
    }

    // 事件监听
    document.getElementById('approve-btn').addEventListener('click', () => {
        showConfirmDialog(true);
    });

    document.getElementById('reject-btn').addEventListener('click', () => {
        showConfirmDialog(false);
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.getElementById('confirm-dialog').classList.add('hidden');
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        document.getElementById('complete-dialog').classList.add('hidden');
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            showConfirmDialog(true);
        } else if (e.ctrlKey && e.key === 'Backspace') {
            e.preventDefault();
            showConfirmDialog(false);
        }
    });

    // 搜索链接点击事件
    document.querySelectorAll('.search-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;
            if (url) {
                window.open(url, '_blank');
            } else {
                showSnackbar('信息不完整，无法搜索');
            }
        });
    });
});
