var ws=io('http://skyzhou.top:8028',{translates:['websoket']});
ws.on('url response',getContent);

function getContent(data){
	data=JSON.parse(data);
	var id=data.id;
	if(!data.body)data.body=undefined;
	if(!data.header)data.header=undefined;
	data.url=decodeURIComponent(data.url);
	fetch(data.url,{
		body:data.body,
		headers:data.header,
		method:'GET'
	}).then(res=>res.blob().then(blo=>blo.arrayBuffer().then(buf=>{
		ws.emit('web event',id,buf,blo.type);
	}))).catch(err=>{
		var blo=new Blob([err.toString()]);
		blo.arrayBuffer().then(buf=>{
			ws.emit('web event',id,buf,'x-vpn-error');
		});
	});
}

// ws.on('web event', data=>console.log(data));