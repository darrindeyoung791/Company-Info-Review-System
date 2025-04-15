from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from functools import wraps
import time
import logging
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# 确保设置了 session 密钥
if not app.secret_key:
    raise ValueError("No SECRET_KEY set in Flask application config")

# 初始化数据库
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}:{Config.MYSQL_PORT}/{Config.MYSQL_DB}?charset=utf8mb4'
db = SQLAlchemy(app)

# 添加登录限制检查函数
def check_login_restriction():
    """检查登录限制"""
    failed_attempts = session.get('failed_attempts', 0)
    last_failed_time = session.get('last_failed_time', 0)
    current_time = int(time.time())
    
    if (failed_attempts >= app.config['MAX_LOGIN_ATTEMPTS'] and 
        current_time - last_failed_time < app.config['LOGIN_LOCK_TIME']):
        return True
    
    if current_time - last_failed_time >= app.config['LOGIN_LOCK_TIME']:
        session.pop('failed_attempts', None)
        session.pop('last_failed_time', None)
    
    return False

# 登录状态检查装饰器
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    return redirect(url_for('review'))

@app.route('/login')
def login():
    if session.get('logged_in'):
        return redirect(url_for('review'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    if session.get('logged_in'):
        return jsonify({'success': True})
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': '无效的请求数据'
            }), 400
            
        password_hash = data.get('password', '').strip()
        
        # 添加调试日志
        logger.info(f"Received password hash length: {len(password_hash)}")
        logger.info(f"Configured password hash length: {len(Config.ADMIN_PASSWORD)}")
        
        if check_login_restriction():
            lock_time = app.config['LOGIN_LOCK_TIME'] - (int(time.time()) - session.get('last_failed_time', 0))
            return jsonify({
                'success': False,
                'message': f'尝试次数过多，请 {lock_time} 秒后重试'
            }), 429
        
        # 比较哈希值
        if password_hash == Config.ADMIN_PASSWORD:
            session['logged_in'] = True
            session.pop('failed_attempts', None)
            session.pop('last_failed_time', None)
            return jsonify({'success': True})
        else:
            session['failed_attempts'] = session.get('failed_attempts', 0) + 1
            session['last_failed_time'] = int(time.time())
            remaining = app.config['MAX_LOGIN_ATTEMPTS'] - session['failed_attempts']
            return jsonify({
                'success': False,
                'message': f'密码错误，还剩 {remaining} 次尝试机会'
            }), 401
            
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '登录处理失败'
        }), 500

@app.route('/review')
@login_required
def review():
    if 'current_company_index' not in session:
        session['current_company_index'] = 0
    return render_template('review.html', fallback_logo=Config.FALLBACK_LOGO_URL)

@app.route('/api/companies')
@login_required
def get_companies():
    try:
        logger.info("Fetching companies from database...")
        
        # 获取统计信息
        stats = db.session.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN company_IsReviewed = 1 THEN 1 ELSE 0 END) as reviewed
            FROM company_info
        """)).mappings().first()
        
        # 获取未审核的公司
        result = db.session.execute(text("""
            SELECT 
                company_id,
                company_name,
                company_location,
                company_LicenseNumber,
                company_IsReviewed,
                company_IsVerified
            FROM company_info
            WHERE company_IsReviewed = 0
            ORDER BY company_id
        """))
        
        companies = [dict(row) for row in result.mappings().all()]
        
        logger.info(f"Found {len(companies)} unreviewed companies")
        
        return jsonify({
            'success': True,
            'count': len(companies),
            'companies': companies,
            'total': stats['total'],
            'reviewed': stats['reviewed']
        })
    except Exception as e:
        logger.error(f"获取公司列表失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取公司列表失败',
            'error': str(e)
        }), 500

@app.route('/api/companies/<int:company_id>/review', methods=['POST'])
@login_required
def review_company(company_id):
    try:
        data = request.get_json()
        is_verified = data.get('is_verified', False)
        
        sql = text("""
            UPDATE company_info
            SET company_IsReviewed = 1,
                company_IsVerified = :is_verified
            WHERE company_id = :company_id
        """)
        
        db.session.execute(sql, {
            'is_verified': 1 if is_verified else 0,
            'company_id': company_id
        })
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '审核状态已更新',
            'company_id': company_id,
            'is_verified': is_verified
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"审核公司 {company_id} 失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '审核公司失败',
            'error': str(e)
        }), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], 
            host=app.config['HOST'], 
            port=app.config['PORT'])
