//main
var markReg={
	reg_html:/(?<!\\)&lt;(&#[0-9]{2};|&quot;|&apos;|&amp;|[^&\\])+(?<!\\)&gt;/mg,
	reg_title:/^#{1,6} .+/mg,
	reg_h1:/^.+\n(&#61;)+\s*\n?/mg,
	reg_h2:/^.+\n\-{3,}\s*\n?/mg,
	reg_table:/(^\|([^\|]+\|)+\n?)+/mg,	
	reg_itac_bold:/((?<!\\)\*{3}.*(?<!\\)\*{3}|(?<!\\)_{3}.*(?<!\\)_{3})/g,
	reg_bold:/((?<!\\)\*{2}.*(?<!\\)\*{2}|(?<!\\)_{2}.*(?<!\\)_{2})/g,
	reg_itac:/((?<!\\)\*{1}.*(?<!\\)\*{1}|(?<!\\)_{1}.*(?<!\\)_{1})/g,
	reg_line:/(\* *|\- *|_ *){3,}\s*/mg,
	reg_block:/^((?<!\\)&gt;(.+\n)+\n?)|^((?<!\\)&gt;+.*\n?)/gm,
	reg_list:/(^\t*((?<!\\)([\*\-\+]|[0-9]+\.)).+\n?)+/mg,
	reg_chart:/````\n([\s\S]+)````/mg,
	reg_block_code:/```(.*)\n[\s\S]*```/mg,
	reg_inline_code:/``[\s\S]*``/g,
	reg_img:/!\[[^\]]+\] ?\([^\)\]]+(\s+&quot;[^\)]+&quot;)?\)/g,
	reg_apart_img:/!\[([^\]]+)\]\s*\[([^\]]*)\]/mg,
	reg_link:/\[[^\]]+\] ?\([^\)\]]+(\s+&quot;[^\)]+&quot;)?\)/g,
	reg_apart_link:/\[([^\]]+)\]\s*\[([^\]]*)\]/mg,
	reg_font:/`[^`]+`\{[^\}]+\}/g,
	reg_del:/~~[^~]*~~/g,
	reg_ins:/~[^~]*~/g,
	reg_block_latex:/\$\$[^\$]+\$\$/mg,
	reg_inline_latex:/\$[^\$]+\$/g,
	reg_keyword:/\\([\\`\*_{}\[\]\(\)#\+\-\.!]|&lt;|&gt;){1}/mg,
	reg_code:/^(( {4}|\t).+\n?)+/mg,
	reg_br:/(?<!\u200b)(  |\n)/mg,
	reg_apart:/\[[^\]]+\]:[^\n\S]*([^ ]+)([^\n\S]*&quot;(.+?)&quot;)?/g,
	reg_html_part:/\u200b\n[0-9]+\u200b\n/g,
};
var support_lang=['css'];
function lang_highlight(str,lang){
	str=str.replace(/ /g,'&nbsp;').replace(/\t/g,'&nbsp;&nbsp;');
	if(support_lang.some(lan => lan==lang)){
		switch (lang) {
			case 'css':
				str=str.replace(/&#47;\*([\s\S]+)\*&#47;/mg,'<span class="comment">/*$1*/</span>');
				str=str.replace(/&#47;&#47;([^\n]+)/g,'<span class="comment">//$1</span>');
				str=str.replace(/!important|@media|@keyframes/g,'<span class="keyword">$&</span>');
				str=str.replace(/^([^\n\{]+){$/mg,'<span class="other">$1</span>{');
				str=str.replace(/((&nbsp;)*[\w\-]+):([^;\n]+;)/mg,'<span class="name">$1:</span>$3');
				str=str.replace(/[^\s\w#&<>"'\/=;]|&amp;|&gt;|&lt;|&#47;|&#61;|&#59;/g,'<span class="op">$&</span>');
				str=str.replace(/(&quot;)(.*)(&quot;)/g,'<span class="string">"$2"</span>');
				str=str.replace(/(&apos;)(.*)(&apos;)/g,"<span class='string'>'$2'</span>");
				str=str.replace(/(?<=[0-9]\s*)(px|em|vh|vw|vm)|(#[\w0-9]{6})/g,'<span class="num">$&</span>');
				str=str.replace(/(?<!&#)[0-9]+(?!;)/g,'<span class="num">$&</span>');
				break;
		}
	}
	str=str.replace(/\n/g,'<br>');
	return str;
}
function markdown_replace(str,turn){
	var htmlArr=[],len=0,ch='\u200b\n';
	str+='\n';
	if(turn==1){
		str=str.replace(/;/g,'&#59;')
		str=str.replace(/&(?!#59;)/g,'&amp;');
		str=str.replace(/>/g,'&gt;');
		str=str.replace(/</g,'&lt;');
		str=str.replace(/"/g,'&quot;');
		str=str.replace(/'/g,'&apos;');
		str=str.replace(/\//g,'&#47;');
		str=str.replace(/=/g,'&#61;');
	}
	function continueReplace(content){
		content=markdown_replace(content.trim(),0);
		return content;
	}	
	for(var key in markReg){
		switch (key) {
			case 'reg_block':
				str=str.replace(markReg[key],function(match){
					var contentArr=match.trim().split('\n');
					var newContentArr=[];
					for(var line of contentArr){
						if(line.search(/^&gt;/)==0)line=line.slice(4);
						newContentArr.push(line);
					}
					var content=newContentArr.join('\n');
					content=continueReplace(content);
					htmlArr.push('<span class="block">'+content+'</span>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_title':
				str=str.replace(markReg[key],function(match){
					var cou=match.split('').filter(ch => ch=='#').length;
					htmlArr.push('<h'+cou+'>'+match.slice(cou+1).trim()+'</h'+cou+'><hr />');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_itac':
				str=str.replace(markReg[key],function(match){
					var content=match.slice(1,match.length-1);
					htmlArr.push('<em>'+content+'</em>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_bold':
				str=str.replace(markReg[key],function(match){
					var content=match.slice(2,match.length-2);
					htmlArr.push('<strong>'+content+'</strong>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_itac_bold':
				str=str.replace(markReg[key],function(match){
					var content=match.slice(3,match.length-3);
					htmlArr.push('<strong><em>'+content+'</em></strong>')
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_list':
				// if(!turn) break;
				str=str.replace(markReg[key],function(match){
					var content=match.split('\n').filter(ele=>{return ele!=''});
					var tree=[],dep=[];
					for(var i=0;i<content.length;i++){
						dep.push([i,0]);
						while(content[i][0]=='\t'||content[i][0]==' '){
							content[i]=content[i].slice(1);
							dep[i][1]++;
						}
						tree.push({next:-1,child:-1});
					}
					dep.sort((a,b)=>{return a[1]-b[1];});
					for(var i=0;i<dep.length;i++){
						var nextIndex=dep.findIndex((ele)=>{return ele[0]==dep[i][0]+1});
						if(dep[i][0]+1<dep.length&&dep[nextIndex][1]>dep[i][1]){
							tree[dep[i][0]]['child']=dep[nextIndex][0];
						}
						if(i+1<dep.length&&dep[i+1][1]===dep[i][1]){
							tree[dep[i][0]]['next']=dep[i+1][0];
						}
					}
					function walk(id){
						var str='',tri,now=id;
						if(/[\*\-\+]/.exec(content[id][0])!==null)tri='ul';
						else tri='ol';
						str+='<'+tri+'>';
						do{
							if(tri=='ul')content[now]=content[now].slice(1);
							else content[now]=content[now].slice(content[now].indexOf('.')+1);
							str+='<li>'+continueReplace(content[now]);
							if(tree[now]['child']!=-1)
								str+=walk(tree[now]['child']);
							str+='</li>';
							now=tree[now]['next'];
						}while(now!=-1);
						str+='</'+tri+'>';
						return str;
					}
					var str=walk(0);
					htmlArr.push(str);
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_line':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<hr />');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_h1':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<h1>'+match.slice(0,match.indexOf('\n'))+'</h1><hr />');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_h2':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<h2>'+match.slice(0,match.indexOf('\n'))+'</h2><hr />');
					return ch+(htmlArr.length-1)+ch;
				});
				break;					
			case 'reg_br':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<br />')
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_block_code':
			// #######
				str=str.replace(markReg[key],function(match){
					var content=match.slice(match.indexOf('\n')+1,match.length-3);
					var lang=match.slice(3,match.indexOf('\n'));
					// var contentArr=content.split('\n');
					var newContent=lang_highlight(content,lang);
					htmlArr.push('<p><code>'+newContent+'</code></p>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_inline_code':
				str=str.replace(markReg[key],function(match){
					var content=match.slice(2,match.length-2);
					htmlArr.push('<p data-inline=1 ><code>'+content+'</code></p>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_code':
				str=str.replace(markReg[key],function(match){
					var content=match;
					htmlArr.push('<pre><code>'+content+'</code></pre>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_link':
				str=str.replace(markReg[key],function(match){
					var name=match.slice(match.indexOf('[')+1,match.indexOf(']'));
					var link=match.slice(match.indexOf('(')+1,match.indexOf('&quot;')).trim();
					var title=match.slice(match.indexOf('&quot;')+'&quot;'.length,match.lastIndexOf('&quot;')).trim();
					if(match.indexOf('&quot;')==-1)title='';
					htmlArr.push('<a href="'+link+'" title="'+title+'">'+continueReplace(name)+'</a>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_img':
				str=str.replace(markReg[key],function(match){
					var name=match.slice(match.indexOf('[')+1,match.indexOf(']'));
					var link=match.slice(match.indexOf('(')+1,match.indexOf('&quot;')).trim();
					var title=match.slice(match.indexOf('&quot;'),match.lastIndexOf('&quot;')).trim();
					if(match.indexOf('&quot;')==-1)title='';
					function getMime(link){
						var aff=link.slice(link.lastIndexOf('.')+1);
						var arrImage=['bmp','jpg','jpeg','png','gif'];
						var arrAudio=['mp3','ogg'];
						var arrVideo=['mp4','webm'];
						if(arrImage.indexOf(aff)>0)return 'images';
						if(arrAudio.indexOf(aff)>0)return 'audio';
						if(arrVideo.indexOf(aff)>0)return 'vedio';
						return 'images';
					}
					var type=getMime(link.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#47;/g,'/').replace(/&#61;/g,'=').replace(/&amp;/g,'&'));
					var mimeType=(type=='images'? 1:(type=='audio'? 2:(type=='vedio'? 3:1)));
					if(mimeType==1)htmlArr.push('<img src="'+link+'" alt="'+name+'" title="'+title.replace(/&quot;/g,'')+'" />');
					if(mimeType==2)htmlArr.push('<audio src="'+link+'" controls="controls" data-alt="'+p1+'"></audio>');
					if(mimeType==3)htmlArr.push('<video src="'+link+'" controls="controls" data-alt="'+p1+'"></video>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_keyword':
				str=str.replace(markReg[key],function(match){
					htmlArr.push(match.slice(1));
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_inline_latex':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<span class="latex">'+match+'</span>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_block_latex':
				str=str.replace(markReg[key],function(match){
					htmlArr.push('<p class="latex">'+match+'</p>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_html':
				str=str.replace(markReg[key],function(match){
					htmlArr.push(match.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#47;/g,'/').replace(/&#61;/g,'=').replace(/&amp;/g,'&'));
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_apart_img':
				str=str.replace(markReg[key],function(match,p1,p2){
					var name=match.slice(match.indexOf('[')+1,match.indexOf(']'));
					var link='',title='';
					str=str.replace(new RegExp('\\[('+p1+'|'+(p2?p2.toLowerCase():ch)+')\\]:[^\\n\\S]*([^ ]+)([^\\n\\S]*&quot;(.+)&quot;)?','g'),
						function(match,p1,p2,p3){
							link=p2,title=p3;
							return match;
						});
					function getMime(link){
						var aff=link.slice(link.lastIndexOf('.')+1);
						var arrImage=['bmp','jpg','jpeg','png','gif'];
						var arrAudio=['mp3','ogg'];
						var arrVideo=['mp4','webm'];
						if(arrImage.indexOf(aff)>0)return 'images';
						if(arrAudio.indexOf(aff)>0)return 'audio';
						if(arrVideo.indexOf(aff)>0)return 'vedio';
						return 'images';
					}
					var type=getMime(link.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#47;/g,'/').replace(/&#61;/g,'=').replace(/&amp;/g,'&')).split('\/')[0];
					var mimeType=(type=='images'? 1:(type=='audio'? 2:(type=='vedio'? 3:1)));
					if(mimeType==1)htmlArr.push('<img src="'+link+'" alt="'+name+'" title="'+title.replace(/&quot;/g,'')+'" />');
					if(mimeType==2)htmlArr.push('<audio src="'+link+'" controls="controls"></audio>');
					if(mimeType==3)htmlArr.push('<vedio src="'+link+'" controls="controls"></vedio>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_apart_link':
				str=str.replace(markReg[key],function(match,p1,p2){
					var link='',content='';
					str=str.replace(new RegExp('\\[('+p1+'|'+(p2?p2.toLowerCase():ch)+')\\]:[^\\n\\S]*([^ ]+)([^\\n\\S]*&quot;(.+)&quot;)?','g'),
						function(match,p1,p2,p3){
							link=p2,content=p3;
							return match;
						});
					htmlArr.push('<a href="'+link+'" title="'+content+'">'+continueReplace(p1)+'</a>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_apart':
				str=str.replace(markReg[key],'');
				len=htmlArr.length;
				break;	
			case 'reg_table':
				str=str.replace(markReg[key],function(match){
					var line=match.split('\n');
					var content='<table>';
					for(var i=0;i<line.length;i++)
						line[i]=line[i].split('|').filter(ele=>{return ele!==''});
					for(var i=0;i<line[1].length;i++){
						var str=line[1][i].trim();
						if(str[0]==':'&&str.slice(-1)!==':')line[1][i]='left';
						else if(str[0]!==':'&&str.slice(-1)==':')line[1][i]='right';
						else line[1][i]='center';
					}
					for(var i=0;i<line.length;i++){
						if(i==1)continue;
						var splSt='<td style="text-align:',splEn='</td>';
						content+='<tr>';
						if(i==0){
							splSt='<th style="text-align:';
							splEn='</th>';
						}
						for(var j=0;j<line[i].length;j++)
							content+=splSt+line[1][j]+';" >'+continueReplace(line[i][j])+splEn;
						content+='</tr>';
					}
					content+='</table>';
					htmlArr.push(content);
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_del':
				str=str.replace(markReg[key],function(match){
					match=match.slice(2).slice(0,-2);
					htmlArr.push('<del>'+match+'</del>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_ins':
				str=str.replace(markReg[key],function(match){
					match=match.slice(1).slice(0,-1);
					htmlArr.push('<ins>'+match+'</ins>');
					return ch+(htmlArr.length-1)+ch;
				});
				break;
			case 'reg_html_part':
				while(len){
					str=str.replace(markReg[key],function(match){
						match=match.slice(2).slice(0,-2);
						return htmlArr[Number(match)];
					});
					len--;
				}
				break;
			case 'reg_font':
				str=str.replace(markReg[key],function(match){
					var eleStr='<span style="';
					var text=/`.*`/.exec(match)[0].slice(1).slice(0,-1);
					var style=JSON.parse(/\{.*\}/.exec(match)[0].replace(/&quot;/g,'"'));
					if(typeof style['size'] !=='undefined')
						eleStr+='font-size:'+style['size']+'px;';
					if(typeof style['color'] !=='undefined')
						eleStr+='color:'+style['color']+';';
					eleStr+='" >'+text+'</span>';
					htmlArr.push(eleStr);
					return ch+(htmlArr.length-1)+ch;
				});
				break;
		}
	}
	return str;
}
function renderlatex() {
	var eqn = window.document.getElementsByClassName("latex");
	for (var i=0; i<eqn.length; i++) {
		html=eqn[i].innerHTML.replace('<br>','\n');
	    html=html.replace(/(^\$|[^\\]\$)(.*?[^\\])\$/g," <img src=\"http://latex.codecogs.com/gif.latex?\\inline $2\" alt=\"$2\" title=\"$2\" border=\"0\" class=\"latex\" /> ");
	    html=html.replace(/(^\\|[^\\]\\)\[(.*?[^\\])\\\]/g," <br/><img src=\"http://latex.codecogs.com/gif.latex?$2\" alt=\"$2\" title=\"$2\" border=\"0\" /><br/> "); 
	    html=html.replace(/\\\$/g,"\$"); 
	    html=html.replace(/\\\\(\[|\])/g,"$1"); 
		eqn[i].innerHTML = html;
		eqn.className='';
	}
}