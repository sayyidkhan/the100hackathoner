import {medivoiceStudio} from './medivoice-studio.js';
import {shoeMoment,TRIBUTES} from './shoe-timing.js';
import {shoeScreen} from './shoe-screen.js';
import {applyObservatoryAO} from './astrodegen-occlusion.js';
import {craftedShoe} from './shoe-craft.js';

export function createArtifact(T,{bake=false,occlusionBake=false}={}){
 const kit=medivoiceStudio(T),{root,materials:m,mesh,batch}=kit;
 // Tactile surfaces use restrained, multi-scale grain, not repeating stripes.
 function surface(kind){const n=512,data=new Uint8Array(n*n*4);let seed=28;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let value=225;
 if(kind==='wood'){const bend=y+14*Math.sin(x*.008)+5*Math.sin(x*.025+y*.009);const rings=Math.sin(bend*.095+2*Math.sin(bend*.027));value=203+16*rings+5*Math.sin(bend*.49)+3*Math.sin(bend*1.8)+(rnd()-.5)*10;}
 if(kind==='mesh')value=225-65*Math.pow(Math.sin(x*Math.PI/5)*Math.sin(y*Math.PI/5),8)+(rnd()-.5)*13;
 if(kind==='leather')value=216+(rnd()-.5)*46+8*Math.sin(x*.05)*Math.sin(y*.06);
 if(kind==='stone')value=225+(rnd()-.5)*27+6*Math.sin(x*.022+y*.019)+(rnd()<.006?-55:0);
 if(kind==='silk')value=235+(rnd()-.5)*10+(x%2===0?-3:0)+(y%2===0?-2:0);
 const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,value));data[i+3]=255;}
 const map=new T.DataTexture(data,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;map.anisotropy=4;return map;}
 const maps={wood:surface('wood'),mesh:surface('mesh'),leather:surface('leather'),stone:surface('stone'),silk:surface('silk')};
 for(const[k,color]of Object.entries({wood:0x61452f,woodInset:0x38261b,ivory:0xd9ceb6,lace:0xe6d9bc,stitch:0xc8b695,rubber:0xbeb29a,tread:0x454237,dark:0x252821,brass:0xac8747,stone:0xe6dcc6,lining:0xe7d5b3,leaf:0x425039,petal:0xece2cb,wear:0xa4977d,meshFabric:0xffffff,leather:0xffffff})){
 const map=maps[k==='wood'||k==='woodInset'?'wood':k==='stone'?'stone':k==='meshFabric'?'mesh':k==='leather'?'leather':k==='lining'||k==='lace'?'silk':'leather'];
 m[k]=new T.MeshStandardMaterial({color,roughness:k==='brass'?.28:k==='wood'?.29:k==='lining'?.86:.78,metalness:k==='brass'?.78:0,map:k==='brass'?null:map,bumpMap:k==='brass'?null:map,bumpScale:k==='wood'?.008:k==='stone'?.025:.009});}
 if(typeof window!=='undefined'){
   const walnut=new T.TextureLoader().load(new URL('../assets/shoe-walnut-v1.webp',import.meta.url).href,()=>{
     if(root.userData.disposed){walnut.dispose();return;}root.userData.requestRender?.();
   });
   walnut.colorSpace=T.SRGBColorSpace;walnut.wrapS=walnut.wrapT=T.RepeatWrapping;walnut.repeat.set(.55,.55);walnut.anisotropy=8;
   for(const key of ['wood','woodInset']){m[key].map=walnut;m[key].bumpMap=walnut;m[key].bumpScale=.012;m[key].color.setHex(key==='wood'?0xffffff:0xbca58c);}
 }
 m.glow=new T.MeshBasicMaterial({color:0xeac488,transparent:true,opacity:.50});
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function round(w,h,d,x,y,z,key,p=root,r=.04){const s=new T.Shape();r=Math.min(r,w/2,h/2);s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.016,bevelThickness:.016,bevelSegments:3,curveSegments:16}),key,p);o.position.set(x,y,z);return o;}
 const slab=(w,d,h,x,y,z,key,p=root,r=.08)=>{const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;};
 const tube=(pts,r,key,p=root)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(q=>new T.Vector3(...q))),Math.max(12,pts.length*3),r,6,false),key,p);
 function label(text,w,h,x,y,z,p=root){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.font=`${c.height*.68}px Georgia`;ctx.fillStyle='#f1dfb9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,c.height/2,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,toneMapped:false}));o.position.set(x,y,z);p.add(o);}
 slab(10.4,5.5,.34,0,-.12,0,'stone',root,.7);slab(10.12,5.24,.06,0,-.18,0,'wood',root,.62);
 round(3.5,.35,.045,0,.025,2.76,'brass');label('Shoe Obituaries',3.2,.27,0,.025,2.83);
 // Gathered lining is a continuous sewn surface with actual folds and UVs.
 function lining(p){const pts=[],uv=[],ix=[],nx=64,nz=36;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=(i/nx-.5)*2.88,z=(j/nz-.5)*1.55,edge=Math.pow(Math.max(Math.abs(x)/1.44,Math.abs(z)/.775),6);const ruffle=edge*(.040*Math.sin(x*13+z*8+2*Math.sin(z*5))+.022*Math.sin(z*19-x*4));const crease=.014*Math.sin(x*13+z*4)*Math.sin(z*6+.3);const y=.23+edge*.30+ruffle+crease;pts.push(x,y,z);uv.push(i/nx*2,j/nz*2);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;ix.push(a,b,a+1,a+1,b,b+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh(g,'lining',p);}
 const bays=TRIBUTES.map((tribute,index)=>{
 const bay=group((index-1)*3.31,.28,index===1?.15:0);bay.rotation.y=(index-1)*-.035;
 const coffin=group(0,0,.44,bay);coffin.name=`tribute-${tribute.name}`;
 slab(3.12,1.86,.12,0,.03,0,'wood',coffin);
 for(const z of [-.9,.9])round(3.12,1.37,.11,0,.74,z,'wood',coffin);
 for(const x of [-1.5,1.5]){const side=round(1.8,1.37,.10,x,.74,0,'wood',coffin);side.rotation.y=Math.PI/2;}
 round(2.83,.80,.025,0,.62,1.018,'woodInset',coffin);round(2.68,.70,.026,0,.62,1.048,'wood',coffin);
 for(const y of [.22,1.02])tube([[-1.37,y,1.078],[1.37,y,1.078]],.008,'brass',coffin);
 for(const x of [-1.37,1.37])tube([[x,.22,1.078],[x,1.02,1.078]],.008,'brass',coffin);
 for(const x of [-1.37,1.37])for(const z of [-.73,.73]){const foot=mesh(new T.CylinderGeometry(.09,.12,.13,24),'brass',coffin);foot.position.set(x,-.03,z);}
 lining(coffin);
 // Upholstery climbs the inner walls to the rim; gathered folds have real depth.
 const upholstery=group(0,0,0,coffin);upholstery.name=`cushion-${index}`;
 for(const side of [-1,1])for(const axis of ['x','z']){
   const positions=[],uv=[],indices=[],nu=72,nv=18;
   for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++){
     const a=u/nu,b=v/nv,fold=Math.pow(Math.sin(a*Math.PI*14+.6*Math.sin(a*19)),2);
     const puff=Math.sin(b*Math.PI)*(.045+.055*fold);
     const y=.24+b*1.12;
     positions.push(axis==='x'?side*(1.38-puff):(a-.5)*2.76,y,axis==='z'?side*(.858-puff*.22):(a-.5)*1.636);
     uv.push(a*3,b);
   }
   for(let v=0;v<nv;v++)for(let u=0;u<nu;u++){const a=v*(nu+1)+u,b=a+nu+1;indices.push(a,a+1,b,a+1,b+1,b);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
   const wall=mesh(g,'lining',upholstery);wall.material.side=T.DoubleSide;
 }
 for(const z of [-.85,.85])tube([[-1.37,1.34,z],[0,1.34,z],[1.37,1.34,z]],.035,'lining',upholstery);
 for(const x of [-1.37,1.37])tube([[x,1.34,-.85],[x,1.34,0],[x,1.34,.85]],.035,'lining',upholstery);
 // Extend the body depth and its matching cover by the same factor.
 // Bake the depth transform into each static part before adding the hinge.
 const depthScale=1.5;
 for(const part of coffin.children)part.applyMatrix4(new T.Matrix4().makeScale(1,1,depthScale));
 // A single rear-hinged wooden lid, with an upholstered inset on its underside.
 const lid=group(0,1.46,-1.35,coffin);lid.name=`lid-${index}`;lid.scale.z=depthScale;
 slab(3.24,1.95,.095,0,0,.975,'wood',lid);
 for(const x of [-1.47,1.47])slab(.12,1.76,.045,x,-.065,.925,'woodInset',lid,.025);
 for(const z of [.08,1.77])slab(2.94,.12,.045,0,-.065,z,'woodInset',lid,.025);
 const padPositions=[],padUV=[],padIndices=[],px=48,pz=24;
 for(let j=0;j<=pz;j++)for(let i=0;i<=px;i++){
   const u=i/px,v=j/pz,envelope=Math.pow(Math.sin(u*Math.PI)*Math.sin(v*Math.PI),.55);
   const edgeWrinkle=.035*(Math.exp(-v*12)+Math.exp(-(1-v)*12))*Math.sin(u*45+Math.sin(u*17));
   padPositions.push((u-.5)*2.80,-.046-envelope*(.035+edgeWrinkle),.925+(v-.5)*1.50);
   padUV.push(u,v);
 }
 for(let j=0;j<pz;j++)for(let i=0;i<px;i++){const a=j*(px+1)+i,b=a+px+1;padIndices.push(a,a+1,b,a+1,b+1,b);}
 const padded=new T.BufferGeometry();padded.setAttribute('position',new T.Float32BufferAttribute(padPositions,3));padded.setAttribute('uv',new T.Float32BufferAttribute(padUV,2));padded.setIndex(padIndices);padded.computeVertexNormals();
 const ui=shoeScreen(T,tribute);
 const inset=group(0,0,0,lid);inset.name=`tribute-card-${index}`;
 m[`memorial-${index}`]=new T.MeshStandardMaterial({color:0xffffff,map:ui.map,roughness:.88,roughnessMap:ui.roughnessMap,bumpMap:ui.bumpMap??maps.silk,bumpScale:.004});
 mesh(padded,`memorial-${index}`,inset);
 // Soft bolsters surround the inscription, with a sewn cord along the outer edge.
 for(const z of [.17,1.68])tube([[-1.32,-.065,z],[0,-.065,z],[1.32,-.065,z]],.075,'lining',inset);
 for(const x of [-1.34,1.34])tube([[x,-.065,.20],[x,-.065,.925],[x,-.065,1.65]],.075,'lining',inset);
 for(const z of [.175,1.675])tube([[-1.40,-.05,z],[1.40,-.05,z]],.010,'lace',lid);
 for(const x of [-1.40,1.40])tube([[x,-.05,.175],[x,-.05,1.675]],.010,'lace',lid);
 // Alternating hinge knuckles share the exact rotation axis.
 for(const x of [-1.12,1.12]){
   round(.25,.15,.016,x,1.36,-1.3875,'brass',coffin,.015);
   slab(.25,.18,.018,x,-.028,.13,'brass',lid,.015);
   for(let k=0;k<5;k++){const hinge=mesh(new T.CylinderGeometry(.037,.037,.046,16),'brass',k%2?lid:coffin);hinge.rotation.z=Math.PI/2;hinge.position.set(x+(k-2)*.047,k%2?0:1.46,k%2?0:-1.35);}
 }
 // Folding brass stays use two fixed-length links; they follow the lid without stretching.
 const stays=group(0,0,0,coffin);stays.name=`lid-stays-${index}`;
 const links=[-1,1].map(side=>{
   const arm1=group(0,0,0,stays),arm2=group(0,0,0,stays);
   for(const arm of [arm1,arm2]){const rod=mesh(new T.CylinderGeometry(.013,.013,1.05,12),'brass',arm);rod.position.y=.525;}
   return {side,arm1,arm2};
 });
 const shoe=group(0,.245,.025,coffin);shoe.name=`shoe-${index}`;
 // A matched left/right pair, toes facing forward, comfortably inside the lining.
 for(const [side,foot]of [[-1,'left'],[1,'right']]){
   const sneaker=craftedShoe(T,kit,shoe,tribute.color,index===2);
   sneaker.name=`${foot}-shoe-${index}`;
   sneaker.scale.set(.80,.72,side*.98);
   sneaker.position.set(side*.64,0,side*.03);
   sneaker.rotation.y=Math.PI/2+side*.045;
 }
 const active=group(0,0,0,coffin);active.name=`active-${index}`;for(const z of [-1.455,1.545])tube([[-1.48,-.03,z],[1.48,-.03,z]],.022,'glow',active);
 // Name engraved on the front remains visible even while the lid closes.
 round(.95,.22,.025,0,.62,1.62,'brass',coffin);label(tribute.name,.80,.17,0,.62,1.685,coffin);
 return {bay,shoe,lid,ui,active,links};});
 // White rose with curled, thin petals rather than a cluster of round balls.
 const rose=group(-.5,.28,2.48);tube([[-1.15,0,.02],[-.1,.02,-.03],[1.25,.08,0]],.017,'leaf',rose);
 for(let j=0;j<7;j++){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(.13,.21,.4,.22,.53,0);s.bezierCurveTo(.3,-.13,.12,-.13,0,0);const o=mesh(new T.ShapeGeometry(s,12),'leaf',rose);o.material.side=T.DoubleSide;o.rotation.set(-Math.PI/2,0,j%2?1:-1);o.position.set(-.6+j*.20,.04,j%2?.02:-.02);}
 const bloom=group(-1.1,.23,.02,rose);bloom.rotation.set(.72,0,-.25);bloom.scale.setScalar(1.05);for(let j=0;j<25;j++){const p=[],ix=[],r=.04+Math.floor(j/5)*.042,a=j*2.4;for(let y=0;y<=10;y++)for(let x=0;x<=12;x++){const u=(x/12-.5)*Math.PI*(.68+.09*Math.sin(j)),v=y/10;const ring=Math.floor(j/5),open=.045+ring*.026,rr=.025+r*v+open*v*v;const height=(.32-ring*.018)*v-.075*Math.pow(v,4);p.push(Math.sin(u)*rr,height+.035*Math.cos(u*2+j)*v*v,Math.cos(u)*rr-.025);}
 for(let y=0;y<10;y++)for(let x=0;x<12;x++){const q=y*13+x;ix.push(q,q+1,q+13,q+1,q+14,q+13);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();const o=mesh(g,'petal',bloom);o.material.side=T.DoubleSide;o.rotation.y=a;}
 batch(root);
 // Ambient contact on architecture plus intrinsic shading on each moving assembly.
 root.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial)o.userData.observatoryAO=true;});
 for(const bay of bays)for(const link of bay.links)for(const arm of [link.arm1,link.arm2])arm.traverse(o=>{delete o.userData.observatoryAO;});
 let selected=null,offset=0;
 const animate=time=>{const s=shoeMoment(Math.max(0,time-offset),selected);root.userData.story=s;
 bays.forEach((b,i)=>{const active=!s.overview&&s.index===i;
 // Shoes remain seated; the lid itself reveals each tribute.
 b.lid.rotation.x=s.openness[i]===0?0:-1.92*s.openness[i];
 for(const link of b.links){
   const start=new T.Vector3(link.side*1.41,1.06,-.975);
   const end=new T.Vector3(link.side*1.41,-.065,1.38).applyEuler(b.lid.rotation).add(b.lid.position);
   const delta=end.clone().sub(start),length=delta.length();
   const bend=new T.Vector3(0,-delta.z,delta.y).normalize().multiplyScalar(Math.sqrt(Math.max(0,1.05*1.05-length*length/4)));
   const elbow=start.clone().add(end).multiplyScalar(.5).add(bend);
   for(const [arm,from,to] of [[link.arm1,start,elbow],[link.arm2,elbow,end]]){arm.position.copy(from);arm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),to.clone().sub(from).normalize());}
 }
 b.active.visible=active;b.ui.update();
 });root.userData.cameraCue={distance:.89,x:0,y:0,z:0,yaw:0};};
 root.userData={artifactId:22,conceptual:true,displayBase:false,studioProfile:'shoeobituaries',groundLevel:-.18,initialYaw:-.05,initialElevation:.66,autoOrbit:false,realTimeAnimation:true,framingTargetY:1.9,cameraFitSway:0,setStep(index,elapsed){selected=index===null?null:Math.max(0,Math.min(3,index));offset=elapsed;},animate};
 selected=3;animate(0);root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root);root.userData.framingPoints=[];for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y+.1])for(const z of[bounds.min.z,bounds.max.z])root.userData.framingPoints.push(new T.Vector3(x,y,z));
 selected=null;animate(0);root.updateMatrixWorld(true);
 // Isolate dynamic assemblies in the offline bake: no ghost shadows when they move.
 if(occlusionBake){bays.forEach((b,i)=>{b.shoe.position.x+=100+i*30;b.lid.position.x+=200+i*30;});root.updateMatrixWorld(true);}
 if(!bake)applyObservatoryAO(T,root,{url:new URL('../assets/shoeobituaries-ao-v9.bin',import.meta.url)});
 return root;
}
