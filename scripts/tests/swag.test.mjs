import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {swagMoment,SWAG_CYCLE} from '../../public/landing/artifacts/swag-timing.js';
import {createArtifact} from '../../public/landing/artifacts/swagmylife.js';
test('home selection precedes budget rebalancing and local recommendations',()=>{
 for(let i=0;i<340;i++){const s=swagMoment(i/10);assert.ok(Math.abs(s.allocations.reduce((a,b)=>a+b)-1)<1e-9);assert.ok(s.allocations.every(v=>v>=0));if(s.balance>0)assert.ok(s.selected);if(s.food>0)assert.equal(s.balance,1);if(s.matched){assert.equal(s.food,1);assert.equal(s.leisure,1);}}
 assert.equal(swagMoment(9).selected,false);assert.equal(swagMoment(10).selected,true);assert.deepEqual(swagMoment(15),swagMoment(15+SWAG_CYCLE));
});
test('seek, reset and geometry remain stable across complete loops',()=>{
 const model=createArtifact(T),pin=model.getObjectByName('swag-home-pin');model.userData.animate(0);assert.equal(pin.visible,false);
 model.userData.animate(26);const pos=pin.position.clone();assert.equal(pin.visible,true);assert.equal(model.getObjectByName('swag-screen').userData.phase,4);
 model.userData.animate(33);assert.equal(pin.visible,false);model.userData.animate(26);assert.ok(pos.distanceTo(pin.position)<1e-9);
 model.userData.animate(34);assert.equal(pin.visible,false);assert.equal(model.userData.story.home,0);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}});console.log({meshes,triangles});assert.ok(meshes<100);assert.ok(triangles<350000);
});
