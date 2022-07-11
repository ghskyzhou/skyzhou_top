var nameList=['实时热点','七日热点','今日热点','体育热点','娱乐热点','民生热点'];
var datas={"七日热点":{},"今日热点":{},"体育热点":{},"娱乐热点":{},"实时热点":{},"民生热点":{}};

async function getBD(){
	var list=await fetch('http://top.baidu.com/buzz?b=1');
	list=await list.text();
	var container=document.createElement('html');
	container.innerHTML=list;
	list=container.querySelectorAll('#sub-nav >li > a');
	fine={};
	delete container;
	list.forEach(async (link,idx)=>{
		var tag=document.createElement('html');
		link=link.href.replace('chrome-extension://'+chrome.runtime.id,'http://top.baidu.com');
		var res=await fetch(link);
		res=await res.blob();
		var fr=new FileReader();
		fr.readAsText(res,'GBK');
		fr.onload=(eve)=>{
			tag.innerHTML=eve.target.result;
			nodes=tag.querySelectorAll('tbody tr:not([class=item-tr]):not(:first-child)');
			var data=[];
			nodes.forEach(ele=>{
				var json={};
				json.key=ele.children[1].children[0].innerText;
				json.new=ele.children[1].childElementCount-2;
				json.links={};
				json.search={};
				json.links.info=ele.children[1].children[0].href;
				json.links.news=ele.children[2].children[0].href;
				json.links.video=ele.children[2].children[1].href;
				json.links.image=ele.children[2].children[2].href;
				json.search={};
				json.search.number=Number(ele.children[3].innerText);
				var className=ele.children[3].children[0].className;
				json.search.status=(className.endsWith('rise')?1:(className.endsWith('fall')?-1:0));
				data.push(json);
			})
			switch(idx){
				case 0:
					fine['实时热点']=data;
					break;
				case 1:
					fine['今日热点']=data;
					break;
				case 2:
					fine['七日热点']=data;
					break;
				case 3:
					fine['民生热点']=data;
					break;
				case 4:
					fine['娱乐热点']=data;
					break;
				case 5:
					fine['体育热点']=data;
					break;
			}
			if(nameList.every(ele=>fine[ele]!=null)){
				callback(fine);
				checkUpdate([nameList[0]]);
				checkUpdate(nameList.slice(1));
			}
		}
	})
}

callback=res=>{
	localStorage.result=JSON.stringify(res);	
}

clearOld=(datas)=>{
	nameList.forEach(res=>{
		var list=Object.keys(datas[res]);
		var json={},date=Date.now();
		list.forEach(name=>{
			var data=datas[res][name];
			var end=data.slice(-1)[0][0];
			var del=1000*60*60*24*Number(localStorage.delTime);
			var out=1000*60*60*24*Number(localStorage.outTime);
			if(date-end<=del){
				var fil=data.filter(ele=>{return date-ele[0]<=out});
				if(fil.length)json[name]=fil;
			}
		});
		datas[res]=json;
	});
	return datas;
}

checkUpdate=(list)=>{
	var checkTime=(pre,now,long)=>{
		if(pre.length==0)return false;
		pre=pre.slice(-1)[0][0];
		if(long)return pre==now;
		else return (now-pre)<Number(localStorage.updateTime)*60*60*1000;
	}
	res=JSON.parse(localStorage.result);
	list.forEach(name=>{
	    var obj=res[name];
	    var date=new Date();
	    if(list.length==1)
	    	date=new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours()).getTime();
	    else date=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
	    obj.forEach(data=>{
	    	if(typeof datas[name][data.key] ==='undefined')datas[name][data.key]=[];
	    	if(checkTime(datas[name][data.key],date,list.length!==1))
	    		return;
	    	datas[name][data.key].push([date,data.search.number]);
	    });
	});
	if(localStorage.clearData=='true')datas=clearOld(datas);
	localStorage.rankDatas=JSON.stringify(datas);
}

chrome.runtime.onMessage.addListener(res=>{
	clearInterval(Number(localStorage.handle));
	load();
});

load=()=>{
	if(!localStorage.lastRead)localStorage.lastRead=0;
	if(!localStorage.time)localStorage.time=30;
	localStorage.handle=setInterval(getBD,Number(localStorage.time)*1000,0);
	if(!localStorage.updateTime)localStorage.updateTime=1;
	if(localStorage.rankDatas)datas=JSON.parse(localStorage.rankDatas);
	if(!localStorage.delTime)localStorage.delTime=3;
	if(!localStorage.outTime)localStorage.outTime=14;
	if(!localStorage.clearData)localStorage.clearData=true;
	if(!localStorage.getShort)localStorage.getShort=false;
	getBD();
}

load();