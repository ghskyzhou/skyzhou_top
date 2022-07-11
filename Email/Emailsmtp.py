from email.header import Header
from email.mime.text import MIMEText
from email.utils import parseaddr, formataddr
 
import smtplib
 
def _format_addr(s):
    name, addr = parseaddr(s)
    return formataddr((Header(name, 'utf-8').encode(), addr))
 
user_mail = 'skyzhou@skyzhou.top' #发件人邮箱
user_name = 'Skyzhou' #发件人信息
password = 'zslbf&2525' #我的密码
send_mail = '3178309197@qq.com' #收件人
send_user = 'Anybody' #收件人信息
header_name = 'HHHH' #主题
smtp_server = 'smtp.skyzhou.top' #smtp服务器
 
#填写邮件的正文、发件人信息、收件人信息、主题...
msg = MIMEText('This is Skyzhou from skyzhou.top using python', 'plain', 'utf-8')	
msg['From'] = _format_addr(user_name + ' ' + user_mail)
msg['To'] = _format_addr(send_user + ' ' + send_mail)
msg['Subject'] = Header(header_name, 'utf-8').encode()
 
#发出邮件要执行的动作
server = smtplib.SMTP(smtp_server, 25)	#执行邮局服务器的25端口
server.set_debuglevel(1)		#	
server.login(user_mail, password)	#登录服务器

server.sendmail(user_mail, [send_mail], msg.as_string()) #发送信件到指定的地址


server.quit()	#结束服务:wq