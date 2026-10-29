import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {warriorsMoment,WARRIORS_CYCLE} from '../../public/landing/artifacts/warriors-timing.js';
import {createArtifact} from '../../public/landing/artifacts/warriors-mages.js';
test('persona and allowance precede allocation; the $500 is conserved throughout',()=>{
 for(let i=0;i<680;i++){const s=warriorsMoment(i/20);assert.ok(Math.abs(s.pending+s.amounts.reduce((a,b)=>a+b,0)-500)<1e-8);assert.ok(s.pending>=-1e-8);assert.ok(s.amounts.every(v=>v>=0));
 if(s.amounts.some(v=>v>0))assert.equal(s.selected,true);for(let j=1;j<5;j++)if(s.fills[j]>0)assert.equal(s.fills[j-1],1);
 if(s.ready)assert.deepEqual(s.amounts,[150,200,50,50,50]);if(s.fills[4]>0)assert.ok(s.lid>.9);}
 assert.equal(warriorsMoment(7).amounts.reduce((a,b)=>a+b),0);assert.deepEqual(warriorsMoment(25),warriorsMoment(25+WARRIORS_CYCLE));
});
test('reset clears selection and allocations, repeated seeks do not drift',()=>{
 const model=createArtifact(T),lid=model.getObjectByName('savings-lid'),mage=model.getObjectByName('mage-selection');
 const glass=model.getObjectByName('bulb-glass').children[0];assert.equal(glass.userData.noShadow,true);assert.equal(glass.castShadow,false);assert.equal(glass.receiveShadow,false);assert.ok(glass.material.transmission>.5);
 assert.equal(mage.visible,false);assert.equal(model.getObjectByName('budget-wheel-0').geometry.drawRange.count,0);assert.equal(model.getObjectByName('utilities-light').children[0].intensity,0);assert.ok(Math.abs(lid.rotation.x)<1e-9);
 model.userData.animate(25);assert.equal(mage.visible,true);assert.equal(model.getObjectByName('budget-wheel-0').geometry.drawRange.count,480);assert.equal(model.getObjectByName('utilities-light').children[0].intensity,5);assert.ok(lid.rotation.x< -1);const pos=model.getObjectByName('allocation-coin-2-0').position.clone();
 model.userData.animate(0);assert.equal(mage.visible,false);assert.equal(model.getObjectByName('budget-stack-2').visible,false);assert.ok(Math.abs(lid.rotation.x)<1e-9);
 model.userData.animate(25);assert.ok(pos.distanceTo(model.getObjectByName('allocation-coin-2-0').position)<1e-9);
 model.userData.animate(34);assert.equal(model.userData.story.pending,500);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}});console.log({meshes,triangles});assert.ok(meshes<220);assert.ok(triangles<450000);
});
