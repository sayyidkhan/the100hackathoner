import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createRiverLandform } from '../../public/landing/artifacts/two-rivers-terrain.js';
const land=createRiverLandform(T,()=>.5);
test('estuary opens wider than the old 1.3-unit channel',()=>{
  const wet=[];for(let x=-2;x<=2;x+=.01)if(land.height(x,2.1)<land.waterY)wet.push(x);
  assert.ok(wet.at(-1)-wet[0]>2.5);
});
test('both tributary mouths remain open at the island edge',()=>{
  for(const side of [-1,1])assert.ok(land.height(side*3.2,-1.2)<land.waterY);
});
test('boats stay in water throughout all three routes',()=>{
  for(const route of land.routes)for(let i=0;i<=100;i++){const p=route.getPoint(i/100);assert.ok(land.height(p.x,p.z)<land.waterY);}
});
test('pavilions and the central tree stay on raised ground',()=>{
  for(const [x,z] of [[-2.26,.38],[2.2,1.18],[-.16,-.64]])assert.ok(land.height(x,z)>land.waterY);
});
