import elements from './elements.json' with {type:'json'};
import {renderSpell} from './geometry.js';
import {ICON_GROUPS,iconMeta,findGalleryItems,renderComponentIcon} from './icon-gallery.js';
import {WATER_LESSON_STEPS,lessonSpell,readClassroom} from './lessons.js';
import {ACADEMY_LESSONS,academySpell,academyCardSpells,completeAcademyLesson} from './academy-lessons.js';

const STORAGE=window.localStorage;
let step=0,lessonIndex=0,collectionSelected='mana-study';
let galleryGroup='elements',gallerySearch='';
const root=document.createElement('section');
root.id='academy';
root.setAttribute('aria-label','SpellWeaver Academy');
document.querySelector('header').after(root);
const editor=document.querySelector('main');
const exportButton=document.getElementById('export-top');
const nav=document.querySelector('header nav');
const menuButton=document.createElement('button');
menuButton.id='academy-nav';
menuButton.textContent='⌂ Main Menu';
nav.prepend(menuButton);
function show(view){
 const inEditor=view==='creator';
 root.hidden=inEditor;
 editor.hidden=!inEditor;
 exportButton.hidden=!inEditor;
 document.body.classList.toggle('academy-active',!inEditor);
 if(!inEditor)render(view);
}
function render(view){
 if(view==='menu'){
 root.innerHTML=`<div class="academy-menu"><span class="eyebrow">SPELLWEAVER · ARCANE ACADEMY</span><h1>Choose your path</h1><p>Study the real shapes and components used in the Spell Creator.</p><div class="academy-options"><button id="academy-class"><strong>✧ Classroom</strong><small>Learn magical inscription step by step</small></button><button id="academy-create"><strong>◉ Spell Creator</strong><small>Open the existing inscription workbench</small></button><button id="academy-book"><strong>▣ My Collection</strong><small>Review completed lessons and learned templates</small></button><button id="academy-icons"><strong>◇ All Icons</strong><small>View every actual element, rune, ring and card glyph</small></button></div></div>`;
 root.querySelector('#academy-class').onclick=()=>show('lessons');
 root.querySelector('#academy-create').onclick=()=>show('creator');
 root.querySelector('#academy-book').onclick=()=>show('collection');
 root.querySelector('#academy-icons').onclick=()=>show('icons');
 return;
 }
 if(view==='icons'){
 root.innerHTML=`<div class="academy-gallery"><div class="academy-gallery-head"><div><span class="eyebrow">THE GRIMOIRE · COMPONENT REFERENCE</span><h1>All Icons</h1><p>These are the actual symbols used by Spell Creator, not emoji or downloaded icon files. Magical signatures and rune designs remain provisional under v37.</p></div><button id="academy-back">← Main Menu</button></div><div class="academy-gallery-controls"><div class="academy-gallery-tabs" role="group" aria-label="Component categories"></div><label class="academy-gallery-search">Search icons<input id="academy-icon-search" type="search" placeholder="Search name, chemical code or effect…" aria-label="Search icons"></label></div><p id="academy-icon-count" class="academy-gallery-count"></p><div id="academy-icon-grid" class="academy-icon-grid" aria-label="Icon reference catalogue"></div></div>`;
 const tabs=root.querySelector('.academy-gallery-tabs');
 for(const group of ICON_GROUPS){
  const button=document.createElement('button');
  button.textContent=`${group.name} (${group.items.length})`;
  button.classList.toggle('active',galleryGroup===group.id);
  button.setAttribute('aria-pressed',String(galleryGroup===group.id));
  button.onclick=()=>{galleryGroup=group.id;gallerySearch='';render('icons')};
  tabs.append(button);
 }
 const input=root.querySelector('#academy-icon-search');input.value=gallerySearch;
 input.oninput=()=>{gallerySearch=input.value;paintGallery()};
 root.querySelector('#academy-back').onclick=()=>show('menu');
 paintGallery();
 return;
 }
 if(view==='lessons'){
  const progress=readClassroom(STORAGE);
  root.innerHTML=`<div class="academy-menu academy-lesson-menu"><span class="eyebrow">ARCANE ACADEMY / BEGINNER STUDIES</span><h1>Classroom</h1><p>Start with Mana, study Fire, then combine them into an intended projectile. Each lesson builds its inscription step by step.</p><div id="academy-lesson-choices" class="academy-lesson-choices"></div><button id="academy-back">← Main Menu</button></div>`;
  const list=root.querySelector('#academy-lesson-choices');
  ACADEMY_LESSONS.forEach((lesson,index)=>{
   const choice=document.createElement('button');choice.className='academy-lesson-choice';
   const done=progress.completedLessons.includes(lesson.id);
   const locked=index>0&&!progress.completedLessons.includes(ACADEMY_LESSONS[index-1].id);
   choice.disabled=locked;
   choice.textContent=lesson.title+' — '+lesson.subtitle+(done?' ✓ Learned':locked?' · Finish previous lesson first':'');
   choice.onclick=()=>{if(locked)return;lessonIndex=index;step=0;show('class')};
   list.append(choice);
  });
  root.querySelector('#academy-back').onclick=()=>show('menu');
  return;
 }
 if(view==='collection'){
  const progress=readClassroom(STORAGE);
  const cards=academyCardSpells().map(({lesson,spell})=>({id:lesson.cardId,name:lesson.name,spell,lessonId:lesson.id}));
  cards.push({id:'water',name:'Water',spell:lessonSpell(WATER_LESSON_STEPS.length-1),lessonId:null});
  const selected=cards.find(card=>card.id===collectionSelected)||cards[0];
  const learned=progress.learnedCards.includes(selected.id);
  root.innerHTML=`<div class="academy-menu academy-collection-page"><span class="eyebrow">THE GRIMOIRE</span><h1>My Collection</h1><p>Study inscriptions learned through Classroom, with real Spell Creator drawings.</p><div id="academy-collection-selector" class="academy-collection-selector"></div><div class="academy-collection"><div class="academy-collection-preview"><canvas id="academy-collection-circle" width="500" height="500" aria-label="Spell study rendered with Spell Creator"></canvas></div><div class="academy-collection-details"><span class="eyebrow">STUDY SPELL · V37</span><h2 id="academy-collection-name"></h2><span class="academy-card-status">${learned?'✓ Learned':'Locked · Preview'}</span><p id="academy-collection-description"></p><p class="academy-card-note">These are experimental design inscriptions, not validated castable spells. Projectile movement is not implemented.</p><button id="academy-study" class="gold-btn">${learned?'Review lesson':'Learn this spell'} →</button></div></div><button id="academy-back">← Main Menu</button></div>`;
  const selector=root.querySelector('#academy-collection-selector');
  for(const card of cards){
   const button=document.createElement('button');
   button.textContent=card.name+(progress.learnedCards.includes(card.id)?' ✓':' · Preview');
   button.classList.toggle('active',card.id===selected.id);
   button.onclick=()=>{collectionSelected=card.id;render('collection')};
   selector.append(button);
  }
  root.querySelector('#academy-collection-name').textContent=selected.name;
  root.querySelector('#academy-collection-description').textContent=selected.id==='mana-study'?
   'Mana center, Smooth ring, and opposing Hold runes.':
   selected.id==='fire-study'?'Carbon, Oxygen pair, Burst-mark ring, and opposing Focus runes.':
   selected.id==='fire-mana-projectile'?'Mana center, opposing Fire starter cards, Burst-mark ring and Redirect rune pair; intended to shoot a Fire projectile.':
   'Oxygen center, Wavy ring, opposing Hydrogen and Bind pairs.';
  const preview=root.querySelector('#academy-collection-circle');
  renderStudyPreview(preview,selected.spell);
  root.querySelector('#academy-study').onclick=()=>{
   lessonIndex=selected.lessonId?ACADEMY_LESSONS.findIndex(lesson=>lesson.id===selected.lessonId):0;
   step=0;show(selected.lessonId?'class':'lessons');
  };
  root.querySelector('#academy-back').onclick=()=>show('menu');
  return;
 }
 const lesson=ACADEMY_LESSONS[lessonIndex];
 const current=lesson.steps[step];
 const completed=readClassroom(STORAGE).completedLessons.includes(lesson.id);
 root.innerHTML=`<div class="academy-class"><div class="academy-class-top"><button id="academy-back">← Lessons</button><div><span class="eyebrow">CLASSROOM / ${lesson.title}</span><h1>${lesson.name}</h1></div><span class="academy-counter">STEP ${step+1} / ${lesson.steps.length}</span></div><div class="academy-board"><div class="academy-board-heading"><span>CHALKBOARD · ACTUAL SPELL CREATOR GEOMETRY</span><span>V37</span></div><canvas id="academy-circle" width="500" height="500" aria-label="Current classroom spell construction"></canvas><div class="academy-board-foot">${current.title}</div></div>${lesson.id==='fire-mana-projectile'&&step===lesson.steps.length-1?'<div class="academy-shot-demo"><div id="academy-shot-track" class="academy-shot-track"><span class="academy-shot-origin">✧</span><span class="academy-shot-fireball" aria-hidden="true"></span><span class="academy-shot-target">◎</span></div><button id="academy-fire-demo" class="gold-btn">▶ Preview projectile</button><small>Visual concept only · not executable casting</small></div>':''}<div class="academy-dialogue"><div class="academy-professor" aria-hidden="true">✧</div><div><strong>Professor Aldric</strong><p>${current.dialog}</p></div></div><div class="academy-controls"><button id="academy-prev" ${step===0?'disabled':''}>← Previous</button><div class="academy-progress" aria-label="Lesson progress">${lesson.steps.map((_,i)=>`<span class="${i<=step?'active':''}"></span>`).join('')}</div><button id="academy-next" class="gold-btn">${step===lesson.steps.length-1?'Complete lesson':'Next →'}</button></div>${completed?'<p class="academy-finished">✓ Study completed. This design is in My Collection.</p>':''}</div>`;
 const canvas=root.querySelector('#academy-circle');
 renderStudyPreview(canvas,academySpell(lesson.id,step));
 root.querySelector('#academy-back').onclick=()=>show('lessons');
 root.querySelector('#academy-prev').onclick=()=>{step=Math.max(0,step-1);render('class')};
 const demo=root.querySelector('#academy-fire-demo');
 if(demo)demo.onclick=()=>{const track=root.querySelector('#academy-shot-track');track.classList.remove('firing');void track.offsetWidth;track.classList.add('firing')};
 root.querySelector('#academy-next').onclick=()=>{
  if(step===lesson.steps.length-1){
   try{completeAcademyLesson(STORAGE,lesson.id);collectionSelected=lesson.cardId;show('collection')}
   catch{root.querySelector('.academy-dialogue p').textContent='Browser storage is unavailable; progress could not be saved.'}
  }else{step++;render('class')}
 };
}
function renderStudyPreview(canvas,spell){
 const ctx=canvas.getContext('2d');
 // Scale around the actual ink bounds rather than the empty 500px editor workspace.
 const radii=spell.rings.map(r=>r.radius);
 const host=id=>spell.rings.find(r=>r.id===id)?.radius||0;
 const furthest=Math.max(38,...radii,
  ...spell.runes.map(r=>host(r.ringId)+38),
  ...spell.elements.map(e=>host(e.ringId)+22*(e.scale||1)),
  ...(spell.cards||[]).map(card=>host(card.ringId)+(120*(card.scale||1))));
 const scale=Math.min(2.25,224/furthest);
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.translate(250,250);ctx.scale(scale,scale);ctx.translate(-250,-250);
 renderSpell(ctx,spell,elements,{guides:false});
 ctx.setTransform(1,0,0,1,0,0);
}
function paintGallery(){
 const grid=root.querySelector('#academy-icon-grid');
 if(!grid)return;
 grid.replaceChildren();
 const items=findGalleryItems(galleryGroup,gallerySearch);
 root.querySelector('#academy-icon-count').textContent=`${items.length} of ${ICON_GROUPS.find(group=>group.id===galleryGroup).items.length} icons`;
 for(const item of items){
  const tile=document.createElement('div');tile.className='academy-icon-tile';
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  canvas.className='academy-icon-preview';
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${item.name} icon`);
  const name=document.createElement('strong');name.textContent=item.name;
  const meta=document.createElement('small');meta.textContent=iconMeta(galleryGroup,item);
  tile.append(canvas,name,meta);
  grid.append(tile);
  renderComponentIcon(canvas,galleryGroup,item);
 }
 if(!items.length)grid.textContent='No matching icons in this category.';
}
menuButton.addEventListener('click',()=>show('menu'));
show('menu');
