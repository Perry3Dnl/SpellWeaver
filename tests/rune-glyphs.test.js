import test from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_GLYPHS,drawRune} from '../src/geometry.js';
import {RUNES} from '../src/rules.js';
import {renderComponentIcon} from '../src/icon-gallery.js';

function recordingContext(){
 const commands=[];
 const context=new Proxy({}, {get(_target,key){
  if(['save','restore','translate','scale','beginPath','moveTo','lineTo','stroke','setTransform','clearRect'].includes(key))
   return (...args)=>commands.push([key,...args]);
  return undefined;
 },set(){return true;}});
 return {context,commands};
}
test('all 26 v37 runes have distinct illustrated geometry, not repeated generic polygons',()=>{
 assert.deepEqual(Object.keys(RUNE_GLYPHS),RUNES.map(r=>r.letter));
 assert.equal(new Set(Object.values(RUNE_GLYPHS)).size,26);
 for(const [letter,glyph] of Object.entries(RUNE_GLYPHS)){
  const strokes=glyph.split('|');
  assert.ok(strokes.length>=2,letter+' must have multiple hand-drawn strokes');
  for(const stroke of strokes){
   const coords=stroke.split(' ');
   assert.ok(coords.length>=2,letter+' has empty stroke');
   for(const point of coords){
    assert.equal(point.split(',').length,2,'Each glyph coordinate has x,y');
    const [x,y]=point.split(',').map(Number);
    assert.ok(Math.abs(x)<=11&&Math.abs(y)<=11,letter+' outside icon bounds');
   }
  }
 }
});
test('every rune draws its own lines at editor size and gallery size',()=>{
 const signatures=[];
 for(const rune of RUNES){
  const {context,commands}=recordingContext();
  drawRune(context,rune.letter,0,0);
  assert.ok(commands.some(command=>command[0]==='stroke'));
  assert.ok(commands.some(command=>command[0]==='lineTo'));
  signatures.push(JSON.stringify(commands.filter(command=>['moveTo','lineTo'].includes(command[0]))));
  const atlas=recordingContext();
  const canvas={width:128,height:128,getContext:()=>atlas.context};
  assert.equal(renderComponentIcon(canvas,'runes',rune),true);
  assert.ok(atlas.commands.some(command=>command[0]==='stroke'));
 }
 assert.equal(new Set(signatures).size,26);
});
test('unknown rune cannot silently draw a misleading fallback',()=>{
 const {context,commands}=recordingContext();
 drawRune(context,'?',0,0);
 assert.equal(commands.length,0);
});
