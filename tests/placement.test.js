import test from 'node:test';
import assert from 'node:assert/strict';
import {nextFreeAngle,nextPlacementAngle} from '../src/placement.js';
import {initialSpell} from '../src/rules.js';
import {readFileSync} from 'node:fs';
test('large free gap algorithm never repeats a location in first 30 placements',()=>{
 const angles=[];
 for(let i=0;i<30;i++){
  const next=nextFreeAngle(angles);
  assert.ok(angles.every(a=>Math.abs(a-next)>0.0001),'overlapped at step '+i);
  angles.push(next);
 }
 assert.deepEqual(angles.slice(0,8),[0,180,90,270,45,135,225,315]);
});
test('manually positioned slots are respected and wraparound handled',()=>{
 assert.equal(nextFreeAngle([350,10,80]),215);
 assert.equal(nextFreeAngle([0,90,180]),270);
 assert.equal(nextFreeAngle([345]),165);
 assert.equal(nextFreeAngle([-15,0]),172.5);
});
test('elements and rune tracks use selected host ring, not last ring',()=>{
 const spell=initialSpell();
 spell.elements.push({id:10,ringId:1,angle:0,elementId:1,scale:1});
 spell.runes.push({id:11,ringId:1,angle:0,letter:'G',side:'after'});
 assert.equal(nextPlacementAngle(spell,1,'element'),180);
 assert.equal(nextPlacementAngle(spell,1,'rune','after'),180);
 assert.equal(nextPlacementAngle(spell,2,'element'),0);
 assert.equal(nextPlacementAngle(spell,2,'rune','after'),0);
 spell.runes.push({id:12,ringId:1,angle:180,letter:'G',side:'before'});
 assert.equal(nextPlacementAngle(spell,1,'rune','after'),180);
});
test('editor keeps ring sticky for multiple catalogue additions and clears when editing item',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const build=readFileSync(new URL('../scripts/build.js',import.meta.url),'utf8');
 assert.match(app,/placementRingId=selected\?\.type==='ring'\?selected\.id:null/);
 assert.match(app,/if\(!placementRing\(\)\)selected=\{type:'element'/);
 assert.match(app,/if\(!placementRing\(\)\)selected=\{type:'rune'/);
 assert.match(app,/nextPlacementAngle\(spell,ringId,'element'\)/);
 assert.match(app,/nextPlacementAngle\(spell,ringId,'rune','after'\)/);
 assert.match(app,/const ringId=hostRingId\(\)/);
 assert.match(app,/ADDING TO RING/);
 assert.match(build,/placement\.js/);
});
