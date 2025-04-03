from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_mysqldb import MySQL
import time
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# 初始化MySQL
mysql = MySQL(app)

# 登录状态检查装饰器
def login_required(f):
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password', '').strip()
        
        # 检查登录限制
        if check_login_restriction():
            return jsonify({
                'success': False,
                'message': '尝试次数过多，请稍后再试'
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
                'message': '密码错误',
                'remaining_attempts': remaining_attempts
            }), 401
    
    return redirect(url_for('index'))

def check_login_restriction():
    """检查是否达到登录限制"""
    failed_attempts = session.get('failed_attempts', 0)
    last_failed_time = session.get('last_failed_time', 0)
    
    if failed_attempts >= app.config['MAX_LOGIN_ATTEMPTS']:
        current_time = int(time.time())
        if current_time - last_failed_time < app.config['LOGIN_LOCK_TIME']:
            return True
        else:
            # 锁定时间已过，重置计数器
            session.pop('failed_attempts', None)
            session.pop('last_failed_time', None)
    
    return False

@app.route('/logout')
@login_required
def logout():
    session.clear()
    return redirect(url_for('index'))

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
    app.run(debug=True)