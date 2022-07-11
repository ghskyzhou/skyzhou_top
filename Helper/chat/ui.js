var ui={
	node:{},
	rec:{}
};
ui.container=()=>document.getElementById('main');
ui.inText=()=>document.getElementById('messageTextReady');
ui.inFile=()=>document.getElementById('messageFileReady');
ui.newTip=()=>document.getElementById('newMsg');
ui.amount=()=>document.getElementById('amount');
ui.user=()=>document.getElementById('userInfo');
ui.sendBtn=()=>document.getElementById('sendBtn');
ui.more=()=>document.getElementById('moreBtn');
ui.moreList=()=>document.getElementById('moreList');
ui.audioBtn=()=>document.getElementById('audioBtn');
ui.audioWin=()=>document.getElementById('recorderWindow');
ui.closeWin=()=>document.getElementById('closeWin');
ui.audioCtrl=num=>document.querySelector('.controlBtn:nth-child('+num+')');
ui.inAudio=()=>document.getElementById('messageAudioReady');
ui.$=qu=>document.querySelector(qu);

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

ui.rec.hide=num=>ui.audioCtrl(num).style="display:none;";
ui.rec.show=num=>ui.audioCtrl(num).style="display:inline-block;";
ui.rec.start=function(){
	ui.rec.hide(1);
	ui.rec.show(2);
	ctrl.rec.start(ui.inAudio());
}
ui.rec.end=function(){
	ui.rec.hide(2);
	ui.rec.show(3);
	ui.rec.show(4);
	ctrl.rec.end(ui.inAudio());
}
ui.rec.cancle=function(){
	ui.rec.toggleShow(0);
	delete blo;
}
ui.rec.send=function(){
	ctrl.sendMsg('audio');
	ui.rec.toggleShow(0);
}
ui.rec.toggleShow=function(open){
	if(open){
		if(!ui.audioWin().hidden)return;
		ui.rec.show(1);
		ui.rec.hide(2);
		ui.rec.hide(3);
		ui.rec.hide(4);
		ui.audioWin().hidden=0;
		ui.inAudio().src=ui.inAudio().srcObject=null;
	}
	else ui.audioWin().hidden=1;
}

ui.initInfo=function(){
	ui.user().innerHTML=ui.node.user(info.username,{type:info.level,text:info.real_level}).outerHTML;
	if(!info.username){
		alert('您未登录！')
		location.replace('http://skyzhou.top:8023');
	}
}
ui.initEvent=function(){
	function releaseEnter(event){	
		if(event.code=='Enter'&&event.shiftKey)return;
		if(event.code=='Enter')ctrl.sendMsg();
	}
	ui.sendBtn().onclick=()=>ctrl.sendMsg();
	ui.inText().onkeydown=releaseEnter;
	ui.inFile().oninput=()=>ctrl.sendMsg('file');
	ui.more().onclick=()=>ui.moreList().hidden^=1;
	ui.audioBtn().onclick=()=>ui.rec.toggleShow(1);
	ui.closeWin().onclick=()=>ui.rec.toggleShow(0);
	ui.audioCtrl(1).onclick=ui.rec.start;
	ui.audioCtrl(2).onclick=ui.rec.end;
	ui.audioCtrl(3).onclick=ui.rec.cancle;
	ui.audioCtrl(4).onclick=ui.rec.send;
}