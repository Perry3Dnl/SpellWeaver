import {STARTER_CARDS} from './starter-cards.js';
import {validateSpell} from './rules.js';
import {readClassroom,LESSON_STORAGE_KEY} from './lessons.js';

const fire=STARTER_CARDS.find(card=>card.id==='fire');
const clone=value=>structuredClone(value);
const make=(name,center,rings=[],elements=[],runes=[],cards=[])=>({
 schema:'spellweaver.creation.v1',rulesVersion:'v37',name,description:'Experimental classroom inscription; behavior is not yet validated.',
 creator:'Classroom',center:{id:center,scale:.9},castSeconds:20,
 rings,elements,runes,amps:[],strokes:[],cards
});
const ring=(id,radius,pattern)=>({id,radius,pattern});
const rune=(id,letter,ringId,angle,rotation=0)=>({id,letter,ringId,angle,side:'after',rotation});
const oxygen=(id,angle,rotation=0)=>({id,elementId:8,ringId:1,angle,scale:.8,rotation});
const fireCard=(id,angle,rotation=0)=>({
 id,ringId:1,angle,rotation,scale:.24,template:clone(fire)
});
const manaBase=()=>make('Mana Study',119,[ring(1,108,'Smooth')],[],[
 rune(1,'H',1,0),rune(2,'H',1,180,180)
]);
const fireBase=()=>make('Fire Element Study',6,[ring(1,108,'Burst-mark')],[
 oxygen(1,90),oxygen(2,270,180)
],[rune(1,'F',1,0),rune(2,'F',1,180,180)]);
const projectileBase=()=>make('Fire Mana Projectile',119,[ring(1,125,'Burst-mark')],[],[
 rune(1,'R',1,0),rune(2,'R',1,180,180)
],[fireCard(1,90),fireCard(2,270,180)]);
export const ACADEMY_LESSONS=[
 {id:'mana-foundations',cardId:'mana-study',title:'Lesson 01 · Mana',name:'Mana Study',
  subtitle:'Your first mana inscription',steps:[
   {title:'Meet the Mana element',dialog:'This is Mana, one of our existing magical elements. Its sigil forms the center of the inscription.',stage:0},
   {title:'Give Mana a ring',dialog:'A Smooth ring adds a neutral structure around Mana. This is the same ring available in Spell Creator.',stage:1},
   {title:'Balance the Hold runes',dialog:'Two opposite Hold runes complete this introductory mana design. The pair is rotated by 180° to preserve symmetry.',stage:2}
  ]},
 {id:'fire-foundations',cardId:'fire-study',title:'Lesson 02 · Fire',name:'Fire Element Study',
  subtitle:'Understand the experimental Fire motif',steps:[
   {title:'The Fire study',dialog:'Fire is currently an experimental starter card, not a standalone element in our chemical catalogue. We begin with Carbon and the existing Burst-mark ring.',stage:0},
   {title:'Oxygen in balance',dialog:'Two opposing Oxygen symbols form a balanced pair around the Carbon center.',stage:1},
   {title:'Focus the Fire study',dialog:'Two opposite Focus runes complete our Fire motif. This is a symbolic design; ignition is not yet a validated game mechanic.',stage:2}
  ]},
 {id:'fire-mana-projectile',cardId:'fire-mana-projectile',title:'Lesson 03 · Fire + Mana',name:'Fire Mana Projectile',
  subtitle:'Compose an intended projectile spell',steps:[
   {title:'Start with Mana',dialog:'We begin with Mana as the center and a Burst-mark ring, representing the existing Burst release ring effect.',stage:0},
   {title:'Add the Fire cards',dialog:'Embed two copies of the same Fire starter card on opposite sides of the ring. Their placement and rotation preserve symmetry.',stage:1},
   {title:'Redirect the emission',dialog:'Add opposing Redirect runes. The intended result is a traveling Fire projectile, but targeting and casting execution are not implemented yet.',stage:2},
   {title:'Your Fire Mana design',dialog:'This is the complete Fire Mana projectile inscription. Save it to your collection as a study spell. It does not actually shoot until the casting system is implemented.',stage:3}
  ]}
];
export function academySpell(lessonId,step){
 const lesson=ACADEMY_LESSONS.find(item=>item.id===lessonId);
 if(!lesson||!Number.isInteger(step)||step<0||step>=lesson.steps.length)throw new RangeError('Unknown classroom lesson or step');
 let spell;
 if(lessonId==='mana-foundations'){
  spell=manaBase();
  if(step===0){spell.rings=[];spell.runes=[];}
  if(step===1)spell.runes=[];
 }else if(lessonId==='fire-foundations'){
  spell=fireBase();
  if(step===0){spell.elements=[];spell.runes=[];}
  if(step===1)spell.runes=[];
 }else{
  spell=projectileBase();
  if(step===0){spell.cards=[];spell.runes=[];}
  if(step===1)spell.runes=[];
 }
 return spell;
}
export function academyCardSpells(){
 return ACADEMY_LESSONS.map(lesson=>({lesson,spell:academySpell(lesson.id,lesson.steps.length-1)}));
}
export function completeAcademyLesson(storage,lessonId){
 const lesson=ACADEMY_LESSONS.find(item=>item.id===lessonId);
 if(!lesson)throw new RangeError('Unknown classroom lesson');
 const prior=readClassroom(storage);
 const next={schema:'spellweaver.classroom.v1',
  completedLessons:[...new Set([...prior.completedLessons,lesson.id])],
  learnedCards:[...new Set([...prior.learnedCards,lesson.cardId])]
 };
 storage.setItem(LESSON_STORAGE_KEY,JSON.stringify(next));
 return next;
}
export function academyLessonValid(){
 return ACADEMY_LESSONS.every(lesson=>lesson.steps.every((_,step)=>validateSpell(academySpell(lesson.id,step)).length===0));
}
