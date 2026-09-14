'use strict';
// Measured doll adaptations inspired by block construction. These are not
// reproductions of adult Bunka formulas; all ease and dart amounts are explicit.
(()=>{
const P=DollPatterns,previousRender=P.render,previousValidate=P.validate;
const commonLower=[['waist','腰圍',12,'腰部水平繞一圈',1,100],['hip','臀圍',16,'臀部最寬處繞一圈',2,120],['hipDepth','腰臀深',3,'腰線垂直至臀圍線 HL',.5,40]];
const lowerDesign=[['hipEase','臀圍鬆量',.8,'整圈增加量',0,20],['waistEase','腰圍鬆量',.3,'省道縫合後整圈增加量',0,20],['sideShare','側縫收量比例',35,'其餘收量分配為腰省，單位 %',0,80],['frontDart','前腰省長',1.3,'腰線至省尖',.2,20],['backDart','後腰省長',2,'腰線至省尖',.2,25]];
const upperFields=[['bust','胸圍',14,'胸部最寬處繞一圈',2,100],['waist','腰圍',11.5,'腰部水平繞一圈',1,100],['neck','頸圍',6,'脖子根部繞一圈',1,60],['shoulder','肩寬',5,'兩肩端水平距離',1,40],['back','背長',7,'後頸根至腰線 WL',1,60],['depth','腋深',3,'後頸根水平至腋下 BL',.5,40],['bustHeight','胸高',4,'後頸根水平線垂直至胸點 BP',.5,40],['bustSpan','胸點間距',2.8,'左右胸點的水平距離',.5,30]];
const upperDesign=[['ease','胸圍鬆量',.8,'整圈增加量',0,20],['waistEase','腰圍鬆量',.3,'縫省後整圈增加量',0,20],['neckEase','領口鬆量',.4,'整圈增加量',0,10],['drop','落肩高度',.5,'肩端低於側頸點',0,8],['shoulderDart','後肩省寬',.2,'肩線上收去的長度；0 為不收省',0,3]];
const configs={
 skirt_block:{title:'基本窄裙原型・實量試版',fields:[...commonLower,['length','裙長',9,'腰線至下襬，不含另接腰頭',1,80]],design:lowerDesign,note:'依參考圖採前後分片，各兩個腰省，標示 WL、HL、CF、CB。以實量腰臀差分配側縫與省量；前中心布折裁一片，後片鏡像裁兩片。不是鬆緊裙，後中心需另設開口；腰頭與搭份另製。',steps:['轉印腰線、臀線與省尖；省道是縫合標記，不要沿省道剪開。','先摺合腰省並修順腰線，再裁胚布；前片布折裁 1 片、後片鏡像裁 2 片。','縫合省道與側縫，後中心預留穿脫開口；試穿後再設計腰頭與下襬。']},
 pants_block:{title:'基本褲原型・前後分片',fields:[...commonLower,['rise','股上／坐高',4.5,'腰線垂直至股上線 CR',1,50],['length','褲長',12,'腰線至褲口，不含另接腰頭',1,100]],design:[...lowerDesign,['opening','單腿褲口圍',7,'前後褲口淨寬相加，需通過腳掌',1,80],['frontExt','前襠伸出量',.8,'從前中心向外水平延伸',.1,12],['backExt','後襠伸出量',1.6,'從後中心向外水平延伸',.1,16]],note:'依參考圖分前後褲片：前片兩省、後片一省，標示腰線、臀線、股上線、膝線與折山線。前後襠伸出量分開調整；此版不含門襟、口袋與腰頭，後腰高度及襠部曲線需試胚補正。',steps:['前片、後片各鏡像裁 2 片，轉印省道、膝線與對合記號。','摺省後修順腰線，先縫省道、內腿縫與側縫，再接合前後襠。','前中心預留穿脫開口，試胚核對坐姿與襠深；另製門襟和腰頭。']},
 bunka_old:{title:'舊文化結構・娃娃實量試版',fields:upperFields,design:upperDesign,note:'參考舊文化式的前後衣身、肩省和 BL／WL 結構，以娃娃實量重新製圖；本模式採單腰省、不加側胸省。不是標準成人舊文化原型公式，也不表示只靠胸圍即可合身。',steps:['先核對 CF／CB、BL／WL、肩線與袖窿；轉印肩省、腰省。','省道不可剪除；先摺省修順邊線，再裁胚布，前片布折 1 片、後片鏡像 2 片。','接合省道與肩、側縫，後中心預留開口，試胚後再變化款式；平胸娃娃可將肩省設 0。']},
 bunka_new:{title:'新文化結構・娃娃實量試版',fields:upperFields,design:[...upperDesign,['bustDart','側胸省寬',.35,'側縫上收去的長度；平胸可填 0',0,4]],note:'參考新文化式的胸省、肩省和腰省結構，增加 BP、BL、WL 標記；以實量尺寸製作娃娃改版，不是成人新文化原型的直接縮小版。省量可調整；平胸娃娃可將胸省、肩省設 0。',steps:['先確認 BP 胸點、BL 胸線和 WL 腰線；前片有側胸省與腰省，後片有肩省和腰省。','省道是縫合線，不要剪除；先摺省、修順裁邊，再裁胚布。','縫合省道後接合肩線與側縫，試穿確認胸部空間，再修整袖窿及製作相配袖子。']}
};
Object.assign(P.registry,configs);
const f=n=>n.toFixed(2),T=(x,y,t,s=.25)=>`<text x="${x}" y="${y}" fill="#24364e" font-size="${s}" text-anchor="middle">${t}</text>`;
const line=(d,cls='construction')=>`<path class="${cls}" d="${d}" fill="none" stroke="${cls==='dart-line'?'#584a72':'#8a98aa'}" stroke-width="${cls==='dart-line'?'.025':'.016'}" ${cls==='dart-line'?'':'stroke-dasharray=".13 .08"'}/>`;
const outline=(d,fold)=>`<path class="seam-line" data-front="${fold}" d="${d}" fill="#edf2fc" fill-opacity=".45" stroke="#254fb1" stroke-width=".035"/>`;
function darts(width,total,length,count,y=0){let s='';for(let i=1;i<=count;i++){const cx=width*i/(count+1),half=total/count/2;if(total>.0001)s+=line(`M ${cx-half} ${y} L ${cx} ${y+length} L ${cx+half} ${y}`,'dart-line')+line(`M ${cx} ${y} V ${y+length}`);};return s;}
function waistDarts(width,total,tip,bottom,count){let s='';for(let i=1;i<=count;i++){const cx=width*i/(count+1),half=total/count/2;if(total>.0001)s+=line(`M ${cx-half} ${bottom} L ${cx} ${tip} L ${cx+half} ${bottom}`,'dart-line')+line(`M ${cx} ${bottom} V ${tip}`);}return s;}
function panel(x,y,body){return `<g transform="translate(${x},${y})">${body}</g>`;}
function sheet(type,v,parts,metrics,description,checks={}){const gap=2+v.seam*2,m=1.7+v.seam;let x=m,maxH=0,contents='';for(const p of parts){contents+=panel(x-p.minX,m-p.minY,p.svg);x+=p.width+gap;maxH=Math.max(maxH,p.height);}const w=Math.max(16,x-gap+m),h=maxH+2*m+2.5;return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}cm" height="${h}cm" viewBox="0 0 ${w} ${h}" role="img" aria-label="${configs[type].title}"><title>${configs[type].title}</title><desc>${description}</desc><g font-family="sans-serif">${contents}${T(w/2,h-1.3,'CF 前中心 · CB 後中心 · BL 胸線 · WL 腰線 · HL 臀線',.23)}${T(w/2,h-.8,`縫份 ${f(v.seam)} cm／布折不加。省道不可剪除，摺省後先修順邊線。`,.23)}<path d="M 1 ${h-1.8} h 2 m -2 -.1 v .2 m 2 -.2 v .2" stroke="#18283f" stroke-width=".025"/>${T(2,h-2.05,'2 cm',.22)}</g></svg>`,metrics,checks};}
function validate(type,v){if(!configs[type])return previousValidate(type,v);for(const [k,l,,,min,max] of [...configs[type].fields,...configs[type].design,P.seam])if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw new Error(`${l}請輸入 ${min}–${max}。`);
if(type.endsWith('_block')){if(v.waist+v.waistEase>v.hip+v.hipEase)throw new Error('腰圍加鬆量需不大於臀圍加鬆量，否則不能使用收腰省原型。');if(v.length<=v.hipDepth)throw new Error('裙／褲長必須大於腰臀深。');if(Math.max(v.frontDart,v.backDart)>=v.hipDepth)throw new Error('腰省長需小於腰臀深，省尖不可超過臀線。');if(type==='pants_block'&&(v.rise<=v.hipDepth||v.length<=v.rise))throw new Error('請確認：腰臀深 < 股上 < 褲長。');}
else{if(v.bust+v.ease<v.waist+v.waistEase)throw new Error('腰圍加鬆量大於胸圍加鬆量，請改用直身上衣或調整鬆量。');if(v.depth>=v.back||v.bustHeight<=v.depth||v.bustHeight>=v.back-.2)throw new Error('請確認：腋深 < 胸高 < 背長，並在胸點下留出腰省長度。');}
}
P.validate=validate;
P.render=function(type,v){if(!configs[type])return previousRender(type,v);validate(type,v);
if(type.endsWith('_block')){
const q=(v.hip+v.hipEase)/4,waist=(v.waist+v.waistEase)/4,intake=q-waist,side=intake*v.sideShare/100,totalDart=intake-side,top=q-side,parts=[];
if(totalDart>=top*.75)throw new Error('腰臀差過大，省道將重疊；請增加側縫收量比例或調整尺寸。');
const isPants=type==='pants_block',rise=isPants?v.rise:0,dx=isPants?(2*q+v.frontExt+v.backExt-v.opening)/2:0;
if(isPants&&(dx<0||dx>=q+Math.min(v.frontExt,v.backExt)))throw new Error('此褲口過寬或過窄，無法形成前後褲管；請調整單腿褲口圍。');
for(const front of [false,true]){const dartLen=front?v.frontDart:v.backDart,ext=isPants?(front?v.frontExt:v.backExt):0,inner=-ext+dx,count=isPants&&!front?1:2;
let d,extras='';
if(!isPants)d=`M 0 0 H ${top} C ${top} ${v.hipDepth*.45} ${q} ${v.hipDepth*.55} ${q} ${v.hipDepth} V ${v.length} H 0 Z`;
else d=`M 0 0 H ${top} C ${top} ${v.hipDepth*.45} ${q} ${v.hipDepth*.55} ${q} ${v.hipDepth} V ${v.length} H ${inner} L ${-ext} ${rise} Q 0 ${rise} 0 ${v.hipDepth} Z`;
let body=outline(d,!isPants&&front)+darts(top,totalDart,dartLen,count)+line(`M 0 ${v.hipDepth} H ${q}`)+T(q+.3,v.hipDepth,'HL',.2)+T(top/2,-.4,'WL',.2)+T(-.3,v.length*.55,front?'CF':'CB',.2);
if(isPants){const ky=rise+(v.length-rise)*.4,crease=(inner+q)/2;body+=line(`M ${-ext} ${rise} H ${q}`)+T(q+.25,rise,'CR',.2)+line(`M ${inner} ${ky} H ${q}`)+T(q+.25,ky,'KL',.2)+line(`M ${crease} ${rise} V ${v.length}`);if(front)body+=line(`M .35 .15 V ${v.hipDepth} Q .35 ${v.hipDepth+.3} 0 ${v.hipDepth+.3}`)+T(.5,v.hipDepth*.55,'開口',.18);}
else if(!front)body+=line(`M 0 0 V ${Math.min(v.length-.3,v.hipDepth+.3)}`)+T(.45,v.hipDepth*.5,'開口',.18);
body+=T(q/2,v.length*.65,front?'前片':'後片',.33)+T(q/2,v.length*.65+.5,!isPants&&front?'布折裁 1 片':'鏡像裁 2 片',.23)+T(q/2,v.length+v.seam+.65,`縫省後腰寬 ${f(waist)} cm`,.22);
parts.push({svg:body,minX:-ext-.5,minY:-.8,width:q+ext+1,height:v.length+v.seam+1.6});
}
return sheet(type,v,parts,[['完成腰圍',waist*4],['完成臀圍',q*4],['整圈腰省量',totalDart*4]],configs[type].note,{waist:waist*4,hip:q*4,dartTotal:totalDart*4,sideIntake:side*4,...(isPants?{frontInseam:Math.hypot(dx,v.length-rise),backInseam:Math.hypot(dx,v.length-rise),cuff:v.opening}:{})});
}
// Doll bodice: measured neckline, matching sewn shoulders and side seams.
let sum=(a,b)=>{let n=0;for(let i=0;i<400;i++){const t=(i+.5)*Math.PI/800;n+=Math.hypot(a*Math.sin(t),b*Math.cos(t))*Math.PI/800;}return n;};
const nw=(v.neck+v.neckEase)/(2*(sum(1,1)+sum(1,.3))),ny=-nw*.3,sx=v.shoulder/2,sy=ny+v.drop,q=(v.bust+v.ease)/4,wq=(v.waist+v.waistEase)/4,intake=q-wq,wd=intake*.6,bottom=q-intake*.4,bp=v.bustSpan/2,newer=type==='bunka_new',bd=newer?v.bustDart:0;
if(wd>bottom*.65)throw new Error('胸腰差過大，腰省將重疊，請調整鬆量或改用直身上衣。');
if(nw>=sx-.15||sx>=q-.05||sy>=v.depth-.2)throw new Error('頸圍、肩寬或落肩高度無法形成合理袖窿，請核對量測。');if(bp>=bottom-.2)throw new Error('胸點間距過大，胸點已接近側縫；請重新量測。');
const shoulder=Math.hypot(sx-nw,sy-ny),backScale=(shoulder+v.shoulderDart)/shoulder,bsx=nw+(sx-nw)*backScale,bsy=ny+(sy-ny)*backScale;
if(bsx>=q-.05||bsy>=v.depth-.1||v.shoulderDart>shoulder*.4)throw new Error('後肩省太寬，請減少後肩省量。');
const upper=v.bustHeight-bd/2,lower=v.bustHeight+bd/2,sideLength=Math.hypot(q-bottom,v.back-v.depth),remain=sideLength-(upper-v.depth);
if(bd>0&&(upper<=v.depth||lower>=v.back||remain<=q-bottom))throw new Error('胸省太大或胸高位置不合，請減少胸省或調整胸高。');
const frontHem=bd>0?lower+Math.sqrt(remain*remain-(q-bottom)**2):v.back;
const tipX=Math.min(q-.2,bp+.2),cap=bd>0?Math.sqrt((q-tipX)**2+(bd/2)**2)-(q-tipX):0,parts=[];
for(const front of [false,true]){const endX=front?sx:bsx,endY=front?sy:bsy,L=front?frontHem:v.back;
let d=front?`M 0 ${nw+ny} A ${nw} ${nw} 0 0 0 ${nw} ${ny}`:`M 0 0 A ${nw} ${-ny} 0 0 0 ${nw} ${ny}`;
d+=` L ${endX} ${endY} C ${endX} ${endY+(v.depth-endY)*.6} ${Math.max(nw,endX-.35)} ${v.depth} ${q} ${v.depth}`;
if(front&&bd>0)d+=` L ${q} ${upper} L ${q+cap} ${v.bustHeight} L ${q} ${lower}`;
d+=` L ${bottom} ${L} H 0 Z`;
let body=outline(d,front)+line(`M 0 ${v.depth} H ${q}`)+T(q+.35,v.depth,'BL',.2)+line(`M 0 ${L} H ${bottom}`)+T(bottom+.35,L,'WL',.2)+waistDarts(bottom,wd,v.bustHeight+.35,L,newer?2:1)+T(-.3,L*.65,front?'CF':'CB',.2);
if(front){body+=`<circle cx="${bp}" cy="${v.bustHeight}" r=".04" fill="#584a72"/>`+T(bp-.15,v.bustHeight-.18,'BP',.2);if(bd>0)body+=line(`M ${q} ${upper} L ${tipX} ${v.bustHeight} L ${q} ${lower}`,'dart-line');}
if(!front&&v.shoulderDart>0){const cx=(nw+endX)/2,cy=(ny+endY)/2,ux=(endX-nw)/(shoulder+v.shoulderDart),uy=(endY-ny)/(shoulder+v.shoulderDart),a=v.shoulderDart/2;body+=line(`M ${cx-ux*a} ${cy-uy*a} L ${cx} ${Math.max(cy+.3,v.depth*.65)} L ${cx+ux*a} ${cy+uy*a}`,'dart-line');}
body+=T(bottom/2,L-.6,front?'前片 · 布折裁 1 片':'後片 · 鏡像裁 2 片',.23)+T(bottom/2,L+v.seam+.65,'省道先摺合修順，不剪除',.22);
parts.push({svg:body,minX:-.5,minY:ny-.6,width:q+cap+1,height:L-ny+v.seam+1.6});}
return sheet(type,v,parts,[['完成胸圍',q*4],['完成腰圍',wq*4],['側胸省寬',bd]],configs[type].note,{waist:wq*4,chest:q*4,frontShoulder:shoulder,backShoulderAfterDart:(shoulder+v.shoulderDart)-v.shoulderDart,frontSide:bd>0?(upper-v.depth)+Math.hypot(q-bottom,frontHem-lower):sideLength,backSide:sideLength});
};
})();
