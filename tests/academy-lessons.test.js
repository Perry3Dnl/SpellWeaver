import test from 'node:test';
import assert from 'node:assert/strict';
import {readClassroom} from '../src/lessons.js';
import {ACADEMY_LESSONS,academySpell,academyCardSpells,academyLessonValid,completeAcademyLesson} from '../src/academy-lessons.js';
import {validateSpell} from '../src/rules.js';

function memory(){const entries=new Map();return {getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};}
test('new curriculum starts with Mana, then Fire, and finally Fire Mana projectile',()=>{
 assert.deepEqual(ACADEMY_LESSONS.map(x=>x.id),['mana-foundations','fire-foundations','fire-mana-projectile']);
 assert.equal(academyLessonValid(),true);
 assert.deepEqual(academyCardSpells().map(x=>x.lesson.cardId),['mana-study','fire-study','fire-mana-projectile']);
});
test('every lesson stage yields a valid inscription and exposes components incrementally',()=>{
 for(const lesson of ACADEMY_LESSONS){
  for(let step=0;step<lesson.steps.length;step++)assert.deepEqual(validateSpell(academySpell(lesson.id,step)),[]);
 }
 const mana=academySpell('mana-foundations',2);
 assert.equal(mana.center.id,119);
 assert.equal(mana.rings[0].pattern,'Smooth');
 assert.deepEqual(mana.runes.map(r=>[r.letter,r.angle]),[['H',0],['H',180]]);
 const fire=academySpell('fire-foundations',2);
 assert.equal(fire.center.id,6);
 assert.equal(fire.rings[0].pattern,'Burst-mark');
 assert.deepEqual(fire.elements.map(e=>[e.elementId,e.angle]),[[8,90],[8,270]]);
 assert.deepEqual(fire.runes.map(r=>[r.letter,r.angle]),[['F',0],['F',180]]);
 const projectile=academySpell('fire-mana-projectile',3);
 assert.equal(projectile.center.id,119);
 assert.equal(projectile.cards.length,2);
 assert.deepEqual(projectile.cards.map(c=>[c.template.id,c.angle,c.rotation]),[['fire',90,0],['fire',270,180]]);
 assert.deepEqual(projectile.runes.map(r=>[r.letter,r.angle]),[['R',0],['R',180]]);
 assert.equal(academySpell('fire-mana-projectile',0).cards.length,0);
 assert.equal(academySpell('fire-mana-projectile',1).runes.length,0);
 assert.throws(()=>academySpell('fire-mana-projectile',4),RangeError);
});
test('new classroom unlocks coexist with previously learned Water and remain idempotent',()=>{
 const storage=memory();
 storage.setItem('spellweaver.classroom.v1',JSON.stringify({schema:'spellweaver.classroom.v1',completedLessons:['water-foundations'],learnedCards:['water']}));
 for(const lesson of ACADEMY_LESSONS){completeAcademyLesson(storage,lesson.id);completeAcademyLesson(storage,lesson.id);}
 const progress=readClassroom(storage);
 assert.deepEqual(progress.learnedCards,['water','mana-study','fire-study','fire-mana-projectile']);
 assert.deepEqual(progress.completedLessons,['water-foundations',...ACADEMY_LESSONS.map(l=>l.id)]);
 assert.throws(()=>completeAcademyLesson(storage,'nonexistent'),RangeError);
});
