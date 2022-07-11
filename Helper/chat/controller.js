var ctrl={
	rec:{}
};
ctrl.onConnect=function(){
	ws.emit('my event',{data:'User Connected'});
	ui.initInfo();
	ui.initEvent();
}
ctrl.onMessage=function(soc){
	if(!soc.user)return ;
	console.log(soc);
	ctrl.addMsg(soc);
}
ctrl.onAmount=function(amount){
	ui.amount().innerHTML=amount;
	console.log('User amount',amount);
}

ctrl.addMsg=function(option){
	var user=option.user,icon=option.icon,time=option.time;
	var type=option.type,body=option.body,ele,msg;
	if(type=='text'){
		ele=ui.node.text(body,user,icon,time);
		msg=ele.children[1].innerText;
	}else{
		if(user==info.username)
			ui.inFile().nextElementSibling.innerText='或输入文件';
		var fileName=option.fileName;
		ele=ui.node.file({filename:fileName,link:body},user,icon,time);
		msg=fileName;
	}
	setTimeout(()=>{ele.classList.remove('hiddenMsg')},100);
	ui.showTip(ele,utils.containIn(ele),{user:user,msg:msg});
}
ctrl.sendMsg=async function(type='text'){
	var msg;
	if(type=='text'){
		var target=ui.inText();
		if(!target.innerText.trim())return;
		msg='<div>'+target.innerHTML+'</div>';
		setTimeout(()=>{target.innerText='';},100);
		if(msg.length>200)msg='[已超出字数]';
		ctrl.ioSend('text',msg);
	}else if(type=='file'){
		var target=ui.inFile(),fr=new FileReader();
		if(!target.files.length)return;
		target.nextElementSibling.innerText='读取中...';
		var name=target.files[0].name;
		fr.readAsDataURL(new Blob([target.files[0]],{type:target.type}));
		fr.onloadend=function(){
			var msg=this.result;
			target.nextElementSibling.innerText='正在发送...';
			ctrl.ioSend('file',msg,name);
		};
		target.type='text';
		target.type='file';
	}else{
		var fr=new FileReader();
		fr.readAsDataURL(blo);
		fr.onloadend=function(){
			var msg=this.result;
			msg=`<audio src="${msg}" controls="controls"></audio>`
			ctrl.ioSend('text',msg);
		};
	}	
}
ctrl.ioSend=function(type,msg,extra){
	var obj={
		user:info.username,
		type:type,
		body:msg,
		icon:{
			type:info.level,
			text:info.real_level
		},
		time:utils.getTime()
	};
	if(extra){
		if(type=='file')Object.assign(obj,{fileName:extra});
	}
	ws.emit('my event',obj);
}

ctrl.rec.start=function(ele){
	if(!navigator.getUserMedia){
		alert('当前设备不支持录音！');
		ui.rec.toggleShow(0);
	}
	navigator.getUserMedia({audio:true},function(stream){
		ele.srcObject=stream;
		mr=new MediaRecorder(stream);
		chunck=[];
		mr.ondataavailable=data=>chunck.push(data.data);
		mr.start();
	},function(){
		alert('当前设备不支持录音！');
		ui.rec.toggleShow(0);
	});
}
ctrl.rec.end=function(ele){
	mr.onstop=()=>{
		blo=new Blob(chunck,{type:mr.mimeType});
		var url=URL.createObjectURL(blo);
		ele.src=url;
		ele.srcObject=null;
		delete mr;
		delete chunck;
	}
	mr.stop();
}

var ws=io('http://skyzhou.top:8026',{translates:['websoket']});
ws.on('connect',ctrl.onConnect);
ws.on('my response',ctrl.onMessage);
ws.on('user amount', ctrl.onAmount);


/*
mr=new MediaRecorder(stream)
var chunck=[]
mr.ondataavailable=data=>chunck.push(data.data)
blo=new Blob(chunck,{type:'video/x-matroska;codecs=avc1'})
url=URL.createObjectURL(blo)
*/