var ws=io('http://skyzhou.top:8026',{translates:['websoket']});
ws.on('connect',()=>{
	ws.emit('my event',{data:'User Connected'});
	document.getElementById('userInfo').value=info.username;
	document.getElementById('userLevel').value=info.real_level;
	if(!info.username){
		alert('您未登录！')
		location.replace('http://skyzhou.top:8023');
	}
});
ws.on('my response',soc=>{
	if(!soc.user_name)return ;
	console.log(soc);
	var dt=new Date();
	var timeHour=String(dt.getHours()).padStart(2,'0');
	var timeMin=String(dt.getMinutes()).padStart(2,'0');
	addMsg({
		user: soc.user_name,
		msg: soc.message,
		icon: {
			type: soc.myicon,
			text: soc.mylevel
		},
		time:timeHour+':'+timeMin
	});
});
function makeNode(name,className,text){
	var node=document.createElement(name);
	node.className=className;
	node.innerHTML=text;
	return node;
}
function makeTextNode(msg,user,icon,time){
	var contianer=document.getElementById('main');
	var iconNode=makeNode('span','icon '+icon.type,icon.text);
	var userNode=makeNode('span','user',(iconNode.outerHTML)+user);
	var msgBodyNode=makeNode('span','msgBody',msg);
	var timeNode=makeNode('span','time',time);
	var ele=makeNode('span','msg hiddenMsg','');
	ele.append(userNode,msgBodyNode,timeNode);
	contianer.append(ele);
	return ele;
}
function makeFileNode(msg,user,icon,time){
	var name=makeNode('span','',msg.filename+'  ');
	var download=makeNode('a','','下载');
	var file=makeNode('div','fileMsg','');
	download.download=msg.filename;
	download.href=msg.link;
	file.append(name,download);
	return makeTextNode(file.outerHTML,user,icon,time);
}
function addMsg(option){
	var user=option.user,msg=option.msg,icon=option.icon,time=option.time;
	var [type,body]=msg.split('$',2),ele;
	if(type=='text'){
		ele=makeTextNode(body,user,icon,time);
		msg=ele.children[1].innerText;
	}else{
		if(user==info.username)
			document.getElementById('messageFileReady').nextElementSibling.innerText='或输入文件';
		var fileName=type.split(':',2)[1];
		ele=makeFileNode({filename:fileName,link:body},user,icon,time);
		msg=fileName;
	}
	setTimeout(()=>{ele.classList.remove('hiddenMsg')},100);
	var y=ele.getBoundingClientRect().y;
	var bottom=document.getElementById('main').getBoundingClientRect().bottom;
	if(y>(bottom-10)){
		var tip=document.getElementById('newMsg');
		tip.innerText=user+" : "+(msg.length<=20?msg:msg.slice(0,20)+'...');
		tip.style.opacity=0.7;
		tip.onclick=function(){
			ele.scrollIntoView({behavior:'smooth'});
			this.style.opacity=0;
		}
	}
}
async function sendMsg(type='text'){
	var msg;
	if(type=='text'){
		var target=document.getElementById('messageTextReady');
		if(!target.innerText.trim())return;
		msg=target.innerHTML;
		target.contentEditable="false";
		setTimeout(()=>{
			target.innerHTML='';
			target.contentEditable="true";
		},100);
		ioSend('text$'+msg);
	}else{
		var target=document.getElementById('messageFileReady'),fr=new FileReader();
		if(!target.files.length)return;
		target.nextElementSibling.innerText='读取中...';
		type+=':'+target.files[0].name;
		msg=await target.files[0].arrayBuffer();
		fr.readAsDataURL(new Blob([msg],{type:target.type}));
		fr.onloadend=function(){
			var msg=type+'$'+this.result;
			target.nextElementSibling.innerText='正在发送...';
			ioSend(msg);
		};
		target.type='text';
		target.type='file';
	}
}
function ioSend(msg){
	ws.emit('my event',{
		user_name:info.username,
		message:msg,
		myicon:info.level,
		mylevel:info.real_level
	});
}
function releaseEnter(event){	
	if(event.code=='Enter'&&event.shiftKey)return;
	if(event.code=='Enter')sendMsg();
}
document.onreadystatechange=()=>{
	if(document.readyState!=='complete')return;
	document.getElementById('sendBtn').onclick=sendMsg;
	document.getElementById('messageTextReady').onkeydown=releaseEnter;
	document.getElementById('messageFileReady').oninput=()=>sendMsg('file');
}