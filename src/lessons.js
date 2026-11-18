import {STARTER_CARDS} from './starter-cards.js';
import {validateSpell} from './rules.js';

export const LESSON_STORAGE_KEY='spellweaver.classroom.v1';
const water=STARTER_CARDS.find(card=>card.id==='water');
export const WATER_LESSON_ID='water-foundations';
export const WATER_LESSON_STEPS=[
 {title:'The heart of an inscription',dialog:'Every inscription requires a central element. This is Oxygen, drawn using our real elemental geometry.',components:'center'},
 {title:'A flowing ring',dialog:'This Wavy ring is one of our existing ring patterns. Its current catalogue description is Oscillation.',components:'ring'},
 {title:'First ingredient: Hydrogen',dialog:'Hydrogen is the first component of our experimental Water ink card. Notice its actual elemental sigil on the ring.',components:'hydrogen-1'},
 {title:'A second Hydrogen',dialog:'Add another Hydrogen on the ring, using the same placement and shape rules as Spell Creator.',components:'hydrogen-2'},
 {title:'Oxygen on the ring',dialog:'Now the Oxygen component joins the two Hydrogen components. We are assembling an existing starter-card motif, not inventing an effect.',components:'oxygen'},
 {title:'The Bind rune',dialog:'The Bind rune appears on the after track. Its icon is the same provisional glyph displayed by Spell Creator.',components:'rune'},
 {title:'Read the complete inscription',dialog:'This is the existing experimental Water starter card. The formula and casting effects are not yet validated by the rulebook. Complete this lesson to keep the design in your classroom collection.',components:'complete'}
];
export function lessonSpell(step){
 if(!Number.isInteger(step)||step<0||step>=WATER_LESSON_STEPS.length)throw new RangeError('Invalid classroom step');
 const source=structuredClone(water.source);
 if(step===0)source.rings=[];
 if(step<2)source.elements=[];
 else if(step===2)source.elements=source.elements.slice(0,1);
 else if(step===3)source.elements=source.elements.slice(0,2);
 if(step<5)source.runes=[];
 return {...source,schema:'spellweaver.creation.v1',rulesVersion:'v37',name:'Water — classroom study',description:water.description,castSeconds:20,creator:'Classroom'};
}
export function completeWaterLesson(storage){
 const prior=readClassroom(storage);
 const completed=[...new Set([...prior.completedLessons,WATER_LESSON_ID])];
 const collected=[...new Set([...prior.learnedCards,water.id])];
 const next={schema:'spellweaver.classroom.v1',completedLessons:completed,learnedCards:collected};
 storage.setItem(LESSON_STORAGE_KEY,JSON.stringify(next));
 return next;
}
export function readClassroom(storage){
 try{
 const parsed=JSON.parse(storage.getItem(LESSON_STORAGE_KEY)||'null');
 if(parsed?.schema==='spellweaver.classroom.v1'&&Array.isArray(parsed.completedLessons)&&Array.isArray(parsed.learnedCards))
 return {schema:parsed.schema,completedLessons:parsed.completedLessons.filter(x=>typeof x==='string'),learnedCards:parsed.learnedCards.filter(x=>typeof x==='string')};
 }catch{}
 return {schema:'spellweaver.classroom.v1',completedLessons:[],learnedCards:[]};
}
export function waterLessonValid(){
 return WATER_LESSON_STEPS.every((_,index)=>validateSpell(lessonSpell(index)).length===0);
}
