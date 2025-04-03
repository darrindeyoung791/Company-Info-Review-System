from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from functools import wraps
from flask_mysqldb import MySQL
import time
import logging
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# 确保设置了 session 密钥
if not app.secret_key:
    raise ValueError("No SECRET_KEY set in Flask application config")

# 初始化MySQL
mysql = MySQL(app)

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

# 数据库连接装饰器
def with_db_connection(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            cur = mysql.connection.cursor()
            kwargs['cursor'] = cur
            result = f(*args, **kwargs)
            mysql.connection.commit()
            return result
        except Exception as e:
            mysql.connection.rollback()
            logger.error(f"Database error: {str(e)}")
            return jsonify({
                'success': False,
                'message': '数据库操作失败',
                'error': str(e)
            }), 500
        finally:
            if 'cursor' in kwargs and kwargs['cursor']:
                kwargs['cursor'].close()
    return decorated_function

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    
    if session.get('logged_in'):
        return redirect(url_for('review'))
    
    password = request.form.get('password', '').strip()
    
    if password == 'check_attempts':
        remaining = app.config['MAX_LOGIN_ATTEMPTS'] - session.get('failed_attempts', 0)
        return jsonify({'remaining_attempts': remaining})
    
    if check_login_restriction():
        lock_time = app.config['LOGIN_LOCK_TIME'] - (int(time.time()) - session.get('last_failed_time', 0))
        return jsonify({
            'success': False,
            'message': f'尝试次数过多，请 {lock_time} 秒后重试'
        }), 429
    
    if check_password_hash(app.config['ADMIN_PASSWORD_HASH'], password):
        session['logged_in'] = True
        session['login_time'] = int(time.time())
        session.pop('failed_attempts', None)
        session.pop('last_failed_time', None)
        return redirect(url_for('review'))
    else:
        session['failed_attempts'] = session.get('failed_attempts', 0) + 1
        session['last_failed_time'] = int(time.time())
        remaining = app.config['MAX_LOGIN_ATTEMPTS'] - session['failed_attempts']
        return jsonify({
            'success': False,
            'message': f'密码错误，还剩 {remaining} 次尝试机会',
            'remaining_attempts': remaining
        }), 401

@app.route('/review')
@login_required
def review():
    return render_template('review.html')

@app.route('/api/companies')
@login_required
@with_db_connection
def get_companies(cursor=None):
    try:
        cursor.execute("""
            SELECT company_id, company_name, company_location, 
                   company_LicenseNumber, company_IsReviewed, company_IsVerified
            FROM company_info
            WHERE company_IsReviewed = 0
            ORDER BY company_id
        """)
        
        columns = [column[0] for column in cursor.description]
        companies = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify({
            'success': True,
            'count': len(companies),
            'companies': companies
        })
    except Exception as e:
        logger.error(f"获取公司列表失败: {str(e)}")
        raise

@app.route('/api/companies/<int:company_id>/review', methods=['POST'])
@login_required
@with_db_connection
def review_company(company_id, cursor=None):
    try:
        data = request.get_json()
        is_verified = data.get('is_verified', False)
        
        cursor.execute("""
            UPDATE company_info
            SET company_IsReviewed = 1,
                company_IsVerified = %s
            WHERE company_id = %s
        """, (1 if is_verified else 0, company_id))
        
        return jsonify({
            'success': True,
            'message': '审核状态已更新',
            'company_id': company_id,
            'is_verified': is_verified
        })
    except Exception as e:
        logger.error(f"审核公司 {company_id} 失败: {str(e)}")
        raise

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], 
            host=app.config['HOST'], 
            port=app.config['PORT'])
