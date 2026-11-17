import elements from './src/elements.json' with {type:'json'};
import {AXES,AMPS,RINGS,RUNES,initialSpell,ampConflict,validateSpell,normalizeImport} from './src/rules.js';
import {polar,renderSpell,measureInk} from './src/geometry.js';
import {STARTER_CARDS} from './src/starter-cards.js';
let spell=initialSpell(),tab='elements',search='',selected=null,tool='select',history=[],future=[],drawing=null;let nextId=1;
const $=id=>document.getElementById(id),canvas=$('circle'),ctx=canvas.getContext('2d');
const id=()=>nextId++;
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),3500)}
function commit(){history.push(structuredClone(spell));if(history.length>80)history.shift();future=[]}
function ring(id){return spell.rings.find(r=>r.id===id)}
function autoRadius(){return Math.max(...spell.rings.map(r=>r.radius))+46}
function issueList(){return validateSpell(spell)}
function viewScale(){return Math.min(1,224/(Math.max(0,...spell.rings.map(r=>r.radius))+110))}
function setView(g,s){g.setTransform(s,0,0,s,250-250*s,250-250*s)}
function selectionTitle(){if(!selected)return 'None';const o=object();if(selected.type==='center')return elements.find(e=>e.id===spell.center.id)?.name||'Center';if(selected.type==='ring')return 'Ring '+o?.id;if(selected.type==='element')return elements.find(e=>e.id===o?.elementId)?.name||'Element';if(selected.type==='rune')return 'Rune '+o?.letter;if(selected.type==='amp')return (o?.tier||'')+' Amp';if(selected.type==='card')return o?.template?.name||'Ink card';return 'Stroke'}
function highlight(){if(!selected)return;const o=object();if(!o)return;ctx.save();ctx.strokeStyle='#66e4ff';ctx.shadowColor='#42d8f5';ctx.shadowBlur=12;ctx.setLineDash([6,4]);ctx.lineWidth=3;if(selected.type==='ring'){ctx.beginPath();ctx.arc(250,250,o.radius,0,Math.PI*2);ctx.stroke()}else if(selected.type==='stroke'){ctx.beginPath();o.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}else{let x=250,y=250,r=32;if(selected.type!=='center'){const host=spell.rings.find(r=>r.id===o.ringId);if(!host){ctx.restore();return}[x,y]=polar(o.angle,host.radius+(selected.type==='rune'?(o.side==='before'?-25:25):0));r=selected.type==='element'?Math.max(15,18*o.scale+9):selected.type==='card'?Math.max(22,Math.min(135,170*o.scale)):21}ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke()}ctx.restore()}
function paint(){ctx.resetTransform();ctx.clearRect(0,0,500,500);setView(ctx,viewScale());renderSpell(ctx,spell,elements);highlight();ctx.resetTransform()}
function update(){paint();$('delete-selected').disabled=!selected||selected.type==='center'||(selected.type==='ring'&&spell.rings.length===1);$('selection-name').textContent=selectionTitle();const ink=measureInk(spell,elements);$('pixel-count').textContent=ink===null?'Not measured':ink.toLocaleString();$('cast-display').textContent=spell.castSeconds;$('cast-value').textContent=spell.castSeconds+'s';$('canvas-title').textContent=spell.name||'Untitled inscription';$('name').value=spell.name;$('description').value=spell.description;$('cast').value=spell.castSeconds;const warnings=issueList();$('validation-count').textContent=warnings.length?`${warnings.length} warning(s)`:'STRUCTURE OK';$('warnings').innerHTML='';if(warnings.length)for(const s of warnings){const el=document.createElement('div');el.className='warning';el.textContent='⚠ '+s;$('warnings').append(el)}else $('warnings').textContent='Structural constraints pass. Element/rune recognition, mana, stability, and behavior remain uncalibrated.';$('layer-pills').replaceChildren(...[['◉',spell.rings.length,'rings'],['◇',spell.elements.length+1,'elements'],['ᚱ',spell.runes.length,'runes'],['✧',spell.amps.length,'amps'],['▣',spell.cards.length,'cards'],['✎',spell.strokes.length,'strokes']].map(([a,b,c])=>{const e=document.createElement('span');e.textContent=`${a} ${b} ${c}`;return e}));showSelection();catalogue()}
function selectedCatalogueEntry(){
 if(!selected)return null;
 const o=object();
 if(!o)return null;
 if(selected.type==='center')return {tab:'elements',key:spell.center.id};
 if(selected.type==='element')return {tab:'elements',key:o.elementId};
 if(selected.type==='ring')return {tab:'rings',key:o.pattern};
 if(selected.type==='rune')return {tab:'runes',key:o.letter};
 if(selected.type==='amp')return {tab:'amps',key:o.tier};
 if(selected.type==='card')return {tab:'cards',key:o.template.id};
 return null;
}
function catalogueKey(v){return tab==='elements'?v.id:tab==='runes'?v.letter:tab==='cards'?v.id:v.name}
function focusCatalogueOnSelection(){
 const entry=selectedCatalogueEntry();
 if(!entry)return;
 tab=entry.tab;
 search='';
 $('search').value='';
}
function syncCatalogueToSelection(){
 for(const button of $('tabs').querySelectorAll('button'))button.classList.toggle('active',button.dataset.tab===tab);
}

