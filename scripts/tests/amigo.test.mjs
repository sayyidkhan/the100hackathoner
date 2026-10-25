import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/amigo.js';

test('Amigo geometry is finite and its conversation has a deterministic seamless loop',()=>{
 const root=createArtifact(T);let vertices=0;
 root.traverse(o=>{if(!o.isMesh)return;assert(o.material);const p=o.geometry.attributes.position;vertices+=p.count;for(const v of p.array)assert(Number.isFinite(v));});
 assert(vertices>100000);assert(root.userData.realTimeAnimation);assert.equal(root.userData.artifactId,26);
 const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(o.visible?1:0,...o.matrixWorld.elements));return a;};
 const initial=state(0);assert.deepEqual(state(14),initial);
 const greeting=state(2.5),reply=state(6.5),card=state(10);
 assert.notDeepEqual(greeting,initial);assert.notDeepEqual(reply,greeting);assert.notDeepEqual(card,reply);
 state(12);assert.deepEqual(state(2.5),greeting);
 for(let t=0;t<28;t+=.1)assert(state(t).every(Number.isFinite));
});

test('Café greetings exchange a message before the vocabulary cards rise',()=>{
 const root=createArtifact(T),animate=root.userData.animate;
 const message=root.getObjectByName('amigo-exchange');
 const hello=root.getObjectByName('amigo-greeting'),hola=root.getObjectByName('amigo-reply');
 const card=root.getObjectByName('amigo-word-1');
 animate(0);const restingY=card.position.y;assert.equal(message.visible,false);
 animate(2);const outgoingX=message.position.x;assert(message.visible);assert(hello.scale.x>hola.scale.x);
 animate(3.5);assert(message.position.x>outgoingX);
 animate(5.8);const incomingX=message.position.x;assert(hola.scale.x>hello.scale.x);
 animate(7.6);assert(message.position.x<incomingX);
 animate(10);assert.equal(message.visible,false);assert(card.position.y>restingY+.18);
 animate(14);assert.equal(card.position.y,restingY);assert.equal(message.visible,false);
 assert(root.userData.framingPoints.every(p=>[p.x,p.y,p.z].every(Number.isFinite)));
});
