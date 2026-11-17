import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCardClickController} from '../src/card-clicks.js';
import {MATERIAL_CARDS} from '../src/material-cards.js';
import {STARTER_CARDS} from '../src/starter-cards.js';
import {initialSpell,validateSpell} from '../src/rules.js';
import {nextPlacementAngle} from '../src/placement.js';

function harness(){
 const timers=new Map();let nextTimer=1;
 const schedule=fn=>{const id=nextTimer++;timers.set(id,fn);return id};
 const cancel=id=>timers.delete(id);
 const events=[];
 const controller=createCardClickController(
  card=>events.push(['replace',card.id]),
  card=>events.push(['add',card.id]),
  {schedule,cancel,delay:260}
 );
 const flush=()=>{for(const [id,fn] of [...timers]){timers.delete(id);fn()}};
 return {controller,events,flush};
}
test('a double click adds exactly one material even if a card was selected',()=>{
 const {controller,events,flush}=harness(),card=MATERIAL_CARDS.find(c=>c.name==='Nickel');
 controller.click(card,{detail:1});
 controller.click(card,{detail:2});
 controller.doubleClick(card);
 flush();
 assert.deepEqual(events,[['add',card.id]]);
});
test('a single click still replaces the selected material',()=>{
 const {controller,events,flush}=harness(),card=MATERIAL_CARDS[0];
 controller.click(card,{detail:1});
 assert.deepEqual(events,[]);
 flush();
 assert.deepEqual(events,[['replace',card.id]]);
});
test('Shift+click inserts a material or starter card immediately',()=>{
 const {controller,events,flush}=harness();
 controller.click(MATERIAL_CARDS[0],{detail:1,shiftKey:true});
 controller.click(STARTER_CARDS[0],{detail:1,shiftKey:true});
 flush();
 assert.deepEqual(events,[['add',MATERIAL_CARDS[0].id],['add',STARTER_CARDS[0].id]]);
});
test('switching away cancels a pending replacement',()=>{
 const {controller,events,flush}=harness();
 controller.click(MATERIAL_CARDS[0],{detail:1});
 controller.cancel();
 flush();
 assert.deepEqual(events,[]);
});
test('repeated double-click addition uses free spots and keeps existing card unchanged',()=>{
 const spell=initialSpell(),nickel=MATERIAL_CARDS.find(c=>c.name==='Nickel');
 for(let i=0;i<5;i++)spell.cards.push({id:100+i,ringId:2,angle:nextPlacementAngle(spell,2,'card'),scale:.32,rotation:0,template:structuredClone(nickel)});
 assert.equal(spell.cards.length,5);
 assert.equal(new Set(spell.cards.map(c=>c.angle)).size,5);
 assert.deepEqual(validateSpell(spell),[]);
});
test('editor defers single-click and double-click skips replacement',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const build=readFileSync(new URL('../scripts/build.js',import.meta.url),'utf8');
 assert.match(app,/cardClicks\.click\(v,e\)/);
 assert.match(app,/cardClicks\.doubleClick\(v\)/);
 assert.match(app,/function addComponent\(v,forceAdd=false\)/);
 assert.match(app,/!forceAdd && !placementRing\(\)/);
 assert.match(build,/card-clicks\.js/);
});
