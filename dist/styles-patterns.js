'use strict';
// Original simplified doll garments; seam-line dimensions in centimetres.
(()=>{
const P=DollPatterns,previousRender=P.render,previousValidate=P.validate;
const field=(...a)=>a;
const fields=[field('bust','胸圍',14,'胸部最寬處一圈',2,100),field('hip','臀圍',16,'衣身取胸臀較大值',2,120),field('neck','頸圍',6,'頸根一圈；領口可試胚調整',1,60),field('arm','上臂圍',4,'上臂最粗處一圈',1,60),field('hand','手掌圍',4,'手掌最寬處一圈，確認能穿過袖口',1,60)];
const design=[field('length','衣長',14,'肩線至下襬；不含腰部折返',2,80),field('ease','衣身鬆量',2,'整圈鬆量；取胸臀較大值再加',.5,20),field('overlap','單側前襟延伸',1.2,'兩片前襟合計可重疊此值的兩倍',0,8),field('sleeveLength','方袖橫向長',5,'衣身接袖線至袖口；此款為落肩',1,40),field('sleeveDepth','袖深',4,'肩線至袖底；整袖高為兩倍',1,40),field('cuff','袖口整圈',4.5,'須通過手掌，且不大於兩倍袖深',1,60),field('collar','領條完成寬',.5,'雙層領條對折後的寬度',.2,3),field('beltWidth','腰帶完成寬',1.2,'雙層腰帶；羽織不使用',.3,6),field('tieExtra','腰帶打結預留',12,'腰帶長＝衣身整圈＋此預留',2,60)];
for(const type of ['kimono','haori'])P.registry[type]={title:type==='kimono'?'簡易和服／浴衣':'短羽織',fields,design:design.map(d=>d[0]==='length'&&type==='haori'?[...d.slice(0,2),8,...d.slice(3)]:d[0]==='overlap'&&type==='haori'?[...d.slice(0,2),0,...d.slice(3)]:d).filter(d=>type==='kimono'||!['beltWidth','tieExtra'].includes(d[0])),note:'娃娃用簡化和風外衣：前後分片、落肩方袖與直領條，並非傳統和裁原型。領口以實量比例估算，先用胚布核對；本版不含裡布、振袖袋、腰部折返。'+(type==='haori'?'前襟預設不重疊，前中敞開；繫帶可另備緞帶。':'包含雙層腰帶；穿著時讓娃娃自身左前襟覆蓋右前襟。'),steps:['後片布折裁 1 片，前片鏡像裁 2 片；先縫合肩線。方袖鏡像裁 2 片。','方袖沿肩線對折，K 記號對肩線；接袖邊上下兩段分別對前後衣身接袖線，長度各等於袖深。','縫合衣身側縫及袖底；袖口外側 O 記號之間留開口，其餘縫合。以窄折邊處理袖口。','領條長邊對折，從一側前下襬經後領接至另一側前下襬。領條兩端各預留 0.5 cm 修整量，試合後修齊；最後處理下襬。',type==='kimono'?'腰帶長邊對折縫合，留返口翻正後封口；穿好前襟，再繫腰帶。':'前中保持敞開；需要扣合時可在試穿後另加緞帶繫帶。']};
function validate(type,v){if(!['kimono','haori'].includes(type))return previousValidate(type,v);for(const [k,l,,,min,max]of [...P.registry[type].fields,...P.registry[type].design,P.seam])if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw Error(`${l}請輸入 ${min}–${max} cm。`);const q=(Math.max(v.bust,v.hip)+v.ease)/4,n=v.neck/6;if(n>=q-.3)throw Error('頸圍相對衣身過大，請核對尺寸或增加衣身鬆量。');if(v.sleeveDepth>=v.length-.5)throw Error('衣長需比袖深至少多 0.5 cm，才有衣身側縫。');if(v.sleeveDepth*2<v.arm+.5)throw Error('兩倍袖深需至少容納上臂圍加 0.5 cm。');if(v.cuff<v.hand+.2)throw Error('袖口需至少大於手掌圍 0.2 cm，請增加袖口圍。');if(v.cuff>2*v.sleeveDepth)throw Error('袖口整圈不可大於兩倍袖深。');if(v.collar>=n)throw Error('領條完成寬需小於估算領寬（頸圍 ÷ 6），請減窄領條。');}
const t=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size=".25" fill="#233854">${s}</text>`;
const line=(d)=>`<path d="${d}" fill="none" stroke="#62758a" stroke-width=".025" stroke-dasharray=".12 .08"/>`;
const mark=(x,y,label)=>`<path d="M ${x-.1} ${y} h .2" stroke="#0e6279" stroke-width=".03"/>${t(x+.3,y-.12,label)}`;
const shape=(d,fold=false)=>`<path class="seam-line" data-front="${fold}" d="${d}" fill="#edf2fc" fill-opacity=".6" stroke="#254fb1" stroke-width=".035"/>`;
function render(type,v){if(!['kimono','haori'].includes(type))return previousRender(type,v);validate(type,v);
 const q=(Math.max(v.bust,v.hip)+v.ease)/4,n=v.neck/6,nd=n*.3,fd=Math.min(v.length*.4,n*2),fw=q+v.overlap,L=v.length,D=v.sleeveDepth,S=v.sleeveLength,gap=2+2*v.seam;
 // Quarter elliptical back neckline, independently integrated for a matching collar.
 let rear=0;for(let i=0;i<500;i++){const a=(i+.5)*Math.PI/1000;rear+=Math.hypot(n*Math.sin(a),nd*Math.cos(a))*Math.PI/1000;}
 const front=Math.hypot(n+v.overlap,fd)+(L-fd),collarLength=2*(rear+front)+1,beltLength=4*q+(v.tieExtra||0);
 let body='',y=0,maxW=0;
 function piece(d,w,h,label,fold,extra=''){body+=`<g transform="translate(0,${y})">${shape(d,fold)}${t(w/2,h*.5,label)}${extra}</g>`;y+=h+gap;maxW=Math.max(maxW,w);}
 piece(`M 0 ${nd} A ${n} ${nd} 0 0 0 ${n} 0 H ${q} V ${L} H 0 Z`,q,L,'後片 · 布折裁 1',true,line(`M ${q} 0 V ${D}`)+mark(q,D,'A'));
 // Front coordinates use x=0 as front opening and x=fw as side seam.
 piece(`M 0 ${fd} L ${n+v.overlap} 0 H ${fw} V ${L} H 0 Z`,fw,L,'前片 · 鏡像裁 2',false,mark(fw,D,'A')+t(fw/2,L-.45,'前中開口在左側'));
 piece(`M 0 0 H ${S} V ${2*D} H 0 Z`,S,2*D,'方袖 · 鏡像裁 2',false,line(`M 0 ${D} H ${S}`)+mark(0,D,'K')+mark(S,D-v.cuff/2,'O')+mark(S,D+v.cuff/2,'O')+t(S/2,.5,'左接衣身／右袖口'));
 // Long strips are placed vertically for a compact, correctly tiled print.
 const bodyY=y;const stripX=maxW+gap;y=0;const garmentBody=body;body='';piece(`M 0 0 H ${2*v.collar} V ${collarLength} H 0 Z`,2*v.collar,collarLength,'領條',false,line(`M ${v.collar} 0 V ${collarLength}`)+t(v.collar,.5,'裁 1'));
 if(type==='kimono')piece(`M 0 0 H ${2*v.beltWidth} V ${beltLength} H 0 Z`,2*v.beltWidth,beltLength,'腰帶',false,line(`M ${v.beltWidth} 0 V ${beltLength}`)+t(v.beltWidth,.5,'裁 1'));
 body=garmentBody+`<g transform="translate(${stripX},0)">${body}</g>`;maxW=stripX+Math.max(2*v.collar,type==='kimono'?2*v.beltWidth:0);y=Math.max(bodyY,y);const m=1.8+v.seam,w=Math.max(14,maxW+2*m),h=y-gap+2*m+1.5;
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="${P.registry[type].title}"><title>${P.registry[type].title}</title><g font-family="sans-serif" transform="translate(${m},${m})">${body}</g>${t(w/2,h-.8,'K 肩線／A 腋下／O 袖口止點；虛線為對折參考')}</svg>`,metrics:[['衣身整圈',q*4],['領條淨長含修整',collarLength],['袖口整圈',v.cuff]],checks:{frontShoulder:fw-(n+v.overlap),backShoulder:q-n,bodySleeveJoin:2*D,sleeveJoin:2*D,collarRequired:2*(rear+front),collarLength,sideSeam:L-D}};
}
P.render=render;P.validate=validate;
})();
