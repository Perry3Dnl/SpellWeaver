import elements from './elements.json' with {type:'json'};
import {renderSpell} from './geometry.js';
import {ICON_GROUPS,iconMeta,findGalleryItems,renderComponentIcon} from './icon-gallery.js';
import {LESSON_STORAGE_KEY,WATER_LESSON_ID,WATER_LESSON_STEPS,lessonSpell,completeWaterLesson,readClassroom} from './lessons.js';

const STORAGE=window.localStorage;
let step=0;
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
 root.querySelector('#academy-class').onclick=()=>show('class');
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
 if(view==='collection'){
 const progress=readClassroom(STORAGE);
 const unlocked=progress.learnedCards.includes('water');
 root.innerHTML=`<div class="academy-menu academy-collection-page"><span class="eyebrow">THE GRIMOIRE</span><h1>My Collection</h1><p>Spell studies learned in Classroom. Progress is saved in this browser.</p><div class="academy-collection"><div class="academy-collection-preview"><canvas id="academy-collection-circle" width="500" height="500" aria-label="Water starter card rendered with the Spell Creator"></canvas></div><div class="academy-collection-details"><span class="eyebrow">STARTER CARD · V37</span><h2>Water</h2><span class="academy-card-status">${unlocked?'✓ Learned':'Locked · Preview'}</span><p>The same experimental Water inscription taught in Classroom, built from existing Spell Creator components.</p><dl><div><dt>Center</dt><dd>Oxygen</dd></div><div><dt>Ring</dt><dd>Wavy · Oscillation</dd></div><div><dt>Ingredients</dt><dd>Hydrogen × 2 (opposite pair)</dd></div><div><dt>Rune</dt><dd>Bind (B) × 2 (opposite pair)</dd></div></dl><p class="academy-card-note">${unlocked?'Added to your classroom collection.':'Complete the Water foundations lesson to unlock this study card.'} This is a study design, not a validated castable spell.</p><button id="academy-study" class="gold-btn">${unlocked?'Review lesson':'Learn this spell'} →</button></div></div><button id="academy-back">← Main Menu</button></div>`;
 const preview=root.querySelector('#academy-collection-circle');
 renderSpell(preview.getContext('2d'),lessonSpell(WATER_LESSON_STEPS.length-1),elements,{guides:false});
 root.querySelector('#academy-study').onclick=()=>{step=0;show('class')};
 root.querySelector('#academy-back').onclick=()=>show('menu');
 return;
 }
 const current=WATER_LESSON_STEPS[step];
 const completed=readClassroom(STORAGE).completedLessons.includes(WATER_LESSON_ID);
 root.innerHTML=`<div class="academy-class"><div class="academy-class-top"><button id="academy-back">← Main Menu</button><div><span class="eyebrow">CLASSROOM / LESSON 01</span><h1>Water foundations</h1></div><span class="academy-counter">STEP ${step+1} / ${WATER_LESSON_STEPS.length}</span></div><div class="academy-board"><div class="academy-board-heading"><span>CHALKBOARD · REAL SPELL CREATOR GEOMETRY</span><span>V37</span></div><canvas id="academy-circle" width="500" height="500" aria-label="Current Water inscription construction"></canvas><div class="academy-board-foot">${current.title}</div></div><div class="academy-dialogue"><div class="academy-professor" aria-hidden="true">✧</div><div><strong>Professor Aldric</strong><p>${current.dialog}</p></div></div><div class="academy-controls"><button id="academy-prev" ${step===0?'disabled':''}>← Previous</button><div class="academy-progress" aria-label="Lesson progress">${WATER_LESSON_STEPS.map((_,i)=>`<span class="${i<=step?'active':''}"></span>`).join('')}</div><button id="academy-next" class="gold-btn">${step===WATER_LESSON_STEPS.length-1?'Complete lesson':'Next →'}</button></div>${completed?'<p class="academy-finished">✓ Water study card learned. Open My Collection to review.</p>':''}</div>`;
 const canvas=root.querySelector('#academy-circle');
 renderSpell(canvas.getContext('2d'),lessonSpell(step),elements,{guides:false});
 root.querySelector('#academy-back').onclick=()=>show('menu');
 root.querySelector('#academy-prev').onclick=()=>{step=Math.max(0,step-1);render('class')};
 root.querySelector('#academy-next').onclick=()=>{if(step===WATER_LESSON_STEPS.length-1){try{completeWaterLesson(STORAGE);show('collection')}catch{root.querySelector('.academy-dialogue p').textContent='Browser storage is unavailable; progress could not be saved.'}}else{step++;render('class')}};
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
