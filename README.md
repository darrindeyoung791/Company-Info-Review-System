# Company Info Review System for NCNU (Not yet completed)

This system is intended for internal use within NCNU to facilitate the visualization and automated review of enterprise information. It is built with a MySQL database, a Flask backend, and a straightforward web interface using HTML, CSS, and JavaScript.

# NCNU 企业信息审核系统（开发中）

此系统用于 NCNU 内部人员可视化自动化审核企业信息。使用 MySQL 数据库和 Flask 后端，以及使用简易的 HTML、CSS、JS 制作的网页界面。

> [!CAUTION]
>
> This project **shall not** be used in any scenarios where safety is required. It is only applicable to stable and controllable internal environments.
>
> This project is currently Chinese(simplified) only.
>
> 这个项目**不应当**用于任何对安全有要求的场景，仅适用于稳定可控的内部环境。

## 特性

- 流式布局，适应各类显示设备
- 前端单用户密码验证
- 支持审核全流程键盘操作
- 快速复制和查询

## 文件结构（包含 todo）

```
/company_review_system
├── app.py                 # 主应用文件
├── config.py              # 配置文件
├── LICENSE
├── README.md
├── requirements.txt       # 依赖文件
├── static/                # 静态文件
│   ├── styles.css         # 样式文件
│   ├── login.js           # 登录页面的JavaScript文件
│   ├── review.js          # 审核页面的JavaScript文件
│   └── script.js          # 已弃用
├── templates/             # 网页页面
│   ├── login.html         # 登录页面
│   ├── review.html        # 审核页面
│   └── index.html         # 已弃用
├── .env
└── .gitignore

```

## 部署

> [!NOTE]
>
> 截至最新一次提交，暂时没有完成 Flask 后端建设

当前，仅需下载 `static/` 文件夹和 `index.html` 即可本地预览网页。并且可以尝试 5 个示例。

要部署 Flask 后端，请安装 Python 3.8（在作者本人的环境下使用的是 Windows 下的 Python 3.9）, 更新 pip：

```bash
pip install --upgrade pip
```

安装依赖：

```bash
pip install -r requirements.txt
```

当然，部署时请考虑是否需要使用 Python 虚拟环境。

```bash
# 创建项目目录
mkdir company_review_system
cd company_review_system

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

配置环境变量

```
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=wechat_app
ADMIN_PASSWORD=your_admin_password
SECRET_KEY=your_secret_key
```

运行应用

```
python app.py
```

## 预览效果

![login_image](https://github.com/user-attachments/assets/efa9325f-6f15-467f-beaf-6a0bd80344a1)

![info_review_image](https://github.com/user-attachments/assets/22091d71-4239-4745-b3fa-9c01c0435e6b)

![comfirm_image](https://github.com/user-attachments/assets/354cf4f8-1e16-4ceb-9410-d37df374a8f2)
