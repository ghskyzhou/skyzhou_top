var node=(data,short)=>{
	var createNode=(localName,className='',text='',extra='')=>{
		var tag=document.createElement(localName);
		tag.className=className;
		tag.innerText=text;
		if(localName=='a'){
			tag.target='__blank';
			tag.href=extra;
		}
		return tag;
	}
	var getShort=link=>{
		var xhr=new XMLHttpRequest();
		xhr.open('GET',link,false);
		xhr.send();
		var tg=createNode('html');
		tg.innerHTML=xhr.response;
		if(tg.querySelector("#\\31  > div > div:nth-child(1)")==null)return '暂无摘要';
		var arr=tg.querySelector("#\\31  > div > div:nth-child(1)").innerText.split('\n');
		if(arr.length==1)return '暂无摘要';
		if(!arr[17])arr[17]='';
		var str=(arr[10].trim()||arr[17].trim());
		return '摘要：'+str;
	}
	var tr=createNode('tr');
	var tg1=createNode('td'),tg2=createNode('td');
	var a1=createNode('a',(data.new? 'new':''),data.key,data.links.info);
	if(short)a1.title=getShort(data.links.info);
	var a2=createNode('a','','图片',data.links.image);
	var a3=createNode('a','','视频',data.links.video);
	var a4=createNode('a','','更多信息',data.links.news);
	var tg3=createNode('td','',data.search.number);
	var sta=(data.search.status>0?'rankUp':(!data.search.status?'rankNotChanged':'rankFall'));
	var text=(data.search.status>0?'上升':(!data.search.status?'不变':'下降'));
	var tg4=createNode('td',sta,text);
	tg1.innerHTML=a1.outerHTML;
	tg2.innerHTML=a2.outerHTML+a3.outerHTML+a4.outerHTML;
	tr.innerHTML=tg1.outerHTML+tg2.outerHTML+tg3.outerHTML+tg4.outerHTML;
	return tr;
}
load=()=>{
	var container=document.querySelectorAll('tbody')[1];
	var result=JSON.parse(localStorage.result),type=decodeURI(location.search.slice(1).split('=')[1]);
	var item=result[type];
	item.forEach((ele,idx)=>{
		var tr=node(ele,idx<6&&(localStorage.getShort=='true'));
		container.append(tr);
	});
	document.querySelector('h1').innerText=type;
}
setEvent=()=>{
	var list=document.querySelector('ul.contentlist').children;
	for(var i=1;i<=6;i++)
		list[i].onclick=function(){
			location.replace('showall.html?type='+this.innerText);
		};
}
document.onreadystatechange=()=>{
	if(document.readyState=='complete'){
		setEvent();
		load();
	}
}