import test from 'node:test';import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {journeyMoment} from '../../public/landing/artifacts/storybook-journey.js';
import {createArtifact} from '../../public/landing/artifacts/storybook.js';
import {geometryAOHash} from '../../public/landing/artifacts/storybook-surface.js';
test('Bob stops to draw, only passes the barrier after opening it, reaches home before fading',()=>{let previous=0;for(let t=0;t<48;t+=.1){const s=journeyMoment(t);assert.ok(s.progress>=previous);previous=s.progress;if(s.drawing)assert.equal(s.walking,false);if(s.progress>.79)assert.equal(s.door,1);}for(const [a,b] of [[5,9.9],[16,20.9],[28,33.9]])assert.equal(journeyMoment(a).progress,journeyMoment(b).progress);assert.equal(journeyMoment(42).progress,1);assert.equal(journeyMoment(42).fade,1);assert.equal(journeyMoment(47.5).fade,0);assert.deepEqual(journeyMoment(48),journeyMoment(0));});
test('animated actors do not alter the baked environment; seeking is deterministic',()=>{const environment=createArtifact(T,{bake:true}),model=createArtifact(T);const hashes=root=>root.children.filter(o=>o.isMesh).map(o=>geometryAOHash(o.geometry));assert.deepEqual(hashes(model),hashes(environment));const bob=model.getObjectByName('bob');model.userData.animate(12);const expected=bob.position.clone();for(const t of [0,29,43,18,95,12]){model.userData.animate(t);model.updateMatrixWorld(true);model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));}assert.ok(bob.position.distanceTo(expected)<1e-9);model.userData.animate(42);assert.equal(model.userData.story.title,'Safe at home');assert.ok(model.getObjectByName('drawn-friend').visible===true);});
test('door is drawn first, then appears, then opens, before Bob walks through',()=>{
 const model=createArtifact(T),gate=model.getObjectByName('drawn-doorway'),leaf=model.getObjectByName('door-leaf');
 for(const t of [0,7,20,28,30,31.5,32]){model.userData.animate(t);assert.equal(gate.visible,false,`door must not exist at ${t}s`);}
 assert.equal(journeyMoment(31.5).draw,1);
 model.userData.animate(32.5);assert.equal(gate.visible,true);assert.ok(Math.abs(leaf.rotation.y)<1e-9);assert.equal(model.userData.story.walking,false);
 model.userData.animate(33.5);assert.ok(leaf.rotation.y<0);assert.equal(model.userData.story.walking,false);
 model.userData.animate(34);assert.equal(journeyMoment(34).door,1);assert.equal(model.userData.story.walking,true);
 model.userData.animate(48);assert.equal(gate.visible,false);
});
test('action has a close camera and enlarged sketches, with a full-book ending',()=>{
 const model=createArtifact(T);model.userData.animate(8);assert.ok(model.userData.cameraCue.distance<=.55);assert.equal(model.getObjectByName('bob').scale.x,1.4);assert.equal(model.getObjectByName('sketch-friend').scale.x,2.1);
 model.userData.animate(45);assert.equal(model.userData.cameraCue.distance,1);
});
