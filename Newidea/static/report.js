function init(){
	pages=[...document.querySelectorAll('.page')];
	now=pages[0];
	pages.forEach(page=>{
		page.classList.add('stop');
		page.hidden=false;
	});
	document.querySelectorAll('[last]').forEach(setWait);
	document.querySelector('[visit-count]').innerText=count;
	document.querySelector('[visit-activeCount]').innerText=activeCount;
	document.querySelector('[visit-sum]').innerText=sum;
	document.querySelector('[visit-avg]').innerText=avg;
	document.querySelector('[visit-yearAvg]').innerText=yearAvg;
	setTimeout(()=>document.querySelector('.load').outerHTML='',500);
	setTimeout(finish,now.querySelector('[last]').waitTime);
	document.querySelector('.music').onclick=function(){
		if(this.children[0].paused){
			this.children[0].play();
			this.children[1].style="display: none;";
			this.style='';
		}
		else{
			this.children[0].pause();
			this.children[1].style="display: inline-block;";
			this.style='animation:initial;';
		}
	}
}
function throwttle(func){
	var last=null,handle=null;
	return function(){
		if(last==null)last=new Date().getTime();
		var now=new Date().getTime();
		if(now-last<200){
			last=now;
			if(handle)clearTimeout(handle);
		}
		handle=setTimeout(()=>{
			last=null;
			handle=null;
			func();
		},100);
	}
}
function setWait(ele){
	var style=getComputedStyle(ele);
	var delay=style.getPropertyValue('animation-delay').slice(0,-1);
	var dur=style.getPropertyValue('animation-duration').slice(0,-1);
	ele.waitTime=(Number(delay)+Number(dur))*1000+100;
}
function finish(){
	document.querySelector('.next').hidden=0;
	document.querySelector('.tip').hidden=0;
	var eve=throwttle(()=>{
		var y=document.querySelector('.next').getBoundingClientRect().y;
		var height=window.innerHeight;
		if(y<=height-5){
			next();
			window.onscroll=window.onwheel=window.ontouchend=null;
		}
	});
	window.onscroll=window.onwheel=window.ontouchend=eve;
}
function next(){
	now.classList.add('finished');
	setTimeout(()=>{
		now.classList.remove('finished');
		now=now.nextElementSibling;
		document.querySelector('.next').hidden=1;
		document.querySelector('.tip').hidden=1;
		now.classList.remove('stop');
		now.scrollIntoView();
		now.previousElementSibling.classList.add('stop');
		setTimeout(finish,now.querySelector('[last]').waitTime);
	},1800);
}
document.onreadystatechange=()=>{
	if(document.readyState!=='complete')return;
	else{
		var ele=document.createElement('link');
		if(screen.availWidth>screen.availHeight){
			ele.href="./static/report-pc.css";
		}
		else ele.href="./static/report.css";
		ele.rel="stylesheet";
		document.head.append(ele);
		ele.onload=()=>{
			var imgs=[...document.querySelectorAll('span[class*=img],.music')];
			imgs.push(document.body);
			var tot=imgs.length+3;
			var script=document.createElement('script');
			script.src='http://skyzhou.top:8023/jspy_user';
			document.head.append(script);
			var tmp=new Number(tot);
			script.onload=()=>{
				tot--;
				document.querySelector('.small').innerText=`${tmp-tot}/${tmp}`;
				if(info.username){
					var userRank=rank.findIndex(ele=>ele[0]==info.username)+1;
					var userSum=visit[info.username];
					document.querySelector('[visit-userSum]').innerText=userSum;
					document.querySelector('[visit-userRank]').innerText=userRank;
				}else{
					document.querySelector('.text4-3').outerHTML='';
					setWait(document.querySelector('.text4-2'));
					var last=document.createAttribute('last');
					document.querySelector('.text4-2').attributes.setNamedItem(last);
				}
				if(!tot)loadend();
			}
			imgs.forEach(img=>{
				var url=getComputedStyle(img).getPropertyValue('background');
				url=/url\(([^\)]+)\)/g.exec(url)[1];
				img.style.background='initial';
				var realImg=new Image();
				realImg.src=url.replace(/"/g,'');
				realImg.onload=()=>{
					tot--;
					document.querySelector('.small').innerText=`${tmp-tot}/${tmp}`;
					img.style='';
					if(!tot)loadend();
				}
			});
			document.querySelector('audio').load();
			document.querySelector('audio').oncanplay=()=>{
				tot--;
				document.querySelector('.small').innerText=`${tmp-tot}/${tmp}`;
				if(!tot)loadend();
			}
			var fc=new FontFace('shouzha','url("./static/res/font.ttf")');
			fc.load().then(()=>{
				var stl=document.createElement('style');
				stl.innerHTML=`@font-face{
					font-family: "shouzha";
					src: url(./static/res/font.ttf);
				}`;
				document.head.append(stl);
				tot--;
				document.querySelector('.small').innerText=`${tmp-tot}/${tmp}`;
				if(!tot)loadend();
			});
		}
	}
}
function loadend(){
	document.querySelector('.loading').innerText='触碰以开始';
	document.querySelector('.loading').onclick=()=>{
		document.querySelector('.loading').style.transform='translateX(500px)';
		document.querySelector('.load').style.opacity=0;
		setTimeout(start,300);
	};
	document.querySelector('.loading').style.cursor='pointer';
	document.querySelector('.loading').classList.add('waiting');
}
function start(){
	setTimeout(()=>document.querySelector('audio').play(),500);
	if(screen.availWidth<=screen.availHeight){
		init();
		now.classList.remove('stop');
		return;
	}
	var body=document.createElement('div');
	body.className='body';
	var child=[...document.body.children];
	child.slice(0,-1).forEach(ch=>{
		body.append(ch.cloneNode(1));
		ch.outerHTML='';
	});
	document.body.append(body);
	init();
	var scale=window.innerHeight/100/17.4;
	body.style.transform='scale('+scale+')';
	var width=body.getBoundingClientRect().width;
	var x=body.getBoundingClientRect().x;
	var left=(window.innerWidth-width)/2;
	body.style.left=left+'px';
	now.classList.remove('stop');
}