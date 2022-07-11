from flask import Flask, render_template, request, url_for, Response
from flask_socketio import SocketIO
from concurrent.futures import ThreadPoolExecutor
import json, time, asyncio
from gevent import monkey
from gevent.pywsgi import WSGIServer

executor = ThreadPoolExecutor(max_workers = 5)

monkey.patch_all()

app = Flask(
    __name__,
    template_folder = '.',
    static_folder = '.',
    static_url_path = '',
)

gid = []
gres = []
gtype = []
for x in range(0, 1000):
    gres.append('a')
    gtype.append('a')

app.config['SECRET_KEY'] = 'asiopfjasdf2839666'
socketio = SocketIO(app, cors_allowed_origins = '*', async_mode="threading")

@app.route('/', methods=['GET', 'POST'])
def sessions():
    return render_template('vpnpage.html')

@app.route('/vpn', methods = ['GET', 'POST'])
def url_get():
    pyurl = request.args.get('pyurl')
    pyheader = request.headers.get('your-header-name')
    pyid = len(gid)
    gid.append(pyid)
    pyjson = {}
    pyjson['id'] = pyid
    pyjson['header'] = pyheader
    pyjson['url'] = pyurl
    urldata = json.dumps(pyjson)
    print(urldata)
    socketio.emit('url response', urldata)
    #executor.submit(checkback, pyid)
    #print("here: ", gres[0])
    while(gres[pyid] == 'a'):
        print('WAITING FOR DATA...', pyid)
        asyncio.sleep(0.2)
        time.sleep(0.2)
    print('GET DATA!', gtype[pyid])
    return gres[pyid], {'Content-Type': gtype[pyid]}

@socketio.on('web event')
def web_get(jsid, jsres, jstype, method = ['GET', 'POST']):
    gres[jsid] = jsres
    gtype[jsid] = jstype
    print("WS DATA!!")


if __name__ == '__main__':
    app.config['JSON_AS_ASCII'] = False
    app.run(host='172.17.53.140', port=8028, debug=False, threaded=True)
    #socketio.run(app, host = '172.17.53.140', port = 8028, debug = True)