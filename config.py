import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 确保从 .env 文件读取密钥
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set in environment")
        
    # 管理员密码
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
    if not ADMIN_PASSWORD:
        raise ValueError("No ADMIN_PASSWORD set in environment")
    
    # MySQL配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
    MYSQL_USER = os.getenv('MYSQL_USER', 'flask_user')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    if not MYSQL_PASSWORD:
        raise ValueError("No MYSQL_PASSWORD set in environment")
    MYSQL_DB = os.getenv('MYSQL_DB', 'wechat_app')    # 可选：连接池配置
    MYSQL_POOL_SIZE = 5
    MYSQL_POOL_RECYCLE = 3600