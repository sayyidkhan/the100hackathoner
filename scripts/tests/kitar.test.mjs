import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {kitarMoment,KITAR_CYCLE} from '../../public/landing/artifacts/kitar-timing.js';
import {createArtifact} from '../../public/landing/artifacts/kitar-go.js';

test('navigation arrives before detection; reward follows complete deposit',()=>{
 let previous=0;
 for(let n=0;n<300;n++){const s=kitarMoment(n/10);assert.ok(s.route>=previous);previous=s.route;if(s.detected)assert.ok(s.arrived);if(s.drop>0)assert.ok(s.detected);if(s.reward)assert.equal(s.drop,1);}
 assert.equal(kitarMoment(10.9).arrived,false);assert.equal(kitarMoment(11).route,1);assert.equal(kitarMoment(18.9).reward,false);assert.equal(kitarMoment(19).reward,true);
 assert.deepEqual(kitarMoment(12),kitarMoment(KITAR_CYCLE+12));
});
test('bottle drops vertically through correct opening and state seeks without drift',()=>{
 const model=createArtifact(T),bottle=model.getObjectByName('kitar-bottle'),scan=model.getObjectByName('kitar-bin-scan'),marker=model.getObjectByName('kitar-route-marker');
 model.userData.animate(0);assert.equal(scan.visible,false);assert.equal(bottle.visible,false);
 model.userData.animate(12);assert.equal(scan.visible,true);assert.equal(bottle.visible,true);const start=bottle.position.clone();const routeEnd=marker.position.clone();
 let y=start.y;for(let k=160;k<190;k++){model.userData.animate(k/10);assert.equal(bottle.position.x,start.x);assert.equal(bottle.position.z,start.z);assert.ok(bottle.position.y<=y);y=bottle.position.y;}
 model.userData.animate(19);assert.equal(bottle.visible,false);assert.equal(model.userData.story.reward,true);assert.equal(model.getObjectByName('kitar-screen').userData.phase,4);
 model.userData.animate(12);assert.ok(bottle.position.distanceTo(start)<1e-9);assert.ok(marker.position.distanceTo(routeEnd)<1e-9);
 model.userData.animate(30);assert.equal(scan.visible,false);assert.equal(bottle.visible,false);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}});
 console.log({meshes,triangles});assert.ok(meshes<100);assert.ok(triangles<220000);
});
