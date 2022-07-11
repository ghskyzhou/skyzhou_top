var visit={"123513":"1","1919810":"9","2147483647":"4","-MILOSH-":"24","-Milosh-":"5","0938":"1","2911295052@qq.com":"2","CZT":"1","Crazymartian":"5","Deefed":"3","Evan704":"4","PM":"8","Rosmontis":"5","Server":"2","ShuraEye":"1","Skyzhou":"139","The":"2","VictorYep":"2","WangXin":"10","YuanXunGeJi":"58","YuckXi":"2","Yuckxi":"90","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":"1","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":"1","asdf":"2","asdfasfae":"1","luna":"15","ly":"3","lzh":"1","superFlash":"8","superflash":"8","test":"20","tt66ea":"10","tylon2006":"3","w":"1","wdh":"1","wentox":"16","yuckxi":"1","zhm":"22","zhy07":"13","zwd":"10","zyx":"7","莽聹聼CZT":"1"}
var sum=0,count=0,avg=0,activeCount=0,yearAvg=0;
for(key in visit){
	count++;
	if(Number(visit[key])>=10)activeCount++;
	sum+=Number(visit[key]);
}
avg=(sum/count).toFixed(3);
yearAvg=(sum/365).toFixed(3);
var rank=Object.entries(visit).sort((a,b)=>Number(b[1])-Number(a[1]));