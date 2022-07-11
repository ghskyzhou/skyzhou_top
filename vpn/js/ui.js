var $=que=>document.querySelector(que);
var eleById=new Proxy({},{
	'get':function(target,prop){
		return $('#'+prop);
	}
});
var eleByClass=new Proxy({},{
	'get':function(target,prop){
		return $('.'+prop);
	}
});

function init(){

}

var searchBar={};
searchBar.close=function(){
	eleById.open.style.display='';
	eleById.search.animate([
		{transform:'scale(1)'},
		{transform:'scale(0)'}
	],{
		duration: 500,
		fill: 'forwards'
	}).onfinish=function(){
		eleById.search.display='none';
		eleById.open.style.opacity=0.5;
		eleById.frame.style.top='-100px';
		eleById.frame.style.height='calc(100vh - 20px)';
	}
}
searchBar.open=function(){
	eleById.frame.style.top='0px';
	eleById.search.display='flex';
	eleById.open.style.display='none';
	eleById.search.animate([
		{transform:'scale(0)'},
		{transform:'scale(1)'}
	],{
		duration: 500,
		fill: 'forwards'
	}).onfinish=function(){
		eleById.open.style.opacity=0;
		eleById.frame.style.height='calc(100vh - 120px)';
	}
}

export {
	init,
	eleById,
	searchBar
}