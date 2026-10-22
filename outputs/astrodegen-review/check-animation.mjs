import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/astrodegen.js';
// Geometry/timeline checks only; actual rendering is verified in the browser.
globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},createRadialGradient:()=>({addColorStop(){}}),fillRect(){},fillText(){}})})};
const root=createArtifact(T);
function pose(t){root.userData.animate(t);root.updateMatrixWorld(true);const values=[];root.traverse(o=>{for(const n of [...o.position,...o.quaternion,...o.scale])assert(Number.isFinite(n),'Non-finite pose');values.push(...o.position,...o.quaternion,...o.scale,o.visible?1:0);});return values;}
const phases=[1,7,13,19].map(t=>({t,pose:pose(t)}));

for(const p of phases)assert.deepEqual(pose(p.t),p.pose,'Timeline must be independently seekable');
assert.notDeepEqual(phases[0].pose,phases[1].pose,'Phases must visibly differ');
assert.deepEqual(pose(0),pose(24),'Loop endpoint must repeat exactly');
assert.deepEqual(pose(NaN),pose(0),'Invalid time falls back safely');
let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.count??1);}});
console.log(JSON.stringify({sampleTimes:phases.map(({t})=>t),deterministic:true,finite:true,loop:true,meshes,triangles}));
