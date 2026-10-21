(()=>{
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
let n,cell,parts=[],svg,drag=null,placed=0,selected=null,edgesH,edgesV;
const W=640,BX=180,BY=45;
function el(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(parent)parent.append(e);return e}
// Each shared edge is generated once; the neighbour traverses its exact reverse.
function edge(x,y,dx,dy,sign){const pt=(u,v)=>`${x+dx*u+dy*v} ${y+dy*u-dx*v}`;if(!sign)return `L ${pt(1,0)} `;const q=sign;return `L ${pt(.34,0)} C ${pt(.43,0)} ${pt(.44,-.015*q)} ${pt(.43,.055*q)} C ${pt(.27,.26*q)} ${pt(.73,.26*q)} ${pt(.57,.055*q)} C ${pt(.56,-.015*q)} ${pt(.57,0)} ${pt(.66,0)} L ${pt(1,0)} `}
function shape(r,c){return 'M 0 0 '+edge(0,0,cell,0,r?-edgesH[r-1][c]:0)+edge(cell,0,0,cell,c<n-1?edgesV[r][c]:0)+edge(cell,cell,-cell,0,r<n-1?edgesH[r][c]:0)+edge(0,cell,0,-cell,c?-edgesV[r][c-1]:0)+'Z'}
function position(p){p.g.setAttribute('transform',`translate(${p.x} ${p.y})`)}
function status(){ $('puzzleStatus').textContent=placed===n*n?'Geschafft! Dein Puzzle ist vollständig. ☕':`${placed} von ${n*n} Teilen eingesetzt · Ziehen und loslassen. Oder Teil antippen und dann seinen Platz im Bild.`}
function release(p){if(Math.hypot(p.x-p.tx,p.y-p.ty)<cell*.27){p.x=p.tx;p.y=p.ty;p.locked=true;placed++;p.g.classList.add('locked');p.g.setAttribute('aria-label','Eingesetztes Puzzleteil');p.g.removeAttribute('tabindex');p.outline.setAttribute('stroke-width','1');svg.insertBefore(p.g,svg.querySelector('.puzzle-part'));}position(p);status()}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function choose(p){selected=p;parts.forEach(x=>x.outline.setAttribute('stroke',x===p?'#506c46':'#755335'))}
function newPuzzle(){n=+$('puzzleLevel').value;cell=W/n;parts=[];placed=0;selected=null;drag=null;edgesH=Array.from({length:n-1},()=>Array.from({length:n},()=>Math.random()<.5?-1:1));edgesV=Array.from({length:n},()=>Array.from({length:n-1},()=>Math.random()<.5?-1:1));
const height=BY+W+110+n*(cell+90)+65;$('puzzleBoard').replaceChildren();svg=el('svg',{viewBox:`0 0 1000 ${height}`,role:'group','aria-label':'Puzzle mit frei beweglichen Teilen'},$('puzzleBoard'));const defs=el('defs',{},svg);
el('rect',{x:BX-8,y:BY-8,width:W+16,height:W+16,rx:10,fill:'#d6c5a5'},svg);el('rect',{x:BX,y:BY,width:W,height:W,fill:'#f2e7d0'},svg);
const hint=el('image',{href:window.journalPuzzleArt,x:BX,y:BY,width:W,height:W,opacity:$('puzzleHint').checked?.24:0,'pointer-events':'none',id:'puzzleHintImage'},svg);
const caption=el('text',{x:500,y:BY+W+65,'text-anchor':'middle',fill:'#8b7753','font-size':24},svg);caption.textContent='Deine losen Puzzleteile';
let order=Array.from({length:n*n},(_,i)=>i);for(let i=order.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
order.forEach((id,i)=>{const r=Math.floor(id/n),c=id%n,path=shape(r,c),clip='puzzle-clip-'+id;el('path',{d:path},el('clipPath',{id:clip,clipPathUnits:'userSpaceOnUse'},defs));const p={id,tx:BX+c*cell,ty:BY+r*cell,x:BX+(i%n)*(cell+90)-((n-1)*90)/2,y:BY+W+115+Math.floor(i/n)*(cell+90),locked:false};p.g=el('g',{class:'puzzle-part',tabindex:0,role:'button','aria-label':'Loses Puzzleteil'},svg);el('path',{d:path,fill:'#614425',opacity:.18,transform:'translate(2 4)','pointer-events':'none'},p.g);el('image',{href:window.journalPuzzleArt,x:-c*cell,y:-r*cell,width:W,height:W,'clip-path':`url(#${clip})`,'pointer-events':'none'},p.g);p.outline=el('path',{d:path,fill:'transparent',stroke:'#755335','stroke-width':1.8,class:'piece-outline'},p.g);position(p);parts.push(p);
p.g.onpointerdown=e=>{if(p.locked)return;e.preventDefault();choose(p);let q=point(e);drag={p,start:q,ox:q.x-p.x,oy:q.y-p.y,moved:false};svg.append(p.g);p.g.classList.add('dragging');p.g.setPointerCapture(e.pointerId)};
p.g.onpointermove=e=>{if(!drag||drag.p!==p)return;let q=point(e);if(Math.hypot(q.x-drag.start.x,q.y-drag.start.y)>5)drag.moved=true;p.x=Math.max(-cell*.1,Math.min(1000-cell*.9,q.x-drag.ox));p.y=Math.max(0,Math.min(height-cell,q.y-drag.oy));position(p)};
p.g.onpointerup=e=>{if(!drag||drag.p!==p)return;const moved=drag.moved;drag=null;p.g.classList.remove('dragging');p.g.releasePointerCapture(e.pointerId);if(moved){release(p);selected=null}};
p.g.onpointercancel=()=>{drag=null;p.g.classList.remove('dragging')};
p.g.onkeydown=e=>{if(p.locked)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(p);return}const d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];if(d){e.preventDefault();p.x+=d[0];p.y+=d[1];release(p)}};
});
svg.onclick=e=>{if(!selected||drag)return;const q=point(e);if(q.x<BX||q.x>BX+W||q.y<BY||q.y>BY+W)return;if(e.target.closest('.puzzle-part'))return;let p=selected;p.x=BX+Math.floor((q.x-BX)/cell)*cell;p.y=BY+Math.floor((q.y-BY)/cell)*cell;release(p);selected=null};status();
}
$('puzzleRestart').onclick=newPuzzle;$('puzzleLevel').onchange=newPuzzle;$('puzzleHint').onchange=()=>{document.getElementById('puzzleHintImage').setAttribute('opacity',$('puzzleHint').checked?.24:0)};newPuzzle();
})();
