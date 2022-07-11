var rankDatas=undefined,result=undefined,typeArr=[],typ='';
draw=()=>{
	var names=[],dataArr=[];
	document.querySelectorAll('.item-on').forEach(ele=>{
		var typ=ele.dataset.path.split('\u200b')[0],key=ele.dataset.path.split('\u200b')[1];
		names.push(key);
		var tmpDatas=rankDatas[typ][key];
		dataArr.push({
			name:key,
			data:tmpDatas
		});
	});
	if(names.length==0){
		document.getElementById('container').innerHTML='';
		document.getElementById('container').dataset.have=0;
		return;
	}
	document.getElementById('container').dataset.have=1;
	var json={
	  "chart": {"type": "spline"},
	  "title": {"text": "搜索指数-"+names.join(' vs ')},
	  "subtitle":{"text":"数据整理 By yuckxi"},
	  "exporting":{"enabled": false},
	  "tooltip": {
	  	"headerFormat": "<b>{series.name}</b><br>",
	    "pointFormat": "{point.x:%Y年%b月%e日%H}时<br>搜索指数: {point.y}"
	  },
	  "xAxis": {"type": "datetime","title": {"text": "时间"}},
	  "yAxis": {"title": {"text": "搜索指数"},"min": 0},
	  "series": dataArr,
	  "plotOptions": {"spline": {"marker": {"enabled": true}}},
	  "credits": {"enabled": false},
	};
	var chart=Highcharts.chart('container',json);
	chart.reflow();
}
addItem=ele=>{
	ele.className='item-on';
	draw();
}
removeItem=ele=>{
	ele.className='item-off';
	draw();
}
var node=(data,short)=>{
	var createNode=(localName,className='',text='',extra='')=>{
		var tag=document.createElement(localName);
		tag.className=className;
		// text=(text.length>8?text.slice(0,9)+'...':text);
		tag.innerText=text;
		if(localName=='a'){
			tag.target='__blank';
			tag.href=extra;
		}
		return tag;
	}
	var tr=createNode('tr');
	var tg1=createNode('td'),tg2=createNode('td');
	var a1=createNode('a',(data.new? 'new':''),data.key,data.links.info);
	var tg3=createNode('td','',data.search.number);
	var sta=(data.search.status>0?'rankUp':(!data.search.status?'rankNotChanged':'rankFall'));
	var text=(data.search.status>0?'上升':(!data.search.status?'不变':'下降'));
	var tg4=createNode('td',sta,text);
	var tg5=createNode('td','item-off','');
	tg5.dataset.path=type+'\u200b'+data.key;
	tg5.onclick=function(){
		var now=(this.className=='item-off');
		if(now)addItem(this);
		else removeItem(this);
	};
	tg1.innerHTML=a1.outerHTML;
	tr.innerHTML=tg1.outerHTML+tg3.outerHTML+tg4.outerHTML;
	tr.append(tg5);
	return tr;
}
load=async ()=>{
	if(result==undefined){
		// var url='http://skyzhou.top:8023/jspy_getrank';
		// var formData = new FormData();
		// formData.append("Need_data", "oooo");
		// var xhr=new XMLHttpRequest();
		// xhr.open('POST',url,false);
		// xhr.send(formData);
		// result=JSON.parse(xhr.response);
		// url='http://skyzhou.top:8023/jspy_getdata';
		// fetch(url).then(res=>res.text().then(txt=>{rankDatas=JSON.parse(txt)}));
		result=JSON.parse(localStorage.res);
		rankDatas=JSON.parse(localStorage.data);
	}
	var container=document.querySelectorAll('tbody')[1];
	typeArr=(localStorage.last&&localStorage.last.indexOf('[')!==-1?localStorage.last:(localStorage.last='["实时热点","今日热点","七日热点"]'));
	typeArr=JSON.parse(typeArr);
	type=typeArr[0];
	var item=result[type];
	container.innerHTML='';
	item.forEach((ele,idx)=>{
		var tr=node(ele);
		container.append(tr);
	});
	document.querySelector('h1').innerText=type;
	typeArr.forEach((ele,idx)=>{
		document.querySelector(`span[name=${ele}]`).dataset.idx=idx+1;
	});
}
setEvent=()=>{
	document.querySelectorAll('.contentlist span').forEach(ele=>{
		ele.onclick=function(){
			var typ=this.attributes.name.value;
			var idx=typeArr.indexOf(typ);
			typeArr[idx]='';
			typeArr.unshift(typ);
			typeArr=typeArr.filter(ele=>ele!='');
			localStorage.last=JSON.stringify(typeArr);
			load();
			draw();
		}
	});
}
document.onreadystatechange=()=>{
	if(document.readyState=='complete'){
		load();
		setEvent();
		Highcharts.setOptions({
		    lang:{
		        contextButtonTitle: "图表导出菜单",
		        downloadJPEG:"下载 JPEG 图片",
		        downloadPDF:"下载 PDF 文件",
		        downloadPNG:"下载 PNG 文件",
		        downloadSVG:"下载 SVG 文件",
		        printChart:"打印图表",
		        shortMonths: ['1','2','3','4','5','6','7','8','9','10','11','12']
		    },
		    global: {
		        useUTC: false
		    }
		});
	}
}