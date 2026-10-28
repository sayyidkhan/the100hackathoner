import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {socapMoment,SOCAP_CYCLES} from '../../public/landing/artifacts/socap-timing.js';
import {createSocap} from '../../public/landing/artifacts/socap-studio.js';

test('1.0 connects before sending and only opens review after arrival',()=>{
 assert.equal(socapMoment(0,1).connected,0);
 assert.equal(socapMoment(6,1).connected,5);
 assert.equal(socapMoment(10,1).outbound,0);
 let previous=0;for(let k=110;k<170;k++){const s=socapMoment(k/10,1);assert.ok(s.outbound>=previous);assert.equal(s.sent,false);assert.equal(s.review,false);previous=s.outbound;}
 assert.equal(socapMoment(17,1).outbound,1);assert.equal(socapMoment(18,1).review,true);assert.equal(socapMoment(27,1).fade,0);
});
test('2.0 outcomes return after review and update the ledger on arrival',()=>{
 assert.equal(socapMoment(11,2).sent,true);assert.equal(socapMoment(11,2).review,false);assert.equal(socapMoment(12,2).review,true);
 for(let t=0;t<=20;t+=.1)assert.equal(socapMoment(t,2).feedback,0);
 assert.equal(socapMoment(26,2).feedback,1);assert.equal(socapMoment(26,2).updated,false);assert.equal(socapMoment(27,2).updated,true);
 for(const v of [1,2])assert.deepEqual(socapMoment(SOCAP_CYCLES[v]+12,v),socapMoment(12,v));
});
for(const version of [1,2])test(`${version}.0 scene follows state, resets and stays bounded`,()=>{
 const model=createSocap(T,version),packet=model.getObjectByName('socap-application-packet'),beacon=model.getObjectByName('socap-bank-received');
 model.userData.animate(0);assert.equal(packet.visible,false);assert.equal(beacon.visible,false);
 model.userData.animate(version===1?14:9);assert.equal(packet.visible,true);const position=packet.position.clone();model.userData.animate(22);model.userData.animate(version===1?14:9);assert.ok(packet.position.distanceTo(position)<1e-9);
 model.userData.animate(version===1?19:28);assert.equal(beacon.visible,true);assert.equal(model.getObjectByName('socap-borrower-screen').userData.phase,model.userData.story.phase);
 if(version===2){assert.equal(model.getObjectByName('socap-ledger-lamp-2').visible,true);model.userData.animate(12);assert.equal(model.getObjectByName('socap-ledger-lamp-2').visible,false);}
 model.userData.animate(SOCAP_CYCLES[version]);assert.equal(packet.visible,false);assert.equal(beacon.visible,false);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}});
 assert.ok(meshes<75);assert.ok(triangles<180000);const bounds=new T.Box3().setFromObject(model);assert.ok(bounds.max.x-bounds.min.x<12);console.log({version,meshes,triangles});
});
