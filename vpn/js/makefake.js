var fakeObj=function(obj){
	function turnToObj(target){
		var skip='arguments|prototype|set|get|length|caller|constructor|__proto__|__defineGetter__|__defineSetter__|eval|import|export'.split('|');
		function getAllProperty(obj){
			var arr=[]
			while(obj){
				arr=arr.concat(Object.getOwnPropertyNames(obj));
				obj=Object.getPrototypeOf(obj);
			}
			return arr;
		}
		function walk(obj,fa){
			if(obj instanceof Window)return obj;
			try{
				if(!obj||!obj instanceof Object||!obj instanceof Function||!obj.bind)return obj;
			}
			catch(err){return obj};
			var basicFunc=obj.bind(fa),nameArr=Object.getOwnPropertyNames(obj);
			try{
				basicFunc.prototype=obj.prototype;
			}catch(err){}
			nameArr.forEach(name=>{
				if(skip.includes(name))return;
				try{
					basicFunc[name]=walk(obj[name],obj);
				}catch(err){}
			})
			return basicFunc;
		}
		var res={},nameArr=getAllProperty(target);
		nameArr.forEach(name=>{
			if(skip.includes(name))return;
			res[name]=walk(target[name],target);
		});
		return res;
	}
	var fakeList=[],originList=[],disableList=[],origin=obj;
	obj=turnToObj(obj);
	var proxy=new Proxy(obj,{
		'get':function(target,prop,rec){
			if(prop=='Symbol(Symbol.unscopables)')return {'eval':true};
			if(originList.includes(prop))return origin[prop];
			var fakeItem=fakeList.find(ele=>ele.prop==prop);
			if(!!fakeItem)return fakeItem.item;
			else return target[prop] || origin[prop];
		},
		'set':function(target,prop,val,rec){
			if(originList.includes(prop))return origin[prop]=val;
			try{
				origin[prop]=val;
			}catch(err){}
			return target[prop]=val;
		}
	});
	proxy.fakeFunction=function(obj,prop,op){
		if(prop instanceof Array){
			prop.forEach(pro=>this.fakeFunction(obj,pro,op));
			return;
		}
		var temp=obj[prop];
		temp=temp.bind(obj);
		var fakeFun=function(){
			var args=[...arguments];
			return op(args,temp);
		};
		fakeList.push({'prop':prop,'item':fakeFun});
	}
	proxy.fakeProp=function(prop,val){
		if(prop instanceof Array)prop.forEach(pro=>fakeList.push({'prop':pro,'item':val}));
		else fakeList.push({'prop':prop,'item':val});
	}
	proxy.disableProp=function(prop){
		disableList.push(prop);
	}
	proxy.enableProp=function(prop){
		disableList=disableList.filter(ele=>ele!==prop);
	}
	proxy.useOriginProp=function(prop){
		if(prop instanceof Array)prop.forEach(pro=>originList.push(pro));
		else originList.push(prop);
	}
	return proxy;
}
