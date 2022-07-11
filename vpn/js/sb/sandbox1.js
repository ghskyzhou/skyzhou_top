function sandBox(){
	this.data={};
	this.env={...sandBox.basicEnv};
	this.timeout=1000;
	this.onfinish=null;
	this.ontimeout=null;
	this.oncompilederror=null;
	return this;
}
sandBox.basicEnv={
	'Function':Function,
	'Number':Number,
	'String':String,
	'Object':Object,
	'Array':Array,
	'Boolean':Boolean,
	'RegExp':RegExp,
	'eval':eval
};
sandBox.proxyHandle={
	'get':function(target,prop,rec){
		// if(prop=='a')return 'a';
		// if(!target[prop])return 'aaaa';
		return target[prop];
	},
	'set':function(target,prop,val,rec){
		// console.log(prop);
		target[prop]=val;
		return val;
	}
};
//顾名思义，提供最基础的环境。
sandBox.prototype.runAsync=function(script){
	script=this.compile(script);
	if(typeof debug!=='undefined')console.log(script);
	console.log([script]);
	var runner=new Function('globalData',`
		with(globalData){
			${script}
		}
		return globalData;
	`);
	// if(script.indexOf('jQuery')!==-1)debugger;
	this.data=runner(this.data);

	return this;
}
sandBox.prototype.compile=function(scr){
	var ggg=scr.startsWith('function addEV(e,t,i)');
	if(ggg)debugger;
	var removeRange=(left,right,str,token)=>str.slice(0,left)+token+str.slice(right+1);
	var strStack=[-1,''],blockStack=[],regArr=[],strArr=[],blockArr=[],defineArr=[];
	var tokenProduce=(type=true)=>(type?'$':"")+String(Math.round(Math.random()*1000000)).padStart(6,'0')+(type?'$':"");
	var keywords=["do","if","for","let","new","try","var","case","else","with","await","break","catch","class","const","super","throw","while","yield","delete","export","import","return","switch","default","extends","finally","continue","debugger","function","arguments","typeof","instanceof","in","void"];
	scr=scr.replace(/\\(.)/g,(match,p1)=>{
		if('abfnrtv\/\"\'\`wWdDsS*'.split('').includes(p1))return match;
		return '\\u'+p1.charCodeAt(0).toString(16).padStart(4,0);
	})
	// scr=scr.replace(/\/\*[\S\s]+?\*\//g,'');
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		if((ch=='\''||ch=='"'||ch=='`'||ch=='\/')&&scr[i-1]!=='\\'){
			if(!strStack[1]){
				if(ch=='\/'){
					var prev=scr.slice(0,i).trim();
					if(scr[i+1]=='\/'){
						var enter=scr.indexOf('\n',i)-1;
						if(enter==-1)enter=scr.length;
						scr=removeRange(i,enter,scr,'');
						continue;
					}
					else if(scr[i+1]=='*'){
						var enter=scr.indexOf('*/',i)+1;
						scr=removeRange(i,enter,scr,'');
						continue;
					}
					else if(prev.slice(-1).search(/[\w\$\)]/)!==-1&&!prev.endsWith('typeof')&&!prev.endsWith('return')){
						continue;
					}//检查是否是除号  例如说1/2
				}
				strStack=[i,ch];
			}
			else if(strStack[1]==ch){
				var pos=strStack[0],token;
				if(ch=='\/'){
					var str=scr.slice(pos,i+1);
					if((str.startsWith('/*')&&str.endsWith('*/'))){
						strStack=[-1,''];
						continue;
					}
					token=tokenProduce();
					var flag=scr.slice(i+1).trim().match(/^[img]*/);
					flag=(flag==null?'':flag[0]);
					i+=flag.length;
					regArr.push([token,`${scr.slice(pos,i+1)}`]);
				}
				else {
					if(i>= 150077&&ggg){
						debugger;
						ggg=!1;
						// console.log(scr.slice(pos,i+1));
						// console.log(scr.slice(i-50,i)+'  %c'+scr[i],'color:white;background:red;',scr.slice(i+1,i+51));
					}
					token=tokenProduce();
					strArr.push([token,`${scr.slice(pos,i+1)}`]);
				}
				scr=removeRange(pos,i,scr,token);
				i=pos-1+token.length;
				strStack=[-1,''];
			}
		}
	}
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		// if(ch=='\n')debugger;
		if(ch=='{'||ch=='}'){
			if(ch=='{'){
				blockStack.push(i);
			}else{
				var pos=blockStack.pop();
				if(!blockStack.length){

					var token=tokenProduce();
					blockArr.push([token,scr.slice(pos,i+1)]);
					scr=removeRange(pos,i,scr,token);
					i=pos-1+token.length;
				}
			}
		}
	}
	blockArr=blockArr.reverse();
	scr=scr.replace(/;/g,';\n');
	scr=scr.replace(/(var|const|let)(\s*[\w$]+?\s*(=\s*[^;=]+?)?\s*)(,\s*[\w$]+?\s*(=\s*[^;=]+?)?\s*)*\s*(\n|;)/mg,function(match,p1){
		// if(match.indexOf('{')!==-1){
		// 	console.log(match);
		// 	debugger;
		// }
		var vars=match.replace(p1,'').slice(0,-1).trim().split(','),varArr=[];
		function skip(arr,idx){
			var num1=0,num2=0;
			while(1){
				num1+=(arr[idx].match(/\[/g)? arr[idx].match(/\[/g).length:0);
				num1-=(arr[idx].match(/\]/g)? arr[idx].match(/\]/g).length:0);
				num2+=(arr[idx].match(/\(/g)? arr[idx].match(/\(/g).length:0);
				num2-=(arr[idx].match(/\)/g)? arr[idx].match(/\)/g).length:0);
				if(num1==0&&num2==0)return idx;
				idx++;
			}
		}
		for(var i=0;i<vars.length;i++){
			if(vars[i].indexOf('[')!==-1||vars[i].indexOf('(')!==-1){
				i=skip(vars,i)+1;
			}else{
				if(vars[i].indexOf('=')==-1){
					varArr.push(vars[i]);
				}
			}
		}
		var res=varArr.reduce((val,ele)=>val+=`${ele}=undefined;\n`,'')+'\n';
		defineArr.push(res);
		return match;
	});
	scr=scr.replace(/(function\s*[^\(\s]+?|function|(?!function\s*)\w+?)\s*\(([^\)\}\(]*?)\)\s*\$/g,(match,p1,p2,idx)=>{
		if(keywords.includes(p1)&&p1!=='function')return match;
		if(p1.indexOf('function')==-1)p1='';
		p1=p1.replace('function','').trim();
		return `${(p1!==''?`${p1}=`:'')}function(${p2})$`;
	});
	scr=scr.replace(/(let|var|const)/g,'');
	scr=defineArr.join('')+scr;
	for(var i=0;i<blockArr.length;i++)scr=scr.replace(blockArr[i][0],()=>blockArr[i][1]);
	scr=scr.replace(/\}/g,'}\n');
	for(var i=0;i<regArr.length;i++)scr=scr.replace(regArr[i][0],()=>regArr[i][1]);
	for(var i=0;i<strArr.length;i++)scr=scr.replace(strArr[i][0],()=>strArr[i][1]);
	return scr;
}
sandBox.prototype.setup=function(config={}){
	this.env={...this.env,...config};
	return this;
}
sandBox.prototype.ready=function(){
	this.data=new Proxy(this.env,sandBox.proxyHandle);
};


var sb=new sandBox();
if(typeof window!='undefined'){

}
else sb.setup({
	'console':console,
});
if(typeof window=='undefined'){
	sb.runAsync(`
		function a(b){
			return b+1;
		}
	`);
	sb.runAsync(`
		console.log(a(1));
	`);
}