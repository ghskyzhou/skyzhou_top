var data={
	start:0,
	choose:[],
	now:'',
	arr:[],
	historyArr:[],
	errorArr:[],
	correct:0,
	incorrect:0,
	question:question,
	total:0
}
if(localStorage.lastDoWMW)data=JSON.parse(localStorage.lastDoWMW);
document.onreadystatechange=()=>{
	if(document.readyState!=='complete')return;
	vm=new Vue({
		el:'#vue',
		data:data,
		computed:{
			text:function(){
				var tmp=[];
				this.choose.forEach(val=>tmp=tmp.concat(JSON.parse(val)));
				return tmp;
			}
		},
		methods:{
			change:function(can,notcan){
				if(!this.start)this.arr=this.text;
				else{
					this.correct+=can;
					this.incorrect+=notcan;
					if(notcan)this.errorArr.push(this.now);
				}
				this.start=1;
				if((this.arr.length==0||this.total==this.historyArr.length)&&this.start){
					this.start=-1;
					alert('结束了！');
					return ;
				}
				var idx=Math.ceil(Math.random()*this.arr.length)-1;
				this.now=this.arr[idx];
				this.historyArr.push(this.arr[idx])
				this.arr[idx]=undefined;
				this.arr=this.arr.filter(Boolean);
			},
			restart:function(oldQues){
				this.correct=0;
				this.incorrect=0;
				if(oldQues){
					this.arr=new Array(this.historyArr)[0];
					this.historyArr=[];
					if(oldQues==-1){
						this.arr=new Array(this.errorArr)[0];
					}
					this.start=1;
					this.change(0,0);
				}
				else{
					this.arr=[];
					this.historyArr=[];
					this.choose=[];
					this.start=0;
					this.total=0;					
				}
				this.errorArr=[];
				this.correct=0;
				this.incorrect=0;
			},
			refresh:function(){
				this.total=this.text.length;
			}
		}
	})
}
window.onbeforeunload=()=>{
	localStorage.lastDoWMW=JSON.stringify(data);
}