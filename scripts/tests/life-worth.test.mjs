import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {ACTIVITIES,EXAMPLE,LIFE_CYCLE,lifeMoment,createArtifact} from '../../public/landing/artifacts/life-worth.js';

test('illustrative day totals 24h and values follow the declared rate and period',()=>{
 assert.equal(ACTIVITIES.reduce((n,a)=>n+a.hours,0),24);
 assert.equal(ACTIVITIES[0].hours+ACTIVITIES[1].hours,EXAMPLE.valuedHours);
 const s=lifeMoment(26.5);assert.equal(s.daily,200);assert.equal(s.monthly,s.daily*EXAMPLE.days);assert.equal(s.monthly,4000);
 assert.equal(lifeMoment(13.9).dailyProgress,0);assert.equal(lifeMoment(20.9).monthProgress,0);
 assert.deepEqual(lifeMoment(0),lifeMoment(LIFE_CYCLE));
});
test('physical dial, live numbers and calendar follow the same clock as the dashboard',()=>{
 const r=createArtifact(T),a=r.getObjectByName('life-activity-0'),last=r.getObjectByName('life-activity-4');
 r.userData.animate(0);assert(!a.visible);assert(!last.visible);
 r.userData.animate(2);assert(a.visible);assert(!last.visible);r.userData.animate(6);assert(last.visible);assert.equal(last.geometry.drawRange.count,last.geometry.attributes.position.count);
 for(let t=14;t<28;t+=.7){r.userData.animate(t);const s=lifeMoment(t);assert.equal(r.getObjectByName('life-daily-number').userData.value,Math.round(s.daily*s.dailyProgress));assert.equal(r.getObjectByName('life-month-number').userData.value,Math.round(s.monthly*s.monthProgress));let days=0;for(let i=0;i<20;i++)days+=Number(r.getObjectByName(`life-calendar-${i}`).visible);assert.equal(days,Math.floor(s.monthProgress*20));}
});
test('manual stages freeze motion; autoplay resumes continuously and seeks deterministically',()=>{
 const r=createArtifact(T),hand=r.getObjectByName('life-clock-hand'),sand=r.getObjectByName('life-sand-stream');
 const snap=t=>{r.userData.animate(t);r.updateMatrixWorld(true);const out=[];r.traverse(o=>out.push(o.visible,...o.matrixWorld.elements,o.geometry?.drawRange.count??0));return out;};
 const before=snap(9.3);snap(24);assert.deepEqual(snap(9.3),before);
 r.userData.setStep(1,30);const fixed=snap(30);assert.deepEqual(snap(45),fixed);r.userData.setStep(null,45);assert.deepEqual(snap(45),fixed);assert.notDeepEqual(snap(45.5),fixed);
 const angle=hand.rotation.z,y=sand.children[0].position.y;snap(46);assert.notEqual(hand.rotation.z,angle);assert.notEqual(sand.children[0].position.y,y);
});
test('finite batched model stays within the interactive rendering budget',()=>{
 const r=createArtifact(T);let meshes=0,triangles=0;
 r.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;for(const a of Object.values(g.attributes))assert(a.array.every(Number.isFinite));if(g.index)assert(g.index.array.every(i=>i>=0&&i<g.attributes.position.count));});
 assert(meshes<100);assert(triangles<300000);assert.equal(r.userData.artifactId,13);assert.equal(r.userData.realTimeAnimation,true);
});
