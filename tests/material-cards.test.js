import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import elements from '../src/elements.json' with {type:'json'};
import {MATERIAL_CARDS} from '../src/material-cards.js';
import {initialSpell,normalizeImport,validateSpell} from '../src/rules.js';
import {nextPlacementAngle} from '../src/placement.js';
test('materials catalogue has exactly thirty unique backed ink recipes',()=>{
 assert.equal(MATERIAL_CARDS.length,30);
 assert.equal(new Set(MATERIAL_CARDS.map(m=>m.id)).size,30);
 for(const card of MATERIAL_CARDS){
  assert.equal(card.kind,'material');
  assert.ok(card.description.startsWith('Experimental'));
  assert.equal(card.source.cards.length,0);
  assert.deepEqual(validateSpell(card.source),[]);
  assert.ok(elements.some(e=>e.id===card.source.center.id));
  for(const part of card.source.elements)assert.ok(elements.some(e=>e.id===part.elementId));
  assert.ok(card.source.runes.length>0);
 }
 for(const name of ['Rock','Dirt','Iron','Copper','Granite','Steel','Bronze','Brick'])
  assert.ok(MATERIAL_CARDS.some(card=>card.name===name),name);
});
test('material card placements on same ring are independent, non-overlapping and self-contained',()=>{
 const spell=initialSpell();
 for(let i=0;i<12;i++){
  const template=structuredClone(MATERIAL_CARDS[i%MATERIAL_CARDS.length]);
  spell.cards.push({id:100+i,ringId:1,angle:nextPlacementAngle(spell,1,'card'),scale:.3,rotation:0,template});
 }
 assert.equal(new Set(spell.cards.map(c=>c.angle)).size,12);
 assert.deepEqual(validateSpell(spell),[]);
 const imported=normalizeImport(JSON.parse(JSON.stringify(spell)),elements);
 assert.equal(imported.cards.length,12);
 assert.equal(imported.cards[0].template.kind,'material');
});
test('materials tab uses existing card placement, selection, and production bundle',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const build=readFileSync(new URL('../scripts/build.js',import.meta.url),'utf8');
 assert.match(app,/MATERIAL_CARDS/);
 assert.match(app,/tab==='materials'/);
 assert.match(app,/o\.template\.kind==='material'\?'materials':'cards'/);
 assert.match(app,/if\(tab==='cards'\|\|tab==='materials'\)/);
 assert.match(html,/data-tab="materials"/);
 assert.match(html,/id="materials-hint"/);
 assert.match(build,/material-cards\.js/);
});
