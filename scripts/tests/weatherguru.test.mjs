import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,weatherMoment,weatherSample,chartX,WEATHER_CYCLE,canalZ,floodEdge,floodHeight} from '../../public/landing/artifacts/weatherguru.js';

test('one continuous series drives rainfall, a lagged canal response and overflow',()=>{
 assert.equal(WEATHER_CYCLE,32);
 assert.deepEqual([0,8,16,24].map(t=>weatherMoment(t).index),[0,1,2,3]);
 assert.equal(weatherMoment(26).rain,.98);assert(weatherMoment(18).level>weatherMoment(16).level);assert(weatherMoment(18).rain<weatherMoment(16).rain);
 assert.equal(weatherMoment(27).flood,1);assert.equal(weatherMoment(0).level,0);
 assert.deepEqual(weatherMoment(32),weatherMoment(0));assert.deepEqual(weatherMoment(-1),weatherMoment(31));
 assert(Math.abs(weatherMoment(31.999).level-weatherMoment(0).level)<.001);
 for(let t=0;t<32;t+=.1){const s=weatherMoment(t);for(const key of ['rain','level','flood'])assert(s[key]>=0&&s[key]<=1);assert.deepEqual(weatherSample(s.sample),{rain:s.rain,level:s.level,flood:s.flood});}
});

test('graph cursor, rain, gauge, water and overflow agree for every sampled time',()=>{
 const model=createArtifact(T),u=model.userData,water=model.getObjectByName('weather-canal-water'),scan=model.getObjectByName('weather-history-scan'),dot=model.getObjectByName('weather-rain-point'),response=model.getObjectByName('weather-response-point'),flood=model.getObjectByName('weather-inundation'),rain=model.getObjectByName('weather-rain'),marker=model.getObjectByName('weather-level-marker');
 u.animate(0);const zeroY=marker.position.y,chartY=dot.position.y-.24*.76;
 for(let t=0;t<32;t+=.13){
  u.animate(t);const s=weatherMoment(t);
  assert(Math.abs(scan.position.x-chartX(s.sample))<1e-5);assert.equal(dot.position.x,scan.position.x);assert.equal(response.position.x,scan.position.x);
  assert(Math.abs(dot.position.y-chartY-s.rain*.76)<1e-5);assert(Math.abs(response.position.y-chartY-s.level*.76)<1e-5);
  assert(Math.abs(water.position.y-u.waterBaseY-s.level*.065-s.flood*.028)<1e-5);assert(Math.abs(marker.position.y-zeroY-s.level*.39)<1e-5);
  assert.equal(flood.visible,s.flood>.005);assert.equal(rain.count,Math.round(35+165*s.rain));
  const p=flood.geometry.attributes.position;
  for(let i=0;i<p.count;i++)assert(Math.abs(p.getZ(i)-floodEdge(p.getX(i),i%2===0?-1:1,s.flood))<1e-5);
 }
});

test('rain clears roofs; visible street flooding stays below the footbridge deck',()=>{
 const model=createArtifact(T),u=model.userData,rain=model.getObjectByName('weather-rain'),water=model.getObjectByName('weather-canal-water'),flood=model.getObjectByName('weather-inundation');
 const matrix=new T.Matrix4(),pos=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3();
 for(let t=0;t<32;t+=.25){
  u.animate(t);u.rainBounds.forEach((d,i)=>{rain.getMatrixAt(i,matrix);matrix.decompose(pos,q,scale);assert(pos.y-scale.y*.0475>=d.bottom-.048);assert(pos.y<=3.681);});
  const p=water.geometry.attributes.position;for(let i=0;i<p.count;i++){assert(p.getY(i)+water.position.y<.47);assert(Math.abs(p.getZ(i)-canalZ(p.getX(i)))<.426);}
  const f=flood.geometry.attributes.position;for(let i=0;i<f.count;i++){assert(f.getY(i)<.47);assert(Math.abs(f.getZ(i))<2.7);}
 }
});

test('manual selections hold graph and flood together; repeated clock samples pause all motion',()=>{
 const model=createArtifact(T),u=model.userData,rain=model.getObjectByName('weather-rain'),water=model.getObjectByName('weather-canal-water'),dot=model.getObjectByName('weather-rain-point');
 u.setStep(3,0);const level=water.position.y,point=dot.position.toArray(),a=Array.from(rain.instanceMatrix.array);
 u.animate(1);assert.equal(u.story.index,3);assert.equal(water.position.y,level);assert.deepEqual(dot.position.toArray(),point);assert.notDeepEqual(Array.from(rain.instanceMatrix.array),a);
 const paused=Array.from(rain.instanceMatrix.array);u.animate(1);assert.deepEqual(Array.from(rain.instanceMatrix.array),paused);
 u.setStep(99);assert.equal(u.story.index,3);u.setStep(null,0);assert.equal(u.story.index,0);assert(water.position.y<level);
 u.animate(0);const first=Array.from(rain.instanceMatrix.array);u.animate(32);assert.deepEqual(Array.from(rain.instanceMatrix.array),first);
});

test('forecast and investigation areas follow the shared sample and overflow threshold',()=>{
 const model=createArtifact(T),u=model.userData,forecast=model.getObjectByName('weather-forecast-window'),exposure=model.getObjectByName('weather-local-exposure');
 for(let t=0;t<32;t+=.2){u.animate(t);const s=weatherMoment(t);assert.equal(forecast.visible,s.sample>=11);assert.equal(exposure.visible,s.flood>.08);}
 u.setStep(2,0);assert.equal(forecast.visible,true);assert.match(u.story.detail,/not a live forecast/);
});

test('geometry and framing remain finite within the rendering budget',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;const a=o.geometry.attributes.position;vertices+=a.count;assert([...a.array].every(Number.isFinite));}});
 assert(meshes<100);assert(vertices<170000);assert(model.userData.framingPoints.every(p=>[p.x,p.y,p.z].every(Number.isFinite)));
 const bounds=new T.Box3().setFromObject(model);assert(bounds.min.y>=-.001);assert(bounds.max.y<5.3);
});


test('peak flood visibly reaches road and paths, then fully withdraws',()=>{
 const model=createArtifact(T),u=model.userData,flood=model.getObjectByName('weather-inundation'),labels=model.getObjectByName('weather-flood-labels'),front=model.getObjectByName('weather-flood-front');
 u.animate(27);assert.equal(flood.visible,true);assert.equal(labels.visible,true);assert.equal(front.visible,true);
 assert(floodEdge(0,-1,1)<-.74,'water covers both lanes of the road');
 assert(floodEdge(2.7,1,1)>2.0,'water covers the riverside footpath');
 assert(floodHeight(1)>.375&&floodHeight(1)<.4725,'water submerges the road but leaves bridge deck dry');
 u.animate(0);assert.equal(flood.visible,false);assert.equal(labels.visible,false);assert.equal(front.visible,false);
});
