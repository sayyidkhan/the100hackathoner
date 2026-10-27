import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,weatherMoment,WEATHER_CYCLE} from '../../public/landing/artifacts/weatherguru.js';

test('rainfall leads the water level and the illustrative sequence loops',()=>{
 assert.equal(WEATHER_CYCLE,28);
 assert.deepEqual([0,7,14,21].map(t=>weatherMoment(t).index),[0,1,2,3]);
 assert.equal(weatherMoment(3).rain,1);assert.equal(weatherMoment(3).level,0);
 assert.equal(weatherMoment(15).level,1);assert.equal(weatherMoment(28).level,0);
 assert.deepEqual(weatherMoment(28),weatherMoment(0));assert.deepEqual(weatherMoment(-1),weatherMoment(27));
 for(let t=0;t<28;t+=.1){const s=weatherMoment(t);assert(s.rain>=0&&s.rain<=1);assert(s.level>=0&&s.level<=1);}
});

test('rain terminates above roofs; the canal stays below the pavement',()=>{
 const model=createArtifact(T),rain=model.getObjectByName('weather-rain'),water=model.getObjectByName('weather-canal-water');
 const matrix=new T.Matrix4(),pos=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3();
 for(let t=0;t<28;t+=.25){
  model.userData.animate(t);assert(water.position.y>=.395&&water.position.y<=.495);assert(water.position.y+.012*.52<.25+.55*.52);
  model.userData.rainBounds.forEach((d,i)=>{rain.getMatrixAt(i,matrix);matrix.decompose(pos,q,scale);assert(pos.y>=d.bottom-1e-5);assert(pos.y<=4.0);assert(Number.isFinite(pos.y));});
 }
 const bounds=new T.Box3().setFromObject(model);assert(bounds.min.y>=-.001);assert(bounds.max.y<5);
});

test('manual steps hold the water level while rainfall keeps moving and pause is deterministic',()=>{
 const model=createArtifact(T),u=model.userData,rain=model.getObjectByName('weather-rain'),water=model.getObjectByName('weather-canal-water');
 u.setStep(2,0);const level=water.position.y,a=Array.from(rain.instanceMatrix.array);
 u.animate(1);assert.equal(u.story.index,2);assert.equal(water.position.y,level);assert.notDeepEqual(Array.from(rain.instanceMatrix.array),a);
 const paused=Array.from(rain.instanceMatrix.array);u.animate(1);assert.deepEqual(Array.from(rain.instanceMatrix.array),paused);
 u.setStep(99);assert.equal(u.story.index,2);u.setStep(null,0);assert.equal(u.story.index,0);assert(water.position.y<level);
 u.animate(0);const first=Array.from(rain.instanceMatrix.array);u.animate(28);assert.deepEqual(Array.from(rain.instanceMatrix.array),first);
});

test('model geometry is finite and batched within a practical rendering budget',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;const a=o.geometry.attributes.position;vertices+=a.count;assert([...a.array].every(Number.isFinite));}});
 assert(meshes<85);assert(vertices<230000);assert(model.getObjectByName('weather-tropical-foliage').count>1000);
});


test('forecast remains distinct from history and appears only in outlook stages',()=>{
 const model=createArtifact(T),u=model.userData,forecast=model.getObjectByName('weather-forecast-window'),scan=model.getObjectByName('weather-history-scan'),tracer=model.getObjectByName('weather-pattern-tracer');
 u.setStep(0,0);assert.equal(forecast.visible,false);assert.equal(scan.visible,false);
 u.setStep(1,9);assert.equal(forecast.visible,false);assert.equal(scan.visible,true);assert.equal(tracer.visible,true);
 assert(Math.abs(scan.position.x-tracer.position.x)<.12);
 u.setStep(2,16);assert.equal(forecast.visible,true);assert.equal(scan.visible,false);assert.match(u.story.detail,/not an exact flood date/);
 u.setStep(3,24);assert.equal(model.getObjectByName('weather-local-exposure').visible,true);
 u.setStep(1,9);const scanX=scan.position.x;u.animate(10);assert.notEqual(scan.position.x,scanX);
 const pose=tracer.position.toArray();u.animate(10);assert.deepEqual(tracer.position.toArray(),pose);
 u.setStep(null,0);assert.equal(forecast.visible,false);assert.equal(model.getObjectByName('weather-local-exposure').visible,false);
 assert(u.framingPoints.length>24);assert(u.framingPoints.every(p=>[p.x,p.y,p.z].every(Number.isFinite)));
});
