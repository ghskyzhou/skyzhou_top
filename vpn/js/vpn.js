import {eleById as eles} from './ui.js'

function startPage(url=undefined){
	if(now!==''){
		url=urlAssain(url);
		url=new URL(url).href;
		window.onbeforeunload=null;
		historyControl.save();
		location.search=`?url=${encodeURIComponent(url)}&history=${historyControl.id}`;
		return;
	}
	if(typeof url!=='string'){
		url=eles.url.value;
		url=new URL(url).href;
		historyControl.pushState({},'',url,false);
	}else{
		url=urlAssain(url);
		url=new URL(url).href;
		eles.url.value=url;
	}
	now=url;
	var resp=getContent(url);
	if(resp.type=='x-vpn-error')console.log('some error happens!');
	else eles.frame.src=release(resp);
}


function release(resp){
	var root=document.createElement('html'),listener=document.createElement('script'),event=document.createElement('script'),div=document.createElement('div');
	var onArr=[];
	root.innerHTML=resp.content;
	needToTurnType.forEach(type=>{
		if(type=='a'||type=='form')return;
		root.querySelectorAll(type).forEach(turn);
	});
	root.querySelectorAll('*').forEach(ele=>{
		var attrs=[...ele.attributes],eventId;
		if(attrs.some(attr=>attr.name.startsWith('on'))){
			eventId=Math.round(Math.random()*1e10).toString();
			ele.setAttribute('vpn-x-eventId',eventId);
		}
		attrs.forEach(attr=>{
			if(!attr.name.startsWith('on'))return;
			var listener=ele.getAttribute(attr.name),eventName=attr.name;
			onArr.push(`document.querySelector('[vpn-x-eventid="${eventId}"]').${eventName}=function(event){
				with(sb.data){
					${listener};
				}
			}`)
		});
	});
	['turn','sb/sandbox','makeFake','polyfill'].reverse().forEach(name=>{
		var node=document.createElement('script');
		node.src=`${prefix}${name}.js`;
		node.setAttribute('data-realsrc',urlAssain(name+'.js'));
		root.children[0].insertBefore(node,root.children[0].firstChild);
	});
	//把sandbox.js、turn.js、polyfill.js等依次插入，但由于是insertBefore所以要倒过来
	listener.src=getURL(onArr.join('\n'));
	listener.setAttribute('vpn-x',listener.src);
	listener.setAttribute('data-realsrc',urlAssain('on.js'));
	root.querySelector('body').append(listener);
	//处理诸如window.onload的事件
	event.src=`${prefix}event.js`;
	event.setAttribute('vpn-x',event.src);
	event.setAttribute('data-realsrc',urlAssain('event.js'));
	root.querySelector('body').append(event);
	//处理诸如window.onload的事件
	div.id='images';
	div.style="display:none";
	root.querySelector('body').insertBefore(div,root.querySelector('body').children[0]);
	//集中存放图片
	return getURL(root.outerHTML,resp.type);
}

function loadParam(){
	localStorage.history=localStorage.history ||'{}';
	var param=location.search.slice(1).split('&').map(ele=>ele.split('=')); // '?a=1&b=2=23'=>[['a','1'],['b','2','23']]
	param=param.map(ele=>[ele[0],ele.slice(1).join('=')]);// [['a','1'],['b','2','23']] =>[['a','1'],['b','2=23']]
	param=Object.assign({url:'',history:''},Object.fromEntries(param)); // [['a','1'],['b','2=23']] => {a:1,b:'2=23'};
	if(param.url){
		param.url=decodeURIComponent(param.url);
		setTimeout(()=>{startPage(param.url)},100);
		eles.url.value=param.url;
		historyControl.create(param.history);
	}else{
		historyControl.create();
	}
}

function init(){
	window.now='';
	loadParam();
	window.onbeforeunload=function(){
		historyControl.clear();
	}
	window.onmessage=msg=>{
		window.onmessage=null;
		historyControl.pushState({},'',msg.data);
	}
}

var historyControl={
	id:null,
	record:[],
	pos:-1,
	get state(){
		return {
			idx:this.pos,
			...this.record[this.pos].state
		}
	},
	clear:function(){
		var id=this.id;
		var obj=JSON.parse(localStorage.history);
		delete obj[id];
		localStorage.history=JSON.stringify(obj);
	},
	save:function(){
		var id=this.id;
		var obj=JSON.parse(localStorage.history);
		obj[id]=[this.record,this.pos];
		localStorage.history=JSON.stringify(obj);
	},
	create:function(id=null){
		if(id==null)this.id=Math.round(Math.random()*1e7);
		else{
			this.id=id;
			var obj=JSON.parse(localStorage.history);
			try{[this.record,this.pos]=obj[id];}
			catch(err){this.create()}
		}
	},
	checkOutOfEdge:function(pos){
		var length=this.record.length;
		return pos>=length||pos<0;
	},// true= out  false=ok
	startPage:function(){
		this.last=new Date().getTime();
		startPage(this.record[this.pos].url);
	},
	go:function(delta=0){
		var pos=this.pos;
		if(this.checkOutOfEdge(pos+delta))return ;
		window.onmessage=null;
		console.log(new Date().getTime(),this.last);
		this.pos+=delta;
		this.startPage();
	},
	forward:function(){
		this.go(1);
	},
	back:function(){
		this.go(-1);
	},
	pushState:function(state,title='',url,start=true){
		window.onmessage=null;
		this.record=this.record.slice(0,this.pos+1);
		this.record.push({state:state,url:url});
		this.pos++;
		if(start)this.startPage();
	},
	replaceState:function(state,title='',url){
		window.onmessage=null;
		this.record=this.record.slice(0,this.pos);
		this.record.push({state:state,url:url});
		this.startPage();
	},
	get length(){
		return this.record.length;
	}
}

export {
	init,
	historyControl as history,
	startPage,
};