from flask import Flask, render_template, request, redirect, Response, session
import pymysql
import json
import time
from funcs import *

app = Flask(__name__)
app.secret_key = 'apsiodjapokfdkfjasdklasdfjkasdl'

conn = pymysql.connect(host = 'localhost', port = 3306, user = 'root', password = 'skysky', database = 'SkyzhouTop', charset = 'utf8')
cursor = conn.cursor()


@app.route('/')
def index():
    clientIP = request.environ.get('REMOTE_ADDR')
    print(clientIP)
    if 'username' in session:
        username = session['username']
        level = get_level(username)
        return render_template('index.html', {'clientIP': clientIP}, {'username': username}, {'level': level})
    else:
        redirect('/login')

@app.route('/login')
def login():
    return render_template('login_bg.html')

@app.route('/logintest', methods = ['POST', 'GET'])
def logintest():
    username = request.form.get('username')
    password = request.form.get('password')
    print(username, password)
    global jspylogin
    if(username == None and password == None):
        print("No enter!")
        return "NO LOGIN!"
    elif(check_pwd(username, password) == True):
        print("Login Success!")
        session['username'] = username
        session['level'] = get_level(username)

        clientIP = request.environ.get('REMOTE_ADDR')
        with open('login.log', 'a', encoding='utf-8') as f:
            f.write(username+" "+clientIP+" "+time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())+"\n")
        
        redirect('/')
        return "CORRECT!!!"
    elif(username == 'LOGOUT' and password == 'LOGOUT'):
        session.pop('username', None)
        session.pop('level', None)
        return render_template('login_bg.html')
    else:
        print("Wrong username or password!")
        session.pop('username', None)
        session.pop('level', None)
        return "WRONG!"

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/registertest', methods = ['POST', 'GET'])
def registertest():
    username = request.form.get('username')
    password = request.form.get('password')
    password2 = request.form.get('password2')
    print(username, password, password2)
    if(username == '' or password == '' or password2 == ''):
        return "Please Enter!"
    elif(check_user(username) == False and password == password2):
        sql = "insert into top values ('%s', '%s', 'User');" %(username, password)
        print (sql)
        cursor.execute(sql)
        conn.commit()
        return "Register Success!!! Now you can use your account to login Skyzhou.top!"
    else:
        return "Register Failed!"
    return(username, password, password2)

@app.route('/baidutop', methods = ['POST', 'GET'])
def showchart():
    s = request.environ.get('beaker.session')
    username = s.get('user')
    password = s.get('password')
    if not username or not password:
        redirect('/login')
    return render_template('mix.html')

@app.route('/review/df', methods = ['POST', 'GET'])
def df():
    f = open('./review/df.html','r',encoding='utf8')
    return f.read()

@app.route('/review/wmw', methods = ['POST', 'GET'])
def wmw():
    f = open('./review/wmw.html','r',encoding='utf8')
    return f.read()

@app.route('/review', methods = ['POST', 'GET'])
def idx():
    f = open('./review/idx.html','r',encoding='utf8')
    return f.read()

@app.route('/jspy_send', methods = ['POST', 'GET'])
def senddata():
    Data = request.POST.get('Send_data')
    Rank = request.POST.get('Send_rank')
    global pyData, pyRank
    pyData = Data
    pyRank = Rank
    #print(pyData, pyRank)
    print("Get Data and Rank!")
    return None

@app.route('/jspy_getdata', methods = ['POST', 'GET'])
def getdata():
    Need_data = request.POST.get('Need_data')
    #print(pyData)
    return str(pyData)

@app.route('/jspy_getrank', methods = ['POST', 'GET'])
def getrank():
    Need_rank = request.POST.get('Need_rank')
    #print(pyRank)
    return str(pyRank)

@app.route('/jspy_user', methods = ['POST', 'GET'])
def senduser():
    username = session['username']
    level = session['level']
    data = {'username' : username, 'level' : 'Tour', 'real_level': level}

    if level == 'SuperAdmin':
        data['level'] = 'icon-super'
    elif level == 'Admin':
        data['level'] = 'icon-admin'
    elif level == '<img src="http://skyzhou.top:8026/crown.png" id = "king-png">':
        data['level'] = 'icon-king'
    elif username == 'YuanXunGeJi':
        data['level'] = 'icon-sjm'
    else:
         data['level'] = 'icon-normal'

    response.content_type = 'application/javascript'
    return(str('const info = ' + json.dumps(data)))

if __name__ == '__main__':
    app.run(host = '172.17.53.140', port = 8023, debug = True)