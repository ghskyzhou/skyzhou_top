'use strict';
function urlAssain(child,vpn=0){
	if(!child)child='';
	if(child.startsWith('http://skyzhou.top')||child.startsWith('blob:')||child.startsWith('data:')||child.startsWith('chrome-ext'))return child;
	if(child.search(/^[\w\-]+:\/\//)==0){
		if(vpn)return vpnURL(child);
		return child;
	}
	if(child.startsWith('//')){
		var pro=new URL(now).protocol;
		child=child.replace('//',pro+'//');
		if(vpn)return vpnURL(child);
		return child;
	}
	var path=now.replace(/^https?:\/\//g,'').split('/'),newURL;
	if(!child.startsWith('#')&&!child.startsWith('?')){
		if(child.startsWith('/')){
			path=[path[0]];
			path.push(child.slice(1));
		}else if(child.startsWith('./')){
			path=path.slice(0,-1);
			path.push(child.slice(2));
		}else if(child.startsWith('../')){
			var num=child.match(/\.\.\//g).length;
			path=path.slice(0,-num);
			path.push(child.slice(num*3));
		}else{
			path.push(child);
		}
		newURL=new URL(now).protocol+'//'+path.filter(Boolean).join('/');
	}else{
		newURL=now+child;
	}
	if(vpn)return vpnURL(newURL);
	return newURL;
}
function compile(scr){
	var removeRange=(left,right,str,token)=>str.slice(0,left)+token+str.slice(right+1);
	var strStack=[-1,''],blockStack=[],strArr=[],blockArr=[],defineArr=[];
	var tempStr,tempStr2,delta=0,delta2=0,maxRight=-1,lastBlock=[]; 
	// delta、tempStr是针对第一次修改的   delta2、tempStr2则是针对第二次修改的
	// maxRight保存当前区间的右边界  lastBlock保存上一个区间的信息
	var keywords=["do","if","for","let","new","try","var","case","else","with","await","break","catch","class","const","super","throw","while","yield","delete","export","import","return","switch","default","extends","finally","continue","debugger","function","arguments","typeof","instanceof","in","void"];
	scr=scr+'\n{};';
	scr=scr.replace(/(^import.+$)+/g,function(match){
		return match.split('\n').map(line=>{
			var $url=line.split(/\s+/g).slice(-1)[0];
			var url=$url.slice(1,-1);
			url=urlAssain(url);
			return line.replace(url,$url);
		}).join('\n');
	});
	scr=scr.replace(/\\(.)/g,(match,p1)=>{
		if(!'[](){}\\/'.split('').includes(p1))return match;
		return '\\u'+p1.charCodeAt(0).toString(16).padStart(4,0);
	})
	tempStr=scr;
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
						tempStr=removeRange(i+delta,enter+delta,tempStr,'');
						continue;
					}
					else if(scr[i+1]=='*'){
						var enter=scr.indexOf('*/',i)+1;
						scr=removeRange(i,enter,scr,'');
						tempStr=removeRange(i+delta,enter+delta,tempStr,'');
						continue;
					}
					else if(/[\w\$\)\]]/.test(prev.slice(-1))&&!prev.endsWith('typeof')&&!prev.endsWith('return')){// '/'前面只能是符号而且不能是')'、']'
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
					try{new RegExp(str)}catch(err){continue;}
					// 某些坑逼的正则，例如说 /\/\/([^/]*)\/.*/
					// if(str.length>100)debugger;
					var flag=scr.slice(i+1).trim().match(/^[img]*/);
					flag=(flag==null?'':flag[0]);
					i+=flag.length;
					
				}
				token=String(strArr.length);
				strArr.push([token,pos+delta,i+delta]);
				// 加偏移量是：变后下标-->原下标
				// 减偏移量是反过来的 ， 即下文中的delta2
				scr=removeRange(pos,i,scr,'#'+token+'#');
				delta+=(i-pos+1)-(token.length+2);//计算偏移的长度  原长度-token长度
				i=pos-1+token.length+2;
				strStack=[-1,''];
			}
		}
	}
	tempStr2=scr;
	for(var i=0;i<scr.length;i++){
		var ch=scr[i];
		// if(ch=='\n')debugger;
		if(ch=='{'||ch=='}'){
			if(ch=='{'){
				blockStack.push(i);
			}else{
				var pos=blockStack.pop();
				function checkIsFunction(str){//确认是否是一个函数的定义  function ...(...)
					var prev=str.trim(),left=0,right=0;
					if(!prev.endsWith(')'))return false;
					do{
						var idx=prev.lastIndexOf('(');
						var str=prev.slice(idx);
						left+=(str.match(/\(/g)?str.match(/\(/g).length:0);
						right+=(str.match(/\)/g)?str.match(/\)/g).length:0);
						prev=prev.slice(0,idx);
					}while(left!==right);
					prev=prev.trim();
					if(!prev.endsWith('function')&&/(if|for|do|while|catch)$/g.exec(prev)==null&&/(get|function)\s+\w+$/.exec(prev)!==null)return true; //处理命名函数
					return prev.endsWith('function');
				}
				function checkIsObject(str,idx){//确认是否是一个对象  {XXX:..,XX:..}
					blockArr.filter(ele=>ele[0]>=idx&&ele[1]<=idx+str.length-1).reverse().forEach(ele=>{
 						var [left,right]=ele;
 						str=removeRange(left-idx,right-idx,str,'$0$');//随便填个什么东西上去
 					});
 					if(str.search(/(?!\w)(var|let|const)\s+[^;\n]+(;\n)/)!==-1)return false;
 					if(/\{\s*\}/.test(str))return true; //特殊处理，空对象
 					str=','+str.slice(1,-1).replace(/,*$/,'')+',temp:';
 					var key=0,val=0,lastIdx=0,entries=[];
 					blockArr.filter(ele=>ele[0]>=idx&&ele[1]<=idx+str.length-1).reverse().forEach(ele=>{
 						var [left,right]=ele;
 						str=removeRange(left-idx,right-idx,str,'$0$');//随便填个什么东西上去
 					});
					str.replace(/,\s*[\w\$#]+\s*:/g,function(match,idx,tempStr){
						key++;
						if(lastIdx)val++;
						lastIdx=idx+match.length+1;
						return match;
					});
					key--;
					if(!key||!val||key!==val)return false;
					return true;
				}
				var isFunction=checkIsFunction(scr.slice(0,pos)),isObject=checkIsObject(scr.slice(pos,i+1),pos);
				if(!isFunction&&!isObject)continue;
				// if(token=='18')debugger;
				blockArr.push([pos,i]);
			}

		}
	}
	blockArr.sort((a,b)=>a[0]-b[0]);
	//以区间左边从小到大排序
	for(var i=0;i<blockArr.length;i++){
		var [left,right]=blockArr[i];
		if(right<maxRight)continue;
		//判断是否在原区间
		maxRight=right;
		if(lastBlock.length!==0){
			var [l,r]=lastBlock;
			var token=String(i);
			scr=removeRange(l-delta2,r-delta2,scr,'$'+token+'$');//这里要用减法！！！
			blockArr.push([token,l,r]);
			delta2+=(r-l+1)-(token.length+2);
			//计算偏移的长度  原长度-token长度
			if(right==tempStr2.length-2){
				break;
			}
		}
		lastBlock=[left,right];
	}
	blockArr=blockArr.filter(ele=>ele.length==3).reverse();
	scr=scr.replace(/;/g,';\n');
	scr=scr.replace(/,\s*/g,',');
	scr=scr.replace(/(var|let|const)\s+?[^\n;]+?\s*(;|\n$)/g,function(match,p1){
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
			var str=vars[i];
			if(vars[i].indexOf('[')!==-1||vars[i].indexOf('(')!==-1){
				try {
					skip(vars,i);
				} catch(e) {
					console.log(e,match);
					debugger;
					return match;
				}
				var next=skip(vars,i);
				str=vars.slice(i,next+1).join(',');
				i=next;
			}
			var varName,varVal,eqIdx=str.indexOf('=');
			varName=eqIdx==-1?str:str.slice(0,eqIdx).trim();
			if(varName.search(/[^\w\$]/)!==-1)return match;
			varVal=eqIdx==-1?'':str.slice(eqIdx+1);
			varArr.push(varName);
		}
		defineArr.push(...varArr);
		return match.replace(p1,'');
	});
	// /(var|const|let)(\s*?[\w\$]+?\s*?(=\s*[^;=]+?)?\s*?)(,\s*?[\w$]+?\s*?(=\s*?[^;=]+?)?\s*)*?\s*?($|;)/mg
	scr=scr.replace(/(function\s*[^\(\s]+?|function|(?!function\s*)[a-zA-Z_$][\w$]*?)\s*\(([^\)\}\(]*?)\)\s*\$/g,(match,p1,p2,idx)=>{
		if(keywords.includes(p1)&&p1!=='function')return match;
		if(p1.indexOf('function')==-1)p1='';
		p1=p1.replace('function','').trim();
		return `${(p1!==''?`${p1}=`:'')}function(${p2})$`;
	});
	defineArr=[...new Set([...defineArr])];
	// 除去重复的变量名
	var res=defineArr.reduce((val,ele)=>val+=`${ele}=(typeof ${ele} =="undefined"? undefined:${ele});\n`,'')+'\n';
	scr=res+scr;
	function turn(arr,ch,temp){
		for(var i=0;i<arr.length;i++){
			var pat=ch+arr[i][0]+ch,left=arr[i][1],right=arr[i][2];
			var idx=scr.indexOf(pat);
			// console.log(scr);
			scr=scr.slice(0,idx)+temp.slice(left,right+1)+scr.slice(idx+pat.length);
		}
	}
	turn(blockArr,'$',tempStr2);
	scr=scr.replace(/\}/g,'}\n');
	turn(strArr,'#',tempStr);
	return scr;
}
onmessage=function(msg){
	var data=msg.data;
	// console.log(data);
	this.now=data.now;
	postMessage({script:compile(data.script),id:data.id,url:data.url});
	console.log(`end ${data}`)
}