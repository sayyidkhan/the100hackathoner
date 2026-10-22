import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from '../../public/landing/vendor/three.module.js';
import {createCoastalTrail,createCoastalWalk,coastalJourney,COASTAL_ARRIVAL} from '../../public/landing/artifacts/anginombak-walk.js';

test('Both walkers stay on the drawn trail, advance toward the pin, and stay separated',()=>{
  const curve=createCoastalTrail(T),walk=createCoastalWalk(T,()=>0);
  const samples=Array.from({length:4001},(_,i)=>curve.getPointAt(i/4000));
  const previous=[1,1];
  for(let time=0;time<=COASTAL_ARRIVAL;time+=.1){
    const poses=walk(time);
    poses.forEach((pose,index)=>{
      assert.ok(Object.values(pose).every(Number.isFinite));
      let closest=Infinity,at=0;
      samples.forEach((p,i)=>{const d=Math.hypot(p.x-pose.x,p.z-pose.z);if(d<closest){closest=d;at=i/4000;}});
      assert.ok(closest<.003,'Feet follow the same curve as the trail dashes');
      assert.ok(at<=previous[index],'Walkers advance toward the destination');
      previous[index]=at;
    });
    assert.ok(Math.hypot(poses[0].x-poses[1].x,poses[0].z-poses[1].z)>.32,'Walkers do not overlap at bends');
  }
});
test('Pin stays hidden until both walkers finish, drops, and stays landed',()=>{
  const walk=createCoastalWalk(T,()=>0);
  for(let t=0;t<COASTAL_ARRIVAL;t+=.1)assert.equal(coastalJourney(t).pinScale,0);
  assert.equal(coastalJourney(COASTAL_ARRIVAL).arrived,true);
  assert.ok(coastalJourney(COASTAL_ARRIVAL+.4).pinHeight>0);
  assert.equal(coastalJourney(COASTAL_ARRIVAL+2).pinHeight,0);
  assert.equal(coastalJourney(COASTAL_ARRIVAL+2).pinScale,1);
  assert.deepEqual(walk(28),walk(90),'Figures wait at the destination');
  walk(28).forEach(p=>assert.equal(p.stride,0));
});
test('Reset and time seeking deterministically restore the journey',()=>{
  const walk=createCoastalWalk(T,()=>0),start=walk(0);
  walk(90);assert.deepEqual(walk(0),start);
  assert.deepEqual(walk(12),walk(12));
  assert.equal(coastalJourney(0).pinScale,0);
  assert.deepEqual(walk(NaN),start);
});
