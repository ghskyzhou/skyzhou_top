from flask import Flask, render_template
from flask_socketio import SocketIO
import pymysql
import json

conn = pymysql.connect(host = 'localhost', port = 3306, user = 'root', password = 'skysky', database = 'SkyzhouTop', charset = 'utf8')
cursor = conn.cursor()

useramount = 0

app = Flask(
    __name__,
    template_folder='.',  # 表示在当前目录 (myproject/A/) 寻找模板文件
    static_folder='.',  # 表示为上级目录 (myproject/) 开通虚拟资源入口
    static_url_path='',  # 这是路径前缀, 个人认为非常蛋疼的设计之一, 建议传空字符串, 可以避免很多麻烦
)

app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app, cors_allowed_origins='*')


@app.route('/', methods=['GET', 'POST'])
def sessions():
    return render_template('chat.html')


def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')


@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    #print('received my event: ' + str(json))
    #sql = "insert into chat(History) values (\"%s\");" %(str(json))
    #print (sql)
    #cursor.execute(sql)
    #conn.commit()
    socketio.emit('my response', json, callback=messageReceived)
    socketio.emit('user amount', useramount)

@socketio.on('connect')
def disconnect_details():
    global useramount
    useramount = useramount + 1
    print("CONNECT!")
    print(useramount)

@socketio.on('disconnect')
def disconnect_details():
    global useramount
    useramount = useramount - 1
    print("DISCONNECT!")
    print(useramount)
    socketio.emit('user amount', useramount)

if __name__ == '__main__':
    socketio.run(app, host = '172.17.53.140', port = 8026, debug=True)
