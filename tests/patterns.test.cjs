const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/patterns.js','utf8')+';this.patterns=DollPatterns;',ctx);
const P=ctx.patterns;
const sample=k=>Object.fromEntries([...P.registry[k].fields,...P.registry[k].design,P.seam].map(([key,,value])=>[key,value]));
const near=(a,b,tol=1e-5)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const skirt=P.render('skirt',sample('skirt'));
near(skirt.metrics[0][1],17);near(skirt.metrics[1][1],21);
assert.match(skirt.svg,/data-front="true"/);assert.match(skirt.svg,/腰頭/);
for(const inseam of [3,7,20]){
 const v={...sample('pants'),inseam};const r=P.render('pants',v);
 const d=r.svg.match(/class="seam-line"[^>]* d="([^"]+)"/)[1];
 const nums=d.match(/-?\d+(?:\.\d+)?/g).map(Number);
 // M(F,0) H(F+half) L(...,rise*.55) Q(...,rise,W,rise)
 // L(right,yr) L(left,yl) L(0,rise)
 const W=nums[7],rise=nums[8],right=nums[9],yr=nums[10],left=nums[11],yl=nums[12];
 near(Math.hypot(W-right,yr-rise),inseam);near(Math.hypot(left,yl-rise),inseam);
 near(Math.hypot(right-left,yr-yl),v.opening);
}
for(const armhole of [7.5,8.5,12]){
 const v={...sample('sleeve'),armhole,length:12};const r=P.render('sleeve',v),h=r.metrics[1][1],a=(v.bicep+v.ease)/2;
 // Independent chord-sum integration of the entire half ellipse.
 let len=0,prev=[-a,h];for(let i=1;i<=20000;i++){const t=Math.PI-i*Math.PI/20000,p=[a*Math.cos(t),h-h*Math.sin(t)];len+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;}
 near(len,v.armhole+v.capEase,.0001);
}
assert.throws(()=>P.render('pants',{...sample('pants'),inseam:1}));
assert.throws(()=>P.render('skirt',{...sample('skirt'),length:2}));
assert.throws(()=>P.render('sleeve',{...sample('sleeve'),armhole:3}));
console.log('Passed: skirt proportions, matching pants inseams and cuff, sleeve cap lengths, invalid measurements.');
