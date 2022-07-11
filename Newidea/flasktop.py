from flask import Flask, render_template, request,redirect,url_for
from werkzeug.utils import secure_filename
import os
import pymysql
import json
import sys

app = Flask(__name__)
app.secret_key = 'sadkfjsdaklfjdklxsvjksdajfsdaoifj'
app.config['UPLOAD_FOLDER'] = 'upload/'

conn = pymysql.connect(host = 'localhost', port = 3306, user = 'root', password = 'skysky', database = 'SkyzhouTop', charset = 'utf8')
cursor = conn.cursor()


@app.route('/2048', methods = ['POST', 'GET'])
def game2048():
    if request.method == 'POST':
        jsdata = request.data
        jsdata = json.loads(jsdata)
        username = jsdata["rname"]
        score = jsdata["rscore"]
        score = int(score)
        print(username, score)
        sql = "SELECT Score FROM Rank2048 WHERE Username = '%s';" %username
        result = cursor.execute(sql)
        print(result)
        if result == 1:
            oscore = cursor.fetchone()
            oldscore = int(oscore[0])
            if oldscore <= score:
                sql = "UPDATE Rank2048 SET Score = %s WHERE Username = '%s';" %(score, username)
                cursor.execute(sql)
                conn.commit()
        else:
            sql = "INSERT INTO Rank2048 (Username, Score) VALUES ('%s', %s);" %(username, score)
            cursor.execute(sql)
            conn.commit()
        return "1"
    return render_template('2048.html')

@app.route('/2048_score', methods = ['POST', 'GET'])
def sendrank():
    sql = "SELECT * FROM Rank2048 ORDER BY Score DESC;"
    cursor.execute(sql)
    Rank = cursor.fetchmany(100)
    #response.content_type = 'application/javascript'
    return(str('const rank = ' + json.dumps(Rank)))

@app.route('/year')
def year():
    return render_template('year.html')

@app.route('/solar')
def solar():
    return render_template('solar.html')

@app.route('/upload', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        ulevel = request.form['userlevel']

        if(ulevel == "User" or ulevel == "testuser" or ulevel == ""):
            return "User不能上传！"
        f = request.files['file']
        basepath = os.path.dirname(__file__)
        upload_path = os.path.join(basepath, 'static\\uploads',secure_filename(f.filename))
        f.save(upload_path)
        fname = secure_filename(f.filename)
        print(fname)
        sql = "INSERT INTO Filename(File) VALUES ('%s');" %secure_filename(f.filename)
        cursor.execute(sql)
        conn.commit()
        return redirect(url_for('upload'))
    return render_template('upload.html')

@app.route('/delete', methods = ['POST', 'GET'])
def deletefile():
    if request.method == 'POST':
        fname = request.form['fname']
        print(fname)
        sql = "DELETE FROM Filename WHERE File = \"%s\";" %fname
        cursor.execute(sql)
        conn.commit()

        basepath = os.path.dirname(__file__)
        upload_path = os.path.join(basepath, 'static\\uploads',secure_filename(fname))
        os.remove(upload_path)

    return render_template('delete.html')

@app.route('/jspy_file', methods = ['POST', 'GET'])
def senduser():
    sql = "SELECT * FROM Filename;"
    cursor.execute(sql)
    filename = cursor.fetchmany(100)
    #response.content_type = 'application/javascript'
    return(str('const flist = ' + json.dumps(filename)))


if __name__ == '__main__':
    app.run(host = '172.17.53.140', port = 8039, debug = True)
