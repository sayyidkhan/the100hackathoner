import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,foodMoment,FOOD_CYCLE} from '../../public/landing/artifacts/smart-food-bridge.js';
import {foodScreenState,FOOD_MENUS} from '../../public/landing/artifacts/food-bridge-screen.js';

test('menu discovery, filtering, dish details and directions preserve the same selected destination',()=>{
 const root=createArtifact(T),screen=root.getObjectByName('food-phone-screen'),badge=root.getObjectByName('food-diet-match');
 const pages=['discover','preferences','dish','directions'];
 for(const [i,time] of [3,9,15,22.5].entries()){
  root.userData.animate(time);const state=foodScreenState(foodMoment(time));
  assert.equal(state.page,pages[i]);assert.equal(screen.userData.page,state.page);
  assert.equal(badge.visible,i>=2);assert.equal(state.preference,i>=1?'Vegetarian':null);
  assert.deepEqual(state.visibleIds,i>=2?['garden']:FOOD_MENUS.map(m=>m.id));
  assert.equal(state.selectedId,i>=2?'garden':null);assert.equal(state.routeProgress,i===3?1:0);
 }
 root.userData.animate(24);assert(!badge.visible);assert.equal(screen.userData.selectedId,null);
});

test('dietary preference precedes matching; the destination pin drops only after route arrival',()=>{
 assert.equal(foodMoment(3).filter,0);assert.equal(foodMoment(9).filter,1);assert.equal(foodMoment(9).match,0);
 assert.equal(foodMoment(15).match,1);assert.equal(foodMoment(15).route,0);
 for(let t=18;t<21;t+=.1){const s=foodMoment(t);assert.equal(s.pin,0);assert(s.route<1);}
 assert.equal(foodMoment(21).route,1);assert.equal(foodMoment(21).pin,0);assert.equal(foodMoment(22.5).pin,1);
 assert.deepEqual(foodMoment(0),foodMoment(FOOD_CYCLE));assert(foodMoment(23.9).fade<.05);
});

test('screen, selected route and markers agree, with deterministic seeking and manual inspection',()=>{
 const root=createArtifact(T),route=root.getObjectByName('food-selected-route'),pin=root.getObjectByName('food-marker-1'),screen=root.getObjectByName('food-phone-screen');
 const snapshot=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const objects=[];root.traverse(o=>objects.push(o.visible,...o.matrixWorld.elements,...(o.material?[o.material.opacity]:[])));return [objects,route.geometry.drawRange.count,screen.userData.phase,screen.userData.matched];};
 root.userData.animate(3);assert(!pin.visible);assert(!route.visible);assert.equal(screen.userData.matched,false);
 root.userData.animate(15);assert(pin.visible);assert(!route.visible);assert.equal(screen.userData.phase,2);const raised=pin.position.y;
 root.userData.animate(20);assert(route.visible);assert(route.geometry.drawRange.count<route.geometry.index.count);assert.equal(pin.position.y,raised);
 root.userData.animate(22.5);assert.equal(route.geometry.drawRange.count,route.geometry.index.count);assert(Math.abs(pin.position.y-raised+.4)<1e-6);
 const start=snapshot(0),middle=snapshot(19.2);snapshot(23.8);assert.deepEqual(snapshot(19.2),middle);assert.deepEqual(snapshot(24),start);
 root.userData.setStep(3,30);const held=snapshot(30);assert.deepEqual(snapshot(50),held);root.userData.setStep(null,50);assert.deepEqual(snapshot(50),held);assert.notDeepEqual(snapshot(54),held);
});

test('food court retains finite indexed geometry within the real-time scene budget',()=>{
 const root=createArtifact(T);let meshes=0,triangles=0;
 root.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;for(const a of Object.values(g.attributes))assert(a.array.every(Number.isFinite));if(g.index)assert(g.index.array.every(i=>i>=0&&i<g.attributes.position.count));});
 assert(meshes<60);assert(triangles<450000);assert.equal(root.userData.artifactId,14);assert.equal(root.userData.autoOrbit,false);
});

test('motion remains visible within each stage and manual inspection freezes it deterministically',()=>{
 const root=createArtifact(T),steam=root.getObjectByName('food-steam-0-0'),scan=root.getObjectByName('food-menu-scan-0'),halo=root.getObjectByName('food-match-halo');
 root.userData.animate(.3);const vapor=steam.position.clone(),angle=scan.rotation.z;assert(scan.visible);
 root.userData.animate(.9);assert(!steam.position.equals(vapor));assert.notEqual(scan.rotation.z,angle);
 root.userData.animate(2.5);assert(!scan.visible);assert(root.getObjectByName('food-menu-scan-1').visible);
 root.userData.animate(15);const size=halo.scale.x;root.userData.animate(15.4);assert.notEqual(halo.scale.x,size);
 root.userData.setStep(2,20);const held=steam.position.clone();root.userData.animate(30);assert(steam.position.equals(held));
 root.userData.setStep(null,30);root.userData.animate(30.3);assert(!steam.position.equals(held));
});
