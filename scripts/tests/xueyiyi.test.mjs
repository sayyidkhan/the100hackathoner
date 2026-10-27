import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
for (const edition of [1,2]) test(`Xueyiyi ${edition}: bounded geometry, stage inspection and deterministic animation`,async()=>{
 const {createArtifact}=await import(`../../public/landing/artifacts/xueyiyi-v${edition}.js`);const m=createArtifact(T);
 assert.equal(m.userData.artifactId,edition);
 const display=m.getObjectByName('microlearning-display');assert.ok(display);
 const uv=display.geometry.attributes.uv;assert.ok([...uv.array].every(n=>n>=-0.00001&&n<=1.00001),'rounded screen UVs remain inside the texture');
 const bubbles=m.getObjectByName('lesson-conversation');assert.ok(bubbles);
 let vertices=0;
 m.traverse(o=>{if(o.isMesh){vertices+=o.geometry.attributes.position.count;for(const a of Object.values(o.geometry.attributes))assert.ok(a.array.every(Number.isFinite));}});
 assert.ok(vertices<500000);const size=new T.Box3().setFromObject(m).getSize(new T.Vector3());assert.ok(size.x<9&&size.y<5&&size.z<5);
 const state=t=>{m.userData.animate(t);m.updateMatrixWorld(true);const s=[];m.traverse(o=>s.push(o.visible,o.material?.color?.getHex(),o.material?.opacity,...o.matrixWorld.elements));return s;};
 const start=state(0);assert.deepEqual(state(24),start);
 for(let i=0;i<4;i++){state(i*6+3);assert.equal(m.userData.story.index,i);assert.ok(m.userData.story.detail.length>10);
 assert.equal(bubbles.visible,i===0,'hero illustration only appears on the home screen');
 const dots=[0,1,2,3].map(n=>m.getObjectByName(`lesson-progress-${n}`));
 assert.ok(dots.every(dot=>dot.visible),'inactive milestones stay visible');
 assert.equal(dots.filter(dot=>dot.material===dots[0].material).length,i+1,'completed dots track the current stage');}
 const at8=state(8);state(19);assert.deepEqual(state(8),at8);
 m.userData.setStep(2,30);const fixed=state(30);assert.equal(m.userData.story.index,2);assert.deepEqual(state(60),fixed);
 m.userData.setStep(null,60);assert.deepEqual(state(60),fixed);assert.notDeepEqual(state(68),fixed);
});

test('microlearning sequence waits for a tap before selecting an answer and fades into feedback',async()=>{
 const {xueyiyiMotion}=await import('../../public/landing/artifacts/xueyiyi.js');
 assert.equal(xueyiyiMotion(13).answerSelected,false);
 assert.ok(xueyiyiMotion(13.9).tapOpacity>0);
 assert.equal(xueyiyiMotion(14.2).answerSelected,true);
 assert.equal(xueyiyiMotion(17).transition,0);
 assert.ok(xueyiyiMotion(17.6).transition>0);
 assert.ok(xueyiyiMotion(17.99).transition>.99);
 assert.equal(xueyiyiMotion(18).phase,3);
 assert.deepEqual([6.7,8,9.4].map(t=>xueyiyiMotion(t).takeaway),[0,1,2]);
 assert.deepEqual(xueyiyiMotion(24),xueyiyiMotion(0));
});
