import elements from './elements.json' with {type:'json'};
import {RINGS,RUNES,AMPS} from './rules.js';
import {STARTER_CARDS} from './starter-cards.js';
import {MATERIAL_CARDS} from './material-cards.js';
import {drawElement,drawRune,drawRing,drawAmp,renderSpell} from './geometry.js';

// One icon renderer for the editor catalogue, reference atlas, and spell preview.
// These are procedural v37 prototype glyphs, not separately downloaded image assets.
export const ICON_GROUPS=[
 {id:'elements',name:'Elements',items:elements},
 {id:'runes',name:'Runes',items:RUNES},
 {id:'rings',name:'Rings',items:RINGS},
 {id:'amps',name:'Amps',items:AMPS},
 {id:'cards',name:'Starter cards',items:STARTER_CARDS},
 {id:'materials',name:'Materials',items:MATERIAL_CARDS}
];
export function iconMeta(group,item){
 if(group==='elements')return item.special?'Provisional magical sigil':item.code;
 if(group==='runes')return item.letter+' · '+item.name+' (provisional)';
 if(group==='rings')return item.effect;
 if(group==='amps')return '×'+item.multiplier.toFixed(1)+' · double diamond';
 if(group==='materials')return item.category;
 return item.ingredients.join(' + ');
}
export function renderComponentIcon(canvas,group,item){
 const ctx=canvas.getContext('2d');
 if(!ctx)return false;
 const size=Math.min(canvas.width,canvas.height);
 if(!size)return false;
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.save();
 ctx.strokeStyle='#d2c69c';
 ctx.fillStyle='#d2c69c';
 ctx.lineCap='round';
 ctx.lineJoin='round';
 // The original render functions share the exact shapes shown in Spell Creator.
 if(group==='elements'){
  ctx.translate(canvas.width/2,canvas.height/2);
  drawElement(ctx,item,0,0,size*.31);
 }else if(group==='runes'){
  ctx.translate(canvas.width/2,canvas.height/2);
  drawRune(ctx,item.letter,0,0,size*.39);
 }else if(group==='rings'){
  const s=size/230;
  ctx.translate(canvas.width/2-250*s,canvas.height/2-250*s);
  ctx.scale(s,s);
  drawRing(ctx,{radius:84,pattern:item.name});
 }else if(group==='amps'){
  const s=size/42;
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.scale(s,s);
  drawAmp(ctx,0,0,item);
 }else if(group==='cards'||group==='materials'){
  const s=size/500;
  ctx.translate(canvas.width/2-250*s,canvas.height/2-250*s);
  ctx.scale(s,s);
  renderSpell(ctx,item.source,elements,{guides:false});
 }else{
  ctx.restore();
  return false;
 }
 ctx.restore();
 return true;
}
export function findGalleryItems(group,search=''){
 const selected=ICON_GROUPS.find(entry=>entry.id===group);
 if(!selected)return [];
 const term=search.trim().toLowerCase();
 return selected.items.filter(item=>!term || [item.name,item.letter,item.symbol,item.code,item.effect,item.description,iconMeta(group,item)].filter(Boolean).join(' ').toLowerCase().includes(term));
}
