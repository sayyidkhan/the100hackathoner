import { createObservatorySurfaces } from './astrodegen-surfaces.js';
import { createLunarMoon } from './astrodegen-moon.js';
import { createLunarMarket } from './astrodegen-market.js';
import { createObservatory } from './astrodegen-observatory.js';
import { applyObservatoryAO } from './astrodegen-occlusion.js';
import { applyObservatorySoftShadows } from './astrodegen-soft-shadows.js';

// A tactile observatory miniature with one moving, phase-changing moon.
export function createArtifact(T, { bake = false } = {}) {
  const root=new T.Group(),PI=Math.PI,TAU=PI*2,cache=new Map(),moving=new Set();
  const material=color=>new T.MeshStandardMaterial({color,roughness:.84,metalness:0});
  const m={ivory:material(0xede0c5),paper:material(0xf5ebd8),red:material(0xb9321c),blue:material(0x123d99),wood:material(0xb2a180),shade:material(0x634b32),lens:material(0x102b69),grid:material(0xd9cbb2)};
  m.lens.roughness=.27;
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=128;
  const grainCtx=grainCanvas.getContext('2d'),grainData=grainCtx.createImageData(128,128);
  for(let i=0;i<128*128;i++){let n=Math.imul(i+42,374761393);n=Math.imul(n^(n>>>13),1274126177);const v=100+((n^(n>>>16))>>>0)%100;grainData.data.set([v,v,v,255],i*4);}
  grainCtx.putImageData(grainData,0,0);const grain=new T.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,3);
  for(const mat of Object.values(m)){mat.bumpMap=grain;mat.bumpScale=.002;}
  const surfaces=createObservatorySurfaces(T);
  Object.assign(m,surfaces,{ivory:surfaces.limestone,red:surfaces.enamel,blue:surfaces.navy,lens:surfaces.glass,ceramic:surfaces.ceramic,nickel:surfaces.nickel,window:surfaces.window,mortar:surfaces.mortar});
  function group(x=0,y=0,z=0,parent=root,animate=false){const o=new T.Group();o.position.set(x,y,z);parent.add(o);if(animate)moving.add(o);return o;}
  function mesh(g,mat,parent=root){const o=new T.Mesh(g,typeof mat==='string'?m[mat]:mat);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function geo(key,fn){if(!cache.has(key))cache.set(key,fn());return cache.get(key);}
  function box(w,h,d,x,y,z,mat='ivory',parent=root,r=.025){
    r=Math.min(r,w/2,h/2,d/2);const g=geo(`b${w},${h},${d},${r}`,()=>{
      // Put the extra topology at the bevel, rather than spreading it across
      // the face. This keeps broad surfaces flat and highlights smoothly rolled.
      const segments=w*h*d>.005?10:6,g=new T.BoxGeometry(w,h,d,segments,segments,segments),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
      const edge=(v,length)=>{const half=length/2,t=Math.round((v/length+.5)*segments),corner=(segments-2)/2;
        return t<=corner?-half+r*t/corner:t>=segments-corner?half-r*(segments-t)/corner:(t-segments/2)*(half-r);};
      for(let i=0;i<p.count;i++){const v=new T.Vector3(edge(p.getX(i),w),edge(p.getY(i),h),edge(p.getZ(i),d));
        const a=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));
        const normal=v.clone().sub(a).normalize();v.copy(a).addScaledVector(normal,r);
        if(Math.abs(n.getX(i))>.5)uv.setXY(i,v.z/d+.5,v.y/h+.5);
        else if(Math.abs(n.getY(i))>.5)uv.setXY(i,v.x/w+.5,v.z/d+.5);
        else uv.setXY(i,v.x/w+.5,v.y/h+.5);
        p.setXYZ(i,...v);n.setXYZ(i,...normal);}return g;
    });const o=mesh(g,mat,parent);o.position.set(x,y,z);return o;
  }
  function disk(r,h,x,y,z,mat='ivory',parent=root){const o=mesh(geo(`d${r},${h}`,()=>{
    const b=Math.min(.014,h*.22,r*.12),profile=[new T.Vector2(0,-h/2),new T.Vector2(r-b,-h/2)];
    for(let i=1;i<=4;i++){const a=-PI/2+i*PI/8;profile.push(new T.Vector2(r-b+Math.cos(a)*b,-h/2+b+Math.sin(a)*b));}
    profile.push(new T.Vector2(r,h/2-b));
    for(let i=1;i<=4;i++){const a=i*PI/8;profile.push(new T.Vector2(r-b+Math.cos(a)*b,h/2-b+Math.sin(a)*b));}
    profile.push(new T.Vector2(0,h/2));const g=new T.LatheGeometry(profile,r<.06?32:64);
    for(let i=0;i<g.attributes.uv.count;i++)g.attributes.uv.setY(i,g.attributes.position.getY(i)/h+.5);return g;
  }),mat,parent);o.position.set(x,y,z);return o;}
  function ring(r,t,x,y,z,mat='ivory',parent=root,flat=false){const o=mesh(geo(`r${r},${t}`,()=>new T.TorusGeometry(r,t,8,r<.1?32:r<.2?64:128)),mat,parent);o.position.set(x,y,z);if(flat)o.rotation.x=PI/2;return o;}
  function ball(r,x,y,z,mat='ivory',parent=root){const o=mesh(geo(`s${r}`,()=>new T.SphereGeometry(r,r<.03?12:24,r<.03?8:16)),mat,parent);o.position.set(x,y,z);return o;}
  function line(points,r=.008,mat='ivory',parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=mesh(new T.TubeGeometry(curve,Math.max(12,points.length*4),r,6,false),mat,parent);return {o,curve};}
  // Inlaid stone on a thin enamel foundation, with a distinct shadow gap.
  box(5.2,.15,3.0,0,.075,0,'blue',root,.09);
  box(5.16,.025,2.96,0,.16,0,'nickel',root,.06);
  box(5.12,.08,2.92,0,.20,0,'ivory',root,.065);
  // Incised paving joints: scale cues on a continuous, quiet surface.
  for(const z of [-1.08,-.62,-.16,.30,.76,1.22])box(4.84,.0015,.004,0,.241,z,'mortar',root,.0005);
  for(let row=0;row<6;row++)for(let i=0;i<6;i++)box(.004,.0015,row===5?.22:.45,-2.30+i*.88+(row%2)*.44,.241,row===5?1.335:-.855+row*.46,'mortar',root,.0005);
  const {observatory,dome,telescope,mount}=createObservatory(T,{group,mesh,box,disk,ring,ball,line,materials:m});

  const moon=createLunarMoon(T,{radius:.44,grain});root.add(moon);moving.add(moon);
  const moonPath=u=>new T.Vector3(-2.05+4.10*u,3.03+Math.sin(PI*u)*.27,.12);
  // A fine inlaid trajectory with instrument-like divisions.
  line(Array.from({length:49},(_,i)=>{const p=moonPath(i/48);p.z-=.16;return p.toArray();}),.008,'nickel');
  for(let i=0;i<=28;i++){const p=moonPath(i/28);line([[p.x,p.y-.025,p.z-.16],[p.x,p.y+(i%7===0?.055:.012),p.z-.16]],.004,'blue');}

  // The market workbench uses the same lunar clock as the telescope.
  const desk=group(1.08,.20,.52);
  box(2.40,.095,.83,0,.67,0,'ceramic',desk,.04);
  box(2.28,.035,.73,0,.61,0,'blue',desk,.012);
  for(const x of [-.81,.81])for(const z of [-.28,.28]){box(.085,.56,.085,x,.32,z,'red',desk,.024);disk(.059,.045,x,.055,z,'nickel',desk);}
  for(const x of [-.81,.81])box(.04,.04,.58,x,.25,0,'nickel',desk,.008);
  box(1.65,.035,.035,0,.20,-.28,'nickel',desk,.008);
  box(.65,.15,.55,.42,.52,0,'red',desk,.018);box(.56,.115,.02,.42,.52,.29,'ceramic',desk,.012);box(.15,.016,.025,.42,.53,.31,'nickel',desk,.006);
  // A full-size market instrument is the second hero, not a tiny desk prop.
  // Keep its face near the viewing plane so candles remain legible at card size.
  const chart=group(.10,1.57,-.15,desk);chart.name='lunar-market-terminal';chart.rotation.set(-.13,-.18,0);chart.scale.set(2.62,2.25,2.62);
  box(1.025,.72,.095,0,0,-.015,'blue',chart,.035);
  box(1.005,.70,.018,0,0,.032,'nickel',chart,.028);
  box(.979,.674,.018,0,0,.044,'blue',chart,.022);
  const screenMaterial=new T.MeshBasicMaterial({color:0x0b1b2a});
  box(.943,.624,.012,0,0,.057,screenMaterial,chart,.014);
  for(const x of [-.486,.486])for(const y of [-.323,.323]){
    const screw=disk(.006,.004,x,y,.055,'nickel',chart);screw.rotation.x=PI/2;
    box(.006,.0013,.001,x,y,.058,'blue',chart,.0003);
  }
  // Ribbed rear casing, a cantilever neck, cable grommet and machined foot.
  for(let i=0;i<16;i++)box(.006,.19,.006,-.30+i*.04,.04,-.065,'nickel',chart,.002);
  box(.25,.065,.055,0,-.24,-.083,'blue',chart,.016);
  const neck=box(.26,.30,.12,.10,.88,-.25,'nickel',desk,.025);neck.rotation.x=-.18;
  box(.78,.035,.36,.10,.738,-.17,'blue',desk,.012);
  box(.74,.009,.32,.10,.760,-.17,'nickel',desk,.004);
  const market=createLunarMarket(T);market.position.z=.066;chart.add(market);moving.add(market);
  // A proper control deck gives the enlarged instrument a convincing scale.
  const controls=group(-.34,.75,.27,desk);controls.rotation.x=-.08;
  box(.89,.055,.24,0,0,0,'blue',controls,.025);
  for(let row=0;row<3;row++)for(let col=0;col<11;col++)box(.060,.017,.045,-.36+col*.071,.038,-.072+row*.062,col===10?'red':'ceramic',controls,.007);
  box(.27,.017,.035,0,.038,.104,'ceramic',controls,.006);
  const dial=disk(.065,.035,.32,.053,.086,'nickel',controls);
  ring(.051,.005,.32,.074,.086,'blue',controls,true);
  // A visible signal cable joins the observatory to the market terminal.
  const signalRoute=line([[-.51,.64,-.12],[-.24,.30,-.10],[.16,.29,0],[.45,.40,.12],[1.12,.87,.25]],.014,'blue');
  const pulseMaterial=m.ceramic.clone();pulseMaterial.emissive=new T.Color(0x94cbd4);pulseMaterial.emissiveIntensity=.8;pulseMaterial.transparent=true;
  const signalPulse=ball(.048,0,0,0,pulseMaterial);signalPulse.name='moon-market-pulse';moving.add(signalPulse);
  const tokens=['buy','hold','sell'].map((name,i)=>{
    const token=group(.37+i*.20,.74,.26,desk,true);token.name=`market-token-${name}`;
    const mat=[m.blue,m.ceramic,m.red][i].clone();mat.emissive=mat.color.clone();
    disk(.095,.025,0,0,0,mat,token);ring(.096,.005,0,.012,0,'nickel',token,true);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=i===1?'#233b59':'#f7edda';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name.toUpperCase(),64,64);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const label=mesh(new T.PlaneGeometry(.16,.16),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),token);label.rotation.x=-PI/2;label.position.y=.014;label.userData.noShadow=true;
    return {token,mat,name};
  });
  const calendar=group(1.10,.32,.05,desk);calendar.rotation.x=-.15;calendar.rotation.y=-.20;
  box(.32,.42,.045,0,0,0,'red',calendar,.012);box(.29,.38,.015,0,.005,.032,'paper',calendar,.006);
  for(const x of [-.095,0,.095]){const o=ring(.028,.009,x,.211,.01,'ivory',calendar);o.rotation.y=PI/2;}
  for(let i=0;i<3;i++)box(.18,.009,.006,0,.07-i*.075,.045,'grid',calendar,.002);
  for(let i=0;i<5;i++){const sheet=box(.37,.007,.25,-.81+i*.003,.728+i*.008,-.11,'paper',desk,.002);sheet.rotation.y=-.14;}
  const pen=disk(.011,.30,-.81,.785,-.12,'blue',desk);pen.rotation.z=PI/2;pen.rotation.y=.2;
  const notebook=group(-.08,.255,1.03);notebook.rotation.y=-.20;
  box(.66,.035,.43,0,0,0,'blue',notebook,.018);
  for(const x of [-.16,.16]){const pages=box(.30,.038,.39,x,.035,0,'paper',notebook,.006);pages.rotation.z=x<0?-.06:.06;
    for(let i=0;i<7;i++)box(.22,.002,.003,x,.059,-.13+i*.043,'grid',notebook,.0005);}
  box(.027,.008,.17,.045,.064,.19,'red',notebook,.002);
  disk(.47,.009,1.04,.247,1.04,'blue');disk(.21,.35,1.04,.38,1.04,'red');disk(.225,.055,1.04,.58,1.04,'ivory');

  // Irregular limestone clusters replace identical cone props.
  function rock(x,z,w,h,mat='ivory',seed=0){
    const g=new T.SphereGeometry(1,48,28),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);
      const n=1+.18*Math.sin(v.x*4+seed)*Math.sin(v.z*5+v.y*4)+.045*Math.sin(v.y*23+v.x*5);
      p.setXYZ(i,v.x*w*n,Math.max(-.23,v.y)*h*n,v.z*w*.7*n);}g.computeVertexNormals();
    const o=mesh(g,mat);o.position.set(x,.255+h*.23,z);o.rotation.y=x*1.7;return o;
  }
  for(const [i,[x,z,w,h]] of [[-2.16,.70,.23,.28],[-2.15,.12,.27,.43],[-1.96,-1.09,.30,.32],[-.55,-1.1,.31,.38],[.13,-1.04,.33,.52],[1.43,-1.03,.26,.34],[2.11,-.88,.23,.42],[2.25,.78,.19,.22],[-1.81,1.12,.17,.20]].entries()){
    rock(x,z,w,h,surfaces.rock,i);rock(x+.17,z+.08,w*.43,h*.38,surfaces.rock,i+10);
  }
  for(const [x,z] of [[-2.25,.35],[.40,-1.02],[2.24,1.12]]){const shard=mesh(new T.ConeGeometry(.11,.29,5),'red');shard.position.set(x,.38,z);shard.rotation.z=.15;}

  // Soft local contact shadows avoid a large display turntable.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(55,34,12,.28)');gradient.addColorStop(.40,'rgba(55,34,12,.18)');gradient.addColorStop(1,'rgba(55,34,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowMap=new T.CanvasTexture(shadowCanvas),shadowMat=new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false});
  for(const [x,z,w,d] of [[-1.22,-.25,2.2,1.9],[1.08,.52,2.5,1.4],[1.04,1.04,.65,.65]]){const o=mesh(new T.PlaneGeometry(w,d),shadowMat);o.position.set(x,.246,z);o.rotation.x=-PI/2;o.userData.noShadow=true;}

  // Batch each rigid assembly in its own coordinate space. Dome and optics
  // still move independently, without paying one draw call per screw or seam.
  root.updateMatrixWorld(true);const removed=new Set();
  function batchAssembly(parent){
    const inverse=new T.Matrix4().copy(parent.matrixWorld).invert(),meshes=[],batches=new Map();
    parent.traverse(o=>{if(!o.isMesh)return;for(let p=o;p&&p!==parent;p=p.parent)if(moving.has(p))return;meshes.push(o);});
    for(const o of meshes){
      const key=o.material.uuid+!!o.userData.noShadow;
      if(!batches.has(key))batches.set(key,{mat:o.material,noShadow:o.userData.noShadow,p:[],n:[],uv:[]});
      const b=batches.get(key),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      for(const value of g.attributes.position.array)b.p.push(value);
      for(const value of g.attributes.normal.array)b.n.push(value);
      for(const value of g.attributes.uv.array)b.uv.push(value);
      g.dispose();removed.add(o.geometry);o.removeFromParent();
    }
    for(const b of batches.values()){
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();
      const o=mesh(g,b.mat,parent);o.userData.noShadow=b.noShadow;
      if(parent===root&&!b.noShadow){o.userData.observatoryAO=true;o.name=`observatory-static-${parent.children.length}`;}
    }
  }
  for(const assembly of [root,dome,telescope,mount])batchAssembly(assembly);
  root.traverse(o=>{if(o.geometry)removed.delete(o.geometry);if(o.userData.noShadow)o.castShadow=o.receiveShadow=false;});removed.forEach(g=>g.dispose());
  const framingPoints=[];for(const x of [-2.6,2.6])for(const z of [-1.5,1.5])for(const y of [0,.24])framingPoints.push(new T.Vector3(x,y,z));
  // Frame the whole journey, not just the moon's initial position.
  for(let i=0;i<=32;i++){const p=moonPath(i/32);for(let j=0;j<32;j++){const y=1-2*(j+.5)/32,a=j*2.399963,s=Math.sqrt(1-y*y);framingPoints.push(p.clone().add(new T.Vector3(Math.cos(a)*s,y,Math.sin(a)*s).multiplyScalar(.46)));}}
  const smooth=u=>{u=T.MathUtils.clamp(u,0,1);return u*u*(3-2*u);};
  const aim=new T.Vector3(),pivot=observatory.position.clone().add(telescope.position),up=new T.Vector3(0,1,0);
  // SphereGeometry uses (-cos(phi), sin(phi)) around the Y axis.
  const apertureAzimuth=PI-(3.2-1.25/2);
  for(const x of [-.52,.52])for(const y of [-.36,.36])for(const z of [-.07,.07])framingPoints.push(chart.localToWorld(new T.Vector3(x,y,z)));
  Object.assign(root.userData,{artifactId:42,conceptual:true,studioProfile:'astrodegen',displayBase:false,contactFootprint:false,groundLevel:0,initialYaw:-.22,initialElevation:.31,autoOrbit:false,framingPoints,animationDuration:24,realTimeAnimation:true,
    animate(time){const t=((Number.isFinite(time)?time:0)%24+24)%24;
      // A 22-second left-to-right pass, followed by an invisible return and
      // short fade-in at the left horizon. Never show a reverse crossing.
      const progress=t<=22?smooth(t/22):1-smooth((t-22)/1.4);
      moon.position.copy(moonPath(progress));
      moon.material.opacity=t<=22?1-smooth((t-21.2)/.8):smooth((t-23.4)/.6);
      moon.visible=moon.material.opacity>0;
      moon.castShadow=moon.material.opacity>.5;
      const phase=progress*TAU;
      moon.userData.sunlight.value.set(Math.sin(phase),0,-Math.cos(phase));
      aim.copy(moon.position).sub(pivot).normalize();
      telescope.quaternion.setFromUnitVectors(up,aim);
      dome.rotation.y=apertureAzimuth-Math.atan2(aim.z,aim.x);
      mount.rotation.y=-Math.atan2(aim.z,aim.x);
      const marketProgress=t<=22?progress:0,marketActive=t<=22?1:smooth((t-23.4)/.6);
      market.userData.update(marketProgress,marketProgress*TAU,t,marketActive);
      signalPulse.position.copy(signalRoute.curve.getPoint((marketProgress*20)%1));
      signalPulse.visible=marketActive>0&&t<22;
      pulseMaterial.opacity=marketActive*.9;
      pulseMaterial.color.copy(market.userData.state.signal==='sell'?m.red.color:m.blue.color);
      pulseMaterial.emissive.copy(pulseMaterial.color);
      const ranges={buy:[.10,.45],hold:[.45,.60],sell:[.60,.94]};
      for(const {token,mat,name} of tokens){
        const [start,end]=ranges[name],weight=marketProgress>start&&marketProgress<end?Math.sin((marketProgress-start)/(end-start)*PI)**2:0;
        token.position.y=.74+weight*.09*marketActive;
        mat.emissiveIntensity=weight*.45*marketActive;
        token.userData.active=market.userData.state.signal===name&&marketActive>0;
      }
    }});root.userData.animate(0);if(!bake){applyObservatorySoftShadows(T,root);applyObservatoryAO(T,root);}return root;
}
