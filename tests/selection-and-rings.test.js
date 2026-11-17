import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialSpell,normalizeImport} from '../src/rules.js';
import elements from '../src/elements.json' with {type:'json'};
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('select is always available and delete has a single dedicated action',()=>{
 assert.match(html,/selection-mode/);
 assert.match(html,/id="delete-selected" disabled/);
 assert.equal((html.match(/id="delete-selected"/g)||[]).length,1);
 assert.doesNotMatch(html,/id="draw-tool"|id="erase-tool"/);
 assert.match(app,/function highlight\(/);
 assert.match(app,/function paint\(/);
});
test('added rings are not capped at 235px and viewport auto-fits',()=>{
 assert.doesNotMatch(app,/radius>235|Working grid is full|No room for another ring/);
 assert.match(app,/function viewScale\(/);
 assert.match(app,/setView\(g,Math\.min\(1,230/);
 const spell=initialSpell();
 for(let i=3;i<=120;i++)spell.rings.push({id:i,radius:i*46,pattern:'Smooth'});
 assert.equal(normalizeImport(spell,elements).rings.length,120);
});
test('required center stays protected when deleting',()=>{
 assert.match(app,/if\(type==='center'\)/);
 assert.match(app,/selected\.type==='center'/);
});

test('selected component identity is edited from left catalogue with persistent highlight',()=>{
 assert.match(app,/function selectedCatalogueEntry\(/);
 assert.match(app,/function syncCatalogueToSelection\(/);
 assert.match(app,/catalogue-selected/);
 assert.match(app,/aria-pressed/);
 assert.match(app,/o\.id=v\.id/);
 assert.match(app,/o\.elementId=v\.id/);
 assert.match(app,/o\.pattern=v\.name/);
 assert.match(app,/o\.letter=v\.letter/);
 assert.match(app,/o\.tier=v\.name/);
 assert.doesNotMatch(app,/selectOpts\('At spell origin'/);
 assert.match(app,/Choose the central element in the highlighted Components catalogue on the left/);
});
