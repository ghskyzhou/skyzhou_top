var ctrl={
	rec:{}
};
ctrl.onConnect=function(){
	ws.emit('my event',{data:'User Connected'});
	ui.initInfo();
	ui.initEvent();
	ui.initEmoji();
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
		body=body.replace(/&nbsp;/g,' ');
		if(option.extra.useMd){
			body=body.replace(/<\/?div>/g,'');
			body=utils.replace(body);
			body=markdown_replace(body,1);
			while(body.endsWith('<br />'))body=body.slice(0,-6);
			body='<div class="mark">'+body+'</div>';
		}
		ele=ui.node.text(body,user,icon,time);
		msg=ele.children[1].innerText;
		renderlatex()
	}else{
		var fileName=option.extra.fileName;
		ele=ui.node.file({filename:fileName,link:body},user,icon,time);
		msg=fileName;
	}
	ui.showTip(ele,utils.containIn(ele),{user:user,msg:msg});
}
ctrl.sendMsg=async function(type='text',option={}){
	var msg;
	if(type=='text'){
		var target=ui.inText();
		if(utils.checkEmpty(target))return;
		msg='<div>'+target.innerHTML+'</div>';
		setTimeout(()=>{target.innerText='';},100);
		if(target.innerText.trim().length>200){
			alert('超出字数！');
			return;
		}
		ctrl.ioSend('text',msg,option);
	}else if(type=='file'){
		var target=ui.inFile();
		if(!target.files.length&&typeof files=='undefined')return;
		target.nextElementSibling.innerText='读取中...';
		var mulFiles=(typeof files!=='undefined'?files:target.files);
		for(var i=0;i<mulFiles.length;i++){
			(function(){
				var file=mulFiles[i];
				var fr=new FileReader();
				if(file.size>10*1024*1024){
					alert('超过限制!');
					ui.inFile().nextElementSibling.innerText='或输入文件';
					return;
				}
				fr.readAsDataURL(new Blob([file],{type:file.type}));
				fr.onloadend=function(){
					var msg=this.result;
					target.nextElementSibling.innerText='正在发送...';
					var tmp=utils.typeReplace(file,msg);
					if(tmp!==msg)ctrl.ioSend('text',tmp);
					else ctrl.ioSend('file',msg,{fileName:file.name});
					ui.inFile().nextElementSibling.innerText='或输入文件';
				};
			})()
		}
		delete files;
		target.type='text';
		target.type='file';
	}else{
		var fr=new FileReader();
		fr.readAsDataURL(blo);
		fr.onloadend=function(){
			var msg=this.result;
			msg=`<audio src="${msg}" controls="controls"></audio>`;
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
		time:utils.getTime(),
		extra:extra
	};
	ws.emit('my event',obj);
}

ctrl.rec.start=function(ele){
	if(!navigator.getUserMedia){
		alert('当前设备不支持录音！');
		ui.rec.toggleShow(0);
		return;
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