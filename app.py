from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from functools import wraps  # 添加导入
from flask_mysqldb import MySQL
import time
from config import Config

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
    
    # 如果超过最大尝试次数且在锁定时间内
    if (failed_attempts >= app.config['MAX_LOGIN_ATTEMPTS'] and 
        current_time - last_failed_time < app.config['LOGIN_LOCK_TIME']):
        return True
    
    # 如果超过锁定时间，重置尝试次数
    if current_time - last_failed_time >= app.config['LOGIN_LOCK_TIME']:
        session.pop('failed_attempts', None)
        session.pop('last_failed_time', None)
    
    return False


# 登录状态检查装饰器
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in') and request.endpoint != 'login':
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # 如果是GET请求，返回登录页面
    if request.method == 'GET':
        return render_template('index.html')
    
    # 如果用户已登录，返回JSON响应
    if session.get('logged_in'):
        return jsonify({
            'success': True,
            'redirect': url_for('index')
        })
    
    # POST请求处理
    password = request.form.get('password', '').strip()
    
    # 特殊值用于检查剩余尝试次数
    if password == 'check_attempts':
        remaining_attempts = app.config['MAX_LOGIN_ATTEMPTS'] - session.get('failed_attempts', 0)
        return jsonify({
            'remaining_attempts': remaining_attempts
        })
    
    # 检查登录限制
    if check_login_restriction():
        lock_time_remaining = app.config['LOGIN_LOCK_TIME'] - (int(time.time()) - session.get('last_failed_time', 0))
        return jsonify({
            'success': False,
            'message': f'尝试次数过多，请在 {lock_time_remaining} 秒后重试'
        }), 429
    
    # 验证密码
    if password == app.config['ADMIN_PASSWORD']:
        session['logged_in'] = True
        session['login_time'] = int(time.time())
        session.pop('failed_attempts', None)
        session.pop('last_failed_time', None)
        
        return jsonify({
            'success': True,
            'redirect': url_for('index')
        })
    else:
        # 记录失败尝试
        session['failed_attempts'] = session.get('failed_attempts', 0) + 1
        session['last_failed_time'] = int(time.time())
        
        remaining_attempts = app.config['MAX_LOGIN_ATTEMPTS'] - session['failed_attempts']
        
        return jsonify({
            'success': False,
            'message': f'密码错误，还剩 {remaining_attempts} 次尝试机会',
            'remaining_attempts': remaining_attempts
        }), 401

@app.route('/api/companies')
@login_required
def get_companies():
    try:
        cur = mysql.connection.cursor()
        
        # 获取未审核的公司
        cur.execute("""
            SELECT company_id, company_name, company_location, company_LicenseNumber, 
                   company_IsReviewed, company_IsVerified
            FROM company_info
            WHERE company_IsReviewed = 0
            ORDER BY company_id
        """)
        
        companies = []
        columns = [column[0] for column in cur.description]
        for row in cur.fetchall():
            companies.append(dict(zip(columns, row)))
        
        cur.close()
        
        return jsonify({
            'success': True,
            'companies': companies
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/companies/<int:company_id>/review', methods=['POST'])
@login_required
def review_company(company_id):
    try:
        data = request.get_json()
        is_verified = data.get('is_verified', False)
        
        cur = mysql.connection.cursor()
        
        # 更新公司审核状态
        cur.execute("""
            UPDATE company_info
            SET company_IsReviewed = 1,
                company_IsVerified = %s
            WHERE company_id = %s
        """, (1 if is_verified else 0, company_id))
        
        mysql.connection.commit()
        cur.close()
        
        return jsonify({
            'success': True,
            'message': '审核状态已更新'
        })
    
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)