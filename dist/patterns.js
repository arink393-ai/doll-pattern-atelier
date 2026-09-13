'use strict';
// Independently designed, simplified doll blocks. All geometry is in cm.
const DollPatterns=(()=>{
const seam=['seam','縫份寬度',.5,'0–2 cm；布折處不加',0,2];
const waist=['waist','腰圍',12,'鬆緊帶完成後的目標腰圍',1,100];
const hip=['hip','臀圍',16,'臀部最寬處水平繞一圈',2,120];
const ease=['ease','臀圍鬆量',1,'臀部整圈增加量',0,20];
const band=['band','腰頭完成寬',.6,'獨立腰頭；已含在總長內',.2,5];
const registry={
 skirt:{title:'基本鬆緊腰裙',fields:[waist,hip,['hipDepth','腰臀深',3,'腰線垂直至臀部最寬處',.5,40]],design:[['length','裙長',9,'腰頭上緣至預定下襬',1,80],ease,band,['flare','下襬展開量',1,'每四分之一片外放；0 為直裙',0,20]],note:'鬆緊腰直裙／A 字裙：裙身腰口按臀圍留出穿脫空間，再以鬆緊帶收至腰圍。前後裙片同版，各對折裁 1 片；另裁腰頭。鬆緊帶長度依伸縮性試量。',steps:['裙片沿布折線裁兩片，縫合左右側縫。','腰頭短邊接成環，對折後接上裙身，留穿鬆緊帶的小口。','鬆緊帶試繞娃娃腰部，調整鬆緊後固定；最後折縫下襬。']},
 pants:{title:'基本鬆緊腰褲',fields:[waist,hip,['rise','股上／坐高',4,'坐姿：腰線垂直至椅面，含腰頭',1,50],['inseam','內腿長',7,'胯下至褲口；縮短可做短褲',.5,80]],design:[ease,band,['opening','單腿褲口圍',6,'需能通過娃娃腳掌',1,60],['frontExt','前襠伸出量',.8,'前襠水平延伸；示範值需試穿',.1,12],['backExt','後襠伸出量',1.6,'後襠水平延伸；示範值需試穿',.1,16]],note:'寬鬆、無側縫的基本褲：每條褲腿前後連成一片，鏡像裁兩片；另裁鬆緊腰頭。前後襠伸出量可自行補正，褲口要能通過腳掌。這是簡化試版，並非貼身褲原型。',steps:['褲腿鏡像裁兩片，分別將前、後內腿邊縫合。','一條褲腿翻正套入另一條，對齊前後襠線縫合。','腰頭接成環並對折，接上褲身、穿鬆緊帶，再試穿補正襠部與褲口。']},
 sleeve:{title:'基本對稱袖',fields:[['armhole','上衣單側袖窿周長',8.5,'前＋後袖窿縫合線總長，不含縫份',2,80],['bicep','上臂圍',6,'上臂最粗處繞一圈',1,60],['length','袖長',6,'肩點至袖口，不是腋下長',1,80]],design:[['ease','上臂鬆量',1,'上臂整圈增加量',0,20],['capEase','袖山吃勢',.2,'袖山比袖窿多出的總長',0,5],['opening','袖口整圈',5,'需能通過手掌；短袖量上臂',1,60]],note:'對稱基本袖：由上臂圍與袖窿長度推算橢圓袖山，適合前後袖窿近似對稱的娃娃上衣。長度吻合仍須核對袖山形狀、手臂角度及穿脫空間；不等同完整文化式原型袖。',steps:['先確認上衣前後袖窿縫合線長度，再裁一對袖片。','袖山頂點對齊肩線，袖山兩端對齊腋下，均勻分配少量吃勢。','試胚檢查抬手活動量，再縫合袖底與袖口；手掌較大時需加開口。']}
};
const fmt=n=>n.toFixed(2);
function arc(a,b){let sum=0;for(let i=0;i<400;i++){const t=(i+.5)*Math.PI/800;sum+=Math.hypot(a*Math.sin(t),b*Math.cos(t))*Math.PI/800;}return sum;}
function validate(type,v){const cfg=registry[type];for(const [k,l,,,min,max] of [...cfg.fields,...cfg.design,seam])if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw new Error(`${l}請輸入 ${min}–${max} cm。`);
if(type!=='sleeve'){if(v.waist>v.hip+v.ease)throw new Error('腰圍大於臀圍加鬆量，請增加臀圍鬆量以保留腰部空間。');}
if(type==='skirt'){if(v.hipDepth<=v.band||v.length<=v.hipDepth)throw new Error('裙長需大於腰臀深，腰臀深需大於腰頭完成寬。');}
if(type==='pants'){if(v.rise<=v.band+.3)throw new Error('股上需大於腰頭完成寬，並留出褲身空間。');}
if(type==='sleeve'&&v.armhole+v.capEase<=v.bicep+v.ease)throw new Error('袖窿加吃勢需大於上臂圍加鬆量，才能形成袖山；請核對量測。');
}
function shape(d,fold=false){return `<path class="seam-line" data-front="${fold}" d="${d}" fill="#edf2fc" fill-opacity=".65" stroke="#254fb1" stroke-width=".035"/>`;}
function text(x,y,t,size=.3){return `<text x="${x}" y="${y}" font-size="${size}" fill="#233854" text-anchor="middle">${t}</text>`;}
function guide(d){return `<path d="${d}" fill="none" stroke="#7b8ba2" stroke-width=".018" stroke-dasharray=".12 .1"/>`;}
function grain(x,y,len){return `<path d="M ${x} ${y} v ${len} m -.1 -.2 l .1 .2 l .1 -.2" fill="none" stroke="#687b96" stroke-width=".018"/>`;}
function waistband(v,width,y){return `<g transform="translate(0,${y})">${shape(`M 0 0 H ${width} V ${2*v.band} H 0 Z`)}${guide(`M 0 ${v.band} H ${width}`)}${text(width/2,-.5-v.seam,'腰頭 · 裁 1 片（中線對折）')}${text(width/2,2*v.band+v.seam+.5,`淨長 ${fmt(width)} × 淨寬 ${fmt(v.band*2)} cm`)}</g>`;}
function wrap(type,v,body,width,height,metrics,extra){const margin=1.8+v.seam,w=Math.max(width+2*margin,13),h=height+2*margin+2.2;const title=registry[type].title;return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}即時版型"><title>${title}／縫份 ${fmt(v.seam)} cm</title><g font-family="sans-serif"><g transform="translate(${margin},${margin})">${body}</g>${text(w/2,h-1.25,`${title} · 縫份 ${fmt(v.seam)} cm · 布折不加`,.25)}${text(w/2,h-.75,extra,.22)}<path d="M 1 ${h-1.6} h 2 m -2 -.1 v .2 m 2 -.2 v .2" stroke="#18283f" stroke-width=".025"/>${text(2,h-1.9,'2 cm',.22)}</g></svg>`,metrics};}
function render(type,v){validate(type,v);
if(type==='skirt'){const hipWidth=(v.hip+v.ease)/4,L=v.length-v.band,hy=v.hipDepth-v.band,hem=hipWidth+v.flare,bandY=L+3+v.seam*2,bandW=v.hip+v.ease;
const body=shape(`M 0 0 H ${hipWidth} L ${hipWidth} ${hy} L ${hem} ${L} H 0 Z`,true)+guide(`M 0 ${hy} H ${hipWidth}`)+grain(hem*.7,hy+.5,Math.max(.3,L-hy-1))+text(hipWidth/2,Math.max(.7,L*.5),'裙身 · 前後同版')+text(hipWidth/2,Math.max(.7,L*.5)+.5,'布折裁 2 片',.24)+text(hipWidth/2,L+v.seam+.6,'左側為布折線',.24)+waistband(v,bandW,bandY);
return wrap(type,v,body,Math.max(hem,bandW),bandY+2*v.band+1,[['成衣臀圍',bandW],['下襬整圈',hem*4],['目標收腰',v.waist]],'裙身布折裁兩片；腰頭裁一片；鬆緊帶試量。');}
if(type==='pants'){const half=(v.hip+v.ease)/2,r=v.rise-v.band,F=v.frontExt,B=v.backExt,W=F+half+B,center=W/2,left=center-v.opening/2,right=center+v.opening/2;
if(left<0||right>W)throw new Error('褲口過寬，請減少褲口圍或增加臀部空間。');const dl=left,dr=W-right;
if(Math.max(dl,dr)>=v.inseam)throw new Error('內腿長太短，無法接到此褲口；請加寬褲口或增加內腿長。');
const yl=r+Math.sqrt(v.inseam**2-dl**2),yr=r+Math.sqrt(v.inseam**2-dr**2),L=Math.max(yl,yr),bandY=L+3+v.seam*2;
const d=`M ${F} 0 H ${F+half} L ${F+half} ${r*.55} Q ${F+half} ${r} ${W} ${r} L ${right} ${yr} L ${left} ${yl} L 0 ${r} Q ${F} ${r} ${F} ${r*.55} Z`;
const body=shape(d)+guide(`M 0 ${r} H ${W}`)+grain(center,r+.3,Math.max(.3,L-r-1))+text(center,Math.max(.6,r*.4),'褲腿 · 鏡像裁 2 片')+text(F+.3,r*.75,'前',.25)+text(F+half-.3,r*.75,'後',.25)+text(center,L+v.seam+.6,'前後連裁／無側縫',.25)+waistband(v,half*2,bandY);
return wrap(type,v,body,Math.max(W,half*2),bandY+2*v.band+1,[['成衣臀圍',half*2],['內腿縫長',v.inseam],['單腿褲口圍',v.opening]],'褲腿鏡像裁兩片；腰頭裁一片；先試胚補正襠部。');}
const a=(v.bicep+v.ease)/2,target=v.armhole+v.capEase;let low=0,high=target;for(let i=0;i<60;i++){const mid=(low+high)/2;if(2*arc(a,mid)>target)high=mid;else low=mid;}const cap=(low+high)/2;
if(cap>=v.length-.2)throw new Error(`推算袖山高 ${fmt(cap)} cm 已接近袖長；請增加袖長或核對袖窿與上臂尺寸。`);
const full=a*2,left=a-v.opening/2,right=a+v.opening/2,shift=Math.max(0,-left),body=`<g transform="translate(${shift},0)">${shape(`M 0 ${cap} A ${a} ${cap} 0 0 1 ${a} 0 A ${a} ${cap} 0 0 1 ${full} ${cap} L ${right} ${v.length} H ${left} Z`)}${guide(`M 0 ${cap} H ${full}`)}${grain(a,cap+.4,Math.max(.2,v.length-cap-1))}${text(a,Math.max(.7,cap*.5),'袖片 · 鏡像裁 2 片')}${text(a,v.length+v.seam+.6,'袖山頂點對肩線',.25)}<path d="M ${a} -.12 v .24" stroke="#18283f" stroke-width=".03"/></g>`;
return wrap(type,v,body,Math.max(full,right)+shift,v.length+1,[['袖山縫合長',target],['推算袖山高',cap],['袖口整圈',v.opening]],'對稱袖山；袖口需通過手掌；先試胚確認活動量。');
}
return {registry,seam,render,validate};
})();
