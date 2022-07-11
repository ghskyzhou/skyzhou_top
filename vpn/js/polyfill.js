window.now=self.parent.now;
window.scripts=[];
window.sb=new sandBox();
var eventArr=["onabort","onafterprint","onanimationend","onanimationiteration","onanimationstart","onappinstalled","onauxclick","onbeforeinstallprompt","onbeforeprint","onbeforeunload","onbeforexrselect","onblur","oncancel","oncanplay","oncanplaythrough","onchange","onclick","onclose","oncontextmenu","oncuechange","ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onformdata","ongotpointercapture","onhashchange","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onlanguagechange","onload","onloadeddata","onloadedmetadata","onloadstart","onlostpointercapture","onmessage","onmessageerror","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onoffline","ononline","onpagehide","onpageshow","onpause","onplay","onplaying","onpointercancel","onpointerdown","onpointerenter","onpointerleave","onpointermove","onpointerout","onpointerover","onpointerrawupdate","onpointerup","onpopstate","onprogress","onratechange","onrejectionhandled","onreset","onresize","onscroll","onsearch","onseeked","onseeking","onselect","onselectionchange","onselectstart","onstalled","onstorage","onsubmit","onsuspend","ontimeupdate","ontoggle","ontransitioncancel","ontransitionend","ontransitionrun","ontransitionstart","onunhandledrejection","onunload","onvolumechange","onwaiting","onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart","onwebkittransitionend","onwheel"];
var env=fakeObj(window),$document=fakeObj(document),$location=fakeObj(new URL(now)),$navigator=fakeObj(navigator);
var runScript=src=>{
	var xhr=new XMLHttpRequest();
	xhr.open('GET',src,false);
	xhr.send();
	try{(new Function(xhr.response))()}catch(err){console.log(err,{a:src,b:xhr.response})}
};
env.useOriginProp(eventArr);
env.useOriginProp('eval');
env.fakeProp('history',parent.historyApi);
env.fakeProp('location',$location);
// env.fakeFunction(window,['ServiceWorker','Worker'],function(args,tmp){
// 	args[0]=urlAssain(args[0],1);
// 	tmp(...args);
// });
env.fakeProp('Image',function(){
	var ele=document.createElement('img');
	document.querySelector('#images').append(ele);
	return ele;
});
env.fakeProp('XMLHttpRequest',(function(){
	var open=XMLHttpRequest.prototype.open,xhr=XMLHttpRequest;
	xhr.prototype.open=function(){
		arguments[1]=urlAssain(arguments[1],1);
		open.call(this,...arguments);
	}
	return xhr;
})());
env.useOriginProp('RegExp');
env.fakeFunction(window,'fetch',function(args,tmp){
	args[0]=urlAssain(args[0],1);
	return tmp(...args);
});
env.fakeProp('import',function(url){
	url=urlAssain(url,1);
	return import(url);
});
$document.useOriginProp(eventArr);
$document.useOriginProp(['readyState'])
$document.fakeFunction(document,'createElement',function(args,tmp){
	var tagName=args[0],ele=tmp(tagName);
	if(ele.tagName=='IMG')document.querySelector('#images').append(ele);
	return ele;
});
$document.fakeFunction(document,['write','writeln'],(function(){
	var tmpCaller,scr='',token;
	function handleScr(write){
		var contain=document.createElement('div'),res;
		contain.innerHTML=scr;
		[...contain.children].forEach(ele=>{
			var emptyNum=[...ele.attributes].filter(attr=>!attr.value).length;
			scr+=' '.repeat(emptyNum*3);
		});
		if(contain.innerHTML.length!==scr.length)return false;
		[...contain.children].forEach(ele=>{
			ele.setAttribute('x-vpn-insert','');
			if(needToTurnType.includes(ele.nodeName.toLowerCase())&&ele.tagName!=='A')ele=turn(ele);
			if(!document.body){
				console.log(document.readyState);
				write(ele.outerHTML);
			}
			else{
				if(ele.tagName!=='SCRIPT')document.lastElementChild.lastElementChild.append(ele);
				else {
					runScript(ele.src);
				}
			}
		});
		return true;
	}
	return function(args,tmp){
		scr+=args[0];
		if(handleScr(tmp))scr='';
	};
})());
$location.fakeProp('replace',function(args){parent.postMessage(args,'*')});
$location.fakeProp('reload',function(){parent.postMessage(now,'*')});
$location.fakeProp('assain',function(args){parent.postMessage(urlAssain(args),'*')});
$location.fakeProp('toString',function(){return now});
$document.fakeProp('location',$location);
$document.fakeProp('scripts',scripts);
$document.fakeProp('domain',new URL(now).host);
$navigator.fakeFunction(navigator,'sendBeacon',function(){
	return true;
})

//
$document.fakeProp('location',$location);
env.fakeProp('document',$document);
env.fakeProp('location',$location);
env.fakeProp('navigator',$navigator);
sb.data=env;
var proxyHandle={
	'get':function(target,prop){return Reflect.get(...arguments);},
	'set':function(){return Reflect.set(...arguments) || 1;}
};
sb.data.window=new Proxy(sb.data,proxyHandle);
sb.data.self=new Proxy(sb.data,proxyHandle);
sb.data.top=new Proxy(sb.data,proxyHandle);


var ob=new MutationObserver(function(list,ob){
	list=list.map(rec=>{
		var node;
		node=rec.addedNodes[0];
		if(!node){
			if(rec.type=='childList')return'';
			node=rec.target;
			if(!needToTurnType.includes(node.nodeName.toLowerCase()))return '';
			else return  node;
		}
		if(needToTurnType.includes(node.nodeName.toLowerCase())){
			if(!node.hasAttribute('vpn-x')){
				if(node.tagName=='SCRIPT'&&document.readyState=='complete'){
					var tmp=node.cloneNode(1);
					node.outerHTML='';
					node=tmp;
					console.log(node);
				} 
				return node;
			}else if(node.hasAttribute('vpn-x')&&node.tagName=='SCRIPT'&&document.readyState!=='complete'){
				try{
					node=Object.defineProperty(node,'src',{
						get:()=>node.dataset.realsrc,
						set:()=>true
					});
				}catch(err){};
			}else return '';
		}
		else return '';
	}).filter(Boolean);
	list=list.map(turn);
	list.forEach(ele=>{
		if(ele.tagName=='SCRIPT'){
			try{
				ele=Object.defineProperty(ele,'src',{
					get:()=>ele.dataset.realsrc,
					set:()=>true
				});
			}catch(err){};
			runScript(ele.src);
		}
	});
}),scrArr=[];
ob.observe(document,{childList:true,attributes:true,subtree:true});