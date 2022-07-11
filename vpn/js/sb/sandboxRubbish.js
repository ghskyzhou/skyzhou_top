function sandBox(){
	this.tempName='TEMPVAR'+Math.round(Math.random()*1000000);
	this.data={};
	this.env={};
	this.timeout=1000;
	this.data.scopes={};
	this.data.golbal={};
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
	'RegExp':RegExp
};
//顾名思义，提供最基础的环境。
sandBox.prototype.init=function(scr,compiled){
	var res=(compiled?scr:this.compile(scr)),tempName=this.tempName;
	var temp={},scopes=[];
	scopes.length=res.scopesLen+2;
	scopes=scopes.fill({});
	this.data.scopes=scopes;
	var func=new Function(res.tempName,res.compiledScript);
	return func;
}
sandBox.prototype.runAsync=function(scr,compiled=false){
	var func=this.init(scr,compiled);
	var promiseFunc=new Promise((res,rej)=>{
		setTimeout(()=>{
			if(this.ontimeout)this.ontimeout();
			rej();
		},this.timeout);
		func(this.data);
		if(this.onfinish)this.onfinish();
		res();
	});
	return promiseFunc;
}
sandBox.prototype.setup=function(config=this.env){
	this.data.golbal={...sandBox.basicEnv,...config};
	if(typeof window!='undefined')window[this.tempName]=this.data;
	this.env={...config};
}
sandBox.prototype.compile=function(scr){
	function walk(id,vars){
		if(id!==blockArr.length-1)
			blockArr[id].content=blockArr[id].content.replace(/(var|let|const|def)\s+(([\w$]+?(=[^;]+)?(,|;|\n))+)/mg,(match,p1,p2)=>{
				p2=p2.replace(/;\s*$/g,'').split(',');
				p2=p2.map(str=>{
					str=str.split('=');
					str[0]=str[0].trim();
					vars[str[0]]=id;
					if(p1=='const')str[0]=tempName+'_CONSTVARS'+str[0];
					return str.join('=');
				});
				return p1+' '+p2.join(',')+(p1=='def'?'\n':';/*呃呃呃*/');
			});
		blockArr[id].content=blockArr[id].content.replace(/(?!:\.)\.?[a-zA-Z_\$][\w\$]*/g,function(match,idx){
			var scope='golbal',leftContent=blockArr[id].content.slice(0,idx).trim(),rightContent=blockArr[id].content.slice(idx+match.length).trim();
			if(match.startsWith(tempName+'_FUNCTIONARGS'))return match.replace(tempName+'_FUNCTIONARGS','');
			if((leftContent.endsWith('{')||(leftContent.endsWith(',')))&&rightContent.startsWith(':'))return match;
			if(match=='var'||match=='let'||match==`${tempName}def`)return '';
			if(keywords.includes(match.replace(new RegExp(tempName+'.+?\\$.+?\\$','g'),'').trim()))return match;
			if(match.startsWith('this')||match.startsWith(tempName)||match.startsWith('.'))return match;
			if(match.startsWith(tempName+'_CONSTVAR'))scope="scopes[\"const\"]";
			if(vars[match]!==undefined)scope=`scopes["${vars[match]}"]`;
			return `${tempName}.${scope}.${match}`;
		});
		for(child of blockArr[id].child)walk(child,vars);
	}
	var removeRange=(left,right,str,token)=>str.slice(0,left)+token+str.slice(right+1);
	var toReg=(token)=>new RegExp(token.trim().replace(/\$/g,'\\$'),'g');
	var tokenProduce=(type=true)=>(type?'$':"")+String(Math.round(Math.random()*1000000)).padStart(6,'0')+(type?'$':"");
	var strStack=[-1,''],blockStack=[],arrayStack=[];
	var strArr=[],blockArr=[],funcArr=[],regArr=[],objectArr=[];
	var prefix='';
	var keywords=["do","if","for","let","new","try","var","case","else","with","await","break","catch","class","const","super","throw","while","yield","delete","export","import","return","switch","default","extends","finally","continue","debugger","function","arguments","typeof","instanceof","in","void"];
	var tempName=this.tempName;
	var tempscr=scr;
	scr='{\n'+scr+'\n}';
	scr=scr.replace(/\\(.)/g,(match,p1)=>{
		if('abfnrtv\/\"\'\`'.split('').includes(p1))return match;
		return '\\u'+p1.charCodeAt(0).toString(16).padStart(4,0);
	})
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		if((ch=='\''||ch=='"'||ch=='`'||ch=='\/')&&scr[i-1]!=='\\'){
			if(!strStack[1]){
				var prev=scr.slice(0,i).trim();
				if(ch=='\/'&&prev.slice(-1).search(/[\w\$\)]/)!==-1&&!prev.endsWith('typeof')&&!prev.endsWith('return'))continue;
				strStack=[i,ch];
			}
			else if(strStack[1]==ch){
				var pos=strStack[0],token;
				if(ch=='\/'){
					if(pos==i-1){
						strStack=[-1,''];
						continue;
					}
					token=' '+tempName+'_REGVARS'+tokenProduce()+' ';
					var flag=scr.slice(i+1).trim().match(/^[img]*/);
					flag=(flag==null?'':flag[0]);
					i+=flag.length;
					regArr.push([token,`${scr.slice(pos,i+1)}`]);
				}
				else {
					token=' '+tempName+'_STRINGVARS'+tokenProduce()+' ';
					strArr.push([token,`${scr.slice(pos,i+1)}`]);
				}
				scr=removeRange(pos,i,scr,token);
				i=pos-1+token.length;
				strStack=[-1,''];
			}
		}
	}
	scr=scr.replace(/(?<!\\)\/(?<!\\)\/.+$/mg,'');
	scr=scr.replace(/,\n|\n,/g,',');
	scr=scr.replace(/(?<!\w)try(?!\w)/g,' try ');
	scr=scr.replace(/(\d+e(\-|\+)?\d+)|(0x[a-f\d]+)/g,function(match){
		var idx=[...arguments].slice(-2,-1)[0];
		var ch=scr[idx+1],num=Number(match).toLocaleString().replace(/,/g,'');
		if(ch=='.')return num;
		else return '('+num+')';
	});
	scr=scr.replace(/\}/g,'}\n');
	scr=scr.replace(/catch\s*\(([^\)]+)\)\s*\{/g,`catch(${tempName}_FUNCTIONARGS$1){$1=${tempName}_FUNCTIONARGS$1\n`);
	var pos=[];
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		if(ch=='['||ch==']'){
			if(ch=='['){
				arrayStack.push(i);
			}else{
				var last=arrayStack.pop(),token=tempName+'_ARRAY'+tokenProduce();
				var sameArray=`(function(){return ${scr.slice(last,i+1)}})()`;
				scr=removeRange(last,i,scr,sameArray);
				i=last-1+sameArray.length;
			}
		}
	}
	scr=scr.replace(/(function\s*[^\(\s]+?|function|(?!function\s*)\w+?)\s*\(([^\)\}\(]*?)\)\s*\{/g,(match,p1,p2,idx)=>{
		if(keywords.includes(p1)&&p1!=='function')return match;
		p1=p1.replace('function','').trim();
		var defs=[];
		var args=p2.split(',').filter(Boolean).map(str=>{
			if(str.trim()=='')return;
			defs.push(str.replace(/=.+$/g,'').trim());
			if(str.split('=').length>1){
				var [arg,defaultVal]=str.split('=');
				return `var ${arg}=(${tempName}_FUNCTIONARGS${arg}?${tempName}_FUNCTIONARGS${arg}:${defaultVal});`;
			}else{
				return `var ${str}=${tempName}_FUNCTIONARGS${str};`;
			}
		});
		args=args.join('\n')+'\n';
		var token=tempName+'_FUNC'+tokenProduce();
		funcArr.push([token,defs.join(',')]);
		return `${(p1!==''?` ${tempName}def ${p1}=`:'')}function(${token}){${args}`;
	});
	scr=scr.replace(/\(?([\w,\$]*)\)?=>(\{|[^\{]+\n)/g,(match,p1,p2)=>{
		var defs=[];
		var args=p1.split(',').filter(Boolean).map(str=>{
			if(str.trim()=='')return;
			defs.push(str.replace(/=.+$/g,''));
			if(str.split('=').length>1){
				var [arg,defaultVal]=str.split('=');
				return `var ${arg}=(${tempName}_FUNCTIONARGS${arg}?${tempName}_FUNCTIONARGS${arg}:${defaultVal});`;
			}else{
				return `var ${str}=${tempName}_FUNCTIONARGS${str};`;
			}
		});
		args=args.join('\n')+'\n';
		var token=tempName+'_FUNC'+tokenProduce();
		funcArr.push([token,defs.join(',')]);
		if(match.indexOf('{')==-1)return `(${token})=>{${args}\nreturn ${p2};}\n`;
		else return `(${token})=>{${args}`;
	});
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		if(ch=='{'||ch=='}'){
			if(ch=='{'){
				blockStack.push({child:[],token:'',pos:i,content:''});
			}else{
				var last=blockStack.pop(),token=tempName+'_BLOCKS'+tokenProduce(),ch=' ';
				while(scr[i+1]&&!scr[i+1].search(/\s/)){
					i++;
					if(scr[i]=='\n')ch='\n';
				}
				last.token=token+ch;
				last.content=scr.slice(last.pos,i+1);
				if(blockStack.length)blockStack.slice(-1)[0].child.push(blockArr.length);
				scr=removeRange(last.pos,i,scr,last.token);
				i=last.pos-1+last.token.length;
				blockArr.push(last);
			}
		}
	}
	walk(blockArr.length-1,{});
	for(var i=blockArr.length-1;i>=0;i--){
		scr=scr.replace(toReg(blockArr[i].token),()=>blockArr[i].content);
	}
	for(var i=0;i<funcArr.length;i++)scr=scr.replace(toReg(funcArr[i][0]),()=>funcArr[i][1]);
	for(var i=0;i<regArr.length;i++)scr=scr.replace(toReg(regArr[i][0]),()=>regArr[i][1]);
	for(var i=0;i<strArr.length;i++)scr=scr.replace(toReg(strArr[i][0]),()=>strArr[i][1]);

		if(typeof window=='undefined')console.log(scr.trim().slice(1,-1).split('\n').slice(325,340))
			else if(typeof debug!=='undefined')console.log(scr.trim().slice(1,-1))
	return {compiledScript:scr.trim().slice(1,-1),scopesLen:blockArr.length,tempName:this.tempName};
}

var sb=new sandBox();
if(typeof window!='undefined')sb.setup({
	...window,
	'window':window,
	'eval':eval,
	'Image':Image,
	'Math':Math,
	'btoa':btoa,
	'console':console,
	Date:Date
})
else sb.setup({});
if(typeof window=='undefined')sb.runAsync(``);
/*
"use strict";(function(){var config={pid:"1_79",sample:{jsnotfound:.02},logServer:"https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif"};function shouldSend(sample){if(!sample){return false}var hitCookie=document.cookie.indexOf("webbtest=1")>-1;return hitCookie||Math.random()<sample}})();
*/
/*
`
	"use strict";
	(function(){
		var config={pid:"1_79",sample:{jsnotfound:.02},logServer:"https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif"};
		function shouldSend(sample){
			if(!sample){return false}
			var hitCookie=document.cookie.indexOf("webbtest=1")>-1;
			return hitCookie||Math.random()<sample
		}
		function send(obj){
			if(!shouldSend(config.sample[obj.group])){return""}
			var logUrl=config.logServer+"?pid="+config.pid+"&lid="+bds.comm.qid+"&ts="+Date.now()+"&type=except&group="+obj.group+"&info="+encodeURIComponent(JSON.stringify(obj.info))+"&dim="+encodeURIComponent(JSON.stringify(obj.dim||{}));
			var img=new Image;
			img.src=logUrl;
			return logUrl
		}
		function jsError(event){
			try{
				var obj={info:{},dim:{},group:""};
				var info=obj.info;
				var target=event.target;
				var dataConnection=navigator.connection||{};
				info.downlink=dataConnection.downlink;
				fo.effectiveType=dataConnection.effectiveType;
				info.rtt=dataConnection.rtt;
				info.deviceMemory=navigator.deviceMemory||0;
				info.hardwareConcurrency=navigator.hardwareConcurrency||0;
				var localName=target.localName||"";
				var errorLink=target.src||"";
				if(localName&&localName==="script"){obj.group="jsnotfound";info.msg=errorLink;info.file=errorLink;send(obj)}
			}
			catch(e){
				console.error(e)
			}
		}
		window.addEventListener&&window.addEventListener("error",jsError,true)})();

*/