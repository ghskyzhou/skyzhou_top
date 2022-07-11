var ui={
	info:{},
	node:{}
};
ui.container=()=>document.getElementById('main');
ui.inText=()=>document.getElementById('messageTextReady');
ui.inFile=()=>document.getElementById('messageFileReady');
ui.newTip=()=>document.getElementById('newMsg');
ui.amount=()=>document.getElementById('amount');
ui.user=()=>document.getElementById('userInfo');

ui.node.factory=function(name,className,text){
	var node=document.createElement(name);
	node.className=className;
	node.innerHTML=text;
	return node;
}
ui.node.user=function(user,icon){
	var node=ui.node.factory;
	var iconNode=node('span','icon',icon.text);
	var userNameNode=node('span','username',user);
	var userNode=node('span','user '+icon.type,'');
	userNode.append(iconNode,userNameNode)
	return userNode;
}
ui.node.text=function(msg,user,icon,time){
	var node=ui.node.factory;
	var userNode=ui.node.user(user,icon);
	var msgBodyNode=node('span','msgBody',msg);
	var timeNode=node('span','time',time);
	var ele=node('span','msg hiddenMsg','');
	ele.append(userNode,msgBodyNode,timeNode);
	ui.container().append(ele);
	return ele;
}
ui.node.file=function(msg,user,icon,time){
	var node=ui.node.factory;
	var name=node('span','',msg.filename+'  ');
	var download=node('a','','下载');
	var file=node('div','fileMsg','');
	download.download=msg.filename;
	download.href=msg.link;
	file.append(name,download);
	return ui.node.text(file.outerHTML,user,icon,time);
}

ui.showTip=function(ele,check,opt){
	if(check){
		ele.scrollIntoView({behavior:'smooth'});
		return;
	}
	var tip=ui.newTip();
	tip.innerText=opt.user+" : "+(opt.msg.length<=20?opt.msg:opt.msg.slice(0,20)+'...');
	tip.style.opacity=0.7;
	tip.onclick=function(){
		ele.scrollIntoView({behavior:'smooth'});
		this.style.opacity=0;
	}
}

ui.initInfo=()=>{
	ui.user().innerHTML=ui.node.user(info.username,{type:info.level,text:info.real_level}).outerHTML;
	if(!info.username){
		alert('您未登录！')
		location.replace('http://skyzhou.top:8023');
	}
}