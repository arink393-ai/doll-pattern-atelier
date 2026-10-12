'use strict';
// 棉花娃娃（ぬい）配套衣服。以常見棉花娃娃尺寸為預設起點，可自行微調。
// 全部為本站原創、簡化、寬鬆的試版，不是任何第三方紙型。單位 cm。
(()=>{
const P=DollPatterns, prevRender=P.render, prevValidate=P.validate, seam=P.seam;
const configs={
 nui_cape:{
  title:'棉花娃娃・連帽斗篷',
  fields:[['head','頭圍',23,'頭部最寬一圈（決定帽子大小）',3,60],
          ['neck','領口整圈',13,'斗篷領口縫合線整圈，也＝帽口長',3,60]],
  design:[['length','斗篷長',7,'領口到下襬',1,40],
          ['hoodEase','帽子鬆量',1,'帽子整體加大量',0,8]],
  note:'半圓披風＋對摺帽：斗篷內弧是領口，帽子下緣縫到領口弧線。尺寸以常見棉花娃娃為起點，請依自己的娃微調（娃娃個體差異大）。寬鬆試版，前領用綁帶或魔鬼氈。',
  steps:['斗篷裁 1 片（攤平的半圓環），帽子鏡像裁 2 片。',
         '帽子沿後中心與頭頂縫合、翻正；帽口下緣對齊斗篷領口弧線縫合。',
         '斗篷前緣、下襬與帽口三摺車縫；前領加綁帶或魔鬼氈即可穿脫。']}
};
Object.assign(P.registry, configs);

const f=n=>n.toFixed(2);
const T=(x,y,t,s=.28)=>`<text x="${x}" y="${y}" fill="#233854" font-size="${s}" text-anchor="middle">${t}</text>`;
const shape=(d,front=false)=>`<path class="seam-line" data-front="${front}" d="${d}" fill="#edf2fc" fill-opacity=".6" stroke="#254fb1" stroke-width=".035"/>`;
const dash=d=>`<path d="${d}" fill="none" stroke="#8b9bb4" stroke-width=".018" stroke-dasharray=".12 .1"/>`;

function validate(type,v){
 if(!configs[type]) return prevValidate(type,v);
 for(const [k,l,,,min,max] of [...configs[type].fields,...configs[type].design,seam])
   if(!Number.isFinite(v[k])||v[k]<min||v[k]>max) throw new Error(`${l}請輸入 ${min}–${max}。`);
}
P.validate=validate;

P.render=function(type,v){
 if(!configs[type]) return prevRender(type,v);
 validate(type,v);
 if(type==='nui_cape') return cape(v);
};

// 半圓環斗篷：內弧=領口(長度=neck)，外弧=下襬，兩直邊為前開口。
function cape(v){
 const ri=v.neck/Math.PI, ro=ri+v.length, hem=Math.PI*ro;
 const capeD=`M 0 ${ro} A ${ro} ${ro} 0 0 1 ${2*ro} ${ro} L ${ro+ri} ${ro} A ${ri} ${ri} 0 0 0 ${ro-ri} ${ro} Z`;
 const capeG=shape(capeD)
   + T(ro, ro*0.52, '斗篷 · 裁 1 片', .32)
   + T(ro, ro*0.52+.5, '內弧＝領口', .24)
   + T(ro, ro-.28, 'CF 前開口', .22);
 // 對摺帽（鏡像裁 2 片），下緣長 HD＝neck/2，兩片合起＝領口弧長。
 const HD=v.neck/2, HH=v.head/Math.PI+v.hoodEase+.5;
 const hoodD=`M 0 ${HH} L 0 ${.6} Q ${HD*0.5} 0 ${HD} ${0.22*HH} Q ${HD*0.92} ${0.55*HH} ${HD} ${HH} Z`;
 const hoodG=shape(hoodD)
   + dash(`M 0 ${HH} H ${HD}`)
   + T(HD*0.5, HH*0.52, '帽子', .3)
   + T(HD*0.5, HH*0.52+.42, '鏡像裁 2 片', .22)
   + T(HD*0.5, HH-.16, '帽口縫領口', .2);
 const m=1.8+v.seam, gap=1.4+v.seam*2, capeW=2*ro, capeH=ro;
 const w=Math.max(16, m+capeW+gap+HD+m), h=Math.max(capeH,HH)+2*m+2.6;
 const bodyG=`<g transform="translate(${m},${m})">${capeG}</g>`
   + `<g transform="translate(${m+capeW+gap},${m})">${hoodG}</g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="${configs.nui_cape.title}"><title>${configs.nui_cape.title}／縫份 ${f(v.seam)} cm</title><desc>棉花娃娃連帽斗篷，本站原創簡化試版。</desc><g font-family="sans-serif">${bodyG}`
   + T(w/2, h-1.75, `領口弧 ${f(v.neck)}＝帽口 2×${f(HD)} cm · 下襬弧 ${f(hem)} cm`, .24)
   + T(w/2, h-1.25, `斗篷長 ${f(v.length)} · 帽高 ${f(HH)} · 縫份 ${f(v.seam)} cm／布折不加`, .23)
   + `<path d="M 1 ${h-.7} h 2 m -2 -.1 v .2 m 2 -.2 v .2" fill="none" stroke="#18283f" stroke-width=".025"/>`
   + T(2, h-.95, '2 cm', .22) + `</g></svg>`;
 return {svg,
   metrics:[['斗篷長',v.length],['領口弧長',v.neck],['帽高',HH]],
   checks:{neck:v.neck, capeInnerArc:Math.PI*ri, hoodNeck:2*HD, hem}};
}

// 尺寸預設（參考起始值；棉花娃娃個體差異大，請依自己的娃微調）。
const presets={
 '20cm 正常體':{head:23,neck:13,length:7,hoodEase:1},
 '20cm 海星體':{head:23,neck:14,length:7,hoodEase:1.2},
 '15cm 正常體':{head:18,neck:10,length:5.5,hoodEase:.8},
 '10cm 正常體':{head:14,neck:8,length:4,hoodEase:.6}
};
if(typeof document!=='undefined'){
 const sel=document.getElementById('nuiPreset');
 if(sel){
  sel.innerHTML=Object.keys(presets).map(k=>`<option>${k}</option>`).join('');
  sel.addEventListener('change',()=>{
   const p=presets[sel.value]; if(!p) return;
   for(const [k,val] of Object.entries(p)){const el=document.getElementById(k); if(el) el.value=val;}
   const form=document.getElementById('measurements');
   if(form) form.dispatchEvent(new Event('input',{bubbles:true}));
  });
 }
}
})();
