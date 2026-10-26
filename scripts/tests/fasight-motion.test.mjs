import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,fasightMoment,fasightPaperHeight} from '../../public/landing/artifacts/fasight.js';

test('Fasight nib follows the ink and returns to its cradle before turning a page',()=>{
 const root=createArtifact(T),pen=root.getObjectByName('fasight-writing-pen'),pages=root.getObjectByName('fasight-written-ledger'),turn=root.getObjectByName('fasight-turning-page');
 const seek=t=>{root.userData.animate(t);root.updateMatrixWorld(true);};
 seek(0);const rest=pen.matrixWorld.toArray();
 for(const time of [1.2,2.2,3.1,6.2,12.2,18.1]){
  seek(time);const s=fasightMoment(time);assert.equal(s.pen,1);
  const point=(row,u)=>{const x=-1.31+(845+590*u)/1536*2.62,y=1.325-(623+row*235)/1536*2.65;return new T.Vector3(x,y,.005+fasightPaperHeight(x,y));};
  const expected=point(s.row,s.stroke);
  if(s.bridge>0&&s.row<2){expected.lerp(point(s.row+1,0),s.bridge);expected.z+=Math.sin(s.bridge*Math.PI)*.16;}
  pages.localToWorld(expected);const actual=pen.localToWorld(new T.Vector3(-1.10,0,0));
  assert(actual.distanceTo(expected)<1e-6,'nib must contact the revealed rule, or lift on the connector');
  assert.equal(pages.userData.section,s.phase);assert.equal(pages.userData.progress,s.ink);
 }
 for(const time of [4.6,9.6,14.6,19.6]){seek(time);assert(turn.visible);assert.deepEqual(pen.matrixWorld.toArray(),rest,'turning pages must not collide with the writing pen');}
 seek(5);assert(!turn.visible);assert.equal(pages.userData.section,1);
 seek(20);assert.deepEqual(pen.matrixWorld.toArray(),rest);assert.equal(pages.userData.progress,0);
});

test('Fasight connections build along branches and remain steady during review',()=>{
 const root=createArtifact(T),branch=root.getObjectByName('fasight-branch-light-4'),windows=root.getObjectByName('fasight-home-windows');
 root.userData.animate(2);assert(!branch.visible);assert(!windows.visible);
 root.userData.animate(7);assert(windows.visible);assert(!branch.visible);
 root.userData.animate(11.2);const partial=branch.geometry.drawRange.count;assert(branch.visible);assert(partial>0&&partial<branch.geometry.index.count);
 root.userData.animate(14);assert.equal(branch.geometry.drawRange.count,branch.geometry.index.count);
 for(let i=0;i<5;i++)assert(root.getObjectByName(`fasight-person-${i}`).visible);
 root.userData.animate(18);assert.equal(branch.geometry.drawRange.count,branch.geometry.index.count);
 root.userData.animate(0);assert(!branch.visible);assert(!windows.visible);
});
