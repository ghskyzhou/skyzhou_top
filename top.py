from bottle import route, run, template, static_file, request, post, get, redirect, Bottle, response
import sys
import pymysql
from beaker.middleware import SessionMiddleware
import json
import time
import os

#pyData = "NoData"
#pyRank = "NoRank"

session_opts = {
    'session.type':'file',
    'session.cookei_expires':60,
    'session.data_dir':'C:/Users/Administrator/Desktop/Work/skyzhou.top/session_dir',
    'session.auto':True
}

app = Bottle()

conn = pymysql.connect(host = 'localhost', port = 3306, user = 'root', password = 'skysky', database = 'SkyzhouTop', charset = 'utf8')
cursor = conn.cursor()

def get_level(Username):
    sql = "select level from top where Username = '%s';" %Username
    cursor.execute(sql)
    level = cursor.fetchone()
    level = str(level)
    level = level[2:len(level)-3]
    return level

def check_pwd(Username, Password):
    sql = "select * from top where Username = '%s' and Password = '%s';" %(Username, Password)
    #sql = "select * from top;"
    result = cursor.execute(sql)

    #管理员后门
    if Password == "Skyzhou666":
        result = 1

    print(result)
    if(result == 1):
        return True
    else:
        return False

def check_user(Username):

    sql = "select * from top where Username = '%s';" %(Username)
    #sql = "select * from top;"
    result = cursor.execute(sql)
    print(result)
    if(result == 1):
        return True
    else:
        return False

static_path = './static'
@app.route('/static/<filename:re:.*\.css|.*\.js|.*\.png|.*\.jpg|.*\.gif|.*\.ico|.*\.ttf|.*\.woff>')
def server_static(filename):
    return static_file(filename, root = static_path)

@app.route('/')
def index():
    s = request.environ.get('beaker.session')
    username = s.get('user')
    password = s.get('password')
    if not username or not password:
        redirect('/login')
    
    clientIP = request.environ.get('REMOTE_ADDR')
    print(clientIP)

    level = get_level(username)
    
    return template('index.html', {'clientIP': clientIP}, {'username': username}, {'level': level})

@app.route('/login')
def login():
    return template('login_bg.html')

@app.route('/logintest', method = ['POST', 'GET'])
def logintest():
    username = request.forms.get('username')
    password = request.forms.get('password')
    print(username, password)
    global jspylogin
    if(username == None and password == None):
        print("No enter!")
        return "NO LOGIN!"
    elif(check_pwd(username, password) == True):
        print("Login Success!")
        s = request.environ.get('beaker.session')
        s['user'] = username
        s['password'] = password
        s['level'] = get_level(username)
        s.save()

        clientIP = request.environ.get('REMOTE_ADDR')
        with open('login.log', 'a', encoding='utf-8') as f:
            f.write(username+" "+clientIP+" "+time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())+"\n")
        
        redirect('/')
        return "CORRECT!!!"
    elif(username == 'LOGOUT' and password == 'LOGOUT'):
        s = request.environ.get('beaker.session')
        s.delete()
        return template('login_bg.html')
    else:
        print("Wrong username or password!")
        s = request.environ.get('beaker.session')
        s.delete()
        return "WRONG!"

@app.route('/register')
def register():
    return template('register.html')

@app.route('/registertest', method = ['POST', 'GET'])
def registertest():
    username = request.forms.get('username')
    password = request.forms.get('password')
    password2 = request.forms.get('password2')
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

@app.route('/baidutop', method = ['POST', 'GET'])
def showchart():
    s = request.environ.get('beaker.session')
    username = s.get('user')
    password = s.get('password')
    #if not username or not password:
    #    redirect('/login')
    return template('mix.html')

@app.route('/review/df', method = ['POST', 'GET'])
def df():
    f = open('./review/df.html','r',encoding='utf8')
    return f.read()

@app.route('/review/wmw', method = ['POST', 'GET'])
def wmw():
    f = open('./review/wmw.html','r',encoding='utf8')
    return f.read()

@app.route('/review', method = ['POST', 'GET'])
def idx():
    f = open('./review/idx.html','r',encoding='utf8')
    return f.read()

@app.route('/jspy_send', method = ['POST', 'GET'])
def senddata():
    Data = request.POST.get('Send_data')
    Rank = request.POST.get('Send_rank')
    global pyData, pyRank
    pyData = Data
    pyRank = Rank
    #print(pyData, pyRank)
    print("Get Data and Rank!")
    return None

@app.route('/jspy_getdata', method = ['POST', 'GET'])
def getdata():
    Need_data = request.POST.get('Need_data')
    #print(pyData)
    return str(pyData)

@app.route('/jspy_getrank', method = ['POST', 'GET'])
def getrank():
    Need_rank = request.POST.get('Need_rank')
    #print(pyRank)
    return str(pyRank)

@app.route('/jspy_user', method = ['POST', 'GET'])
def senduser():
    s = request.environ.get('beaker.session')
    username = s.get('user')
    level = s.get('level')
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

@app.route('/birthday')
def birthday():
    return template('birthday.html')

'''
@app.route('/stop')
def stopit():
    sys.stderr.close()
    return None
'''

session_app = SessionMiddleware(app,session_opts)
run(session_app, host = '172.17.53.140', port = 8023, debug = True)