function catalogue(){
 syncCatalogueToSelection();
 const el=$('catalogue');
 $('catalogue-hint').hidden=tab!=='cards';
 el.replaceChildren();
 const values=tab==='elements'?elements:tab==='runes'?RUNES:tab==='rings'?RINGS:tab==='cards'?STARTER_CARDS:AMPS;
 const current=selectedCatalogueEntry();
 for(const v of values.filter(v=>`${v.name} ${v.symbol||''} ${v.code||''} ${v.letter||''}`.toLowerCase().includes(search.toLowerCase()))){
  const b=document.createElement('button');
  const active=current?.tab===tab && current.key===catalogueKey(v);
  if(tab==='cards'){b.classList.add('starter-card');b.title=v.description;b.setAttribute('aria-description',v.description)}
  b.classList.toggle('catalogue-selected',active);
  b.setAttribute('aria-pressed',String(active));
  if(active)b.setAttribute('aria-label',`${v.name} — selected`);
  const symbol=document.createElement('span');symbol.className='symbol';symbol.textContent=tab==='elements'?(v.special?'✧':v.code?.replaceAll('-','·')):tab==='runes'?`ᚷ${v.letter}`:tab==='rings'?'◉':tab==='cards'?'▣':'◇◇';
  symbol.style.fontSize=tab==='elements'&&!v.special?'12px':'25px';
  const name=document.createElement('span');name.className='itemname';name.textContent=v.name;
  const meta=document.createElement('span');meta.className='itemmeta';meta.textContent=tab==='elements'?`${v.id} · ${v.symbol}`:tab==='runes'?`${v.letter} · rune`:tab==='rings'?v.effect:tab==='cards'?v.ingredients.join(' + '):`×${v.multiplier.toFixed(1)} · ${v.name}`;
  b.append(symbol,name,meta);b.onclick=()=>addComponent(v);el.append(b);
 }
 if(!el.children.length)el.textContent='No matching components.';
 const active=el.querySelector('.catalogue-selected');if(active)active.scrollIntoView({block:'nearest',inline:'nearest'});
}

