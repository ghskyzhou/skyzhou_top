var ws=io('http://skyzhou.top:8026',{translates:['websoket']});
ws.on('connect',()=>{
	ws.emit('my event',{data:'User Connected'});
	document.getElementById('userInfo').value=info.username;
	if(!info.username)location.replace('http://skyzhou.top:8023');
});
ws.on('my response',soc=>{
	if(!soc.user_name)return ;
	console.log(soc);
	var dt=new Date();
	var timeHour=String(dt.getHours()).padStart(2,'0');
	var timeMin=String(dt.getMinutes()).padStart(2,'0');
	// console.log(info.level);
	addMsg({
		user: soc.user_name,
		msg: soc.message,
		icon: {
			type:info.level,
			text:info.real_level
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
function addMsg(option){
	var user=option.user,msg=option.msg,icon=option.icon,time=option.time;
	var contianer=document.getElementById('main');
	var iconNode=makeNode('span','icon '+icon.type,icon.text);
	var userNode=makeNode('span','user',(iconNode.outerHTML)+user);
	var msgBodyNode=makeNode('span','msgBody',msg);
	var timeNode=makeNode('span','time',time);
	var ele=makeNode('span','msg hiddenMsg','');
	ele.append(userNode,msgBodyNode,timeNode);
	contianer.append(ele);
	setTimeout(()=>{ele.classList.remove('hiddenMsg')},100);
	var y=ele.getBoundingClientRect().y,bottom=contianer.getBoundingClientRect().bottom;
	if(y>(bottom-10)){
		var tip=document.getElementById('newMsg');
		tip.innerText=user+" : "+(msg.length<=20?msg:msg.slice(0,20)+'...');
		tip.style.opacity=0.7;
		tip.onclick=function(){
			ele.scrollIntoView({behavior:'smooth'});
			this.style.opacity=0;
		}
	}
	if(user == info.username) document.getElementById('messageReady').innerHTML='';
}
function sendMsg(){
	var user=info.username;
	var msg=document.getElementById('messageReady').innerHTML;
	if(!msg)return;
	document.getElementById('messageReady').innerHTML='';
	ws.emit('my event',{
		user_name:user,
		message:msg
	});
}
function releaseEnter(event){
	if(event.code=='Enter'&&event.ctrlKey)return;
	if(event.code=='Enter')sendMsg();
}