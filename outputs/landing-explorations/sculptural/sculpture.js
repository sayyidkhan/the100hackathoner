import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createSculpture(host,reduced){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0xeeefeb,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;host.append(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(33,1,.1,100);camera.position.set(5.4,5.8,16.5);camera.lookAt(0,2.25,0);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 const key=new THREE.DirectionalLight(0xffffff,5);key.position.set(-5,11,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.04;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0x9babff,2);fill.position.set(8,3,-5);scene.add(fill);scene.add(new THREE.HemisphereLight(0xffffff,0x77809c,2));
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.ShadowMaterial({color:0x283048,opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.16;floor.receiveShadow=true;scene.add(floor);
 const blue=new THREE.MeshPhysicalMaterial({color:0x0628ef,metalness:.65,roughness:.16,clearcoat:1,clearcoatRoughness:.11,envMapIntensity:1.4});
 const blueDark=new THREE.MeshPhysicalMaterial({color:0x122bdd,metalness:.6,roughness:.22,clearcoat:1,envMapIntensity:1.5});
 const group=new THREE.Group();scene.add(group);group.position.set(-.2,.65,0);group.rotation.set(.015,-.16,-.055);
 function rounded(path,x,y,w,h,r){path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);return path;}
 const zero=rounded(new THREE.Shape(),-1.52,0,3.04,5.3,1.45);const hole=rounded(new THREE.Path(),-.66,.89,1.32,3.52,.66);zero.holes.push(hole);
 const one=new THREE.Shape();one.moveTo(-.83,0);one.lineTo(1.07,0);one.lineTo(1.07,5.3);one.lineTo(-.17,5.3);one.lineTo(-1.57,4.19);one.lineTo(-.84,3.22);one.lineTo(-.22,3.72);one.lineTo(-.22,.73);one.lineTo(-.83,.73);one.closePath();
 const opts={depth:1.12,bevelEnabled:true,bevelSegments:9,steps:1,bevelSize:.23,bevelThickness:.23,curveSegments:36};
 const oneMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(one,opts),[blue,blueDark]);oneMesh.position.set(-4.45,0,0);oneMesh.castShadow=true;oneMesh.receiveShadow=true;group.add(oneMesh);
 const zeroGeometry=new THREE.ExtrudeGeometry(zero,opts);for(const x of [-.7,3.03]){const mesh=new THREE.Mesh(zeroGeometry,[blue,blueDark]);mesh.position.x=x;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 // A brushed-aluminium base turns the digits into a single physical exhibit.
 const plinth=new THREE.Mesh(new THREE.BoxGeometry(12.2,.11,3.8),new THREE.MeshPhysicalMaterial({color:0xd9dce0,metalness:.55,roughness:.31}));plinth.position.set(-.25,-.4,.5);plinth.castShadow=true;plinth.receiveShadow=true;group.add(plinth);
 // Soft contact shadow, drawn locally; no remote textures or image assets.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(128,64,4,128,64,118);gradient.addColorStop(0,'rgba(18,25,50,.32)');gradient.addColorStop(1,'rgba(18,25,50,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,128);const contact=new THREE.Mesh(new THREE.PlaneGeometry(16,7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(0,-.14,1);scene.add(contact);
 let targetX=0,targetY=0,visible=true,frame=0,last=0;const mobile=()=>host.clientWidth<800;
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobile()?43:33;camera.position.z=mobile()?24:16.5;camera.lookAt(0,2.25,0);camera.updateProjectionMatrix();render(0);}
 function render(time){group.rotation.y+=(targetX*.13-.16-group.rotation.y)*.045;group.rotation.x+=(targetY*.05+.015-group.rotation.x)*.045;group.rotation.z=-.055+(reduced.matches?0:Math.sin(time*.00022)*.011);renderer.render(scene,camera);}
 function loop(time){frame=0;if(!visible||document.hidden||reduced.matches)return;if(time-last>32){render(time);last=time;}frame=requestAnimationFrame(loop);}
 function start(){if(!frame&&visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(loop);else render(0);}
 host.closest('.hero').addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType==='touch')return;const r=host.getBoundingClientRect();targetX=(event.clientX-r.left)/r.width-.5;targetY=(event.clientY-r.top)/r.height-.5;});
 host.closest('.hero').addEventListener('pointerleave',()=>{targetX=targetY=0;});
 new ResizeObserver(resize).observe(host);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();},{rootMargin:'100px'}).observe(host);document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.classList.remove('webgl-ready');renderer.domElement.style.display='none';visible=false;});
 resize();host.classList.add('webgl-ready');start();
}
