# Company Info Review System for NCNU

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A system designed for NCNU's internal operations, enabling enterprise information visualization and automated review through a MySQL database, Flask backend, and a lightweight web interface built with HTML, CSS, and JavaScript.

# NCNU 企业信息审核系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于 NCNU 内部人员使用的系统。使用MySQL数据库、Flask后端以及基于HTML、CSS和JavaScript构建的轻量级Web界面，实现企业信息的可视化自动化审核。

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
- 单用户操作，不传输密码明文
- 支持审核全流程键盘操作
- 快速复制和多来源查询



## 预览效果（第一版）

![image](https://github.com/user-attachments/assets/beb0d301-f2bb-4705-b4b0-59423452c89e)

![image](https://github.com/user-attachments/assets/639bd92a-43f2-4e2e-897f-0fa66bb74958)

![image](https://github.com/user-attachments/assets/d5a8cc0e-ee5c-4838-aba4-17d4fdaffa65)



## 文件结构

```
/company_review_system
├── app.py                 # 主应用文件
├── config.py              # 配置文件
├── LICENSE
├── README.md
├── requirements.txt       # 依赖文件
├── static/                # 静态文件
│   ├── img/			   # 图像文件
│   │   └── banner/        # 顶栏
│   │       └── logo.png   # logo 图片
│   ├── favicon.svg        # 标签页图片
│   ├── styles.css         # 样式文件
│   ├── login.js           # 登录页面的 JavaScript 文件
│   └── review.js          # 审核页面的 JavaScript 文件
├── templates/             # 网页页面
│   ├── login.html         # 登录页面
│   └── review.html        # 审核页面
├── .env
└── .gitignore
```



## 部署

### 1. 数据库配置

> [!NOTE]
>
> 后期很可能引入多用户审批概念，此处的配置可能会在未来更新

首先需要配置 MySQL 数据库：

> [!CAUTION]
>
> 数据库密码**不要设太简单**，后续所有密码使用 `123456` 仅作演示

```sql
# 创建数据库（这里使用wechat_app作为示例数据库）
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
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
.\\venv\scripts\activate  # Windows PowerShell

# 更新pip并安装依赖
python -m pip install --upgrade pip
pip install -r requirements.txt
```

当前开发环境是 Windows 11 23H2 下的 Python 3.9，如果在其他环境中部署出现错误，请提 issue 或者咨询 AI。

> [!TIP]
>
> 若在 Windows PowerShell 初次激活 Python 虚拟环境，可能无法运行 `Activate.ps1` 并看到如下报错：
>
> ```
> venv\Scripts\activate : 无法加载文件 venv\Scripts\Activate.ps1，因为在此系统上禁止运行脚本。
> ```
>
> 要解决这个问题，使用管理员模式运行 PowerShell，输入：
>
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
>
> 即可解决。
>
> 或者不使用虚拟环境直接全局安装这些库（**不推荐**）



### 3. 环境变量配置

> [!NOTE]
>
> 后期很可能引入多用户审批概念，此处的配置可能会在未来更新

创建 `.env` 文件并设置以下配置：

```ini
# MySQL配置（MYSQL_PASSWORD为第一步设定的密码）
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

这时，使用浏览器访问 `127.0.0.1:5000` 即可访问系统



### 5. 调整主题色

在 `.\static\styles.css` 中的开头处有如下配置：

```css
:root {
    --primary-color: rgb(66 94 145);
    --on-primary: rgb(255 255 255);
    --primary-container: rgb(215 226 255);
    --on-primary-container: rgb(41 70 119);
    --secondary-color: rgb(86 94 113);
    --on-secondary: rgb(255 255 255);
    --secondary-container: rgb(218 226 249);
    --on-secondary-container: rgb(62 71 89);
    --error-color: rgb(186 26 26);
    --on-error: rgb(255 255 255);
    --surface: rgb(249 249 255);
    --on-surface: rgb(26 28 32);
    --outline: rgb(116 119 127);
    --surface-variant: rgb(224 226 236);
    --on-surface-variant: rgb(68 71 78);
}
```

可以使用 [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/) 和一张颜色合适的图片提取其主题色，并以 **Web (CSS)** 导出（Export）得到三种对比程度的亮色深色主题配色。

更改 `.\static\styles.css` 中的颜色为对应的颜色即可，这个过程用 AI 处理会更方便。此处影响登录和审批页面的主题颜色。

同时更改 `.\static\favicon.svg` 中更改 `fill="rgb(66 94 145)"`处的 RGB 数值为 `--primary-color` 的颜色。此处影响网站标签页的图标颜色。



### 6. 变更顶栏 logo

请更改 `.\static\img\banner\logo.png` 文件。推荐使用透明底色的图。

如果图片不是 png 图像，请选择将 `.\templates\review.html` 中 `app-bar` 中的 `app-bar-left` 里的路径更改为对应的图像后缀名，或将你的图片转换格式为 png。