function addComponent(v){
 if(tab==='cards'){
  const current=object();
  if(selected?.type==='card' && current){
   if(current.template.id!==v.id){commit();current.template=structuredClone(v);toast(`Card replaced with ${v.name}`)}
  }else{
   const ringId=spell.rings.at(-1).id;
   const n=spell.cards.filter(c=>c.ringId===ringId).length;
   const newId=id();
   commit();
   spell.cards.push({id:newId,ringId,angle:(n*56+20)%360,rotation:0,scale:0.32,template:structuredClone(v)});
   selected={type:'card',id:newId};
   toast(`${v.name} ink card placed · drag to move`);
  }
  update();return;
 }

 // The catalogue edits the selected component of the matching kind, rather than
 // silently adding a second element to the outermost ring.
 if(selected && (selected.type===tab.slice(0,-1) || (selected.type==='center'&&tab==='elements') || (selected.type==='element'&&tab==='elements') || (selected.type==='ring'&&tab==='rings') || (selected.type==='rune'&&tab==='runes') || (selected.type==='amp'&&tab==='amps'))){
  const o=object();
  if(o){
   if(selected.type==='center'){
    if(o.id!==v.id){commit();o.id=v.id;toast(`Center changed to ${v.name}`)}
   }else if(selected.type==='element' && o.elementId!==v.id){
    commit();o.elementId=v.id;toast(`Element changed to ${v.name}`);
   }else if(selected.type==='ring' && o.pattern!==v.name){
    commit();o.pattern=v.name;toast(`Ring pattern changed to ${v.name}`);
   }else if(selected.type==='rune' && o.letter!==v.letter){
    commit();o.letter=v.letter;toast(`Rune changed to ${v.name}`);
   }else if(selected.type==='amp' && o.tier!==v.name){
    commit();o.tier=v.name;o.rank=v.rank;toast(`Amp changed to ${v.name}`);
   }
   update();return;
  }
 }
 commit();
 if(tab==='elements'){
  const ringId=spell.rings.at(-1).id;
  const used=spell.elements.filter(e=>e.ringId===ringId).length;
  const newId=id();
  spell.elements.push({id:newId,elementId:v.id,ringId,angle:(used*72)%360,scale:1,rotation:0});
  selected={type:'element',id:newId};toast(`${v.name} anchored to ring ${ringId}`);
 }else if(tab==='runes'){
  const ringId=spell.rings.at(-1).id;
  const used=spell.runes.filter(r=>r.ringId===ringId).length;
  const newId=id();spell.runes.push({id:newId,letter:v.letter,ringId,angle:(used*45)%360,side:'after'});
  selected={type:'rune',id:newId};toast(`${v.name} added to outside rune track`);
 }else if(tab==='rings'){
  const radius=autoRadius();
  let ringId=Math.max(...spell.rings.map(r=>r.id))+1;
  spell.rings.push({id:ringId,radius,pattern:v.name});
  selected={type:'ring',id:ringId};toast(`${v.name} ring added`);
 }else{
  const ringId=spell.rings.at(-1).id;
  const axis=AXES.find(a=>!ampConflict(spell.amps,ringId,a));
  if(axis===undefined){history.pop();toast('No eligible diagonal Amp axis on this ring');return}
  const newId=id();spell.amps.push({id:newId,ringId,angle:axis,tier:v.name,rank:v.rank});
  selected={type:'amp',id:newId};toast(`${v.name} Amp placed on ${axis}° axis`);
 }
 update();
}

