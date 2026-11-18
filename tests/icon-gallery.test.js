import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ICON_GROUPS,findGalleryItems,iconMeta,renderComponentIcon} from '../src/icon-gallery.js';

function fakeCanvas(){
 const calls=[];
 const ctx=new Proxy({}, {get(_target,key){
  if(key==='canvas')return {width:128,height:128};
  if(key==='setTransform'||key==='translate'||key==='clearRect'||key==='beginPath'||key==='arc'||key==='moveTo'||key==='lineTo'||key==='closePath'||key==='stroke'||key==='save'||key==='restore'||key==='rotate'||key==='scale'||key==='rect'||key==='clip'||key==='setLineDash')
   return (...args)=>calls.push([key,...args]);
  return undefined;
 },set(){return true;}});
 return {width:128,height:128,getContext:()=>ctx,calls};
}
test('All Icons lists every existing v37 component category without unrelated glyphs',()=>{
 assert.deepEqual(ICON_GROUPS.map(g=>[g.id,g.items.length]),[
  ['elements',124],['runes',26],['rings',26],['amps',5],['cards',6],['materials',30]
 ]);
 for(const group of ICON_GROUPS){
  assert.equal(findGalleryItems(group.id).length,group.items.length);
  assert.ok(group.items.every(item=>iconMeta(group.id,item).length>0));
 }
 assert.equal(findGalleryItems('elements','Hydrogen').length,1);
 assert.ok(findGalleryItems('rings','Oscillation').some(r=>r.name==='Wavy'));
 assert.ok(findGalleryItems('runes','Bind').some(r=>r.letter==='B'));
 assert.deepEqual(findGalleryItems('unknown'),[]);
});

test('every glyph renders with same actual geometry routines as Spell Creator',()=>{
 for(const group of ICON_GROUPS){
  for(const item of group.items){
   const canvas=fakeCanvas();
   assert.equal(renderComponentIcon(canvas,group.id,item),true,group.id+' '+item.name);
   assert.ok(canvas.calls.some(([method])=>method==='stroke'),group.id+' '+item.name+' must draw strokes');
  }
 }
});

test('editor and academy share the same icon renderer and production build ships it',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const academy=readFileSync(new URL('../src/classroom.js',import.meta.url),'utf8');
 const build=readFileSync(new URL('../scripts/build.js',import.meta.url),'utf8');
 assert.match(app,/renderComponentIcon\(symbol,tab,v\)/);
 assert.match(academy,/renderComponentIcon\(canvas,galleryGroup,item\)/);
 assert.match(academy,/id="academy-icons"/);
 assert.match(build,/icon-gallery\.js/);
});
