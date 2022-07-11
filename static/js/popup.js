load=()=>{
	var nameList=['实时热点','今日热点','七日热点','民生热点','娱乐热点','体育热点'];
	loaditem=itemname=>{
		var list=document.querySelectorAll('div[name="'+itemname+'"] > ol > li >a');
		list.forEach((ele,idx)=>{
			var data=JSON.parse(localStorage.result);
			data=data[itemname][idx];
			ele.href=data['links']['info'];
			if(data['key'].length<=8)ele.innerText=data['key'];
			else ele.innerText=data['key'].slice(0,8)+'...';
			ele.title=data['key'];
			if(data['new'])ele.className+=' new';
		});
	}
	nameList.forEach(name=>loaditem(name));
}
setEvent=()=>{
	var list=document.querySelectorAll('.typelist > li');
	list.forEach(ele=>{ele.onclick=(eve)=>{
		var tag=eve.target;
		document.querySelectorAll('.typelist > li').forEach(ele=>{ele.className='';});
		tag.className='on';
		var container=document.querySelector('.content');
		container.style='margin-top:-'+Number(tag.dataset.margin)*250+'px';
		localStorage.lastRead=tag.dataset.margin;
	}});
}
document.onreadystatechange=(eve)=>{
	if(document.readyState=="complete"){
		load();
		setEvent();
		document.querySelectorAll('.typelist > li')[Number(localStorage.lastRead)].click();
		document.querySelector('#info').style='display:none';
		document.querySelector('.main').style='';
	}
}