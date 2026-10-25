import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact as pest, PESTOVERFLOW_CYCLE, pestMoment} from '../../public/landing/artifacts/pestoverflow.js';
import {createArtifact as grab} from '../../public/landing/artifacts/grabhunt.js';
import {pestSurfaces} from '../../public/landing/artifacts/pestoverflow-surfaces.js';
for(const [title,create,cycle] of [['PestOverflow',pest,PESTOVERFLOW_CYCLE],['GrabHunt',grab,16]]){
 test(`${title}: finite geometry, seekable motion and a seamless cycle`,()=>{
  const root=create(T);let vertices=0;
  root.traverse(o=>{if(o.isMesh){assert(o.material);const p=o.geometry.attributes.position;vertices+=p.count;assert(Array.from(p.array).every(Number.isFinite));}});
  assert(vertices>15000);assert(root.userData.realTimeAnimation);
  const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(o.visible?1:0,...o.matrixWorld.elements));return a;};
  const start=state(0);assert.deepEqual(state(cycle),start);const action=state(5.3);assert.notDeepEqual(action,start);state(11);assert.deepEqual(state(5.3),action);
  for(let t=0;t<cycle;t+=.1)assert(state(t).every(Number.isFinite));
 });
}

test('PestOverflow centres the owner app and keeps resting paws planted',()=>{
 const root=pest(T);root.userData.animate(5.5);root.updateMatrixWorld(true);
 const phone=root.getObjectByName('pestoverflow-owner-phone'),kitchen=root.getObjectByName('pestoverflow-kitchen'),sensor=root.getObjectByName('pestoverflow-room-sensor');
 assert(phone&&kitchen&&sensor);
 const size=o=>new T.Box3().setFromObject(o).getSize(new T.Vector3());
 assert(size(phone).y>size(kitchen).y*1.3,'owner phone must be the dominant vertical form');
 assert(size(sensor).y<size(phone).y*.15,'sensor stays a small part of the property');
 assert(phone.getObjectByName('pestoverflow-app-screen'),'the owner phone contains an integrated app screen');
 const mouse=root.getObjectByName('pestoverflow-field-mouse');
 assert(mouse.getObjectByName('mouse-continuous-coat').geometry.attributes.color,'sculpted coat retains its fur colouring');
 const paws=mouse.children.filter(o=>o.name.includes('-paw-'));
 assert.equal(paws.length,4);
 const rest=paws.map(o=>o.position.toArray());root.userData.animate(8);
 assert.deepEqual(paws.map(o=>o.position.toArray()),rest,'idle animation must not slide the feet');
 root.userData.animate(1.5);assert.notDeepEqual(paws.map(o=>o.position.toArray()),rest,'paws articulate while approaching the sensor');
});

test('PestOverflow detects in the property before informing the owner',()=>{
 const root=pest(T),notice=root.getObjectByName('pestoverflow-owner-alert'),confirmation=root.getObjectByName('pestoverflow-owner-confirmation'),pulse=root.getObjectByName('pestoverflow-notification-pulse'),zone=root.getObjectByName('pestoverflow-detection-zone'),mouse=root.getObjectByName('pestoverflow-field-mouse'),screen=root.getObjectByName('pestoverflow-app-screen');
 for(const t of [0,2,3.99]){root.userData.animate(t);assert.equal(zone.visible,false);assert.equal(notice.visible,false);assert.equal(confirmation.visible,false);assert.equal(pulse.visible,false);assert.equal(screen.userData.phase,'monitoring');}
 root.userData.animate(4);root.updateMatrixWorld(true);assert.equal(zone.visible,true);assert.equal(notice.visible,false);assert.equal(screen.userData.phase,'detected');
 const region=new T.Box3().setFromObject(zone),animal=new T.Box3().setFromObject(mouse);
 assert(animal.max.x>region.min.x&&animal.min.x<region.max.x,'mouse must enter the floor detection zone before the trigger');
 root.userData.animate(5.8);assert.equal(pulse.visible,true);assert.equal(notice.visible,false);assert.equal(root.userData.story.phase,'sending');assert.equal(screen.userData.phase,'sending');
 root.userData.animate(7);assert.equal(pulse.visible,false);assert.equal(notice.visible,true);assert.equal(confirmation.visible,true);assert.equal(root.userData.story.title,'The owner knows where to act');assert.equal(screen.userData.phase,'notified');
 root.userData.animate(17.7);assert.equal(notice.visible,false);assert.equal(zone.visible,false);assert.equal(screen.userData.phase,'monitoring');
 root.userData.animate(PESTOVERFLOW_CYCLE+7);assert.equal(screen.userData.phase,'notified','screen seeking follows the same repeatable clock as the model');
 assert.equal(pestMoment(4).phase,'detected');assert.equal(pestMoment(6.5).phase,'notified');
});

