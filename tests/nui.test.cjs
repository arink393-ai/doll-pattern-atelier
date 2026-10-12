const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({});
for(const f of ['patterns','nuigurumi']) vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
const P=vm.runInContext('DollPatterns',c);
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(const [head,neck,length] of [[23,13,7],[18,10,5.5],[14,8,4]]){
  for(const seam of [0,.3,.5]){
    const r=P.render('nui_cape',{head,neck,length,hoodEase:1,seam});
    near(r.checks.capeInnerArc, r.checks.neck);              // 斗篷領口弧 == neck
    near(r.checks.hoodNeck, r.checks.neck);                  // 兩片帽口 == 領口弧
    assert.ok(r.checks.hem > r.checks.neck);                 // 下襬弧 > 領口弧
    assert.ok(/data-front/.test(r.svg));
    assert.ok(!/NaN|Infinity|undefined/.test(r.svg));
    assert.equal((r.svg.match(/class="seam-line"/g)||[]).length, 2); // 斗篷 + 帽子
  }
}
assert.throws(()=>P.render('nui_cape',{head:23,neck:2,length:7,hoodEase:1,seam:.5}));   // neck < 3
assert.throws(()=>P.render('nui_cape',{head:23,neck:13,length:7,hoodEase:1,seam:NaN})); // bad seam
console.log('Cotton-doll cape: neckline==hood seam, hem>neck, 2 pieces, invalids rejected.');
