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