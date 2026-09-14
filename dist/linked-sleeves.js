'use strict';
const LinkedSleeves=(()=>{
const lerp=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
function point(c,t){const u=1-t;return [0,1].map(k=>u*u*u*c[0][k]+3*u*u*t*c[1][k]+3*u*t*t*c[2][k]+t*t*t*c[3][k]);}
function split(c,t){const a=lerp(c[0],c[1],t),b=lerp(c[1],c[2],t),d=lerp(c[2],c[3],t),e=lerp(a,b,t),f=lerp(b,d,t),p=lerp(e,f,t);return [[c[0],a,e,p],[p,f,d,c[3]]];}
function length(c){let total=0;for(let i=0;i<400;i++){const t=(i+.5)/400,u=1-t;total+=Math.hypot(...[0,1].map(k=>3*u*u*(c[1][k]-c[0][k])+6*u*t*(c[2][k]-c[1][k])+3*t*t*(c[3][k]-c[2][k])))/400;}return total;}
function atLength(c,d){let low=0,high=1;for(let i=0;i<30;i++){const t=(low+high)/2;if(length(split(c,t)[0])<d)low=t;else high=t;}return point(c,(low+high)/2);}
function atY(c,y){let lo=0,hi=1;for(let i=0;i<40;i++){const t=(lo+hi)/2;if(point(c,t)[1]<y)lo=t;else hi=t;}return (lo+hi)/2;}
function arc(a,b){let total=0;for(let i=0;i<400;i++){const t=(i+.5)*Math.PI/800;total+=Math.hypot(a*Math.sin(t),b*Math.cos(t))*Math.PI/800;}return total;}
function geometry(type,v){
 const nw=(v.neck+v.neckEase)/(2*(arc(1,1)+arc(1,.3))),sx=v.shoulder/2,sy=-nw*.3+v.drop,q=(type==='top'?Math.max(v.bust,v.waist)+v.ease:v.bust+v.ease)/4;
 const curves=[false,true].map(back=>{const sh=Math.hypot(sx-nw,v.drop),scale=back&&type!=='top'?(sh+v.shoulderDart)/sh:1,x=nw+(sx-nw)*scale,y=-nw*.3+v.drop*scale;return [[x,y],[x,y+(v.depth-y)*.6],[Math.max(nw,x-.35),v.depth],[q,v.depth]];});
 const lengths=curves.map(length),method=type==='bunka_new'?'new':'old',scale=v.back/38,mean=(curves[0][0][1]+curves[1][0][1])/2;
 const capBase=method==='new'?(v.depth-mean)*5/6:(lengths[0]+lengths[1])/4+2.5*scale;
 const matchY=method==='new'?curves.map(()=>mean+(v.depth-mean)*.65):curves.map(c=>Math.min(v.depth-.05,c[0][1]+(v.depth-c[0][1])/2+2.5*scale));
 const ts=curves.map((c,i)=>atY(c,matchY[i])),lower=curves.map((c,i)=>split(c,ts[i])[1]),lowerLength=lower.map(length);
 return {type,method,scale,q,depth:v.depth,curves,lengths,capBase,matchY,ts,lower,lowerLength};
}
const defs={title:'配套袖子・連動上衣',fields:[['length','袖長',6,'肩點至袖口',1,80],['opening','袖口整圈',3.5,'需能通過手掌',1,60],['bicep','上臂圍',3.2,'用來檢查袖寬是否足夠',1,60]],design:[['ease','上臂最低鬆量',.3,'生成袖寬必須容納此鬆量',0,10],['capEase','袖山吃勢',.2,'前 40%、後 60%；整圈增加量',0,5],['capAdjust','袖山高調整',0,'負值會降低袖山、增加袖寬',-3,3]],note:'先設定上衣，再自動讀取前後袖窿分別製袖。新式參考 5/6 袖山高及下段對合，舊式參考 AH/4＋縮放常數。這是本站娃娃實量上衣的配套試版，並非成人文化式公式原版。',steps:['衣身 F 單記號對袖子 F，B 雙記號對 B，袖山 S 對肩線。','新式 G* 以下不加吃勢；上方按前後指定吃勢量分配，切勿強拉袖窿。','先試胚核對手臂活動量，再接合袖底與袖口；修改上衣後重新產生袖子。']};
function validate(v){for(const [k,l,,,min,max] of [...defs.fields,...defs.design,DollPatterns.seam])if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw new Error(`${l}請輸入 ${min}–${max} cm。`);}
function half(g,index,H,extra){const target=g.lengths[index]+extra;let make,min;
 if(g.method==='new'){
  const lower=g.lower[index].map(p=>[g.q-p[0],H-g.depth+p[1]]).reverse(),G=lower[3],tangent=[G[0]-lower[2][0],G[1]-lower[2][1]],norm=Math.hypot(...tangent),unit=tangent.map(n=>n/norm);
  min=G[0]+.02;
  make=a=>{const dist=Math.hypot(a-G[0],G[1]),c1=[G[0]+unit[0]*dist*.3,Math.max(.01,G[1]+unit[1]*dist*.3)],upper=[G,c1,[a-(a-G[0])*.45,0],[a,0]];return [lower,upper];};
 }else{min=.02;make=a=>[[[0,H],[0,H*(1-.55228475)],[a*(1-.55228475),0],[a,0]]];}
 const total=a=>make(a).reduce((s,c)=>s+length(c),0);let lo=min,hi=target*3+1;
 if(total(lo)>target)throw new Error('目前袖山太高，無法配合上衣袖窿；請降低袖山高調整值。');
 for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(total(mid)>target)hi=mid;else lo=mid;}
 const a=(lo+hi)/2,curves=make(a),lowerExtra=g.method==='new'?0:Math.min(.2*g.scale,extra*.5),notchDistance=g.lowerLength[index]+lowerExtra;
 let d=notchDistance,notch;for(const c of curves){const L=length(c);if(d<=L){notch=atLength(c,d);break;}d-=L;}
 return {a,curves,target,notch,notchDistance,extra,lowerExtra};
}
const path=c=>`C ${c[1]} ${c[2]} ${c[3]}`;
const text=(x,y,t,s=.24)=>`<text x="${x}" y="${y}" font-size="${s}" fill="#203953" text-anchor="middle">${t}</text>`;
function notch(p,label,double=false){let d='';for(const off of double?[-.06,.06]:[0])d+=`M ${p[0]+off-.09} ${p[1]-.06} l .18 .12 `;return `<g class="match-symbol" data-match="${label}"><path d="${d}" stroke="#0e6279" stroke-width=".03"/>${text(p[0]+.3,p[1]+.18,label,.22)}</g>`;}
function build(g,v){validate(v);const H=g.capBase+v.capAdjust;if(H<=.1||H>=v.length-.3||H>=Math.min(...g.lengths))throw new Error('袖山高需大於 0 且小於袖長、前後袖窿長；請調整袖長或袖山高。');
 const front=half(g,0,H,v.capEase*.4),back=half(g,1,H,v.capEase*.6),W=front.a+back.a;
 if(W<v.bicep+v.ease-.001)throw new Error(`推算袖寬 ${W.toFixed(2)} cm 不足上臂圍加鬆量 ${(v.bicep+v.ease).toFixed(2)} cm；請核對上臂圍，或降低袖山高。`);
 const mirror=c=>c.map(p=>[W-p[0],p[1]]).reverse(),backCurves=back.curves.slice().reverse().map(mirror),left=(W-v.opening)/2,right=(W+v.opening)/2,minX=Math.min(0,left)-.6,maxX=Math.max(W,right)+.6;
 const d=`M 0 ${H} ${front.curves.map(path).join(' ')} ${backCurves.map(path).join(' ')} L ${right} ${v.length} L ${left} ${v.length} Z`,bn=[W-back.notch[0],back.notch[1]],el=v.length/2+2.5*g.scale;
 let body=`<path class="seam-line" data-front="false" d="${d}" fill="#edf2fc" fill-opacity=".4" stroke="#254fb1" stroke-width=".035"/>${notch(front.notch,'F')}${notch(bn,'B',true)}${notch([front.a,0],'S')}<path d="M 0 ${H} H ${W}" stroke="#8797ae" stroke-width=".018" stroke-dasharray=".12 .08"/>${text(W/2,H+.45,'袖寬線',.23)}${text(W/2,v.length-.5,'袖片 · 鏡像裁 2 片',.25)}`;
 if(el>H+.2&&el<v.length-.2)body+=`<path d="M ${left} ${el} H ${right}" stroke="#8797ae" stroke-width=".018" stroke-dasharray=".12 .08"/>${text(W/2,el-.15,'EL 肘線',.2)}`;
 const m=1.8+v.seam,w=Math.max(16,maxX-minX+2*m),h=v.length+2*m+3.5;
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="配套袖子"><title>配套袖子</title><g font-family="sans-serif"><g transform="translate(${m-minX},${m})">${body}</g>${text(w/2,h-2.4,`前袖山 ${front.target.toFixed(2)}＝FAH ${g.lengths[0].toFixed(2)}＋吃勢 ${front.extra.toFixed(2)} cm`)}${text(w/2,h-1.9,`後袖山 ${back.target.toFixed(2)}＝BAH ${g.lengths[1].toFixed(2)}＋吃勢 ${back.extra.toFixed(2)} cm`)}${text(w/2,h-1.3,'F 單記號／B 雙記號／S 肩點；記號轉印至縫合線。',.22)}${text(w/2,h-.8,`${g.method==='new'?'新式 G* 下段無吃勢':'舊式下段配合點'} · 縫份 ${v.seam.toFixed(2)} cm`,.22)}</g></svg>`,metrics:[['前袖窿 FAH',g.lengths[0]],['後袖窿 BAH',g.lengths[1]],['袖山高',H]],checks:{frontTarget:front.target,backTarget:back.target,frontActual:front.curves.reduce((s,c)=>s+length(c),0),backActual:back.curves.reduce((s,c)=>s+length(c),0),frontLower:g.lowerLength[0],frontNotch:front.notchDistance,backLower:g.lowerLength[1],backNotch:back.notchDistance,width:W,height:H,inseamsEqual:true},front,back};
}
return {geometry,build,defs,point,split,length,atLength};
})();
DollPatterns.registry.sleeve_linked=LinkedSleeves.defs;
