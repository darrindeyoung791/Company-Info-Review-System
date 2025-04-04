# Company Info Review System for NCNU 

This system is intended for internal use within NCNU to facilitate the visualization and automated review of enterprise information. It is built with a MySQL database, a Flask backend, and a straightforward web interface using HTML, CSS, and JavaScript.

# NCNU 企业信息审核系统

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
- （仿）Material Design 3 风格界面
- 前端单用户密码验证
- 支持审核全流程键盘操作
- 快速复制和多来源查询

## 预览效果

![image](https://github.com/user-attachments/assets/beb0d301-f2bb-4705-b4b0-59423452c89e)

![image](https://github.com/user-attachments/assets/43c88ae2-a38c-4f27-9205-bdb5ff66eedc)

![image](https://github.com/user-attachments/assets/639bd92a-43f2-4e2e-897f-0fa66bb74958)

![image](https://github.com/user-attachments/assets/342058bf-7e40-43e0-ba84-23788a880eae)

![image](https://github.com/user-attachments/assets/d5a8cc0e-ee5c-4838-aba4-17d4fdaffa65)

![image](https://github.com/user-attachments/assets/000a3745-95f9-412c-b46d-8c3bcbbdc2a4)

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
│   └── review.js          # 审核页面的JavaScript文件
├── templates/             # 网页页面
│   ├── login.html         # 登录页面
│   └── review.html        # 审核页面
├── .env
└── .gitignore
```

## 部署

### 1. 数据库配置

首先需要配置 MySQL 数据库：

```sql
# 创建数据库
CREATE DATABASE wechat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'flask_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON wechat_app.* TO 'flask_user'@'localhost';
FLUSH PRIVILEGES;

# 创建数据表
USE wechat_app;
CREATE TABLE company_info (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_location VARCHAR(100),
    company_LicenseNumber VARCHAR(255),
    company_IsReviewed TINYINT(1) DEFAULT 0,
    company_IsVerified TINYINT(1) DEFAULT 0
);
```

### 2. Python环境配置

推荐使用虚拟环境进行部署：

```bash
# 创建并激活虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 更新pip并安装依赖
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. 环境变量配置

创建 `.env` 文件并设置以下配置：

```ini
# MySQL配置
MYSQL_HOST="127.0.0.1"
MYSQL_USER="flask_user"
MYSQL_PASSWORD="123456"
MYSQL_DB="wechat_app"
MYSQL_PORT=3306

# 安全配置
SECRET_KEY="生成一个随机密钥"
ADMIN_PASSWORD="设置管理员密码"

# 登录限制配置
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCK_TIME=300
```

### 4. 运行应用

```bash
# 开发环境
python app.py
```
