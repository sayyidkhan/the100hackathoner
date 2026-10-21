import { hederaSurfaces } from './hedera-surfaces.js';

// A 24-second, seek-safe agent-commerce performance. This is an illustrative scene.
export function createArtifact(T) {
  const root=new T.Group(),m=hederaSurfaces(T),cache=new Map();
  const PI=Math.PI,TAU=PI*2,clamp=T.MathUtils.clamp,mix=T.MathUtils.lerp;
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const ramp=(t,a,b)=>smooth((t-a)/(b-a));
  const window=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
  function group(x=0,y=0,z=0,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function mesh(geometry,material,parent=root){const o=new T.Mesh(geometry,typeof material==='string'?m[material]:material);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function cached(key,create){if(!cache.has(key))cache.set(key,create());return cache.get(key);}
  // Project subdivided box faces onto a rounded cuboid; analytic normals eliminate bevel banding.
  function rounded(w,h,d,r,x,y,z,material='ceramic',parent=root){
    const geo=cached(`box:${w}:${h}:${d}:${r}`,()=>{
      const segments=w>.45&&h>.35&&d>.2?12:6;
      const g=new T.BoxGeometry(w,h,d,segments,segments,segments),p=g.attributes.position,n=g.attributes.normal;
      for(let i=0;i<p.count;i++){
        const v=new T.Vector3().fromBufferAttribute(p,i),inner=new T.Vector3(clamp(v.x,-w/2+r,w/2-r),clamp(v.y,-h/2+r,h/2-r),clamp(v.z,-d/2+r,d/2-r));
        const normal=v.clone().sub(inner).normalize();v.copy(inner).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
      }g.computeBoundingSphere();return g;
    });const o=mesh(geo,material,parent);o.position.set(x,y,z);return o;
  }
  function disk(r,h,x,y,z,material='metal',parent=root){const o=mesh(cached(`c:${r}:${h}`,()=>new T.CylinderGeometry(r,r,h,96)),material,parent);o.position.set(x,y,z);return o;}
  function sphere(r,x,y,z,material='metal',parent=root){const o=mesh(cached(`s:${r}`,()=>new T.SphereGeometry(r,32,24)),material,parent);o.position.set(x,y,z);return o;}
  function ring(r,t,x,y,z,material='metal',parent=root,flat=false,arc=TAU){const o=mesh(cached(`t:${r}:${t}:${arc}`,()=>new T.TorusGeometry(r,t,12,96,arc)),material,parent);o.position.set(x,y,z);if(flat)o.rotation.x=-PI/2;return o;}
  function tube(points,r,material='metal',parent=root){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(c,32,r,8,false),material,parent);}
  function text(value,x,y,z,width,color='#a9e8c7',parent=root){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`500 ${Math.min(100,1500/value.length)}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,512,64);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(width,width/5),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide}),parent);o.position.set(x,y,z);o.userData.noShadow=true;return o;}
  function shadow(x,y,z,w,d,parent=root){const o=mesh(new T.PlaneGeometry(w,d),'shadow',parent);o.rotation.x=-PI/2;o.position.set(x,y,z);o.userData.noShadow=true;return o;}
  function halo(x,y,z,size,parent=root){const o=mesh(new T.PlaneGeometry(size,size),'halo',parent);o.position.set(x,y,z);o.userData.noShadow=true;return o;}
  function ticks(radius,y,count,parent=root){const inst=new T.InstancedMesh(new T.BoxGeometry(.014,.012,.065),m.bronze,count),dummy=new T.Object3D();for(let i=0;i<count;i++){const a=i/count*TAU;dummy.position.set(Math.sin(a)*radius,y,Math.cos(a)*radius);dummy.rotation.y=a;dummy.scale.z=i%5===0?2:1;dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}parent.add(inst);}

  // Layered obsidian stage, machined trim, recessed seams and contact shadows.
  disk(2.63,.16,0,.08,0,'dark');disk(2.60,.035,0,.175,0,'bronze');disk(2.56,.10,0,.24,0,'stone');
  ring(2.51,.018,0,.294,0,'metal',root,true);ring(2.45,.011,0,.296,0,'muted',root,true);ticks(2.37,.3,100);
  const orbit=group();ring(2.48,.016,0,.308,0,'glow',orbit,true,.65);ring(2.48,.012,0,.308,0,'glow',orbit,true,.35).rotation.z=PI;
  const bolts=new T.InstancedMesh(new T.CylinderGeometry(.026,.026,.018,12),m.metal,12),bolt=new T.Object3D();
  for(let i=0;i<12;i++){const a=i*TAU/12;bolt.position.set(Math.sin(a)*2.53,.304,Math.cos(a)*2.53);bolt.updateMatrix();bolts.setMatrixAt(i,bolt.matrix);}root.add(bolts);
  shadow(0,.302,0,4.6,4.4);
  // Inlaid routes, inset docking bays and radial seams break up the large stone surface.
  for(const side of [-1,1]){
    tube([[side*.98,.306,.4],[side*1.6,.306,.3],[side*1.95,.306,-.25],[side*1.7,.306,-1.25],[side*.75,.306,-1.72]],.009,'bronze');
    tube([[side*1.3,.306,.8],[side*1.65,.306,1.12],[side*1.28,.306,1.65]],.012,'muted');
    for(let i=0;i<5;i++)rounded(.13,.012,.04,.005,side*(1.82+i*.04),.31,-.75+i*.10,'metal');
  }
  for(let i=0;i<8;i++){
    const a=(i+.5)*TAU/8;
    tube([[Math.sin(a)*2.15,.307,Math.cos(a)*2.15],[Math.sin(a)*2.30,.307,Math.cos(a)*2.30]],.006,'bronze');
  }

  // A physical portal, with suspended inner machinery rather than a bare neon hoop.
  const portal=group(0,0,-1.12);
  for(const x of [-1.1,1.1]){rounded(.31,.16,.47,.055,x,.38,0,'dark',portal);rounded(.15,1.85,.23,.05,x,1.26,0,'metal',portal);rounded(.035,1.55,.025,.012,x,1.28,.13,'muted',portal);}
  ring(1.13,.105,0,2.28,0,'stone',portal);ring(1.13,.018,0,2.28,.107,'bronze',portal);ring(1.01,.018,0,2.28,.07,'glow',portal);
  const innerRotor=group(0,2.28,0,portal);
  for(let i=0;i<3;i++){const a=ring(.94,.012,0,0,.03,'metal',innerRotor,false,1.35);a.rotation.z=i*TAU/3;}
  const globe=mesh(new T.SphereGeometry(.75,48,32),'glass',innerRotor);globe.scale.z=.43;
  const emblem=group(0,2.28,.12,portal);
  for(const x of [-.22,.22])rounded(.067,.77,.08,.025,x,0,0,'ceramic',emblem);
  for(const y of [-.105,.105])rounded(.58,.058,.08,.025,0,y,.005,'glow',emblem);
  const portalHalo=halo(0,2.28,-.07,2.25,portal);portalHalo.material=m.halo.clone();portalHalo.material.opacity=.32;
  const satellites=[],panelLights=[];
  for(let i=0;i<3;i++){
    const [x,y]=[[-1.40,2.18],[1.40,2.18],[1.40,1.55]][i],p=group(x,y,.17,portal);satellites.push(p);
    rounded(.58,.46,.07,.035,0,0,0,'metal',p);rounded(.52,.4,.035,.015,0,0,.052,'visor',p);
    const status=sphere(.022,.21,.145,.083,'glow',p);panelLights.push(status);
    if(i===0){sphere(.048,0,.065,.085,'muted',p);rounded(.16,.08,.025,.012,0,-.03,.085,'muted',p);}
    if(i===1)for(let j=0;j<5;j++)sphere(.021,(j-2)*.07,.035,.08,'glow',p);
    if(i===2)tube([[-.10,.04,.085],[-.025,-.025,.085],[.10,.10,.085]],.014,'glow',p);
    text(['IDENTITY','REPUTATION','VALIDATION'][i],0,-.13,.08,.45,'#a8cbbb',p);
  }

  // Recessed exchange table: layered rings, a rotating optical assembly and projected product.
  shadow(0,.305,.17,2.3,1.7);
  disk(.34,.48,0,.57,.08,'dark');ring(.33,.018,0,.40,.08,'bronze',root,true);
  disk(.92,.13,0,.86,.08,'stone');ring(.91,.026,0,.88,.08,'metal',root,true);ring(.86,.012,0,.934,.08,'glow',root,true);
  disk(.62,.018,0,.934,.08,'visor');ring(.62,.022,0,.95,.08,'bronze',root,true);ring(.51,.012,0,.956,.08,'muted',root,true);
  const scanner=group(0,.97,.08);ring(.48,.016,0,0,0,'glow',scanner,true,1.25);ticks(.75,.94,48);
  const projection=halo(0,.96,.08,1.5);projection.material=m.halo.clone();projection.material.opacity=.24;projection.rotation.x=-PI/2;
  const beamMaterial=new T.MeshBasicMaterial({color:0x78ffc3,transparent:true,opacity:.035,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
  const beam=mesh(new T.CylinderGeometry(.32,.45,.85,48,1,true),beamMaterial);beam.position.set(0,1.39,.08);beam.userData.noShadow=true;

  // Rounded shells and a real shoulder → elbow → hand hierarchy.
  const agents=[];
  function robot(x,z,yaw,role){
    const stand=group(x,.30,z);stand.rotation.y=yaw;
    shadow(0,.01,0,1.2,.95,stand);
    disk(.39,.04,0,.04,0,'dark',stand);ring(.36,.009,0,.065,0,'bronze',stand,true);
    const body=group(0,0,0,stand);
    // Comfortable little seat with leather pad and polished frame.
    rounded(.58,.13,.49,.06,0,.42,-.06,'dark',stand);rounded(.55,.48,.13,.055,0,.65,-.29,'rubber',stand);
    for(const side of [-1,1]){rounded(.065,.32,.065,.025,side*.22,.23,-.17,'metal',stand);rounded(.20,.13,.33,.055,side*.14,.14,.19,'ceramic',body);rounded(.17,.26,.19,.065,side*.14,.32,.08,'metal',body);}
    rounded(.51,.49,.40,.14,0,.65,0,'ceramic',body);
    rounded(.29,.23,.035,.015,0,.68,.205,'metal',body);ring(.078,.012,0,.68,.231,'bronze',body);
    for(const sx of [-.03,.03])rounded(.014,.09,.013,.005,sx,.68,.24,'muted',body);
    for(const sy of [-.015,.015])rounded(.09,.01,.013,.004,0,.68+sy,.24,'muted',body);
    disk(.105,.10,0,.96,0,'dark',body);
    const head=group(0,1.23,0,body);
    rounded(.72,.55,.55,.17,0,0,0,'ceramic',head);
    rounded(.60,.37,.10,.049,0,-.015,.255,'metal',head);
    rounded(.55,.32,.07,.034,0,-.015,.307,'visor',head);
    const eyes=[];
    for(const side of [-1,1]){
      const eye=rounded(.057,.105,.025,.012,side*.135,.025,.349,'glow',head);eyes.push(eye);
      const ear=disk(.125,.06,side*.375,0,0,'metal',head);ear.rotation.z=PI/2;
      const cap=disk(.087,.065,side*.378,0,0,'dark',head);cap.rotation.z=PI/2;
      const rim=ring(.106,.008,side*.414,0,0,'bronze',head);rim.rotation.y=PI/2;
    }
    tube([[-.055,-.09,.349],[0,-.108,.355],[.055,-.09,.349]],.007,'muted',head);
    const limbs=[];
    for(const side of [-1,1]){
      const arm=group(side*.33,.82,0,body);sphere(.095,0,0,0,'metal',arm);
      rounded(.16,.25,.18,.075,0,-.14,0,'ceramic',arm);
      const elbow=group(0,-.28,0,arm);sphere(.075,0,0,0,'dark',elbow);
      const forearm=group(0,0,0,elbow);forearm.rotation.x=-1.05;
      rounded(.145,.25,.16,.065,0,-.13,0,'ceramic',forearm);
      const hand=group(0,-.28,0,forearm);rounded(.15,.11,.10,.043,0,0,0,'ceramic',hand);
      for(let k=0;k<3;k++)rounded(.033,.075,.055,.016,(k-1)*.044,-.055,.017,'ceramic',hand);
      const thumb=rounded(.042,.09,.06,.02,side*.08,-.015,.045,'ceramic',hand);thumb.rotation.z=side*.55;
      limbs.push({arm,elbow,forearm,hand,side});
    }
    // Devices are attached to the hands, so gestures never leave them floating behind.
    const device=group(0,-.055,.08,limbs[role===0?1:0].hand);device.rotation.x=.6;
    const w=role===0?.35:.18,h=role===0?.27:.34;
    rounded(w,h,.045,.022,0,0,0,'metal',device);rounded(w-.035,h-.035,.02,.009,0,0,.031,'visor',device);
    for(let i=0;i<3;i++)rounded(w*.6,.013,.01,.004,0,.065-i*.05,.045,i===0?'glow':'muted',device);
    const a={stand,body,head,eyes,limbs,device,role};agents.push(a);return a;
  }
  robot(-1.24,.43,.62,0);robot(1.24,.43,-.62,1);robot(0,-.88,.05,2);

  // Product passes through the shared table while an offer and receipt tell the story.
  const product=group(0,1.55,.1);product.rotation.y=-.25;
  rounded(.30,.59,.065,.032,0,0,0,'metal',product);rounded(.265,.55,.018,.009,0,0,.043,'visor',product);
  rounded(.095,.022,.012,.005,0,.225,.057,'dark',product);
  for(let i=0;i<3;i++)sphere(.029,-.08+(i%2)*.07,.19-Math.floor(i/2)*.07,-.045,'dark',product);
  const screenHalo=halo(0,0,.058,.37,product);screenHalo.material=m.halo.clone();screenHalo.material.opacity=.25;screenHalo.scale.y=1.3;
  ring(.065,.009,0,.065,.063,'glow',product);tube([[-.035,.065,.066],[-.005,.035,.066],[.04,.095,.066]],.008,'glow',product);text('x402',0,-.13,.065,.22,'#acffdc',product);
  const offer=group(-.60,1.65,.80);rounded(.66,.34,.022,.01,0,0,0,'ui',offer);text('S$ 999',0,.035,.018,.60,'#c3ffe0',offer);text('OFFER',0,-.10,.018,.40,'#739d88',offer);
  const receipt=group(.10,1.5,.85);rounded(.64,.62,.025,.012,0,0,0,'ui',receipt);ring(.11,.012,0,.12,.024,'glow',receipt);tube([[-.06,.12,.03],[-.015,.07,.03],[.075,.18,.03]],.014,'glow',receipt);text('VERIFIED',0,-.10,.025,.58,'#c3ffe0',receipt);text('HCS RECORD',0,-.23,.025,.50,'#87bf9f',receipt);

  const paths=[
    [[-1.25,.40,.4],[-1.8,.5,-.25],[-1.7,1.6,-1.0],[-1.4,2.18,-.93]],
    [[-1.0,1.10,.5],[-.6,1.65,.4],[.6,1.65,.4],[1,1.1,.5]],
    [[-1.2,.5,.6],[-.8,.55,1.2],[.8,.55,1.2],[1.2,.5,.6]],
    [[0,1.3,.1],[.5,1.8,-.3],[.4,2.4,-.7],[0,2.28,-1.0]],
  ];
  const packets=[];
  paths.forEach((points,stage)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));for(let i=0;i<5;i++){const bead=sphere(.025+(i===0?.013:0),0,0,0,'glow');bead.userData.noShadow=true;packets.push({curve,bead,stage,lag:i*.035});}});
  const pulses=[];for(let i=0;i<3;i++){const mat=m.glow.clone();mat.transparent=true;mat.depthWrite=false;const o=ring(.52,.009,0,.965,.08,mat,root,true);o.userData.noShadow=true;pulses.push(o);}
  // Front control rail: four restrained physical status tiles, no extra card UI.
  const tiles=[],stageLabels=[];
  for(let i=0;i<4;i++){
    const g=group((i-1.5)*.61,.35,1.58);g.rotation.x=-.30;
    rounded(.54,.25,.075,.03,0,0,0,'metal',g);rounded(.49,.2,.018,.008,0,0,.047,'visor',g);
    const light=rounded(.36,.015,.013,.005,0,-.065,.063,'muted',g);tiles.push(light);
    text(['DISCOVER','NEGOTIATE','SETTLE','RECORD'][i],0,.025,.064,.43,'#bed9c8',g);
  }
  const title=group(0,.34,2.07);title.rotation.x=-.9;
  rounded(1.45,.21,.045,.02,0,0,0,'dark',title);
  ['01 / DISCOVER','02 / NEGOTIATE','03 / SETTLE','04 / VERIFIED'].forEach(value=>stageLabels.push(text(value,0,0,.029,1.21,'#b7f4d2',title)));

  // Static framing includes all performance poses without refitting or camera jumps.
  root.updateMatrixWorld(true);
  const framingPoints=[];
  for(let i=0;i<64;i++)framingPoints.push(new T.Vector3(Math.cos(i*TAU/64)*2.66,.1,Math.sin(i*TAU/64)*2.66));
  for(let i=0;i<64;i++)framingPoints.push(new T.Vector3(Math.cos(i*TAU/64)*1.25,2.28+Math.sin(i*TAU/64)*1.25,-1.12));
  for(const x of [-1.78,1.78])for(const y of [1.35,2.5])framingPoints.push(new T.Vector3(x,y,-.8));
  // Batch static architecture while retaining UVs and every articulated subtree.
  const moving=new Set([orbit,innerRotor,emblem,...satellites,scanner,projection,beam,
    ...agents.map(a=>a.stand),product,offer,receipt,...packets.map(p=>p.bead),...pulses,...tiles,...stageLabels]);
  const batches=new Map(),removed=new Set();root.updateMatrixWorld(true);
  const staticMeshes=[];
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh)return;
    for(let p=o;p;p=p.parent)if(moving.has(p))return;
    staticMeshes.push(o);
  });
  for(const o of staticMeshes){
    const key=o.material.uuid+Boolean(o.userData.noShadow);
    if(!batches.has(key))batches.set(key,{material:o.material,noShadow:o.userData.noShadow,p:[],n:[],uv:[]});
    const b=batches.get(key),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
    for(const v of g.attributes.position.array)b.p.push(v);
    for(const v of g.attributes.normal.array)b.n.push(v);
    for(const v of g.attributes.uv.array)b.uv.push(v);
    g.dispose();removed.add(o.geometry);o.removeFromParent();
  }
  for(const b of batches.values()){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();
    const o=mesh(g,b.material);o.userData.noShadow=b.noShadow;
  }
  root.traverse(o=>{if(o.geometry)removed.delete(o.geometry);});removed.forEach(g=>g.dispose());
  const stages=['Discover trusted sellers','Negotiate an offer','Settle with x402','Record the exchange'];
  Object.assign(root.userData,{
    artifactId:46,conceptual:true,displayBase:false,groundLevel:0,contactFootprint:false,studioProfile:'hedera',
    initialYaw:-.17,initialElevation:.36,autoOrbit:false,framingPoints,animationDuration:24,realTimeAnimation:true,
    animate(time){
      const t=((Number.isFinite(time)?time:0)%24+24)%24,phase=Math.floor(t/6);
      const negotiating=window(t,4.5,6.5,10,12),paying=window(t,10,12,16,18),verified=window(t,16,18,21.5,24);
      orbit.rotation.y=-t*TAU/24;innerRotor.rotation.z=t*TAU/24;scanner.rotation.y=-t*TAU/6;
      emblem.rotation.y=Math.sin(t*TAU/12)*.16;
      satellites.forEach((p,i)=>{p.position.y=[2.18,2.18,1.55][i]+Math.sin(t*TAU/6+i)*.055;p.rotation.y=Math.sin(t*TAU/12+i)*.09;panelLights[i].scale.setScalar(1+.45*Math.sin(t*TAU/2-i));});
      agents.forEach((a,i)=>{
        const idle=Math.sin(t*TAU/6+i),talk=negotiating*Math.sin(t*TAU/1.5+i*1.7),nod=verified*Math.sin(t*TAU/1.5)*.14;
        a.body.position.y=idle*.018;a.body.rotation.z=(i===0?-.09:i===1?.09:0)*(negotiating+paying*.5);
        a.head.rotation.y=Math.sin(t*TAU/12+i)*.14+(i===0?.30:i===1?-.30:0)*(negotiating+paying*.4);
        a.head.rotation.x=nod+talk*.10;a.head.rotation.z=idle*.035;
        const blinkTime=(t+i*.73)%4,blink=1-.94*window(blinkTime,2.65,2.74,2.80,2.94);
        a.eyes.forEach(eye=>eye.scale.y=blink);
        a.limbs.forEach(({arm,forearm,side},j)=>{
          const presenting=(i===0&&j===1)||(i!==0&&j===0);
          arm.rotation.x=-.12-(presenting?.70:.35)*negotiating-(presenting?.55:.25)*paying-(presenting?0:.45)*verified+talk*.15;
          arm.rotation.z=side*(.10+(presenting?.08:.50)*negotiating+(presenting?0:.45)*verified);
          forearm.rotation.x=-1.05-(presenting?.45:.20)*negotiating-(presenting?.25:0)*paying+talk*.20;
        });
      });
      const reveal=window(t,4,6,16,18),transfer=ramp(t,11,16);
      product.visible=reveal>.001;product.scale.setScalar(Math.max(.001,reveal)*1.18);
      product.position.set(mix(.40,-.52,transfer),1.79+Math.sin(t*TAU/4)*.075+Math.sin(transfer*PI)*.23,.16);
      product.rotation.y=-.35+Math.sin(t*TAU/8)*.5;product.rotation.z=Math.sin(t*TAU/6)*.06;
      offer.visible=negotiating>.01;offer.scale.setScalar(Math.max(.001,negotiating));offer.position.y=1.65+Math.sin(t*TAU/6)*.035;
      receipt.visible=verified>.01;receipt.scale.setScalar(Math.max(.001,verified));receipt.position.y=1.5+(1-verified)*.25+Math.sin(t*TAU/6)*.04;
      beam.visible=product.visible||receipt.visible;beamMaterial.opacity=.025+.035*(negotiating+verified);projection.scale.setScalar(1+.12*Math.sin(t*TAU/3));
      packets.forEach(({curve,bead,stage,lag})=>{bead.visible=phase===stage;const u=((t/1.8-lag)%1+1)%1;bead.position.copy(curve.getPoint(u));bead.scale.setScalar(Math.sin(u*PI)*.8+.25);});
      pulses.forEach((p,i)=>{const u=((t/2+i/3)%1+1)%1;p.scale.setScalar(.7+u*.95);p.material.opacity=(1-u)*(.12+verified*.7);});
      tiles.forEach((tile,i)=>{tile.material=i===phase?m.glow:m.muted;});stageLabels.forEach((l,i)=>{l.visible=i===phase;});
      root.userData.story={title:stages[phase],step:`0${phase+1} / 04`,index:phase,detail:'Illustrative testnet agent-commerce sequence.',tone:'complete'};
    },
  });
  root.userData.animate(0);return root;
}
