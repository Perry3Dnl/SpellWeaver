const TAU=Math.PI*2;
export function polar(angle,radius){const a=(angle-90)*Math.PI/180;return [250+radius*Math.cos(a),250+radius*Math.sin(a)]}
export function polygon(ctx,x,y,sides,radius,rotate=0){ctx.beginPath();for(let i=0;i<sides;i++){const a=rotate-Math.PI/2+TAU*i/sides;const p=[x+Math.cos(a)*radius,y+Math.sin(a)*radius];i?ctx.lineTo(...p):ctx.moveTo(...p)}ctx.closePath();ctx.stroke()}
export function diamond(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.stroke()}
function special(ctx,id,x,y,r){const oct=(rr,rot=0)=>polygon(ctx,x,y,8,rr,rot);if(id===120){oct(r);oct(r*.84);return}if(id===119){oct(r);polygon(ctx,x,y,6,r*.77);diamond(ctx,x,y,r*.55);ctx.beginPath();ctx.arc(x,y,r*.32,0,TAU);ctx.stroke();return}if(id===121){oct(r);diamond(ctx,x,y,r*.8);for(let i=0;i<8;i++){let a=i*TAU/8;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.25,y+Math.sin(a)*r*.25);ctx.lineTo(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88);ctx.stroke()}return}if(id===122){oct(r);oct(r*.78);diamond(ctx,x,y,r*.52);ctx.beginPath();ctx.arc(x,y,r*.22,0,TAU);ctx.stroke();return}if(id===123){oct(r);oct(r*.85);polygon(ctx,x,y,4,r*.62,Math.PI/4);diamond(ctx,x,y,r*.28);for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5);ctx.lineTo(x+Math.cos(a)*r*.94,y+Math.sin(a)*r*.94);ctx.stroke()}return}if(id===124){oct(r);oct(r*.82);polygon(ctx,x,y,4,r*.64,Math.PI/4);diamond(ctx,x,y,r*.27);for(let i=0;i<4;i++){let a=i*Math.PI/2;const px=x+Math.cos(a)*r*.73,py=y+Math.sin(a)*r*.73;diamond(ctx,px,py,r*.12)}return}}
export function drawElement(ctx,element,x,y,radius=20){ctx.save();ctx.lineWidth=1.25;if(element.special){special(ctx,element.id,x,y,radius)}else{const parts=element.code.split('-');let r=radius;for(const part of parts){const double=part.endsWith('R');const base=double?part.slice(0,-1):part;const n={T:3,S:4,P:5,Hx:6,Hp:7,O:8}[base];if(n){polygon(ctx,x,y,n,r);if(double)polygon(ctx,x,y,n,r,Math.PI/n)}r*=.73}}ctx.restore()}
function contour(ctx,r,type){const n=type==='Toothed'?180: type==='Spiked'?84:type==='Star'?32:240;ctx.beginPath();for(let i=0;i<=n;i++){const a=TAU*i/n-Math.PI/2;let mod=0;if(type==='Wavy')mod=3*Math.sin(i/n*TAU*22);if(type==='Spiked')mod=i%2?0:7;if(type==='Toothed')mod=i%3===0?4:0;if(type==='Star')mod=i%2?9:0;if(type==='Squared')mod=4*Math.cos(i/n*TAU*4);const rr=r+mod;const x=250+rr*Math.cos(a),y=250+rr*Math.sin(a);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke()}
export function drawRing(ctx,ring){const r=ring.radius;const type=ring.pattern;ctx.save();ctx.lineWidth=1.4;contour(ctx,r,['Wavy','Spiked','Toothed','Star','Squared'].includes(type)?type:'Smooth');if(['Double','Triple','Reservoir'].includes(type))contour(ctx,r-5,'Smooth');if(type==='Triple')contour(ctx,r-10,'Smooth');if(type==='Braided'){contour(ctx,r+3,'Wavy');contour(ctx,r-3,'Wavy')}const marks={'Dotted-node':24,'Linked-circle':24,'Tick-mark':48,'Lattice':40,'Serpentine':24,'Burst-mark':32,'Inward-mark':32,'Chevron':8,'Gate':4,'Forked':4,'Anchor':4,'Echo':8,'Sieve':8,'Inversion':4,'Synchronizer':8,'Prism':4};let count=marks[type]||0;for(let i=0;i<count;i++){const a=i*TAU/count-Math.PI/2,x=250+Math.cos(a)*r,y=250+Math.sin(a)*r;if(['Dotted-node','Linked-circle'].includes(type)){ctx.beginPath();ctx.arc(x,y,type==='Linked-circle'?4:2,0,TAU);ctx.stroke()}else{let width=type==='Burst-mark'?12:type==='Inward-mark'?-10:7;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*Math.min(0,width),y-Math.sin(a)*Math.min(0,width));ctx.lineTo(x+Math.cos(a)*Math.max(0,width),y+Math.sin(a)*Math.max(0,width));ctx.stroke()}}ctx.restore()}
export function drawAmp(ctx,x,y,tier){ctx.save();ctx.strokeStyle=tier.color;ctx.lineWidth=1.7;diamond(ctx,x,y,12);diamond(ctx,x,y,6);ctx.restore()}
// 26 bespoke v37 prototype rune silhouettes. Coordinates are normalized to ±11.
// These are deliberately distinct illustrations, NOT finalized canonical strokes.
export const RUNE_GLYPHS=Object.freeze({
 A:'-10,8 0,-11 10,8|-6,2 6,2|0,-11 0,11',
 B:'-8,-10 4,-10 9,-5 4,0 -8,0|-8,0 5,0 10,6 4,10 -8,10|-4,-7 -4,7',
 C:'9,-9 -2,-10 -10,-2 -10,6 -2,10 9,9|4,-5 -3,-5 -5,0 -3,5 4,5',
 D:'-9,-10 1,-10 10,0 1,10 -9,10|-5,-6 -5,6|0,-6 5,0 0,6',
 E:'10,-10 -9,-10 -9,10 10,10|-9,0 5,0|3,-5 8,0 3,5',
 F:'-9,10 -9,-10 10,-10|-9,0 6,0|1,0 7,7',
 G:'9,-8 0,-11 -9,-5 -10,5 0,11 9,6 9,1 1,1|1,1 5,5',
 H:'-10,-10 -10,10|10,-10 10,10|-10,0 10,0|0,-6 0,6',
 I:'-9,-10 9,-10|0,-10 0,10|-9,10 9,10|-5,-5 5,5',
 J:'-9,-10 10,-10|6,-10 6,6 1,11 -6,7|-6,7 -3,2',
 K:'-10,-11 -10,11|-10,1 10,-10|-3,-2 10,11|3,-6 3,6',
 L:'-9,-11 -9,10 10,10|-4,5 1,0 6,5',
 M:'-10,10 -10,-10 0,1 10,-10 10,10|-5,4 0,9 5,4',
 N:'-10,10 -10,-10 10,10 10,-10|-5,-5 5,5',
 O:'0,-11 10,-4 10,6 0,11 -10,6 -10,-4 0,-11|0,-6 5,0 0,6 -5,0 0,-6',
 P:'-9,11 -9,-10 4,-10 10,-4 4,2 -9,2|-4,-5 4,-5',
 Q:'0,-11 9,-5 9,5 0,10 -9,5 -9,-5 0,-11|1,3 11,11|-4,-3 4,3',
 R:'-9,11 -9,-10 3,-10 9,-4 3,2 -9,2|-1,2 9,11|0,-5 5,-5',
 S:'9,-10 -3,-10 -9,-3 8,3 3,10 -9,10|-6,-5 4,-5|-4,5 6,5',
 T:'-10,-10 10,-10|0,-10 0,11|-6,-4 0,2 6,-4',
 U:'-10,-11 -10,5 0,11 10,5 10,-11|-5,0 0,5 5,0',
 V:'-10,-11 0,11 10,-11|-7,-4 0,-1 7,-4',
 W:'-11,-10 -7,10 0,-2 7,10 11,-10|-6,-4 0,4 6,-4',
 X:'-10,-10 10,10|-10,10 10,-10|-4,-10 0,-5 4,-10|-4,10 0,5 4,10',
 Y:'-10,-10 0,0 10,-10|0,0 0,11|-6,5 6,5',
 Z:'-10,-10 10,-10 -10,10 10,10|-5,-4 5,-4|-5,4 5,4'
});
export function drawRune(ctx,letter,x,y,size=13){
 const glyph=RUNE_GLYPHS[letter];
 if(!glyph)return;
 ctx.save();ctx.translate(x,y);ctx.scale(size/13,size/13);
 ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';
 for(const stroke of glyph.split('|')){
  const coords=stroke.split(' ').map(pair=>pair.split(',').map(Number));
  ctx.beginPath();
  coords.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));
  ctx.stroke();
 }
 ctx.restore();
}
export function renderSpell(ctx,spell,elements,{guides=true}={}){ctx.clearRect(0,0,500,500);drawInk(ctx,spell,elements,0);if(guides){ctx.save();ctx.strokeStyle='rgba(220,192,133,.16)';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(250,0);ctx.lineTo(250,500);ctx.moveTo(0,250);ctx.lineTo(500,250);ctx.stroke();ctx.restore()}}
function drawInk(ctx,spell,elements,depth){if(depth>4)return;ctx.save();ctx.strokeStyle='#d2c69c';ctx.fillStyle='#d2c69c';for(const ring of spell.rings)drawRing(ctx,ring);for(const e of spell.elements){const item=elements.find(x=>x.id===e.elementId);if(!item)continue;const [x,y]=polar(e.angle,spell.rings.find(x=>x.id===e.ringId)?.radius||0);ctx.save();ctx.translate(x,y);ctx.rotate((e.rotation||0)*Math.PI/180);drawElement(ctx,item,0,0,Math.max(5,18*e.scale));ctx.restore()}const c=elements.find(e=>e.id===spell.center.id);if(c)drawElement(ctx,c,250,250,Math.max(8,28*(spell.center.scale||1)));for(const r of spell.runes){const ring=spell.rings.find(x=>x.id===r.ringId);if(!ring)continue;const [x,y]=polar(r.angle,ring.radius+(r.side==='before'?-25:25));ctx.save();ctx.translate(x,y);ctx.rotate((r.rotation||0)*Math.PI/180);drawRune(ctx,r.letter,0,0);ctx.restore()}for(const a of spell.amps){const ring=spell.rings.find(r=>r.id===a.ringId);if(!ring)continue;const [x,y]=polar(a.angle,ring.radius);drawAmp(ctx,x,y,{color:['#484b58','#767786','#c1c3c9','#fff','#eac476'][a.rank-1]})}for(const card of spell.cards||[]){if(!card.template?.source)continue;const host=spell.rings.find(r=>r.id===card.ringId);if(!host)continue;const [x,y]=polar(card.angle,host.radius);ctx.save();ctx.translate(x,y);ctx.rotate((card.rotation||0)*Math.PI/180);ctx.scale(card.scale||1,card.scale||1);ctx.translate(-250,-250);ctx.beginPath();ctx.rect(0,0,500,500);ctx.clip();drawInk(ctx,card.template.source,elements,depth+1);ctx.restore()}for(const stroke of spell.strokes){if(stroke.points?.length<2)continue;ctx.beginPath();stroke.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineWidth=stroke.width||1.5;ctx.stroke()}ctx.restore()}

export function measureInk(spell,elements){const radius=Math.max(250,...spell.rings.map(r=>r.radius+60),...(spell.cards||[]).map(c=>(spell.rings.find(r=>r.id===c.ringId)?.radius||0)+Math.SQRT2*250*(c.scale||1)+8)),size=Math.ceil(radius*2);if(size>4096)return null;const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.translate(size/2-250,size/2-250);ctx.fillStyle='#000';ctx.strokeStyle='#000';renderSpell(ctx,spell,elements,{guides:false});const data=ctx.getImageData(0,0,size,size).data;let count=0;for(let i=3;i<data.length;i+=4)if(data[i]>127)count++;return count}
