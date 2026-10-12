'use strict';
const defs=[['bust','胸圍',14,'繞胸部最寬一圈',1,100],['waist','腰圍',12,'腰部水平繞一圈',1,100],['neck','頸圍',6,'脖子根部繞一圈',1,60],['shoulder','肩寬',5,'兩肩端水平距離',1,40],['back','背長',7,'後頸根至腰線',1,60],['depth','腋深',3,'後頸根水平至腋下',.5,40]];
const designDefs=[['length','衣長',8,'後頸根至下襬',1,80],['ease','胸腰鬆量',1,'胸、腰各加的整圈量',0,20],['neckEase','領口鬆量',.4,'領圍整圈增加量',0,10],['drop','落肩高度',.5,'肩端低於側頸點',0,8]];
const seamDefs=[['seam','縫份寬度',.5,'0–2 cm，整圈均一縫份',0,2]];
let allDefs=[...defs,...designDefs,...seamDefs];
let garment="top";
const draftMemory={};
const invalidUppers=new Set();
let lastUpper="top";
const topNote="無袖・後中心全開・不設胸褶。直身寬度取胸、腰較大值再加鬆量；後開口搭份與貼邊另加。";
function renderFields(items,id){document.getElementById(id).innerHTML=items.map(([key,label,value,hint,min,max])=>`<label for="${key}">${label}<input id="${key}" name="${key}" type="number" inputmode="decimal" min="${min}" max="${max}" step="0.1" value="${value}" required aria-describedby="${key}-hint"><small id="${key}-hint">${hint}</small></label>`).join('');}
renderFields(defs,'fields');renderFields(designDefs,'designFields');renderFields(seamDefs,'seamFields');
const $=id=>document.getElementById(id);let exportSvg='';let state=null;const f=n=>n.toFixed(2);
// Numerical length of a quarter ellipse. Front/back neckline arcs together
// are scaled to the measured neck circumference plus the chosen ease.
function arc(a,b){let sum=0;const steps=240;for(let i=0;i<steps;i++){const t=(i+.5)*Math.PI/(2*steps);sum+=Math.hypot(a*Math.sin(t),b*Math.cos(t))*Math.PI/(2*steps);}return sum;}
function validate(v){if(garment!=='top'){DollPatterns.validate(garment,v);return;}for(const [key,label,,hint,min,max] of allDefs){if(!Number.isFinite(v[key])||v[key]<min||v[key]>max)throw new Error(`${label}請輸入 ${min}–${max} cm 的數字。`);}if(v.waist>v.bust*1.5)throw new Error('此無胸褶試版不適用腰圍超過胸圍 1.5 倍的身形。');if(v.depth>=v.back)throw new Error('腋深必須小於背長，請確認量測起點。');if(v.length<=v.depth)throw new Error('衣長必須大於腋深，才有完整衣身。');const nw=(v.neck+v.neckEase)/(2*(arc(1,1)+arc(1,.3)));
if(nw>=v.shoulder/2-.1)throw new Error('領寬已接近肩端，請確認頸圍、肩寬或減少領口鬆量。');if(-nw*.3+v.drop>=v.depth-.2)throw new Error('肩端過低，請確認落肩高度或腋深。');if(nw*.7>=v.depth)throw new Error('領口深度已超過腋下，請確認頸圍及腋深。');if(v.shoulder/2>(v.bust+v.ease)/4)throw new Error('此簡化版需半肩寬不大於四分之一成衣胸圍；請重新量測或改用專門身形版。');return nw;}
function generate(v,kind){if(garment==='sleeve_linked')return pairedSleeve(v);if(garment!=='top')return DollPatterns.render(garment,v);const nw=validate(v),top=-nw*.3,sx=v.shoulder/2,sy=top+v.drop,w=(Math.max(v.bust,v.waist)+v.ease)/4,waist=(v.waist+v.ease)/4,hem=kind==='aline'?Math.max(w,waist)+v.length*.10:Math.max(w,waist);const gap=2.6+v.seam*2,margin=1.8+v.seam,pieceWidth=Math.max(w,hem,sx),offset=pieceWidth+gap,total=offset+pieceWidth+margin*2,height=v.length+4.7+nw*.3+v.seam*2;
function piece(front,x){const start=front?nw+top:0;
const neckPath=front?`M 0 ${start} A ${nw} ${nw} 0 0 0 ${nw} ${top}`:`M 0 0 A ${nw} ${-top} 0 0 0 ${nw} ${top}`;
const path=`${neckPath} L ${sx} ${sy} C ${sx} ${sy+(v.depth-sy)*.6} ${Math.max(nw,sx-.35)} ${v.depth} ${w} ${v.depth} L ${hem} ${v.length} L 0 ${v.length} Z`;
const font=Math.max(.22,Math.min(.38,v.length/22));let s=`<g transform="translate(${x},${1.5+nw*.3+v.seam})"><path class="seam-line" data-front="${front}" d="${path}" fill="${front?'#edf2fc':'#f2f5fb'}" fill-opacity=".65" stroke="#254fb1" stroke-width=".035"/><path d="M 0 ${v.depth} H ${w}" fill="none" stroke="#8b9bb4" stroke-width=".018" stroke-dasharray=".12 .1"/>`;
if(v.back<v.length)s+=`<path d="M 0 ${v.back} H ${w+(hem-w)*(v.back-v.depth)/(v.length-v.depth)}" stroke="#8b9bb4" stroke-width=".018" stroke-dasharray=".12 .1"/>`;
s+=`<text x="${w*.48}" y="${v.depth+(v.length-v.depth)*.45}" text-anchor="middle" fill="#233854" font-size="${font*1.2}">${front?'前片':'後片'}</text><text x="${w*.48}" y="${v.depth+(v.length-v.depth)*.45+font*1.6}" text-anchor="middle" fill="#63748c" font-size="${font*.7}">${front?'對折裁 1 片':'鏡像裁 2 片'}</text><path d="M ${w*.72} ${v.depth+.35} v ${Math.max(.2,v.length-v.depth-.7)}" stroke="#667995" stroke-width=".018"/><text x="-.25" y="${v.length*.65}" fill="#63748c" font-size="${font*.65}" transform="rotate(-90,-.25,${v.length*.65})">${front?'前中心 · 布折線':'後中心 · 全開口'}</text><text x="${w/2}" y="${v.length+v.seam+.6}" text-anchor="middle" fill="#233854" font-size="${font*.75}">下襬淨寬 ${f(hem)} cm</text></g>`;return s;}
let contents=`<title>娃娃無袖上衣實量試版，縫份 ${f(v.seam)} cm</title><desc>胸圍 ${v.bust}，頸圍 ${v.neck}，衣長 ${v.length} 公分。獨立簡化試版，非完整文化原型。後中心全開，需另加搭份與貼邊。</desc><g font-family="sans-serif">${piece(true,margin)}${piece(false,margin+offset)}<path d="M ${margin} ${height-1.4} h 2 m -2 -.1 v .2 m 2 -.2 v .2" fill="none" stroke="#18283f" stroke-width=".025"/><text x="${margin}" y="${height-.9}" font-size=".23" fill="#18283f">2 cm 校正線 · 列印選 100%，勿縮放</text><text x="${margin}" y="${height-.45}" font-size=".21" fill="#626f80">縫份 ${f(v.seam)} cm／布折不加。搭份與貼邊另加。先試胚再裁布。</text></g>`;
return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${total}cm" height="${height}cm" viewBox="0 0 ${total} ${height}" role="img" aria-label="前後片即時版型">${contents}</svg>`,chest:w*4,hem:hem*4,neck:v.neck+v.neckEase};}
function read(){return Object.fromEntries(allDefs.map(([key])=>[key,$(key).value.trim()===''?NaN:Number($(key).value)]));}
function update(){try{const v=read();const result=generate(v,$('silhouette').value);$('error').hidden=true;$('error').textContent='';$('paper').innerHTML=result.svg;$('paper').style.opacity=1;addPatternMarks(result);addSeamAllowance(v.seam);exportSvg=$('paper').querySelector('svg').outerHTML;state=v;$('makeSleeve').disabled=false;buildPrintSheets();$('download').disabled=false;$('printPreview').disabled=false;$('seamSummary').textContent=`縫份 ${f(v.seam)} cm，標示布折的邊不加。列印後先核對校正線，再做胚衣試穿。`;draftMemory[garment]={...v};if(['top','bunka_old','bunka_new'].includes(garment)){lastUpper=garment;invalidUppers.delete(garment);}$('results').innerHTML=(result.metrics||[['成衣胸圍',result.chest],['目標領口周長',result.neck],['下襬整圈',result.hem]]).map(([t,n])=>`<div><small>${t}</small><b>${f(n)} <em>cm</em></b></div>`).join('');}catch(e){if(['top','bunka_old','bunka_new'].includes(garment)){lastUpper=garment;invalidUppers.add(garment);draftMemory[garment]=read();}$('makeSleeve').disabled=true;$('error').textContent=e.message;$('error').hidden=false;$('paper').innerHTML='<p class="muted">修正尺寸後，版型會重新顯示。</p>';$('results').innerHTML='';$('download').disabled=true;$('printPreview').disabled=true;exportSvg='';state=null;$('printSheets').innerHTML='<p>尺寸無效，請關閉列印並修正尺寸。</p>';$('seamSummary').textContent='請先修正尺寸。';}}
$('measurements').addEventListener('input',update);$('measurements').addEventListener('submit',e=>e.preventDefault());$('reset').addEventListener('click',()=>{allDefs.forEach(([key,,val])=>$(key).value=val);$('silhouette').value='straight';update();});$('download').addEventListener('click',()=>{if(!exportSvg)return;const url=URL.createObjectURL(new Blob([exportSvg],{type:'image/svg+xml;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`小衣研究室-${patternName()}-縫份${state.seam}cm.svg`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
// Offset in pattern units (cm), never by scaling the garment. Integer clipping
// removes self-intersections and clips the front allowance at the fabric fold.
function addSeamAllowance(cm){
  if(cm===0)return;
  const C=ClipperLib,S=100000;
  for(const path of $('paper').querySelectorAll('.seam-line')){
    const length=path.getTotalLength(),count=Math.ceil(length/.01),points=[];
    for(let i=0;i<count;i++){const p=path.getPointAtLength(i*length/count);points.push({X:Math.round(p.x*S),Y:Math.round(p.y*S)});}
    if(!C.Clipper.Orientation(points))points.reverse();
    const offset=new C.ClipperOffset(2,.002*S),polygons=[];
    offset.AddPath(points,C.JoinType.jtMiter,C.EndType.etClosedPolygon);offset.Execute(polygons,(path.dataset.hole==='true'?-cm:cm)*S);
    let result=polygons;
    if(path.dataset.front==='true'){
      const clip=new C.Clipper();clip.AddPaths(polygons,C.PolyType.ptSubject,true);
      clip.AddPath([{X:0,Y:-1000*S},{X:1000*S,Y:-1000*S},{X:1000*S,Y:1000*S},{X:0,Y:1000*S}],C.PolyType.ptClip,true);
      result=[];clip.Execute(C.ClipType.ctIntersection,result,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);
    }
    if(result.length!==1)throw new Error('縫份無法形成完整裁剪線，請減少縫份或調整尺寸。');
    const line=document.createElementNS('http://www.w3.org/2000/svg','path');
    line.setAttribute('class','cut-line');line.setAttribute('d',result.map(poly=>'M '+poly.map(p=>(p.X/S).toFixed(5)+' '+(p.Y/S).toFixed(5)).join(' L ')+' Z').join(' '));
    line.setAttribute('fill','none');line.setAttribute('stroke','#b34e29');line.setAttribute('stroke-width','.035');
    path.after(line);path.setAttribute('stroke-dasharray','.12 .07');
  }
}
function buildPrintSheets(){
  const svg=$('paper').querySelector('svg'),[, ,width,height]=svg.getAttribute('viewBox').split(' ').map(Number);
  const cols=Math.max(1,Math.ceil((width-1)/18)),rows=Math.max(1,Math.ceil((height-1)/24)),total=cols*rows;
  $('printInfo').textContent=`縫份 ${f(state.seam)} cm · ${rows} 行 × ${cols} 列，共 ${total} 張 A4。`;
  $('tileMap').style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;
  let sheets='',map='';
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const page=row*cols+col+1,tile=svg.cloneNode(true);
    tile.setAttribute('width','190mm');tile.setAttribute('height','250mm');tile.setAttribute('viewBox',`${col*18} ${row*24} 19 25`);
    tile.removeAttribute('role');tile.removeAttribute('aria-label');
    sheets+=`<section class="print-sheet"><div class="print-header">${patternName()} · 第 ${page} / ${total} 頁 · 第 ${row+1} 行／第 ${col+1} 列 · 縫份 ${f(state.seam)} cm</div><div class="print-tile">${tile.outerHTML}</div><div class="print-footer"><span class="calibration">5 cm 校正線</span><span>100% · 相鄰頁重疊 1 cm · 布折線不加縫份</span></div></section>`;
    map+=`<span>${row+1} 行 ${col+1} 列<small>第 ${page} 頁</small></span>`;
  }
  if($('includeGuide').checked){sheets+=PatternGuide.printPage();$('printInfo').textContent+=' 另附 1 張記號說明。';}$('printSheets').innerHTML=sheets;$('tileMap').innerHTML=map;
}
$('printPreview').addEventListener('click',()=>{if(exportSvg){buildPrintSheets();$('printDialog').showModal();}});
$('closePrint').addEventListener('click',()=>$('printDialog').close());
$('printNow').addEventListener('click',()=>{if(!exportSvg)return;$('printDialog').close();window.print();});
window.addEventListener('beforeprint',()=>{if(exportSvg)buildPrintSheets();});
function patternName(){return garment==='top'?'基本上衣':DollPatterns.registry[garment].title;}
function chooseGarment(next){
  garment=next;$('paper').classList.toggle('long-pattern',['kimono','haori'].includes(next));$('garment').value=next;$('makeSleeve').hidden=!['top','bunka_new','bunka_old'].includes(next);$('linkedSettings').hidden=next!=='sleeve_linked';$('linkedInfo').textContent='來源：'+(lastUpper==='top'?'基本上衣':DollPatterns.registry[lastUpper].title)+'；修改上衣後，袖子會依最新有效尺寸重新計算。';
  const cfg=DollPatterns.registry[next];allDefs=next==='top'?[...defs,...designDefs,...seamDefs]:[...cfg.fields,...cfg.design,...seamDefs];
  renderFields(next==='top'?defs:cfg.fields,'fields');renderFields(next==='top'?designDefs:cfg.design,'designFields');renderFields(seamDefs,'seamFields');
  if(draftMemory[next])allDefs.forEach(([k])=>$(k).value=draftMemory[next][k]);
  $('topOptions').hidden=next!=='top';$('useArmhole').hidden=next!=='sleeve';const _nuiOpt=$('nuiOptions');if(_nuiOpt)_nuiOpt.hidden=!/^nui_/.test(next);$('patternTitle').textContent=patternName();$('patternNote').textContent=next==='top'?topNote:cfg.note;
  const steps=next==='top'?['前片對折裁一片，後片鏡像裁兩片；先接合肩線與側縫。','處理領口、袖窿及後開口貼邊，另加扣合搭份。','試胚補正後再裁正式布料。']:cfg.steps;
  $('assembly').innerHTML='<h3>裁剪與組合</h3><ol>'+steps.map(t=>'<li>'+t+'</li>').join('')+'</ol>';update();
}

$('makeSleeve').addEventListener('click',()=>chooseGarment('sleeve_linked'));
$('editSource').addEventListener('click',()=>chooseGarment(lastUpper));
$('includeGuide').addEventListener('change',()=>{if(exportSvg)buildPrintSheets();});
function pairedSleeve(v){
 const source=draftMemory[lastUpper];if(invalidUppers.has(lastUpper))throw new Error('來源上衣尺寸有誤，請返回修改來源上衣後再產生袖子。');if(!source)throw new Error('請先設定有效的上衣尺寸。');
 const g=LinkedSleeves.geometry(lastUpper,source),result=LinkedSleeves.build(g,v),previous=garment;
 let upper;const previousDefs=allDefs;try{garment=lastUpper;if(lastUpper==='top')allDefs=[...defs,...designDefs,...seamDefs];upper=generate({...source,seam:v.seam},$('silhouette').value);}finally{garment=previous;allDefs=previousDefs;}
 const parse=s=>new DOMParser().parseFromString(s,'image/svg+xml').documentElement,a=parse(upper.svg),b=parse(result.svg),av=a.getAttribute('viewBox').split(' ').map(Number),bv=b.getAttribute('viewBox').split(' ').map(Number),w=Math.max(av[2],bv[2]),h=av[3]+bv[3];
 result.svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="上衣及配套袖子"><g data-panel="upper">${a.innerHTML}</g><g data-panel="sleeve" transform="translate(0,${av[3]})">${b.innerHTML}</g></svg>`;result.upperGeometry=g;return result;
}
function addPatternMarks(result){
 const svg=$('paper').querySelector('svg'),ns='http://www.w3.org/2000/svg';
 const add=(parent,markup)=>{const g=document.createElementNS(ns,'g');g.setAttribute('class','pattern-mark');g.innerHTML=markup;parent.append(g);};
 for(const path of svg.querySelectorAll('.seam-line')){if(path.dataset.hole==='true'||path.dataset.ring==='true')continue;const b=path.getBBox(),x=b.x+b.width*.65,y=b.y+b.height*.62,L=Math.min(1,b.height*.2);add(path.parentNode,`<g class="grain-symbol" fill="none" stroke="#243953" stroke-width=".025"><path d="M ${x} ${y-L/2} v ${L} m -.1 -.16 l .1 .16 .1 -.16 M ${x-.1} ${y-L/2+.16} l .1 -.16 .1 .16"/></g>`);if(path.dataset.front==='true')add(path.parentNode,`<text class="fold-symbol" x=".08" y="${y}" font-size=".2" fill="#243953">布折 ↕</text>`);}
 const upper=['top','bunka_new','bunka_old'].includes(garment),g=result.upperGeometry||(upper?LinkedSleeves.geometry(garment,read()):null);if(!g)return;
 const paths=[...(result.upperGeometry?svg.querySelector('[data-panel="upper"]'):svg).querySelectorAll('.seam-line')];
 paths.forEach((path,i)=>{const index=g.type==='top'?i:1-i,c=g.curves[index],p=LinkedSleeves.point(c,g.ts[index]),label=index===0?'F':'B',ticks=index===0?[0]:[-.06,.06];add(path.parentNode,`<g class="match-symbol" data-match="${label}" fill="none" stroke="#0e6279" stroke-width=".03">${ticks.map(o=>`<path d="M ${p[0]-.1} ${p[1]+o} h .2"/>`).join('')}</g><text x="${p[0]+.18}" y="${p[1]}" font-size=".2">${label}</text><text x="${c[0][0]+.1}" y="${c[0][1]-.1}" font-size=".2">S</text>`);});
}

$('garment').addEventListener('change',()=>chooseGarment($('garment').value));
$('useArmhole').addEventListener('click',()=>{
  const v=draftMemory[lastUpper]||Object.fromEntries([...defs,...designDefs,...seamDefs].map(([k,,n])=>[k,n]));
  const nw=(v.neck+v.neckEase)/(2*(arc(1,1)+arc(1,.3))),sx=v.shoulder/2,sy=-nw*.3+v.drop,w=(lastUpper==='top'?Math.max(v.bust,v.waist)+v.ease:v.bust+v.ease)/4;
  let total=0;for(const back of [false,true]){const sh=Math.hypot(sx-nw,sy+nw*.3),scale=back&&lastUpper!=='top'?(sh+v.shoulderDart)/sh:1,ex=nw+(sx-nw)*scale,ey=-nw*.3+(sy+nw*.3)*scale;
  const p0=[ex,ey],p1=[ex,ey+(v.depth-ey)*.6],p2=[Math.max(nw,ex-.35),v.depth],p3=[w,v.depth];let len=0;
  for(let i=0;i<1000;i++){const t=(i+.5)/1000,u=1-t;const dx=3*u*u*(p1[0]-p0[0])+6*u*t*(p2[0]-p1[0])+3*t*t*(p3[0]-p2[0]);const dy=3*u*u*(p1[1]-p0[1])+6*u*t*(p2[1]-p1[1])+3*t*t*(p3[1]-p2[1]);len+=Math.hypot(dx,dy)/1000;}
  total+=len;}
  $('armhole').value=total.toFixed(2);update();
});
let mode='new';function formula(){const b=Number($('adultB').value),w=Number($('adultW').value);$('methodDescription').textContent=mode==='new'?'第八代原型：先了解胸圍、領寬與腰褶量的關係，再學習完整製圖。':'第七代原型：從基本矩形與領口尺寸認識較早的文化式結構。';if(!$('adultB').value||!$('adultW').value||!Number.isFinite(b)||!Number.isFinite(w)||b<60||b>160||w<40||w>160){$('formulaRows').innerHTML='<tr><td colspan="3">請輸入範圍內的成人胸圍與腰圍。</td></tr>';return;}const rows=mode==='new'?[['原型半身框寬','B / 2 + 6',b/2+6],['胸圍線深度','B / 12 + 13.7',b/12+13.7],['背寬','B / 8 + 7.4',b/8+7.4],['胸寬','B / 8 + 6.2',b/8+6.2],['前領寬','B / 24 + 3.4',b/24+3.4],['總腰褶量（半身）','(B / 2 + 6) − (W / 2 + 3)',(b-w)/2+3]]:[['原型半身框寬','B / 2 + 5',b/2+5],['胸圍線深度','B / 6 + 7',b/6+7],['背寬','B / 6 + 4.5',b/6+4.5],['胸寬','B / 6 + 3',b/6+3],['後領寬','B / 20 + 2.9',b/20+2.9],['前領寬','B / 20 + 2.9 − 0.2',b/20+2.7],['腰寬基準（四分之一）','W / 4 + 1.5',w/4+1.5]];$('formulaRows').innerHTML=rows.map(([a,c,n])=>`<tr><td>${a}</td><td>${c}</td><td>${n<0?'負值：不適用收褶':f(n)+' cm'}</td></tr>`).join('');}
function selectMode(m){mode=m;document.querySelectorAll('[data-mode]').forEach(t=>{t.setAttribute('aria-selected',String(t.dataset.mode===m));t.tabIndex=t.dataset.mode===m?0:-1;});$('formula-panel').setAttribute('aria-labelledby',m+'-tab');formula();}
document.querySelectorAll('[data-mode]').forEach(t=>{t.addEventListener('click',()=>selectMode(t.dataset.mode));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectMode(e.key==='Home'?'new':e.key==='End'?'old':mode==='new'?'old':'new');$(mode+'-tab').focus();}});});['adultB','adultW'].forEach(id=>$(id).addEventListener('input',formula));chooseGarment('bunka_new');formula();
if(document.modelContext?.registerTool){
  const kinds=['top',...Object.keys(DollPatterns.registry)];
  const schema={oneOf:kinds.map(kind=>{const cfg=DollPatterns.registry[kind],ds=kind==='top'?[...defs,...designDefs,...seamDefs]:[...cfg.fields,...cfg.design,...seamDefs];return {type:'object',properties:{garment:{const:kind},measurements:{type:'object',properties:Object.fromEntries(ds.map(([k,l,,,min,max])=>[k,{type:'number',minimum:min,maximum:max,description:l}])),required:ds.map(d=>d[0]),additionalProperties:false}},required:['garment','measurements'],additionalProperties:false};})};
  try{Promise.resolve(document.modelContext.registerTool({name:'configure_doll_pattern',title:'選擇娃娃版型並設定尺寸',description:'選擇新舊文化結構、窄裙、分片褲等娃娃原型或簡易款式，設定尺寸和縫份，更新紙樣與列印頁數。',inputSchema:schema,annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
    if(!input||!kinds.includes(input.garment)||!input.measurements)throw new Error('Invalid pattern input');
    const kind=input.garment,v=input.measurements,cfg=DollPatterns.registry[kind],ds=kind==='top'?[...defs,...designDefs,...seamDefs]:[...cfg.fields,...cfg.design,...seamDefs];
    if(Object.keys(v).some(k=>!ds.some(d=>d[0]===k)))throw new Error('Unknown measurement');
    for(const [k,l,,,min,max] of ds)if(typeof v[k]!=='number'||!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw new Error('Invalid '+l);
    // Validate the complete proposed geometry before touching visible state.
    const previousGarment=garment,previousDefs=allDefs;
    try{garment=kind;allDefs=ds;generate(v,'straight');}finally{garment=previousGarment;allDefs=previousDefs;}
    draftMemory[kind]={...v};chooseGarment(kind);if(!state)throw new Error($('error').textContent);
    return {garment,measurements:state,patternReady:!!exportSvg,printPages:$('printSheets').children.length};
  }})).catch(()=>{});}catch{}
}
