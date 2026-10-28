import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/saywhat.js';
import {saywhatMoment,SAYWHAT_CYCLE,SAYWHAT_HITS} from '../../public/landing/artifacts/saywhat-timing.js';

test('recording, complete query, matches, seek and playback occur in order',()=>{
 for(let t=0;t<11;t+=.1)assert.equal(saywhatMoment(t).matches,0);
 assert.equal(saywhatMoment(10).query,'persona');
 assert.equal(saywhatMoment(13).matches,3);
 assert.equal(saywhatMoment(16).playing,false);
 assert.ok(saywhatMoment(17).cursor>SAYWHAT_HITS[1].u);
 assert.equal(saywhatMoment(18).cursor,SAYWHAT_HITS[1].u);
 assert.equal(saywhatMoment(18).playing,true);
 assert.equal(saywhatMoment(25).playing,false);
 assert.equal(saywhatMoment(27.5).fade,0);
 assert.deepEqual(saywhatMoment(SAYWHAT_CYCLE+9),saywhatMoment(9));
 for(const hit of SAYWHAT_HITS){const [m,s]=hit.time.split(':').map(Number);assert.equal(hit.u,(m*60+s)/2100);}
});

test('3D and screen follow the same state, seek deterministically and reset',()=>{
 const model=createArtifact(T),screen=model.getObjectByName('saywhat-search-screen'),cursor=model.getObjectByName('saywhat-playhead');
 const markers=SAYWHAT_HITS.map((_,i)=>model.getObjectByName(`saywhat-hit-${i}`));
 model.userData.animate(0);assert.ok(markers.every(m=>!m.visible));
 model.userData.animate(12);assert.equal(markers.filter(m=>m.visible).length,screen.userData.matches);
 model.userData.animate(19);const pose=cursor.position.clone();assert.equal(screen.userData.cursor,saywhatMoment(19).cursor);assert.equal(model.userData.playback.playing,true);
 model.userData.animate(26);model.userData.animate(19);assert.ok(cursor.position.distanceTo(pose)<1e-9);
 model.userData.animate(SAYWHAT_CYCLE);assert.ok(markers.every(m=>!m.visible));assert.equal(screen.userData.matches,0);
 let meshes=0,vertices=0;model.traverse(o=>{if(!o.isMesh)return;meshes++;vertices+=o.geometry.attributes.position.count;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));});
 assert.ok(meshes<50);assert.ok(vertices<250000);
 const bars=model.getObjectByName('saywhat-wave-bars');assert.equal(bars.count,88);for(const v of bars.instanceMatrix.array)assert.ok(Number.isFinite(v));
});