function object(){if(!selected)return null;if(selected.type==='center')return spell.center;if(selected.type==='stroke')return spell.strokes.find(x=>x.id===selected.id);return spell[`${selected.type}s`]?.find(x=>x.id===selected.id)}
function selectOpts(label,value,options,onChange){const div=document.createElement('label');div.className='control';div.textContent=label;const sel=document.createElement('select');for(const [v,n] of options){const op=document.createElement('option');op.value=v;op.textContent=n;sel.add(op)}sel.value=String(value);sel.onchange=()=>{const val=sel.value;if(onChange(val)===false){sel.value=String(value);return}update()};div.append(sel);return div}
function range(label,value,min,max,step,onChange){const div=document.createElement('label');div.className='control';div.textContent=`${label}: ${value}`;const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=value;input.oninput=()=>{commit();onChange(Number(input.value));update()};div.append(input);return div}
function showSelection(){const el=$('selection');el.replaceChildren();const obj=object();if(!obj){el.textContent='Select an object in the drawing, or choose a component from the catalogue.';return}const title=document.createElement('b');title.textContent=selected.type==='center'?'Central element':`${selected.type.charAt(0).toUpperCase()+selected.type.slice(1)} settings`;el.append(title);if(selected.type==='center'){el.append(document.createTextNode('Choose the central element in the highlighted Components catalogue on the left.'),range('Sphere scale',obj.scale||1,.4,2.3,.1,v=>obj.scale=v));return}
if(selected.type==='stroke'){el.append(document.createTextNode(' Freehand stroke · full ink geometry'));return}
if(selected.type==='ring'){el.append(document.createTextNode('Choose a ring pattern in Components on the left.'),range('Radius',obj.radius,45,Math.max(300,obj.radius+200),1,v=>obj.radius=v));return}
if(selected.type==='element'){const e=elements.find(e=>e.id===obj.elementId);el.append(document.createTextNode(` ${e?.name||''}`),selectOpts('Host ring',obj.ringId,spell.rings.map(r=>[r.id,`Ring ${r.id}`]),v=>{commit();obj.ringId=Number(v)}),range('Ring position (degrees)',obj.angle,0,359,1,v=>obj.angle=v),range('Sphere scale',obj.scale,.3,2.5,.1,v=>obj.scale=v),range('Independent rotation',obj.rotation,0,359,1,v=>obj.rotation=v));return}
if(selected.type==='rune'){el.append(document.createTextNode(` ${RUNES.find(r=>r.letter===obj.letter)?.name||''}`),selectOpts('Host ring',obj.ringId,spell.rings.map(r=>[r.id,`Ring ${r.id}`]),v=>{commit();obj.ringId=Number(v)}),selectOpts('Process order',obj.side,[['before','Inside · BEFORE'],['after','Outside · AFTER']],v=>{commit();obj.side=v}),range('Ring position (degrees)',obj.angle,0,359,1,v=>obj.angle=v));return}
if(selected.type==='card'){el.append(document.createTextNode('Reusable ink drawing. Only the combined inscription determines its effect.'),selectOpts('Host ring',obj.ringId,spell.rings.map(r=>[r.id,`Ring ${r.id}`]),v=>{commit();obj.ringId=Number(v)}),range('Ring position (degrees)',obj.angle,0,359,1,v=>obj.angle=v),range('Card scale',obj.scale,.1,2,.05,v=>obj.scale=v),range('Card rotation',obj.rotation,0,359,1,v=>obj.rotation=v));return}
if(selected.type==='amp'){el.append(document.createTextNode('Choose an Amp tier in Components on the left.'),selectOpts('Host ring',obj.ringId,spell.rings.map(r=>[r.id,`Ring ${r.id}`]),v=>{if(ampConflict(spell.amps,Number(v),obj.angle,obj.id)){toast('Same-axis Amp conflict with adjacent ring');return false}commit();obj.ringId=Number(v)}),selectOpts('Diagonal axis',obj.angle,AXES.map(a=>[a,`${a}°`]),v=>{if(ampConflict(spell.amps,obj.ringId,Number(v),obj.id)){toast('Axis occupied on same or neighboring ring');return false}commit();obj.angle=Number(v)}))}}
function toPoint(e){const box=canvas.getBoundingClientRect(),s=viewScale();return [250+((e.clientX-box.left)/box.width*500-250)/s,250+((e.clientY-box.top)/box.height*500-250)/s]}
function pick(pt){const [x,y]=pt,centerDist=Math.hypot(x-250,y-250);if(centerDist<38)return {type:'center'};let best=null,bestD=22/viewScale();for(const type of ['element','rune','amp','card'])for(const o of spell[`${type}s`]){const r=ring(o.ringId);if(!r)continue;let rr=r.radius+(type==='rune'?(o.side==='before'?-25:25):0),p=polar(o.angle,rr),d=Math.hypot(x-p[0],y-p[1]);if(d<Math.max(bestD,type==='card'?Math.min(55,Math.max(20,o.scale*75))/viewScale():0)){best={type,id:o.id};bestD=d}}for(const r of spell.rings){const d=Math.abs(centerDist-r.radius);if(d<Math.min(bestD,10/viewScale())){best={type:'ring',id:r.id};bestD=d}}return best}
canvas.addEventListener('pointerdown',e=>{const p=toPoint(e);if(false){commit();drawing={id:id(),points:[p],width:1.6};spell.strokes.push(drawing);canvas.setPointerCapture(e.pointerId)}else if(false){const before=spell.strokes.length;const strokes=spell.strokes.filter(s=>!s.points.some(([x,y])=>Math.hypot(x-p[0],y-p[1])<8));if(strokes.length!==before){commit();spell.strokes=strokes;toast('Stroke erased')}else{selected=pick(p);deleteSelection()}update()}else{selected=pick(p);focusCatalogueOnSelection();if(selected){canvas.setPointerCapture(e.pointerId)}update()}});
canvas.addEventListener('pointermove',e=>{if(e.buttons!==1)return;const p=toPoint(e);if(false&&drawing){drawing.points.push(p);paint();return}if(selected&&selected.type!=='center'){const o=object();if(!o||!['element','rune','amp','card'].includes(selected.type))return;const a=(Math.atan2(p[1]-250,p[0]-250)*180/Math.PI+90+360)%360;if(selected.type==='amp'){let closest=AXES.reduce((best,b)=>Math.abs(b-a)<Math.abs(best-a)?b:best,45);if(closest!==o.angle&&!ampConflict(spell.amps,o.ringId,closest,o.id)){if(!o._dragged){commit();o._dragged=true}o.angle=closest}}else{if(!o._dragged){commit();o._dragged=true}o.angle=Math.round(a)}paint()}});
canvas.addEventListener('pointerup',()=>{drawing=null;for(const arr of [spell.elements,spell.runes,spell.amps,spell.cards])for(const x of arr)delete x._dragged;update()});
function deleteSelection(){if(!selected)return;const type=selected.type;if(type==='center'){toast('Center is mandatory; select Void instead');return}if(type==='ring'&&spell.rings.length===1){toast('At least one ring is required');return}commit();spell[`${type}s`]=spell[`${type}s`].filter(x=>x.id!==selected.id);if(type==='ring'){for(const key of ['elements','runes','amps','cards'])spell[key]=spell[key].filter(x=>x.ringId!==selected.id)}selected=null;update()}
function download(name,data,type='application/json'){const blob=new Blob([data],{type});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function exportSpell(){const s=structuredClone(spell);download((s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')||'spell')+'.json',JSON.stringify(s,null,2));toast('Spell configuration exported')}
$('export-top').onclick=exportSpell;$('name').onchange=e=>{commit();spell.name=e.target.value;update()};$('description').onchange=e=>{commit();spell.description=e.target.value;update()};$('cast').oninput=e=>{spell.castSeconds=Number(e.target.value);$('cast-display').textContent=e.target.value;$('cast-value').textContent=e.target.value+'s'};$('cast').onchange=()=>{update()};$('delete-selected').onclick=deleteSelection;
$('add-ring').onclick=()=>{const radius=autoRadius();commit();let ringId=Math.max(...spell.rings.map(r=>r.id))+1;spell.rings.push({id:ringId,radius,pattern:'Smooth'});selected={type:'ring',id:ringId};update()};
$('undo').onclick=()=>{if(!history.length)return;future.push(structuredClone(spell));spell=history.pop();selected=null;update()};$('redo').onclick=()=>{if(!future.length)return;history.push(structuredClone(spell));spell=future.pop();selected=null;update()};

$('new-btn').onclick=()=>{if(!confirm('Start a new inscription? Export your current design first if needed.'))return;commit();spell=initialSpell();selected=null;update();toast('New inscription created')};$('import-btn').onclick=()=>$('import-file').click();$('import-file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>3000000)throw Error('File too large');const imported=normalizeImport(JSON.parse(await file.text()),elements);const problems=validateSpell(imported);if(problems.length)throw Error(problems.join('; '));commit();spell=imported;nextId=Math.max(1,...[...spell.elements,...spell.runes,...spell.amps,...spell.cards,...spell.strokes].map(x=>x.id||0))+1;selected=null;update();toast('Spell imported')}catch(err){toast('Import rejected: '+err.message)}finally{e.target.value=''}};
$('save-spell').onclick=()=>{if(issueList().length){toast('Fix structural warnings before saving');return}const snapshot={kind:'spellweaver.personal-spellbook-prototype',source:structuredClone(spell),finalizedAt:new Date().toISOString(),resolvedBehavior:null,calibratedManaCost:null,castSeconds:spell.castSeconds,note:'An immutable design snapshot, NOT an executable validated castable spell.'};download('spellweaver-snapshot.json',JSON.stringify(snapshot,null,2));toast('Immutable design snapshot downloaded; rule interpreter not yet implemented')};
$('record-card').onclick=()=>{const c=document.createElement('canvas');c.width=c.height=500;const g=c.getContext('2d');g.strokeStyle='#000';setView(g,Math.min(1,230/(Math.max(0,...spell.rings.map(r=>r.radius))+42)));renderSpell(g,spell,elements,{guides:false});g.resetTransform();const binary=g.getImageData(0,0,500,500).data;const packed=[];for(let i=3;i<binary.length;i+=4)if(binary[i]>127)packed.push((i-3)/4);download('spellweaver-ink-card.json',JSON.stringify({schema:'spellweaver.ink-card.v1',width:500,height:500,filledPixels:packed,name:spell.name,sourceRulesVersion:'v37'},null,0));toast('500 × 500 binary ink card recorded')};
for(const button of $('tabs').querySelectorAll('button'))button.onclick=()=>{tab=button.dataset.tab;search='';$('search').value='';for(const x of $('tabs').querySelectorAll('button'))x.classList.toggle('active',x===button);catalogue()};$('search').oninput=e=>{search=e.target.value;catalogue()};
// Dedicated origin selector: exactly one element, with visible Void fallback.
canvas.addEventListener('dblclick',e=>{const p=toPoint(e);if(Math.hypot(p[0]-250,p[1]-250)<35){selected={type:'center'};focusCatalogueOnSelection();update()}});
selected={type:'center'};catalogue();update();

window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;if(e.key==='Delete'||e.key==='Backspace'){if(selected)deleteSelection()}else if(e.key==='Escape'){selected=null;update()}});
