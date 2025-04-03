# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # 加载.env文件

class Config:
    # MySQL配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')      # 数据库IP/域名
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))        # 端口
    MYSQL_USER = os.getenv('MYSQL_USER', 'flask_user')     # 用户名
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')       # 密码
    MYSQL_DB = os.getenv('MYSQL_DB', 'wechat_app')         # 数据库名
    MYSQL_DATABASE_CHARSET = 'utf8mb4'
    
    # 可选：连接池配置
    MYSQL_POOL_SIZE = 5
    MYSQL_POOL_RECYCLE = 3600