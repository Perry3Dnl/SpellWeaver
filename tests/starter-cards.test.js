import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTER_CARDS} from '../src/starter-cards.js';
import elements from '../src/elements.json' with {type:'json'};
import {initialSpell,validateSpell,normalizeImport} from '../src/rules.js';
import {readFileSync} from 'node:fs';
test('six experimental starter cards use valid existing element signatures',()=>{
 assert.deepEqual(STARTER_CARDS.map(c=>c.id),['fire','water','ice','lava','steam','wind']);
 for(const card of STARTER_CARDS){
  assert.deepEqual(validateSpell(card.source),[]);
  assert.equal(card.source.cards.length,0);
  assert.ok(elements.some(e=>e.id===card.source.center.id));
  for(const ingredient of card.source.elements)assert.ok(elements.some(e=>e.id===ingredient.elementId));
  assert.match(card.description,/^Experimental/);
 }
});
test('embedded card JSON is self-contained and validates its placement',()=>{
 const spell=initialSpell();
 spell.cards.push({id:200,ringId:2,angle:35,rotation:45,scale:.4,template:structuredClone(STARTER_CARDS[0])});
 assert.deepEqual(validateSpell(spell),[]);
 assert.equal(normalizeImport(JSON.parse(JSON.stringify(spell)),elements).cards[0].template.source.elements.length,3);
 spell.cards[0].ringId=999;
 assert.match(validateSpell(spell).join(' '),/missing ring/);
});
test('catalogue, placement, renderer, recording and deletion use embedded cards',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const geom=readFileSync(new URL('../src/geometry.js',import.meta.url),'utf8');
 assert.match(html,/data-tab="cards"/);
 assert.match(app,/spell\.cards\.push/);
 assert.match(app,/selected\.type==='card'/);
 assert.match(app,/\['elements','runes','amps','cards'\]/);
 assert.match(geom,/card\.template\.source/);
 assert.match(geom,/drawInk\(ctx,card\.template\.source/);
});

test('Water starter card preserves 180-degree balance on each component track',()=>{
 const water=STARTER_CARDS.find(card=>card.id==='water').source;
 assert.equal(water.center.id,8,'Oxygen is the central atom');
 assert.equal(water.rings[0].pattern,'Wavy');
 assert.deepEqual(water.elements.map(({elementId,angle,scale,rotation})=>[elementId,angle,scale,rotation]),[
  [1,90,.72,0],[1,270,.72,0]
 ]);
 assert.deepEqual(water.runes.map(({letter,angle,side})=>[letter,angle,side]),[
  ['B',0,'after'],['B',180,'after']
 ]);
 for(const collection of [water.elements,water.runes]){
  for(const item of collection){
   const partner=collection.find(other=>other!==item &&
    other.angle===(item.angle+180)%360 &&
    (item.elementId===undefined||other.elementId===item.elementId) &&
    (item.letter===undefined||other.letter===item.letter) &&
    (item.side===undefined||other.side===item.side));
   assert.ok(partner,`Missing opposite companion at ${item.angle} degrees`);
  }
 }
 assert.deepEqual(validateSpell(water),[]);
});
