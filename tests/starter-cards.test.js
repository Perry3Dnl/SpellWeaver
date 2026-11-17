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
  assert.ok(card.description.toLowerCase().includes('not')||card.description.toLowerCase().includes('unverified'));
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
