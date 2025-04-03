import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 数据库配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
    MYSQL_DB = os.getenv('MYSQL_DB', 'wechat_app')
    
    # 应用配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')  # 实际生产环境应使用hash
    
    # 安全配置
    MAX_LOGIN_ATTEMPTS = 10
    LOGIN_LOCK_TIME = 3600  # 1小时(秒)