test('PestOverflow mouse route stays in the open floor lane',()=>{
 const root=pest(T),mouse=root.getObjectByName('pestoverflow-field-mouse'),cabinet=root.getObjectByName('pestoverflow-cabinet-bank');
 const centreHeight=mouse.position.y;
 for(let t=0;t<PESTOVERFLOW_CYCLE;t+=.1){
  root.userData.animate(t);root.updateMatrixWorld(true);
  const animal=new T.Box3().setFromObject(mouse),obstacle=new T.Box3().setFromObject(cabinet);
  assert(!animal.intersectsBox(obstacle),'the mouse must not walk through cabinetry');
  assert.equal(mouse.position.y,centreHeight,'route translation must not hover or sink');
  assert(root.userData.story.index>=0&&root.userData.story.index<4);
 }
});

test('PestOverflow integrated app display clears the phone glass and stays unlit',()=>{
 const root=pest(T),phone=root.getObjectByName('pestoverflow-owner-phone'),screen=phone.getObjectByName('pestoverflow-app-screen');
 root.updateMatrixWorld(true);
 assert(screen.material.isMeshBasicMaterial,'app colours and typography should be independent of studio lighting');
 assert.equal(screen.material.toneMapped,false,'tone mapping must not wash out the display');
 assert.equal(screen.userData.noShadow,true,'display should not cast a rectangular shadow');
 assert(screen.geometry.attributes.uv,'screen must have texture coordinates');
 assert.equal(screen.material.map,null,'Node fallback must not require a canvas or DOM');
 const forward=new T.Vector3(0,0,1).transformDirection(phone.matrixWorld);
 // Test the title, camera image and footer regions, leaving the physical notch alone.
 for(const [x,y] of [[0,1.15],[-.55,.45],[.55,.45],[0,-.85]]){
  const point=screen.localToWorld(new T.Vector3(x,y,0));
  const ray=new T.Raycaster(point.clone().addScaledVector(forward,.5),forward.clone().negate());
  const hits=ray.intersectObject(phone,true);
  assert.equal(hits[0]?.object,screen,'the app plane must be the frontmost surface through its content area');
  const backing=hits.find(hit=>hit.object!==screen);
  assert(backing&&backing.distance>hits[0].distance+.001,'the display needs physical clearance above its backing');
 }
});

test('PestOverflow architectural materials have deterministic distinct PBR channels',()=>{
 const first=pestSurfaces(T),second=pestSurfaces(T);
 for(const name of ['oak','stone','plaster']){
  for(const key of ['map','bumpMap','roughnessMap']){
   const texture=first[name][key],data=texture.image.data;
   assert.equal(texture.image.width,512);assert.equal(texture.image.height,512);
   assert.equal(texture.colorSpace,key==='map'?T.SRGBColorSpace:T.NoColorSpace,'only colour values should be decoded as sRGB');
   assert.equal(texture.wrapS,T.RepeatWrapping);assert.equal(texture.wrapT,T.RepeatWrapping);
   assert.equal(texture.generateMipmaps,true,'material detail needs mipmaps to avoid shimmering when zoomed out');
   assert.deepEqual(data,second[name][key].image.data,'random material changes must not occur after reload');
   let min=255,max=0;for(let i=0;i<data.length;i+=4){min=Math.min(min,data[i]);max=Math.max(max,data[i]);assert.equal(data[i+3],255);}
   assert(max-min>8,`${name} ${key} must carry real surface variation`);
  }
  assert.notDeepEqual(first[name].bumpMap.image.data,first[name].roughnessMap.image.data,'height and roughness describe different physical characteristics');
 }
});
