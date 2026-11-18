import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {completeWaterLesson} from '../src/lessons.js';

test('the menu opens a rendered Water preview, lesson, and existing creator',async()=>{
 const saved=new Map();
 const storage={getItem:key=>saved.get(key)??null,setItem:(key,val)=>saved.set(key,val)};
 let strokes=0,root;
 const ctx=new Proxy({}, {get:(obj,key)=>key in obj?obj[key]:(...args)=>{if(key==='stroke')strokes++;}});
 const element=()=>({
  hidden:false,onclick:null,classList:{toggle(){}},
  append(){},
  getContext:()=>ctx,
  set innerHTML(html){
   this.html=html;
   this.children=new Map();
   for(const match of html.matchAll(/id="([^"]+)"/g))this.children.set(match[1],element());
  },
  get innerHTML(){return this.html||''},
  querySelector(selector){return this.children?.get(selector.slice(1))??null},
  after(child){root=child},
  addEventListener(){},
  setAttribute(){},
  prepend(){}
 });
 const header=element(),nav=element(),editor=element(),exportButton=element();
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window={localStorage:storage};
 globalThis.document={
  body:{classList:{toggle(){}}},
  createElement:()=>element(),
  querySelector:selector=>({'header':header,'header nav':nav,'main':editor})[selector],
  getElementById:id=>id==='export-top'?exportButton:null
 };
 try{
  await import('../src/classroom.js?academy-ui-test');
  assert.match(root.innerHTML,/Choose your path/);
  assert.equal(editor.hidden,true);
  root.querySelector('#academy-book').onclick();
  assert.match(root.innerHTML,/id="academy-collection-circle"/);
  assert.match(root.innerHTML,/Locked · Preview/);
  assert.equal(root.querySelector('#academy-collection-name').textContent,'Mana Study');
  assert.match(root.innerHTML,/academy-collection-selector/);
  assert.ok(strokes>0,'the shared geometry renderer draws the actual Water inscription');
  root.querySelector('#academy-study').onclick();
  assert.match(root.innerHTML,/Mana Study/);
  completeWaterLesson(storage);
  // Existing Water progress is preserved even when the new curriculum is shown.
  root.querySelector('#academy-back').onclick();
  root.querySelector('#academy-back').onclick();
  root.querySelector('#academy-book').onclick();
  assert.equal(root.querySelector('#academy-collection-name').textContent,'Mana Study');
  root.querySelector('#academy-back').onclick();
  root.querySelector('#academy-create').onclick();
  assert.equal(editor.hidden,false);
  assert.equal(root.hidden,true);
 }finally{
  globalThis.window=oldWindow;
  globalThis.document=oldDocument;
 }
});

test('main game regions are viewport-bounded and panels use internal scrolling',()=>{
 const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');
 assert.match(css,/body\{height:100vh;height:100dvh;/);
 assert.match(css,/main\{flex:1 1 auto;width:100%;min-height:0;height:auto;overflow:hidden;/);
 assert.match(css,/#academy\{flex:1 1 auto;min-height:0;max-height:100%;overflow:auto;/);
 assert.match(css,/@media\(max-width:1100px\)\{/);
 assert.match(css,/\.academy-collection\{display:grid;/);
});
