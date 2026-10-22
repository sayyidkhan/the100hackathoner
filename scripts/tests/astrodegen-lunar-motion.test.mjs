import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/astrodegen.js';

// Canvas stubs only supply procedural texture pixels; verify WebGL in-browser.
globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},createRadialGradient:()=>({addColorStop(){}}),fillRect(){},fillText(){},clearRect(){},setTransform(){}})})};
const root=createArtifact(T),scope=root.getObjectByName('lunar-tracking-telescope'),dome=root.getObjectByName('lunar-tracking-dome');
const moons=[];root.traverse(o=>{if(o.geometry?.attributes.lunarDirection)moons.push(o);});
assert.equal(moons.length,1,'Exactly one moon in the scene');
const moon=moons[0];
const up=new T.Vector3(0,1,0),aperture=new T.Vector3(Math.cos(Math.PI-2.575),0,Math.sin(Math.PI-2.575));
function pose(time){
  root.userData.animate(time);root.updateMatrixWorld(true);
  return [...scope.quaternion,...dome.quaternion,...moon.position,moon.material.opacity,moon.visible,...moon.userData.sunlight.value];
}
for(let time=0;time<24;time+=.1){
  pose(time);
  const target=moon.getWorldPosition(new T.Vector3()).sub(scope.getWorldPosition(new T.Vector3())).normalize();
  const barrel=up.clone().applyQuaternion(scope.getWorldQuaternion(new T.Quaternion()));
  assert(barrel.dot(target)>0.999999,'Telescope must track the moving moon');
  const slot=aperture.clone().applyQuaternion(dome.quaternion);
  target.y=0;target.normalize();
  assert(slot.dot(target)>0.999999,'Dome aperture must follow barrel azimuth');
}
// Integrate the visible lunar disk: new/full/quarters must change coverage,
// not merely spin a fixed painted half around the vertical axis.
function litFraction(time){
  pose(time);const sun=moon.userData.sunlight.value;let lit=0,total=0;
  for(let x=-.99;x<1;x+=.02)for(let y=-.99;y<1;y+=.02){
    if(x*x+y*y>=1)continue;total++;
    if(new T.Vector3(x,y,Math.sqrt(1-x*x-y*y)).dot(sun)>0)lit++;
  }
  return lit/total;
}
function timeAt(progress){let lo=0,hi=22;for(let i=0;i<50;i++){const mid=(lo+hi)/2,u=mid/22;if(u*u*(3-2*u)<progress)lo=mid;else hi=mid;}return (lo+hi)/2;}
assert(litFraction(0)<.01,'New moon at left horizon');
assert(Math.abs(litFraction(timeAt(.25))-.5)<.02,'Waxing quarter');
assert(litFraction(11)>.99,'Full moon at arc midpoint');
assert(Math.abs(litFraction(timeAt(.75))-.5)<.02,'Waning quarter');
assert(litFraction(22)<.01,'New moon at right horizon');
let previousX=-Infinity;
for(let t=0;t<=22;t+=.1){pose(t);assert(moon.position.x>=previousX,'Visible pass moves only left to right');previousX=moon.position.x;}
for(let t=22;t<23.4;t+=.05){pose(t);assert.equal(moon.visible,false,'Return crossing must be hidden');}
pose(23.7);assert.equal(moon.position.x,-2.05,'Fade-in is stationary at the left');
const sampled=pose(7.5);pose(19);assert.deepEqual(pose(7.5),sampled,'Independent seeking');
assert.deepEqual(pose(24),pose(0),'Seamless loop');
assert.deepEqual(pose(NaN),pose(0),'Invalid time fallback');
for(let t=0;t<24;t+=.1)assert(pose(t).filter(v=>typeof v==='number').every(Number.isFinite),'Finite animation');
console.log('PASS: one moon, left-to-right transit, hidden return, phase coverage, telescope tracking, dome alignment, deterministic loop');
