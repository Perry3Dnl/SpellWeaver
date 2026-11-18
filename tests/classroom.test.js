import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTER_CARDS} from '../src/starter-cards.js';
import {WATER_LESSON_STEPS,WATER_LESSON_ID,LESSON_STORAGE_KEY,lessonSpell,completeWaterLesson,readClassroom,waterLessonValid} from '../src/lessons.js';

function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('classroom uses exact existing Water starter geometry and rune',()=>{
 const expected=STARTER_CARDS.find(x=>x.id==='water').source;
 const actual=lessonSpell(WATER_LESSON_STEPS.length-1);
 for(const part of ['center','rings','elements','runes','amps','strokes','cards'])assert.deepEqual(actual[part],expected[part]);
 assert.equal(actual.rings[0].pattern,'Wavy');
 assert.equal(actual.runes[0].letter,'B');
 assert.equal(waterLessonValid(),true);
});
test('Next reveals canonical Water components incrementally without altering starter card',()=>{
 assert.equal(lessonSpell(0).rings.length,0);
 assert.equal(lessonSpell(1).rings.length,1);
 for(let n=2;n<=4;n++)assert.equal(lessonSpell(n).elements.length,n-1);
 assert.equal(lessonSpell(4).runes.length,0);
 assert.equal(lessonSpell(5).runes.length,1);
 assert.throws(()=>lessonSpell(-1),RangeError);
});
test('completion persists one collection item and is idempotent',()=>{
 const memory=storage();
 assert.deepEqual(readClassroom(memory).learnedCards,[]);
 completeWaterLesson(memory);
 completeWaterLesson(memory);
 assert.deepEqual(readClassroom(memory).learnedCards,['water']);
 assert.deepEqual(readClassroom(memory).completedLessons,[WATER_LESSON_ID]);
 assert.equal(JSON.parse(memory.getItem(LESSON_STORAGE_KEY)).schema,'spellweaver.classroom.v1');
});
test('corrupt browser storage does not erase lesson definitions',()=>{
 const memory={getItem:()=>'{oops',setItem:()=>{}};
 assert.deepEqual(readClassroom(memory).learnedCards,[]);
});
