import * as VPNApi from './vpn.js'
import {eleById,searchBar,init as UIInit} from './ui.js'

window.historyApi=VPNApi.history;

function initEvent(){
	eleById.go.onclick=function(){
		VPNApi.startPage(eleById.url.value);
	}
	eleById.back.onclick=function(){
		VPNApi.history.back();
	};
	eleById.forward.onclick=function(){
		VPNApi.history.forward();
	};
	eleById.reload.onclick=function(){
		eleById.frame.contentWindow.location.reload();
	}
	eleById.close.onclick=searchBar.close;
	eleById.open.onclick=searchBar.open;
}

document.onreadystatechange=function(){
	if(document.readyState!=='complete')return;
	VPNApi.init();
	UIInit();
	initEvent()
}