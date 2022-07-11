function sandBox(){
	this.data={};
	this.id=0;
	this.last=0;
	this.queue=[];
	this.env={...sandBox.basicEnv};
	this.compiler=new Worker(`${prefix}sb/compiler.js`);
	this.compiler.onmessage=msg=>{
		var data=msg.data,queue=this.queue;
		if(data.id==this.last+1){
			queue.push(data);
			queue.sort((a,b)=>a.id-b.id);
			queue=queue.map(ele=>{
				if(ele.id==this.last+1){
					this.last=ele.id;
					var scriptElement=document.createElement('script');
					scriptElement.src=(ele.url.startsWith('$TEMPURL')?'':ele.url);
					if(typeof scripts!=='undefined')scripts.push(scriptElement);
					if(typeof debug!=='undefined')console.log(ele);
					try{
						this.run(ele.script)
					}catch(err){
						console.log(err,ele)
					};
					// console.log(this.data.bds.comm)
					return false;
				}
				else return ele;
			}).filter(Boolean);
			this.queue=queue;
		}else {
			this.queue.push(data);
		}
	};
	this.waitQueue=[];
	this.running=false;
	return this;
}
sandBox.prototype.runAsync=function(script,url='',insert=false){
	if(script=='TypeError: Failed to fetch')return;
	if(this.running&&!insert){
		this.waitQueue.push([script,url]);
		return this;
	}
	this.running=true;
	this.compile(script,url);
	return this;
}
sandBox.prototype.compile=function(scr,url){
	if(url=='')url='$TEMPURL'+Math.random();
	console.log('%cURL:%s','color:red;',url);
	var compiler=this.compiler;
	// if(scr.indexOf('layer')!=-1)debugger;
	var id=++this.id;
	compiler.postMessage({script:scr,id:id,url:url,now:now});
}
sandBox.prototype.run=function(scr){
	try{
		var runScr=new Function('glo',`
			with(glo){
				(function(){${scr}})()
			}
			return glo;
		`);
		this.data=runScr(this.data);
	}catch(err){
		console.log(err,runScr);
		throw err;
	}finally{
		this.running=false;
		if(!this.waitQueue.length)return;
		var item=this.waitQueue.shift();
		this.compile(...item);
	};
}


// if(typeof window!='undefined'){

// }
// else sb.setup({
// 	'console':console,
// });
// if(typeof window=='undefined'){
// 	sb.runAsync(`
// 		function a(b){
// 			return b+1;
// 		}
// 	`);
// 	sb.runAsync(`
// 		console.log(a(1));
// 	`);
// }