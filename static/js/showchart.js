var dataArr=[],names=[],result=JSON.parse(localStorage.rankDatas);
var nameList=['实时热点','七日热点','今日热点','体育热点','娱乐热点','民生热点'];
var draw=()=>{
	var itemList=document.querySelector('.now .sublist');
	var start=itemList.nextElementSibling.children.start.value;
	var end=itemList.nextElementSibling.children.end.value;
	if(start!=="")start=new Date(start).getTime();
	else start=-1;
	if(end!=="")end=new Date(end).getTime();
	else end=Infinity;
	names=[],dataArr=[];
	itemList.querySelectorAll('li').forEach(ele=>{
		names.push(ele.innerText);
		var path=ele.dataset.path;
		var tmpDatas=result[path.split('\u200b')[0]][path.split('\u200b')[1]];
		dataArr.push({
			name:ele.innerText,
			data:tmpDatas.filter(ele=>(ele[0]>=start)&&(ele[0]<=end))
		});
	});
	if(names.length==0){
		document.getElementById('container').innerHTML='';
		return;
	}
	var json={
	  "chart": {"type": "spline"},
	  "title": {"text": "搜索指数-"+names.join(' vs ')},
	  "subtitle":{"text":"数据整理 By yuckxi"},
	  "exporting":{"enabled": true},
	  "tooltip": {
	  	"headerFormat": "<b>{series.name}</b><br>",
	    "pointFormat": "{point.x:%Y年%b月%e日%H}时<br>搜索指数: {point.y}"
	  },
	  "xAxis": {"type": "datetime","title": {"text": "时间"}},
	  "yAxis": {"title": {"text": "搜索指数"},"min": 0},
	  "series": dataArr,
	  "plotOptions": {"spline": {"marker": {"enabled": true}}}
	};
	Highcharts.chart('container',json);
}
var load=()=>{
	nameList.forEach(type=>{
		var list=JSON.stringify(result[type]).match(/"[^\"]+"/g).map(ele=>ele.slice(1).slice(0,-1));
		var container=document.querySelector('.list[name='+type+'] ul');
		list.forEach(name=>{
			var li=document.createElement('li');
			li.dataset.path=type+'\u200b'+name;
			li.title=name;
			li.innerText=name;
			container.append(li);
		});
	});
}
var addItem=item=>{
	var con=document.querySelector('.now');
	var itemList=con.children[1];
	itemList.innerHTML+=item.outerHTML;
	con.children[0].className=con.children[2].className='';
	item.style="display:none;";
	itemList.querySelectorAll('li').forEach(ele=>{
		ele.onclick=function(){
			removeItem(this);
		};
	});
	draw();
}
var removeItem=item=>{
	var con=document.querySelector('.now');
	var itemList=con.children[1];
	var path=item.dataset.path;
	itemList.removeChild(item);
	draw();
	if(itemList.childElementCount==0)con.children[0].className=con.children[2].className='nothing';
}

var setEvent=()=>{
	var buttons=document.querySelectorAll('.list span');
	buttons.forEach(btn=>{
		btn.onclick=function(){
			this.className=(this.className.indexOf('close')==-1?'close':'open')+this.dataset.init;
			var list=this.nextElementSibling;
			var height=list.childElementCount*20+100;
			if(list.children[0].style.marginTop=='0px'||list.children[0].style.marginTop=='')
				list.children[0].style.marginTop="-"+height+"px";
			else list.children[0].style.marginTop='0px';
		}
		btn.dataset.init='';
		btn.click();
		btn.nextElementSibling.style.display="";
		btn.dataset.init=' ani';
	});
	var details=document.querySelectorAll('.sublist li');
	details.forEach(dtl=>{
		dtl.onclick=function(){
			addItem(this);
		}
	});
	var in1=document.querySelector('.in');
	var in2=document.querySelector('.in:last-child');
	in1.onchange=in2.onchange=draw;
	var searchIn=document.querySelector('.search span');
	searchIn.onkeyup=function(){
		if(document.querySelector('.search span').innerText==''){
			document.querySelector('.result').style='display:none;';
			document.querySelector('.result h3').className='';
			this.nextElementSibling.innerHTML='';
		}
		var tags='',resList=document.querySelector('.result ul');
		var ptn='.list .sublist li[title*='+this.innerText+']:not([style="display: none;"])';
		var ansList=document.querySelectorAll(ptn);
		ansList.forEach(ele=>tags+=ele.outerHTML.replace(/style="[^"]+"/g,''));
		resList.innerHTML=tags;
		resList.previousElementSibling.className=(tags?'':'nothing');
		resList.parentElement.style="";
		resList.querySelectorAll('li').forEach(ele=>ele.onclick=function(){
			document.querySelector('.result').style='display:none;';
			document.querySelector('.result h3').className='';
			addItem(this);
			this.parentElement.innerHTML='';
			document.querySelector('.search span').innerText='';
		});

	}
}
document.onreadystatechange=()=>{
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
	if(document.readyState=='complete'){
		load();
		setEvent();
	}
}