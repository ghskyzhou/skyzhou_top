var load=()=>{
	document.querySelector('[name=time]').value=localStorage.time;
	document.querySelector('[name=updateTime]').value=localStorage.updateTime;
	document.querySelector('[name=delTime]').value=localStorage.delTime;
	document.querySelector('[name=outTime]').value=localStorage.outTime;
	document.querySelector('[name=getShort]').checked=(localStorage.getShort=='true');
	document.querySelector('[name=clearData]').checked=(localStorage.clearData=='true');
}
var save=()=>{
	alert('已保存！');
	localStorage.time=document.querySelector('[name=time]').value;
	localStorage.updateTime=document.querySelector('[name=updateTime]').value;
	localStorage.delTime=document.querySelector('[name=delTime]').value;
	localStorage.outTime=document.querySelector('[name=outTime]').value;
	localStorage.getShort=document.querySelector('[name=getShort]').checked;
	localStorage.clearData=document.querySelector('[name=clearData]').checked;
	chrome.runtime.sendMessage('changed');
}
var reset=()=>{
	document.querySelector('[name=time]').value=30;
	document.querySelector('[name=updateTime]').value=1;
	document.querySelector('[name=delTime]').value=3;
	document.querySelector('[name=outTime]').value=14;
	document.querySelector('[name=getShort]').checked=false;
	document.querySelector('[name=clearData]').checked=true;	
}
var createNode=(localName,text='',extra='')=>{
	var tag=document.createElement(localName);
	tag.innerText=text;
	if(localName=='a'){
		tag.target='__blank';
		tag.href=extra;
	}
	return tag;
}
var exportXls=()=>{
	var type=document.querySelector('#exportXls~select').value;
	var data=JSON.parse(localStorage.result);
	data=data[type];
	var tb=createNode('table');
	var th1=createNode('th',text='关键词');
	var th2=createNode('th',text='图片');
	var th3=createNode('th',text='视频');
	var th4=createNode('th',text='更多信息');
	var th5=createNode('th',text='搜索指数');
	var th6=createNode('th',text='状态');
	var tr=createNode('tr');
	tr.innerHTML=th1.outerHTML+th2.outerHTML+th3.outerHTML+th4.outerHTML+th5.outerHTML+th6.outerHTML;
	tb.append(tr);
	for(var i=0;i<data.length;i++){
		var ele=data[i];
		tr=createNode('tr');
		var tg1=createNode('td'),tg2=createNode('td'),tg3=createNode('td'),tg4=createNode('td');
		var a1=createNode('a',ele.key,ele.links.info);
		var a2=createNode('a','图片',ele.links.image);
		var a3=createNode('a','视频',ele.links.video);
		var a4=createNode('a','更多信息',ele.links.news);
		var tg5=createNode('td',ele.search.number);
		var text=(ele.search.status>0?'上升':(!ele.search.status?'不变':'下降'));
		var tg6=createNode('td',text);
		tg1.innerHTML=a1.outerHTML;
		tg2.innerHTML=a2.outerHTML;
		tg3.innerHTML=a3.outerHTML;
		tg4.innerHTML=a4.outerHTML;		
		tr.innerHTML=tg1.outerHTML+tg2.outerHTML+tg3.outerHTML;
		tr.innerHTML+=tg4.outerHTML+tg5.outerHTML+tg6.outerHTML;
		tb.append(tr);
	}
	var pre='data:application/vnd.ms-excel;base64,';
	var str='<html><body>'+tb.outerHTML+'</body></html>';
	str=btoa(JSON.parse('["'+encodeURIComponent(str).replace(/%(\w\w)/g,"\\u00$1")+'"]')[0]);
	var a=createNode('a','',pre+str);
	a.download=type+'-榜单数据.xls';
	a.click();
}
var exportRankXls=()=>{
	var type=document.querySelector('#exportRankXls~select').value;
	var data=JSON.parse(localStorage.rankDatas);
	data=data[type];
	var list=JSON.stringify(data).match(/"[^\"]+"/g).map(ele=>ele.slice(1).slice(0,-1));
	var tb=createNode('table');
	var th1=createNode('th',text='关键词');
	var th2=createNode('th',text='日期');
	var th3=createNode('th',text='搜索指数');
	var tr=createNode('tr');
	tr.innerHTML=th1.outerHTML+th2.outerHTML+th3.outerHTML;
	tb.append(tr);
	list.forEach(name=>{
		var now=data[name]
		for(var i=0;i<now.length;i++){
			var ele=now[i];
			tr=createNode('tr');
			var tg1=createNode('td',name);
			var tg2=createNode('td',String(new Date(ele[0])));
			var tg3=createNode('td',ele[1]);
			tr.innerHTML=tg1.outerHTML+tg2.outerHTML+tg3.outerHTML;
			tb.append(tr);
		}
	})
	var pre='data:application/vnd.ms-excel;base64,';
	var str='<html><body>'+tb.outerHTML+'</body></html>';
	str=btoa(JSON.parse('["'+encodeURIComponent(str).replace(/%(\w\w)/g,"\\u00$1")+'"]'));
	var a=createNode('a','',pre+str);
	a.download=type+'-搜索指数统计数据.xls';
	a.click();	
}
var exportJson=()=>{
	var type=document.querySelector('#exportJson~select').value;
	var data=JSON.parse(localStorage.result);
	data=data[type];
	var str=JSON.stringify(data)
	var a=createNode('a','',URL.createObjectURL(new Blob([str],{type:"text/json"})));
	a.download=type+'-榜单数据.json';
	a.click();
}
var exportRankJson=()=>{
	var type=document.querySelector('#exportRankJson~select').value;
	var data=JSON.parse(localStorage.rankDatas);
	data=data[type];
	var str=JSON.stringify(data)
	var a=createNode('a','',URL.createObjectURL(new Blob([str],{type:"text/json"})));
	a.download=type+'-搜索指数统计数据.json';
	a.click();
}
var clearAll=()=>{
	var g=confirm('确定删除吗？');
	if(!g)return;
	else localStorage.result=localStorage.rankDatas='';
}
var setEvent=()=>{
	document.querySelector('#reset').onclick=reset;
	document.querySelector('#save').onclick=save;
	document.querySelector('#clearAll').onclick=clearAll;
	document.querySelector('#exportXls').onclick=exportXls;
	document.querySelector('#exportJson').onclick=exportJson;
	document.querySelector('#exportRankXls').onclick=exportRankXls;
	document.querySelector('#exportRankJson').onclick=exportRankJson;	
}
document.onreadystatechange=()=>{
	if(document.readyState=='complete'){
		load();
		setEvent();
	}
}