'use strict';
const PatternGuide=(()=>{
const entries=[
 ['裁剪線','<path d="M8 22H92" stroke="#b34e29"/>','外圍實線包含你設定的縫份。沿裁剪線剪布；縫份為 0 時與完成線重合。'],
 ['完成／縫合線','<path d="M8 22H92" stroke="#254fb1" stroke-dasharray="7 4"/>','縫紉時沿此線車縫。版型尺寸與袖窿長度都以這條線計算，不包含縫份。'],
 ['直布紋','<path d="M50 4V40M44 11L50 4L56 11M44 33L50 40L56 33"/>','雙箭頭平行布邊。上下兩端到布邊距離應相同，避免裁片歪斜。'],
 ['布折線','<path d="M20 4V40M60 10H23L31 6M23 10L31 14M60 34H23L31 30M23 34L31 38"/>','箭頭指向布料對折的位置，該邊不加縫份、不剪開。紙樣標示布折裁一片，即展開後的一整片。'],
 ['F／B／S 對合記號','<path d="M10 25H95M23 18V32M50 18V32M56 18V32M82 15V35"/><text x="18" y="12" fill="#24364e" stroke="none">F</text><text x="48" y="12" fill="#24364e" stroke="none">B</text><text x="78" y="12" fill="#24364e" stroke="none">S</text>','F 單記號對前袖，B 雙記號對後袖，S 對肩線。將同名記號對齊；以粉筆或疏縫轉印，不要剪到完成線。'],
 ['省道／省尖','<path d="M25 5L50 39L75 5" stroke="#584a72"/><path d="M50 5V39" stroke-dasharray="3 3"/>','對齊省道兩邊，從寬端縫向省尖。三角形不是要挖掉的洞；摺合後先修順紙樣邊線。'],
 ['吃勢區','<path d="M12 30Q50 2 88 30" stroke-dasharray="3 3"/><path d="M12 20V36M88 20V36"/>','袖山比袖窿多出的少量長度，需在指定區段均勻縮縫。不要強拉衣身來配合。'],
 ['基準點與基準線','<path d="M8 23H92" stroke-dasharray="6 4"/><circle cx="38" cy="23" r="3"/><text x="42" y="16" fill="#24364e" stroke="none">BP</text>','CF 前中心、CB 後中心、BL 胸線、WL 腰線、HL 臀線、CR 股上、KL 膝線、EL 肘線。BP 為胸點。G* 是本站娃娃新式配套袖的對合參考線。']
];
// Text styling is set per-<text> via attributes (not a <style> block): a bare
// `text{}` rule inside an injected SVG leaks to the whole document and clobbers
// every pattern's font-size presentation attribute.
const icon=body=>`<svg viewBox="0 0 100 44" aria-hidden="true" fill="none" stroke="#24364e" stroke-width="2" font-family="sans-serif" font-size="12">${body}</svg>`;
const cards=()=>entries.map(([title,art,body])=>`<article class="mark-card">${icon(art)}<div><h3>${title}</h3><p>${body}</p></div></article>`).join('');
function printPage(){return `<section class="print-sheet mark-print"><h2>小衣研究室 · 版型記號說明</h2><p>先分清裁剪線與完成線，再核對裁片名稱、數量、布紋與同名對合記號。</p><div class="mark-grid">${cards()}</div><p>列印 A4／100%／關閉頁首頁尾。相鄰紙樣頁重疊 1 cm，對齊線條；先量 5 cm 校正線再裁布。</p><p>配套袖先做胚衣：新式 G* 下段直接對合，吃勢在上段；舊式按各區段列出的配合增量縫製。G* 並非成人新文化原型的標準 G 點。</p></section>`;}
return {cards,printPage};
})();
if(document.getElementById('guideGrid'))document.getElementById('guideGrid').innerHTML=PatternGuide.cards();
