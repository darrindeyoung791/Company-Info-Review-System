import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()

class Config:
    # 应用基础配置
    DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # 安全配置
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set in environment")
    
    # 密码配置
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
    if not ADMIN_PASSWORD:
        raise ValueError("No ADMIN_PASSWORD set in environment")
    
    # 密码哈希存储
    ADMIN_PASSWORD_HASH = generate_password_hash(ADMIN_PASSWORD)
    
    # 登录限制配置
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_LOCK_TIME = 300  # 5分钟锁定时间(秒)
    
    # MySQL数据库配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
    MYSQL_USER = os.getenv('MYSQL_USER', 'flask_user')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    if not MYSQL_PASSWORD:
        raise ValueError("No MYSQL_PASSWORD set in environment")
    MYSQL_DB = os.getenv('MYSQL_DB', 'wechat_app')
    
    # MySQL连接池配置
    MYSQL_POOL_SIZE = 5
    MYSQL_POOL_RECYCLE = 3600  # 连接回收时间(秒)
    
    # 会话配置
    PERMANENT_SESSION_LIFETIME = 3600  # 1小时会话有效期(秒)
    SESSION_COOKIE_SECURE = not DEBUG  # 生产环境启用安全cookie
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
