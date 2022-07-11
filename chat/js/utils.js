var utils={};
utils.getTime=function(){
	var dt=new Date();
	var timeHour=String(dt.getHours()).padStart(2,'0');
	var timeMin=String(dt.getMinutes()).padStart(2,'0');
	return timeHour+':'+timeMin;
}
utils.containIn=function(ele){
	var y=ele.getBoundingClientRect().y;
	var bottom=ui.container().getBoundingClientRect().bottom;
	return y-bottom<=40;
}
utils.canVideoPlay=function(type){
	return document.createElement('video').canPlayType(type)!=='';
}
utils.canAudioPlay=function(type){
	return document.createElement('audio').canPlayType(type)!=='';
}
utils.checkEmpty=function(ele){
	var ch=[...ele.children];
	return !ch.some(el=>el.tagName!=='BR')&&ele.innerText.trim()=='';
}
utils.replace=function(str){
	str=str.replace(/&amp;/g,'&');
	str=str.replace(/&gt;/g,'>');
	str=str.replace(/&lt;/g,'<');
	str=str.replace(/<br>/g,'\n');
	return str;
}
utils.typeReplace=function(file,msg){
	if(file.type.startsWith('image/'))return `<div><img src="${msg}"></div>`;
	else if(utils.canAudioPlay(file.type))return `<div><audio src="${msg}" controls="controls"></audio></div>`;
	else if(utils.canVideoPlay(file.type))return `<div><video src="${msg}" controls="controls"></video></div>`;
	return msg;
}