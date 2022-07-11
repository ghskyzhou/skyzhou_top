var needToTurnType=['script','img','link','a'];
var vpnURL=url=>'http://skyzhou.top:8028/vpn?pyurl='+encodeURIComponent(url);
var checkAlready=(ele,attr)=>ele.hasAttribute(attr)&&ele.hasAttribute('vpn-x')&&ele.getAttribute('vpn-x')==ele.getAttribute(attr);
var prefix='http://skyzhou.top:8028/js/';
	// poly.src='http://skyzhou.top:8028/polyfill.js';
	//chrome-extension://cfhocloomhbfmkaoacadkfpjcfbnmlel/vpn/vpn-front/js/
function urlAssain(child,vpn=0){
	if(!child)child='';
	if(child.startsWith('http://skyzhou.top')||child.startsWith('blob:')||child.startsWith('data:')||child.startsWith('chrome-ext'))return child;
	if(child.search(/^[\w\-]+:\/\//)==0){
		if(vpn)return vpnURL(child);
		return child;
	}
	if(child.startsWith('//')){
		var pro=new URL(now).protocol;
		child=child.replace('//',pro+'//');
		if(vpn)return vpnURL(child);
		return child;
	}
	var path=now.replace(/^https?:\/\//g,'').split('/'),newURL;
	if(!child.startsWith('#')&&!child.startsWith('?')){
		if(child.startsWith('/')){
			path=[path[0]];
			path.push(child.slice(1));
		}else if(child.startsWith('./')){
			path=path.slice(0,-1);
			path.push(child.slice(2));
		}else if(child.startsWith('../')){
			var num=child.match(/\.\.\//g).length;
			path=path.slice(0,-num);
			path.push(child.slice(num*3));
		}else{
			path.push(child);
		}
		newURL=new URL(now).protocol+'//'+path.filter(Boolean).join('/');
	}else{
		newURL=now+child;
	}
	if(vpn)return vpnURL(newURL);
	return newURL;
}
function getContent(url){
	var xhr=new XMLHttpRequest();
	var tmpURL=urlAssain(url,1);
	xhr.open('GET',tmpURL,false);
	xhr.send();
	var obj={};
	obj.content=xhr.response;
	obj.url=url;
	obj.type=xhr.getResponseHeader('content-type');
	return obj;
}
function getURL(content,type=''){
	var blo=new Blob([content],{type:type});
	return URL.createObjectURL(blo);
}
function turn(ele){
	var type=ele.tagName,url;
	type=type[0]+type.slice(1).toLowerCase();
	[ele,url]=handle['turn'+type](ele);	
	if(url!==false)ele.setAttribute('vpn-x',url);
	return ele;
}
var handle={};
handle.turnScript=function (ele){
	if(checkAlready(ele,'src'))return [ele,false];
	var scr='',url;
	if(ele.hasAttribute('src')&&ele.getAttribute('src')){
		var src=ele.getAttribute('src');
		ele.dataset.realsrc=urlAssain(src);
		scr=`
			{
				var url='${urlAssain(src,1)}';
				var xhr=new XMLHttpRequest();
				xhr.open('GET',url,false);
				xhr.send();
				sb.runAsync(xhr.response,"${urlAssain(src)}",${ele.hasAttribute('x-vpn-insert')});
				//console.log("${src}");
			};
		`;
	}
	else {
		scr=`sb.runAsync((function(){${ele.innerHTML}}).toString().slice(11,-1),'',${ele.hasAttribute('x-vpn-insert')})`;
		ele.innerHTML='';
	}
	var url=getURL(scr);
	ele.setAttribute('src',url);
	return [ele,url];
}
handle.turnImg=function (ele){
	if(checkAlready(ele,'src')||!ele.hasAttribute('src'))return [ele,false];
	if(ele.hasAttribute('src'))ele.setAttribute('src',urlAssain(ele.getAttribute('src'),1));
	if(ele.hasAttribute('srcset'))ele.srcset='';
	return [ele,ele.getAttribute('src')];
}
handle.turnLink=function (ele){
	if(checkAlready(ele,'href'))return [ele,false];
	var href=ele.attributes.href.value;
	if(href.startsWith('chrome-ext')||href.startsWith('data:'))return;
	if(!href.endsWith('.css')&&(!ele.rel||ele.rel.toLowerCase()!=='stylesheet')){
		ele.href=urlAssain(href,1);
		return [ele,ele.href];
	}
	var content=getContent(href);
	var cssText=content.content;
	href=urlAssain(href).replace(/\/[\w\.\?\#=%]+$/g,'');
	cssText=cssText.replace(/(url|path)\((.+?)\)/g,(match,p1,p2)=>`${p1}(${vpnURL(href+'/'+p2.replace(/^\//,''))})`);
	ele.href=getURL(cssText);
	return [ele,ele.href];
}
handle.turnA=function (ele){
	function handleClick(eve){
		eve.preventDefault();
		var target=[...eve.path].find(ele=>ele.tagName=='A');
		var url=target.getAttribute('href');
		if(!url||url=='#')return;
		if(url.startsWith('javascript'))sb.runAsync(url.slice(11));
		else if(url)parent.postMessage(url,'*');
	}
	if(ele.hasAttribute('vpn-x'))return [ele,false];
	ele.addEventListener('click',handleClick);
	return [ele,' '];
}

