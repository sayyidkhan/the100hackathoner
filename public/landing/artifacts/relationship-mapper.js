import { sculpture } from './sculpture.js';

// A conceptual walkthrough of the real product sequence in App.tsx:
// profile → selected opportunity → grouped public contacts → outreach draft.
export function createArtifact(T) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(T);
  const palette={ivory:0xeee4cd,paper:0xd9cdb5,shade:0x8c9c88,blue:0x15483e,ink:0x0b2721,wood:0xb99860,red:0x3c6b59};
  for(const [name,color]of Object.entries(palette)){materials[name].color.setHex(color);materials[name].roughness=.64;}
  materials.wood.metalness=.78;materials.wood.roughness=.27;
  materials.blue.metalness=.18;materials.blue.roughness=.38;
  materials.ink.metalness=.32;materials.ink.roughness=.28;
  const labels=[],lights=[],curves=[];
  const V=a=>new T.Vector3(...a);
  function roundedShape(w,h,r=.07){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function relief(s,depth,color,parent=root,bevel=.012){return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:20}),color,parent);}
  function rounded(w,h,d,x,y,z,color='ivory',parent=root,r=.07){const m=relief(roundedShape(w,h,r),d,color,parent);m.position.set(x,y,z-d/2);return m;}
  function flat(w,d,h,x,y,z,color='ivory',r=.1){const m=rounded(w,d,h,0,0,0,color,root,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;}
  function faceDisk(r,h,x,y,z,color='wood',parent=root){const m=disk(r,h,x,y,z,color,parent);m.rotation.x=Math.PI/2;return m;}
  function ring(r,t,x,y,z,color='wood',parent=root,flat=true){const m=mesh(new T.TorusGeometry(r,t,6,72),color,parent);m.position.set(x,y,z);if(flat)m.rotation.x=Math.PI/2;return m;}
  function rod(a,b,r,color='wood',parent=root){const d=V(b).sub(V(a));const m=mesh(new T.CylinderGeometry(r,r,d.length(),10),color,parent);m.position.copy(V(a).add(V(b)).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  function group(x,y,z){const g=new T.Group();g.position.set(x,y,z);root.add(g);return g;}
  function label(text,x,y,z,width=.8,color='#daceb3',parent=root){
    if(typeof document==='undefined')return;
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.font='500 43px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,48,735);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const mat=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
    const m=new T.Mesh(new T.PlaneGeometry(width,width/8),mat);m.position.set(x,y,z);m.userData.noShadow=true;parent.add(m);labels.push(m);return m;
  }
  // A thin jade instrument deck, with brass perimeter and softly engraved contours.
  flat(8.6,4.9,.16,0,.16,0,'wood',.34);
  flat(8.51,4.81,.09,0,.24,0,'ink',.32);
  flat(8.42,4.72,.025,0,.275,0,'blue',.30);
  for(const material of [materials.blue,materials.ink]){
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vJade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvJade=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vJade;').replace('#include <color_fragment>',`#include <color_fragment>
        float vein=sin(vJade.x*11.+vJade.z*6.+sin(vJade.z*13.)*1.6+sin(vJade.x*17.)*.5);
        diffuseColor.rgb*=.90+.10*pow(abs(vein),22.);`);
    };material.customProgramCacheKey=()=> 'mapper-jade-v2';
  }
  for(let k=0;k<14;k++){
    const points=[];for(let i=0;i<=70;i++){const x=-4+i*8/70,z=-2.1+k*.30+.06*Math.sin(x*1.8+k*.9);points.push([x,.292,z]);}line(points,.0023,k%3?'red':'wood');
  }
  for(const [x,z]of[[-3.3,1.7],[-1.3,-1.6],[.3,1.8],[2.6,-1.6],[3.4,.95]])for(let i=0;i<3;i++)ring(.20+i*.13,.003,x,.294,z,'red');
  for(const [x,z]of[[-3.8,-2],[-3.8,2],[3.8,2],[3.8,-2]]){disk(.045,.02,x,.30,z,'wood');box(.05,.003,.006,x,.313,z,'ink');}

  function cameo(x,y,z,r,variant,parent){
    const g=new T.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(r/.40);
    faceDisk(.41,.035,0,0,0,'wood',g);faceDisk(.385,.035,0,0,.025,'paper',g);
    const shape=new T.Shape();shape.moveTo(-.28,-.29);shape.bezierCurveTo(-.23,-.19,-.12,-.18,-.08,-.14);shape.lineTo(-.07,-.07);shape.bezierCurveTo(-.22,.06,-.17,.27,-.03,.29);shape.bezierCurveTo(.10,.31,.17,.24,.15,.13);shape.lineTo(.23,.045);shape.lineTo(.155,.015);shape.lineTo(.16,-.045);shape.quadraticCurveTo(.14,-.10,.075,-.10);shape.lineTo(.07,-.16);shape.bezierCurveTo(.13,-.18,.24,-.20,.26,-.29);shape.closePath();
    const face=relief(shape,.04,'ivory',g,.008);face.position.z=.06;
    for(let i=0;i<7;i++)line([[-.13,.10+i*.016,.12],[-.16,.23+i*.006,.12],[-.05,.29+i*.004,.12],[.12,.23+i*.006,.12]],.007,variant===1?'wood':'shade',g);
    const ear=ball(.035,-.035,.075,.108,'paper',g);ear.scale.set(.65,1,.5);
    const hair=new T.Shape();hair.moveTo(-.15,.06);hair.bezierCurveTo(-.25,.28,-.06,.35,.10,.28);hair.quadraticCurveTo(.02,.23,-.03,.22);hair.quadraticCurveTo(-.12,.20,-.15,.06);hair.closePath();
    const coiffure=relief(hair,.026,variant===1?'wood':'shade',g,.005);coiffure.position.z=.093;
    if(variant===0){const bun=ball(.07,-.17,.12,.08,'shade',g);bun.scale.z=.5;}
    if(variant===2){ring(.045,.005,.12,.11,.13,'wood',g,false);rod([.08,.12,.13],[-.09,.15,.13],.005,'wood',g);}
    ball(.009,.12,.11,.113,'ink',g);
    for(const side of[-1,1])line([[side*.22,-.23,.11],[side*.10,-.19,.11],[.015,-.30,.11]],.006,'wood',g);
    return g;
  }
  // Profile: one large authored card, with three tangible experience signals.
  const profile=group(-2.95,1.91,.30);
  rounded(1.66,2.95,.09,0,0,-.025,'wood',profile,.12);
  rounded(1.60,2.89,.065,0,0,.045,'ivory',profile,.11);
  cameo(0,.57,.10,.57,0,profile);
  label('YOUR PROFILE',0,1.22,.11,1.22,'#315047',profile);
  for(let i=0;i<3;i++){
    const yy=-.40-i*.30;rounded(1.22,.19,.014,0,yy,.10,'paper',profile,.06);
    faceDisk(.079,.018,-.49,yy,.125,'blue',profile);
    rounded(.66-i*.09,.033,.014,.06,yy,.124,'blue',profile,.012);
    line([[-.52,yy,.14],[-.495,yy-.025,.14],[-.46,yy+.025,.14]],.009,'wood',profile);
  }
  flat(1.85,.66,.105,-2.95,.37,.30,'wood',.14);
  // Selected role in front; two less relevant opportunities remain behind it.
  for(let i=2;i>=0;i--){
    const x=-.56+i*.40,z=-.10-i*.48,h=2.15-i*.08,y=.47+h/2;
    const card=group(x,y,z);
    rounded(1.28,h,.08,0,0,0,i?'red':'wood',card,.10);
    rounded(1.21,h-.075,.045,0,0,.06,i?'shade':'ivory',card,.09);
    label(i?'OPPORTUNITY':'SELECTED ROLE',0,h/2-.14,.10,1.04,i?'#253d32':'#315047',card);
    // Engraved architectural skyline instead of a generic briefcase block.
    for(const [bx,bh,bw]of[[-.28,.47,.20],[-.02,.70,.29],[.27,.40,.23]]){
      rounded(bw,bh,.05,bx,.06+bh/2,.12,i?'red':'paper',card,.012);
      for(let row=0;row<Math.floor(bh/.11)-1;row++)for(let col=0;col<2;col++)box(.037,.045,.008,bx-.055+col*.095,.14+row*.11,.154,'wood',card);
    }
    box(.96,.035,.055,0,.06,.14,'wood',card);
    for(let j=0;j<3;j++)rounded(.83-j*.13,.025,.015,-j*.025,-.19-j*.12,.10,'shade',card,.009);
    for(let j=0;j<3;j++){faceDisk(.064,.018,-.30+j*.30,-.70,.12,i?'red':'blue',card);ball(.017,-.30+j*.30,-.70,.14,'wood',card);}
    flat(1.43,.48,.10,x,.38,z,'wood',.11);
  }
  // Public contact categories, not claims of existing personal relationships.
  const people=[{x:1.5,z:.00,h:1.28,label:'HIRING MANAGER'},{x:2.25,z:-1.45,h:1.95,label:'MENTOR'},{x:3.15,z:.02,h:1.35,label:'ROLE COLLEAGUE'}];
  people.forEach((person,i)=>{
    disk(.28,.065,person.x,.36,person.z,'wood');disk(.23,.02,person.x,.407,person.z,'blue');
    rod([person.x,.42,person.z],[person.x,person.h-.26,person.z],.035);
    const g=group(person.x,person.h,person.z);cameo(0,0,0,.43,i+1,g);
    label(person.label,0,-.56,.11,1.08,'#d7d6b5',g);
  });
  // The final message is a draft laid on a jade tray, with a brass seal.
  flat(1.87,1.15,.07,2.05,.40,1.54,'wood',.12);
  flat(1.78,1.06,.04,2.05,.445,1.54,'ink',.10);
  const envelope=group(2.05,.51,1.54);envelope.rotation.x=-Math.PI/2;
  rounded(1.39,.80,.038,0,0,0,'ivory',envelope,.035);
  const flap=new T.Shape();flap.moveTo(-.66,.36);flap.lineTo(0,-.10);flap.lineTo(.66,.36);flap.closePath();
  const fold=relief(flap,.019,'paper',envelope,.005);fold.position.z=.034;
  for(const side of[-1,1])line([[side*.66,-.35,.034],[0,.10,.034]],.006,'wood',envelope);
  faceDisk(.075,.025,0,-.11,.065,'wood',envelope);
  label('OUTREACH DRAFT',0,-.59,.03,1.4,'#e5c892',envelope);

  // Tiny terminals and curved inlays carry animated signals along the workflow.
  const nodes=[[-2.18,.31,.76],[-.56,.31,.55],[1.5,.31,.43],[2.25,.31,-.97],[3.15,.31,.47],[1.19,.31,1.5]];
  for(const [x,y,z]of nodes){disk(.10,.024,x,y,z,'wood');ring(.15,.009,x,y+.015,z);}
  const routeSpecs=[
    {phase:0,p:[nodes[0],[-1.8,.33,1.04],[-1.06,.33,1.05],nodes[1]]},
    {phase:1,p:[nodes[1],[.28,.33,.52],[.85,.33,.45],nodes[2]]},
    {phase:2,p:[nodes[1],[.35,.33,-.48],[1.38,.33,-.92],nodes[3]]},
    {phase:2,p:[nodes[1],[.38,.33,.87],[2.65,.33,.91],nodes[4]]},
    {phase:3,p:[nodes[2],[1.5,.33,.96],[.93,.33,1.20],nodes[5]]},
  ];
  for(const spec of routeSpecs){
    const curve=new T.CatmullRomCurve3(spec.p.map(V),false,'centripetal');
    const mat=new T.MeshStandardMaterial({color:0xc3a66d,emissive:0xffbb56,emissiveIntensity:.15,metalness:.5,roughness:.35});
    const path=new T.Mesh(new T.TubeGeometry(curve,72,.018,6,false),mat);path.userData.noShadow=true;root.add(path);lights.push(path);curves.push({...spec,curve,path});
  }
  // Static sculpture is batched; texture lettering and signals retain their UVs.
  root.updateMatrixWorld(true);
  for(const obj of [...labels,...lights])root.attach(obj);
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3());
  const offset=new T.Vector3(-center.x,-bounds.min.y,-center.z);
  const model=finish(70,[...labels,...lights]);
  const dynamic=new T.Group();dynamic.position.copy(offset);model.add(dynamic);
  const glowPixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const d=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;glowPixels[i]=glowPixels[i+1]=glowPixels[i+2]=255;glowPixels[i+3]=Math.round(255*Math.pow(Math.max(0,1-d),2.4));}
  const glowTexture=new T.DataTexture(glowPixels,64,64,T.RGBAFormat);glowTexture.needsUpdate=true;
  const signalMaterial=new T.MeshBasicMaterial({color:0xffdfa0,toneMapped:false});
  const signalGeometry=new T.SphereGeometry(.033,10,8);
  const packets=curves.map(()=>{const point=new T.Mesh(signalGeometry,signalMaterial);point.userData.noShadow=true;dynamic.add(point);const halo=new T.Sprite(new T.SpriteMaterial({map:glowTexture,color:0xffbc62,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.scale.setScalar(.28);point.add(halo);return point;});
  const halos=nodes.map(([x,y,z])=>{const material=new T.MeshBasicMaterial({color:0xffc873,transparent:true,opacity:.7,toneMapped:false,depthWrite:false});const halo=new T.Mesh(new T.TorusGeometry(.13,.018,6,64),material);halo.rotation.x=-Math.PI/2;halo.position.set(x,y+.027,z);halo.userData.noShadow=true;dynamic.add(halo);return halo;});
  const focusLight=new T.PointLight(0xffcf85,.28,3.5,2);dynamic.add(focusLight);
  let manual=null,epoch=0;
  const stories=[
    {title:'Start with your proof of work',detail:'Your experience, skills and goals shape the search.'},
    {title:'Choose a relevant opportunity',detail:'Rank live roles by fit, then select one to investigate.'},
    {title:'Find the people around the role',detail:'Research hiring managers, mentors and role colleagues.'},
    {title:'Give the conversation context',detail:'Rank contact paths, then prepare a tailored outreach draft.'},
  ];
  model.userData={...model.userData,displayBase:false,studioProfile:'mapper',groundLevel:0,initialYaw:.14,initialElevation:.52,
    setStep(index,time=0){manual=Number.isInteger(index)&&index>=0&&index<4?index:null;epoch=time;},
    animate(time){
      const age=Math.max(0,time-epoch),phase=manual??Math.floor((age%24)/6);
      curves.forEach(({curve,path},i)=>{
        const active=phase===0?i===0:phase===1?i===0:phase===2?i>=1&&i<=3:i===1||i===4;
        path.material.emissiveIntensity=active?1.8:.035;
        path.material.color.setHex(active?0xd8ad62:0x315e50);
        packets[i].visible=active;packets[i].position.copy(curve.getPointAt((age*.16+i*.27)%1));
      });
      const selected=phase===0?[0]:phase===1?[1]:phase===2?[2,3,4]:[2,5];
      halos.forEach((halo,i)=>{halo.material.opacity=selected.includes(i)?.9:.17;halo.scale.setScalar(selected.includes(i)?1+Math.sin(age*2)*.08:1);});
      const node=nodes[selected[0]];focusLight.position.set(node[0],1.1,node[2]);
      model.userData.story={index:phase,step:`0${phase+1} / 04`,...stories[phase],tone:phase===3?'complete':'flowing'};
    }
  };
  model.userData.animate(0);
  // Height bands remove the unused corners above the thin atlas deck.
  const bands=new Map(),point=new T.Vector3();model.updateMatrixWorld(true);
  model.traverse(o=>{if(!o.isMesh||o.userData.noShadow)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);const key=Math.floor(point.y/.16);if(!bands.has(key))bands.set(key,new T.Box3());bands.get(key).expandByPoint(point);}});
  model.userData.framingPoints=[];
  for(const b of bands.values())for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])model.userData.framingPoints.push(new T.Vector3(x,y,z));
  return model;
}
