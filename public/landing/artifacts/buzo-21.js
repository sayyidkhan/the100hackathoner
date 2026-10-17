import { sculpture } from './sculpture.js';
import { applyBakedAO } from './buzo-atlas-surface.js';

// Buzo: a conversation, a credible shortlist, a night out. The venues are metaphors.
export function createArtifact(T, {bake=false}={}) {
  const {root,materials,mesh,box,finish}=sculpture(T);
  for(const [key,color] of Object.entries({ivory:0xf0e4cd,paper:0xd6c5a7,shade:0x9f947b,red:0x852820,blue:0x24616b,ink:0x14252b,wood:0xb58b46,leaf:0x45533a,leaf2:0x68744b,leaf3:0x354535,skin:0xbd9675,hair:0x302820,fabric:0xc9b594,flower:0xb85570,water:0x144954,glass:0x286e77})){
    materials[key]??=new T.MeshStandardMaterial();materials[key].color.setHex(color);
    materials[key].roughness=key==='wood'?.3:key==='glass'?.2:.72;
    materials[key].metalness=key==='wood'?.7:key==='glass'?.35:0;
  }
  materials.water.roughness=.12;materials.water.metalness=.62;
  materials.water.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 waterPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n waterPosition=position;');
    shader.fragmentShader='varying vec3 waterPosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n normal=normalize(normal+vec3(.09*sin(waterPosition.z*88.0+waterPosition.x*25.0),.0,.06*cos(waterPosition.x*70.0)));');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float caustic=pow(.5+.5*sin(waterPosition.x*31.0+sin(waterPosition.z*22.0)),8.0)*pow(.5+.5*cos(waterPosition.z*58.0+waterPosition.x*12.0),3.0);diffuseColor.rgb+=vec3(.08,.17,.13)*caustic;');
  };
  materials.wood.color.setHex(0xb88b45);materials.wood.roughness=.24;
  materials.red=new T.MeshPhysicalMaterial({color:0x8e151d,roughness:.65,sheen:1,sheenColor:new T.Color(0xcd4840),sheenRoughness:.8});
  materials.fabric.roughness=.88;materials.fabric.side=T.DoubleSide;materials.red.side=T.DoubleSide;
  materials.velvet=new T.MeshPhysicalMaterial({color:0x410c12,roughness:.9,sheen:1,sheenColor:new T.Color(0x8e3029),side:T.DoubleSide});
  materials.route=new T.MeshStandardMaterial({color:0xa6e1d7,emissive:0x39a59b,emissiveIntensity:1.6,roughness:.3});
  materials.brassDark=new T.MeshStandardMaterial({color:0x514022,roughness:.3,metalness:.75});
  materials.warmWall=new T.MeshStandardMaterial({color:0xe5c28c,roughness:.68,emissive:0xc47f32,emissiveIntensity:.15});
  materials.pink=new T.MeshStandardMaterial({color:0xcd3865,roughness:.8});
  materials.leaf4=new T.MeshStandardMaterial({color:0x859354,roughness:.65});
  for(const key of ['leaf','leaf2','leaf3','leaf4'])materials[key].side=T.DoubleSide;
  materials.leaf2.color.setHex(0x54672e);materials.leaf.color.setHex(0x344a25);materials.leaf3.color.setHex(0x20351e);
  // Stone gets fine mineral grain and broad tonal variation in model space.
  // No image projection: every visible surface remains real, rotatable geometry.

  materials.glazing=new T.MeshPhysicalMaterial({color:0x78bec2,transparent:true,opacity:.26,roughness:.09,metalness:.28,side:T.DoubleSide,depthWrite:false});
  // Fine stone variation survives static batching because it uses object position, not UVs.
  for(const key of ['ivory','paper','shade'])materials[key].onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 stonePosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n stonePosition=position;');
    shader.fragmentShader='varying vec3 stonePosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float grain=fract(sin(dot(floor(stonePosition*310.0),vec3(12.9898,78.233,45.164)))*43758.5453); float veins=sin(stonePosition.x*37.0+sin(stonePosition.z*28.0)*2.0+stonePosition.y*18.0); float mineral=sin(stonePosition.x*137.0+stonePosition.y*73.0)*cos(stonePosition.z*119.0+stonePosition.y*45.0); diffuseColor.rgb*=.86+.17*grain+.035*veins+.045*mineral;');
  };
  materials.lamp=new T.MeshStandardMaterial({color:0xffdeb0,emissive:0xffb963,emissiveIntensity:1.5});
  materials.glass.emissive=new T.Color(0x174b50);materials.glass.emissiveIntensity=.18;
  const g=(x,y,z)=>{const o=new T.Group();o.position.set(x,y,z);root.add(o);return o;};
  function ball(r,x,y,z,color='ivory',parent=root){
    const m=mesh(new T.SphereGeometry(r,r<.04?8:16,r<.04?5:10),color,parent);m.position.set(x,y,z);return m;
  }
  function disk(r,h,x,y,z,color='ivory',parent=root){
    const m=mesh(new T.CylinderGeometry(r,r,h,r<.04?10:32),color,parent);m.position.set(x,y,z);return m;
  }
  function line(points,radius=.04,color='blue',parent=root){
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(curve,points.length===2?1:Math.min(40,points.length*5),radius,6,false),color,parent);
  }
  function rounded(w,h,d,x,y,z,c='ivory',parent=root,r=.06){
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:r<.03?1:2,curveSegments:r<.03?2:8}),c,parent);o.position.set(x,y,z-d/2);return o;
  }
  function slab(w,d,h,x,y,z,c='ivory',parent=root,r=.10){const o=rounded(w,d,h,0,0,0,c,parent,r);o.rotation.x=-Math.PI/2;o.position.set(x,y-h/2,z);return o;}
  function ring(r,t,x,y,z,c='wood',parent=root,arc=Math.PI*2){const o=mesh(new T.TorusGeometry(r,t,8,48,arc),c,parent);o.position.set(x,y,z);return o;}
  let visitorId=0;
  function person(x,y,z,s=1,c='ivory',pose=0,style=''){
    const p=g(x,y,z);p.scale.setScalar(s);const id=visitorId++,woman=style==='woman'||style==='host'||(!style&&id%4===1);
    const skinTone=['skin','skin','fabric'][id%3];
    const shape=points=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),12);
    const torso=mesh(shape([[.045,.25],[.057,.29],[.047,.35],[.062,.425],[.046,.445],[.027,.455]]),c,p);torso.scale.z=.65;
    const head=ball(.042,0,.503,0,skinTone,p);head.scale.set(.82,1.26,.86);
    const hair=ball(.043,0,.525,-.008,'hair',p);hair.scale.set(.87,.77,.87);
    const nose=ball(.009,0,.501,.035,skinTone,p);nose.scale.set(.6,.8,1.2);
    disk(.017,.04,0,.452,0,skinTone,p);
    if(woman){
      const hairBack=ball(.043,0,.467,-.026,'hair',p);hairBack.scale.set(.95,style==='host'?.8:1.65,.48);
      if(style==='host')ball(.027,.006,.546,-.029,'hair',p);
      if(style==='woman'){const dress=mesh(shape([[.064,.04],[.067,.10],[.058,.21],[.045,.30]]),c,p);dress.scale.z=.72;}
    }
    if(style==='host'){line([[0,.44,.034],[.024,.38,.043],[.003,.34,.04]],.008,'red',p);}

    for(const sign of [-1,1])ball(.0035,sign*.014,.508,.033,'hair',p);

    for(const sign of [-1,1]){
      line([[sign*.030,.265,0],[sign*.029,.145,pose*sign*.015],[sign*.034,.025,.012]],.018,c==='ivory'?'fabric':c==='fabric'?'paper':'ink',p);
      const shoe=ball(.025,sign*.034,.018,.03,'hair',p);shoe.scale.set(.66,.50,1.40);
      const elbow=[sign*.084,.34,pose*.035],hand=[sign*(pose?.11:.077),pose?.38:.27,.045];
      line([[sign*.055,.422,0],elbow,hand],.017,c,p);ball(.015,...hand,skinTone,p);
      if(c==='ivory')line([[sign*.015,.441,.03],[sign*.035,.39,.036],[sign*.01,.36,.036]],.004,'fabric',p);
    }
    if(c!=='ivory'&&id%2===0)box(.007,.12,.008,0,.36,.039,'brassDark',p);
    p.rotation.y=pose*.35;return p;
  }
  function foliage(x,y,z,r,seed=0){
    for(let i=0;i<42;i++){
      const a=i*2.39996+seed,v=1-2*(i+.5)/42,h=Math.sqrt(1-v*v);
      const leaf=mesh(new T.SphereGeometry(.042,5,3),['leaf','leaf2','leaf3','leaf4'][i%4]);
      leaf.position.set(x+Math.cos(a)*h*r,y+v*r*.75,z+Math.sin(a)*h*r);
      leaf.scale.set(1.25,.24,.55);leaf.rotation.set(a*.4,a,v);
    }
  }
  function frond(x,y,z,angle,length=.5){
    const pts=[];
    for(let i=0;i<=8;i++){
      const t=i/8;pts.push([x+Math.cos(angle)*length*t,y+length*(.75*Math.sin(t*2.4)),z+Math.sin(angle)*length*t]);
      if(i===0)continue;
      const width=length*.19*Math.sin(t*Math.PI);
      for(const side of [-1,1]){
        const [px,py,pz]=pts[i];
        const length=width*1.8+.025,dx=Math.sin(angle)*side,dz=-Math.cos(angle)*side;
        const ex=px+dx*length+Math.cos(angle)*length*.40,ez=pz+dz*length+Math.sin(angle)*length*.40;
        const mx=(px+ex)/2,mz=(pz+ez)/2,half=length*.19;
        const positions=[px,py,pz,mx+Math.cos(angle)*half,py+.015,mz+Math.sin(angle)*half,ex,py-.018,ez,mx-Math.cos(angle)*half,py+.015,mz-Math.sin(angle)*half,mx,py+.03,mz];
        const bladeGeometry=new T.BufferGeometry();bladeGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));bladeGeometry.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);bladeGeometry.computeVertexNormals();mesh(bladeGeometry,i%3?'leaf':'leaf2');
      }
    }
    line(pts,.006,'leaf2');
  }
  function plant(x,y,z,s=1){
    const pot=mesh(new T.CylinderGeometry(.13*s,.10*s,.19*s,16),'paper');pot.position.set(x,y+.095*s,z);
    disk(.132*s,.025,x,y+.19*s,z,'ivory');disk(.11*s,.01,x,y+.205*s,z,'brassDark');
    for(let i=0;i<9;i++)frond(x,y+.20*s,z,i*2.4,.37*s);
  }
  function tree(x,y,z,s=1){
    disk(.20*s,.16*s,x,y+.08*s,z,'paper');
    line([[x,y+.10*s,z],[x-.03*s,y+.54*s,z],[x+.035*s,y+.82*s,z]],.022*s,'brassDark');
    for(let i=0;i<9;i++){
      const a=i*2.4;const tx=x+Math.cos(a)*.27*s,tz=z+Math.sin(a)*.27*s,ty=y+(.76+(i%3)*.09)*s;
      line([[x,y+.45*s,z],[tx*.45+x*.55,ty-.20*s,tz*.45+z*.55],[tx,ty,tz]],.009*s,'wood');foliage(tx,ty,tz,.20*s,i);
    }
  }
  function palm(x,y,z,s=1){
    line([[x,y,z],[x-.05*s,y+.50*s,z],[x+.04*s,y+.95*s,z]],.023*s,'brassDark');
    for(let i=0;i<10;i++)frond(x+.04*s,y+.95*s,z,i*2.4,.65*s);
  }
  function flowers(x,y,z,r=.15){foliage(x,y,z,r);for(let i=0;i<16;i++){const a=i*2.4;const h=(i%4)*.035;const b=ball(.022,x+Math.cos(a)*r,y+h,z+Math.sin(a)*r,'pink');b.scale.y=.5;}}
  function railing(x1,z1,x2,z2,y){
    const distance=Math.hypot(x2-x1,z2-z1),n=Math.ceil(distance/.18);
    for(let i=0;i<=n;i++){const t=i/n;disk(.012,.32,x1+(x2-x1)*t,y+.16,z1+(z2-z1)*t,'wood');}
    line([[x1,y+.32,z1],[x2,y+.32,z2]],.018,'wood');line([[x1,y+.07,z1],[x2,y+.07,z2]],.009,'wood');
  }
  function lamp(x,z){
    disk(.075,.06,x,.32,z,'brassDark');disk(.05,.11,x,.39,z,'wood');disk(.018,.77,x,.81,z,'brassDark');
    for(const y of [.46,1.13,1.20,1.40])disk(y===1.40?.065:.04,.025,x,y,z,'wood');
    const lantern=mesh(new T.CylinderGeometry(.042,.057,.19,6),'lamp');lantern.position.set(x,1.30,z);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[x+Math.cos(a)*.057,1.20,z+Math.sin(a)*.057],[x+Math.cos(a)*.042,1.40,z+Math.sin(a)*.042]],.006,'brassDark');}
    const cap=mesh(new T.ConeGeometry(.076,.10,6),'brassDark');cap.position.set(x,1.46,z);ball(.018,x,1.52,z,'wood');
  }
  function steps(x,z,w,_top){for(let i=0;i<4;i++){slab(w,.24,.07*(i+1),x,.30+.035*(i+1),z-i*.15,'ivory');box(w-.09,.013,.012,x,.31+.07*(i+1),z-i*.15+.12,'lamp');}}
  function pin(x,y,z){
    disk(.11,.035,x,y,z,'wood');const p=g(x,y+.18,z);ring(.085,.034,0,.035,0,'red',p);
    const tip=mesh(new T.ConeGeometry(.065,.15,3),'red',p);tip.position.y=-.09;tip.rotation.z=Math.PI;
  }
  // One architectural block, with paving, planted edges and stepped venues.
  slab(7.8,5.8,.26,0,.13,0,'paper',root,.58);slab(7.72,5.72,.025,0,.275,0,'ivory',root,.55);
  slab(7.70,5.70,.025,0,.025,0,'wood',root,.56);
  for(let row=0;row<39;row++)for(let col=0;col<45;col++){
    const x=-3.60+col*.164+(row%2)*.075,z=-2.60+row*.138;
    if(Math.abs(x)<3.60 && !(x>1.55&&z>1.4&&z<2.54))slab(.154,.128,.008,x,.294,z,(row+col)%5===0?'paper':'ivory',root,.014);
  }
  // Music club: marquee arch, velvet folds, instruments and small cabaret tables.
  const stageStart=new Set(root.children);
  const sx=-2.40,sz=-.95;
  slab(2.30,2.30,.22,sx,.40,sz,'paper');slab(2.10,1.40,.08,sx,.55,sz-.24,'ink');
  box(2.12,1.42,.12,sx,1.25,sz-.98,'ink');
  for(let i=0;i<27;i++){const fold=mesh(new T.CylinderGeometry(.034,.042,1.35,8),'velvet');fold.position.set(sx-.85+i*.065,1.29,sz-.88);}

  for(const side of [-1,1]){
    box(.17,1.55,.24,sx+side*1.04,1.30,sz-.82,'ivory');
    const verts=[],indices=[];
    for(let iy=0;iy<=30;iy++)for(let ix=0;ix<=16;ix++){
      const v=iy/30,u=ix/16;const inner=.60+.18*Math.sin(v*Math.PI);
      verts.push(sx+side*(inner+u*(.98-inner)),.60+v*1.47,sz-.68+.032*Math.sin(u*8*Math.PI));
    }
    for(let iy=0;iy<30;iy++)for(let ix=0;ix<16;ix++){const a=iy*17+ix;indices.push(a,a+1,a+17,a+1,a+18,a+17);}
    const cloth=new T.BufferGeometry();cloth.setAttribute('position',new T.Float32BufferAttribute(verts,3));cloth.setIndex(indices);cloth.computeVertexNormals();mesh(cloth,'red');
    line([[sx+side*.80,1.35,sz-.61],[sx+side*.90,1.32,sz-.59],[sx+side*.99,1.35,sz-.61]],.012,'wood');
    box(.27,.55,.23,sx+side*.82,.83,sz+.18,'ink');
    for(const y of [.70,.91])ring(.07,.014,sx+side*.82,y,sz+.302,'wood');
  }
  const archBack=new T.Shape();archBack.absarc(0,0,.98,0,Math.PI,false);archBack.lineTo(.98,0);
  const backing=mesh(new T.ShapeGeometry(archBack),'velvet');backing.position.set(sx,2.02,sz-.88);
  ring(1.04,.105,sx,2.02,sz-.82,'ivory',root,Math.PI);
  ring(.93,.025,sx,2.02,sz-.68,'wood',root,Math.PI);
  // Pleated overhead valance follows the curved proscenium, with a scalloped hem.
  const valanceVertices=[],valanceIndices=[];
  for(let i=0;i<=64;i++)for(let j=0;j<=6;j++){
    const x=-.88+i*1.76/64,v=j/6,upper=2.02+Math.sqrt(.93*.93-x*x),lower=2.13+.15*Math.abs(Math.sin(i*Math.PI/32));
    valanceVertices.push(sx+x,lower+(upper-lower)*v,sz-.76+.025*Math.sin(i*Math.PI/2));
  }
  for(let i=0;i<64;i++)for(let j=0;j<6;j++){const a=i*7+j;valanceIndices.push(a,a+7,a+1,a+1,a+7,a+8);}
  const valanceGeo=new T.BufferGeometry();valanceGeo.setAttribute('position',new T.Float32BufferAttribute(valanceVertices,3));valanceGeo.setIndex(valanceIndices);valanceGeo.computeVertexNormals();mesh(valanceGeo,'red');
  // Stone arch depth, cornices and gathered velvet rather than a closed red panel.
  for(const z of [sz-1.02,sz-.86,sz-.68])ring(1.06,.08,sx,2.02,z,'paper',root,Math.PI);
  for(const side of [-1,1]){
    for(const y of [.57,1.98])box(.30,.10,.48,sx+side*1.04,y,sz-.83,'paper');
    box(.055,1.35,.07,sx+side*1.04,1.25,sz-.56,'wood');
    for(let i=0;i<6;i++)line([[sx+side*(.10+i*.07),2.93-i*.025,sz-.80],[sx+side*(.42+i*.065),2.58-i*.045,sz-.66],[sx+side*.88,2.13+i*.035,sz-.66]],.045,'red');
  }
  for(let i=0;i<7;i++){const a=.12+i*.48;const lx=sx+.85*Math.cos(a),ly=2.02+.85*Math.sin(a);disk(.045,.07,lx,ly,sz-.59,'wood');ball(.027,lx,ly-.04,sz-.59,'lamp');}
  const marquee=[];
  for(let i=0;i<=20;i++){const a=i*Math.PI/20;const bulb=ball(.035,sx+.94*Math.cos(a),2.02+.94*Math.sin(a),sz-.65,'lamp');marquee.push(bulb);}
  for(const side of [-1,1])for(let i=0;i<8;i++)ball(.028,sx+side*.94,.69+i*.17,sz-.65,'lamp');

  const drum=disk(.22,.22,sx-.22,.85,sz-.15,'red');drum.rotation.x=Math.PI/2;
  const skin=disk(.19,.012,sx-.22,.85,sz-.03);skin.rotation.x=Math.PI/2;
  for(const dx of [-.5,.15]){disk(.012,.48,sx+dx,.85,sz-.35,'wood');disk(.17,.015,sx+dx,1.10,sz-.35,'wood');}
  for(const [dx,z] of [[.43,sz+.05],[-.55,sz+.12]]){disk(.08,.025,sx+dx,.61,z,'ink');line([[sx+dx,.62,z],[sx+dx,1.16,z],[sx+dx+.08,1.20,z]],.012,'wood');}
  const guitar=ball(.12,sx+.5,.91,sz-.36,'wood');guitar.scale.set(.7,1.4,.4);box(.045,.38,.035,sx+.50,1.14,sz-.36,'wood');
  person(sx+.36,.60,sz-.40,1.25,'ink',1);person(sx-.58,.60,sz-.34,1.20,'red',-1);person(sx-.15,.60,sz-.50,1.15,'ink');
  for(const x of [-.85,.85])railing(sx+x,sz+.40,sx+x,sz+1.0,.51);
  for(const x of [-.70,.70]){disk(.18,.025,sx+x,.89,sz+.72,'wood');disk(.018,.37,sx+x,.70,sz+.72,'wood');ball(.025,sx+x,.94,sz+.72,'lamp');person(sx+x-.16,.52,sz+.88,.82,'fabric',1);person(sx+x+.15,.52,sz+.68,.80,'ink',-1);}
  railing(sx-1.0,sz+1.0,sx-.75,sz+1.0,.51);railing(sx+.75,sz+1.0,sx+1.0,sz+1.0,.51);
  steps(sx,sz+1.37,1.5,.50);
  // A curved glazed barrel roof and carved arch mouldings give the club its silhouette.
  for(const z of [sz-1.09,sz-.80,sz-.50])ring(1.13,.025,sx,2.02,z,'wood',root,Math.PI);
  for(let i=0;i<=24;i++){
    const a=i*Math.PI/24,x=sx+1.12*Math.cos(a),y=2.02+1.12*Math.sin(a);
    line([[x,y,sz-1.10],[x,y,sz-.48]],.009,'brassDark');
    if(i%2===0){const voussoir=box(.10,.035,.14,x,y,sz-.48,'paper');voussoir.rotation.z=a+Math.PI/2;}
  }
  const roofVertices=[],roofIndices=[];
  for(let i=0;i<=48;i++){const a=i*Math.PI/48;for(const z of [sz-1.1,sz-.48])roofVertices.push(sx+1.105*Math.cos(a),2.02+1.105*Math.sin(a),z);}
  for(let i=0;i<48;i++){const a=i*2;roofIndices.push(a,a+1,a+2,a+1,a+3,a+2);}
  const roofGeometry=new T.BufferGeometry();roofGeometry.setAttribute('position',new T.Float32BufferAttribute(roofVertices,3));roofGeometry.setIndex(roofIndices);roofGeometry.computeVertexNormals();mesh(roofGeometry,'glazing');
  for(const side of [-1,1]){
    for(let i=0;i<3;i++)box(.30+i*.045,.035,.42,sx+side*1.04,1.93+i*.04,sz-.77,'ivory');
    for(let i=0;i<4;i++)box(.025,1.20,.02,sx+side*1.04+(i-1.5)*.032,1.23,sz-.55,'paper');
    for(const y of [.72,1.75]){const ornament=ring(.047,.012,sx+side*1.04,y,sz-.54,'wood');ornament.scale.y=1.6;}
    plant(sx+side*1.04,.52,sz+.51,.90);
  }
  for(const x of [-.48,0,.48]){disk(.14,.025,sx+x,.90,sz+.71,'wood');disk(.012,.37,sx+x,.71,sz+.71,'wood');ball(.018,sx+x,.94,sz+.71,'lamp');person(sx+x-.10,.52,sz+.90,.84,'ink',1);}
  // The unseen rear is completed as a stone theatre elevation for full orbiting.
  box(2.08,1.43,.05,sx,1.26,sz-1.06,'paper');
  const rearArch=mesh(new T.ShapeGeometry(archBack),'paper');rearArch.rotation.y=Math.PI;rearArch.position.set(sx,2.02,sz-1.065);
  for(let row=0;row<6;row++)box(2.06,.008,.012,sx,.59+row*.25,sz-1.096,'shade');
  for(const side of [-1,1]){
    box(.30,.72,.035,sx+side*.16,.97,sz-1.11,'brassDark');
    box(.01,.09,.025,sx+side*.045,.99,sz-1.14,'wood');
    box(.045,.12,.045,sx+side*.68,1.34,sz-1.11,'lamp');
  }
  ring(.17,.025,sx,2.37,sz-1.10,'wood');
  for(let i=0;i<5;i++)box(.22,.012,.02,sx,2.30+i*.035,sz-1.12,'brassDark');
  const stage=g(0,0,0);for(const o of [...root.children])if(o!==stage&&!stageStart.has(o))stage.add(o);
  // Widen about the theatre's center, not the origin of the whole scene.
  stage.scale.x=1.12;stage.position.x=-sx*.12;
  // Tall gallery, with open front bays, teal side glazing and rooftop planting.
  const galleryStart=new Set(root.children);
  const gx=.05,gz=-1.70;
  slab(2.15,1.65,.24,gx,.40,gz,'paper');
  box(2.05,2.40,.12,gx,1.72,gz-.73,'warmWall');
  for(const side of [-1,1]){
    box(.025,2.35,1.35,gx+side*.99,1.72,gz,'glazing');
    for(let j=0;j<4;j++)box(.055,2.4,.035,gx+side*1.03,1.72,gz-.60+j*.4,'wood');
  }
  for(const y of [1.55,2.75])box(1.94,.25,.035,gx,y,gz+.70,'glass');
  for(const y of [.54,1.75,2.95])slab(2.20,1.70,.10,gx,y,gz,'ivory');
  for(const x of [-.98,.98])box(.18,2.44,.18,gx+x,1.72,gz+.72,'paper');
  for(const x of [-.77,-.26,.26,.77])for(const y of [1.14,2.34])box(.46,1.10,.012,gx+x,y,gz+.74,'glazing');
  for(const x of [-1.03,-.52,0,.52,1.03])box(.055,2.40,.055,gx+x,1.73,gz+.73,'wood');
  for(const y of [1.12,2.32]){
    for(const [i,x] of [-.60,.60].entries()){
      rounded(.52,.65,.04,gx+x,y,gz-.64,'wood');rounded(.44,.57,.02,gx+x,y,gz-.61,'paper');
      const a=ball(.15,gx+x-.06,y+.04,gz-.58,i?'blue':'red');a.scale.set(.6,1.3,.1);
      box(.11,.19,.012,gx+x+.11,y-.11,gz-.56,i?'red':'blue');
    }
    box(.25,.28,.25,gx,y-.36,gz-.05,'paper');
    line([[gx-.035,y-.20,gz],[gx+.09,y-.02,gz],[gx-.08,y+.13,gz],[gx+.025,y+.28,gz]],.055,'ivory');
    person(gx-.55,y-.57,gz+.36,.78,'ink');
    box(1.75,.025,.025,gx,y+.45,gz-.50,'lamp');
  }
  slab(1.9,.34,.15,gx,3.06,gz-.48,'paper');for(let i=0;i<9;i++)foliage(gx-.8+i*.2,3.20,gz-.48,.15,i);
  for(const x of [-.92,.92])plant(gx+x,3.00,gz+.48,.7);
  railing(gx-.92,gz+.66,gx+.92,gz+.66,1.80);
  for(const x of [-.64,.65])person(gx+x,.60,gz+.22,.95,'fabric',x<0?1:-1);
  tree(gx-.70,3.0,gz-.35,.60);tree(gx+.66,3.0,gz-.25,.55);
  for(const side of [-1,1])for(let row=0;row<10;row++)box(.20,.23,.018,gx+side*.98,.65+row*.235,gz+.83,row%3?'ivory':'paper');
  // Thin curtain wall mullions and continuous glass balcony, lit from inside.
  for(let i=0;i<13;i++){
    const x=gx-.98+i*.163;
    box(.014,2.40,.045,x,1.73,gz+.76,'wood');
    for(const y of [1.55,2.75])box(.012,.24,.06,x,y,gz+.72,'brassDark');
  }
  for(const y of [1.49,2.70])box(1.92,.020,.06,gx,y,gz+.76,'wood');
  for(const y of [.59,1.80]){
    for(const x of [-.80,.78]){person(gx+x,y,gz+.43,.84,x<0?'fabric':'ink',1);}
    for(const x of [-.92,.92])box(.016,.90,.016,gx+x,y+.53,gz+.54,'lamp');
  }
  for(const x of [-.90,.90]){palm(gx+x,3.03,gz-.20,.55);}
  for(let i=0;i<7;i++){plant(gx-.74+i*.25,3.01,gz+.51,.45);}
  slab(.85,.60,.045,gx,3.41,gz-.10,'fabric');
  for(const x of [-.4,.4])for(const z of [-.37,.15])disk(.012,.40,gx+x,3.20,gz+z,'wood');
  for(const side of [-1,1])for(let i=0;i<4;i++){const x=gx+side*.95,z=gz+.30-i*.23;for(let j=0;j<4;j++)foliage(x,2.98-j*.09,z,.055,j+i);}
  for(let row=0;row<10;row++)for(let col=0;col<6;col++){
    box(.325,.231,.026,gx-.845+col*.338,.665+row*.236,gz-.806,(row+col)%4?'paper':'ivory');
  }
  for(const y of [1.11,2.31])for(const x of [-.64,.64]){
    rounded(.40,.65,.03,gx+x,y,gz-.838,'wood',root,.025);
    box(.32,.57,.01,gx+x,y,gz-.86,'glass');
    box(.012,.57,.015,gx+x,y,gz-.87,'wood');box(.32,.012,.015,gx+x,y,gz-.87,'wood');
  }
  const gallery=g(0,0,0);for(const o of [...root.children])if(o!==gallery&&!galleryStart.has(o))gallery.add(o);gallery.scale.y=1.05;gallery.scale.x=1.35;
  steps(gx,gz+1.32,1.55,.50);
  // Rooftop social lounge: airy pergola, bar, seating and festoon lighting.
  const lx=2.49,lz=-.67;
  slab(2.10,2.45,.42,lx,.50,lz,'paper');slab(1.98,2.32,.045,lx,.735,lz,'ivory');
  for(const x of [-.92,.92])for(const z of [-1.05,1.05])disk(.035,1.70,lx+x,1.60,lz+z,'wood');
  for(const z of [-1.05,1.05])box(2.0,.06,.07,lx,2.46,lz+z,'wood');
  for(let i=0;i<8;i++)box(.045,.055,2.18,lx-.94+i*.27,2.47,lz,'wood');
  box(1.65,.43,.27,lx,1.0,lz-.83,'red');slab(1.75,.36,.045,lx,1.24,lz-.83,'wood');
  for(let i=0;i<7;i++)disk(.025,.13,lx-.65+i*.2,1.32,lz-.83,i%2?'glass':'wood');
  for(const x of [-.51,.50]){
    disk(.24,.035,lx+x,1.15,lz+.15,'wood');disk(.025,.37,lx+x,.96,lz+.15,'wood');
    for(const z of [-.20,.45]){rounded(.34,.22,.10,lx+x,.90,lz+z,'blue');box(.34,.08,.28,lx+x,.80,lz+z+.05,'blue');}
    person(lx+x,.75,lz+.70,.78,x<0?'ivory':'ink');
  }
  for(const z of [-.76,.78]){
    line([[lx-.89,2.38,lz+z],[lx,2.25,lz+z],[lx+.89,2.38,lz+z]],.009,'ink');
    for(let i=0;i<7;i++)ball(.027,lx-.8+i*.267,2.26+.12*Math.pow((i-3)/3,2),lz+z,'lamp');
  }
  slab(1.9,.30,.12,lx,2.52,lz-.80,'paper');for(let i=0;i<9;i++)foliage(lx-.8+i*.2,2.65,lz-.80,.16,i);
  // Draped canopy, a planted parapet and lounge sofas fill the terrace.
  for(const z of [-1.02,1.02])line([[lx-.90,2.43,lz+z],[lx,2.19,lz+z],[lx+.90,2.43,lz+z]],.045,'fabric');
  for(const x of [-.92,.92])railing(lx+x,lz-1.03,lx+x,lz+1.07,.75);
  railing(lx-.90,lz+1.10,lx+.90,lz+1.10,.75);
  for(const x of [-.71,.65]){
    rounded(.52,.30,.12,lx+x,1.00,lz+.47,'fabric');slab(.52,.35,.10,lx+x,.85,lz+.35,'fabric');
    person(lx+x-.08,.76,lz-.35,1.02,'fabric',1);person(lx+x+.10,.76,lz+.32,.90,'ink',-1);
  }
  for(const x of [-.90,.90])for(const z of [-1.05,.98])plant(lx+x,.76,lz+z,.75);
  for(let i=0;i<18;i++){
    const z=lz-1.0+i*.12;foliage(lx+.91,2.48,z,.12,i);
    for(let j=0;j<3;j++)ball(.025,lx+.91+Math.sin(i+j)*.08,2.48+Math.cos(i+j)*.05,z,'flower');
  }
  for(const x of [-.71,.65])for(const dx of [-.14,.14]){const cushion=ball(.10,lx+x+dx,.98,lz+.42,'fabric');cushion.scale.set(1.1,.95,.38);cushion.rotation.z=dx*.7;}
  for(const [x,z] of [[-.50,.15],[.50,.15]]){disk(.025,.055,lx+x,1.20,lz+z,'glazing');disk(.035,.005,lx+x+.08,1.175,lz+z,'ivory');ball(.018,lx+x-.10,1.21,lz+z,'lamp');}
  // Fabric sails hang between the pergola beams, with folds along their edges.
  for(const offset of [-.70,0,.70]){
    const vs=[],idx=[];
    for(let a=0;a<=24;a++)for(let b=0;b<=6;b++){
      const u=a/24,v=b/6;vs.push(lx-.91+u*1.82,2.43-.25*Math.sin(u*Math.PI)+.015*Math.sin(v*6*Math.PI),lz+offset+(v-.5)*.47);
    }
    for(let a=0;a<24;a++)for(let b=0;b<6;b++){const n=a*7+b;idx.push(n,n+7,n+1,n+1,n+7,n+8);}
    const cloth=new T.BufferGeometry();cloth.setAttribute('position',new T.Float32BufferAttribute(vs,3));cloth.setIndex(idx);cloth.computeVertexNormals();mesh(cloth,'fabric');
  }
  for(const x of [-.75,0,.75]){
    disk(.015,.26,lx+x,2.12,lz+.60,'wood');
    const lantern=ball(.075,lx+x,1.95,lz+.60,'lamp');lantern.scale.y=1.25;
    for(let i=0;i<8;i++){const a=i*Math.PI/4;line([[lx+x+Math.cos(a)*.02,2.04,lz+.60+Math.sin(a)*.02],[lx+x+Math.cos(a)*.075,1.95,lz+.60+Math.sin(a)*.075],[lx+x+Math.cos(a)*.02,1.86,lz+.60+Math.sin(a)*.02]],.004,'wood');}
  }
  for(let i=0;i<15;i++){
    const z=lz-.98+i*.14;flowers(lx+.94,2.51,z,.12);
    if(i%2===0)for(let j=1;j<5;j++)flowers(lx+.96,2.51-j*.12,z,.065);
  }
  for(const z of [-.86,.72])palm(lx+.80,.76,lz+z,.9);
  steps(lx,lz+1.77,1.5,.50);
  // The conversation is the focal point: fluted concierge desk, phone shortlist, visitors.
  const cz=1.66;
  disk(.97,.055,-.24,.33,cz,'red');
  function crescent(r,inner,height,y,c){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI,false);s.absarc(0,0,inner,Math.PI,0,true);s.closePath();const geo=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2});geo.rotateX(-Math.PI/2);const o=mesh(geo,c);o.rotation.y=Math.PI;o.position.set(-.24,y,cz);}
  crescent(.85,.65,.53,.37,'red');crescent(.88,.62,.045,.92,'wood');crescent(.865,.635,.012,.964,'ivory');crescent(.86,.64,.035,.38,'wood');
  for(let i=0;i<30;i++){const a=i*Math.PI/29;disk(.012,.46,-.24+.86*Math.cos(a),.65,cz+.86*Math.sin(a),'wood');}
  person(-.24,.36,cz-.10,2.03,'ivory',1,'host');const scarf=ring(.042,.016,-.24,1.28,cz-.09,'red');scarf.rotation.x=Math.PI/2;
  const guest=person(-.55,.30,2.67,2.05,'blue',1,'man');guest.rotation.y=Math.PI-.16;const partner=person(.06,.30,2.63,1.98,'fabric',-1,'woman');partner.rotation.y=Math.PI+.14;
  disk(.105,.02,.30,.98,2.24,'wood');const bell=ball(.09,.30,1.01,2.24,'wood');bell.scale.y=.6;ball(.02,.30,1.09,2.24,'wood');
  // A small desktop globe supports the worldwide ambition without dominating the scene.
  disk(.11,.025,-.85,.98,2.08,'wood');disk(.018,.12,-.85,1.05,2.08,'wood');
  ball(.13,-.85,1.23,2.08,'blue');ring(.16,.014,-.85,1.23,2.08,'wood');
  const phone=g(.88,.33,1.26);phone.rotation.y=-.09;
  rounded(.89,1.89,.12,0,1.02,0,'wood',phone,.13);rounded(.83,1.83,.03,0,1.02,.08,'ivory',phone,.12);
  rounded(.23,.055,.01,0,1.84,.102,'ink',phone,.025);
  // Event cards retain real miniature relief, with legible visual hierarchy.
  for(let i=0;i<3;i++){
    const y=1.50-i*.46;rounded(.68,.32,.015,0,y,.108,i===0?'ink':i===1?'glass':'blue',phone,.025);
    if(i===0){
      for(let j=0;j<8;j++)line([[-.29+j*.08,y+.13,.137],[-.15+j*.04,y-.03,.137]],.004,'wood',phone);
      for(let j=0;j<17;j++){const x=-.30+j*.037;ball(.015,x,y-.06+(j%3)*.014,.14,'skin',phone);box(.024,.04,.013,x,y-.095,.14,'red',phone);}
    }else if(i===1){
      for(let j=0;j<6;j++){box(.075,.24,.012,-.26+j*.105,y,.14,'warmWall',phone);box(.007,.27,.01,-.31+j*.105,y,.16,'wood',phone);}
      for(const x of [-.20,0,.20]){box(.04,.09,.014,x,y+.02,.16,'red',phone);ball(.009,x,y-.05,.16,'skin',phone);}
    }else{
      for(let j=0;j<13;j++){const x=-.29+j*.047,h=.05+(Math.sin(j*7)+1)*.07;box(.035,h,.012,x,y-.10+h/2,.14,'paper',phone);}
      box(.47,.015,.012,.03,y+.07,.16,'wood',phone);
    }
    ball(.019,-.29,y-.20,.14,'red',phone);
    for(let j=0;j<2;j++)box(j?.27:.42,.009,.008,-.03-(j?.075:0),y-.185-j*.026,.14,j?'paper':'ink',phone);
  }
  const typing=g(.88,.63,1.38);rounded(.51,.13,.02,0,0,0,'red',typing,.05);
  const dots=[];for(const x of [-.15,0,.15])dots.push(ball(.014,x*.7,0,.025,'ivory',typing));
  // Embedded routes and practical streetscape details keep the district coherent.
  for(const points of [ [[-.9,.31,1.63],[-1.65,.31,1.11],[-2.4,.31,.51]], [[.1,.31,.88],[.05,.31,.30],[.05,.31,-.32]], [[1.25,.31,1.53],[1.80,.31,1.43],[2.49,.31,1.14]] ]){
    line(points,.029,'wood');line(points.map(([x,y,z])=>[x,y+.012,z]),.014,'route');
  }
  pin(-2.4,.31,.52);pin(.05,.31,-.33);pin(2.49,.31,1.16);
  for(const [x,z] of [[-3.45,-1.9],[-3.40,.9],[3.45,-1.9],[3.45,1.6],[-1.2,-2.45],[1.25,-2.40]])tree(x,.30,z,.72);
  for(const [x,z] of [[-1.4,.3],[1.33,.1],[-3.2,2.1],[3.1,2.2]])plant(x,.30,z,.85);
  for(const [x,z] of [[-3.25,1.75],[-1.35,1.95],[1.62,2.18],[3.37,.65]])lamp(x,z);
  for(const [x,z] of [[-2.95,-.02],[-1.95,.04]]){disk(.18,.035,x,.81,z,'wood');disk(.025,.28,x,.65,z,'wood');person(x+.20,.52,z,.65);}
  // Reflecting canal and a small arched bridge on the right foreground.
  slab(1.97,1.10,.035,2.47,.325,1.98,'water',root,.08);
  for(const z of [1.41,2.55])slab(2.08,.10,.09,2.47,.35,z,'paper');
  for(let i=0;i<24;i++){
    const x=1.61+(i%8)*.24,z=1.53+Math.floor(i/8)*.36;
    line([[x,.349,z],[x+.09,.349,z+.025],[x+.16,.349,z]],.002,i%3?'blue':'route');
  }
  slab(1.97,.43,.035,2.47,.325,1.22,'water',root,.08);slab(2.08,.08,.09,2.47,.35,.98,'paper');
  const bridgeShape=new T.Shape();
  for(let i=0;i<=24;i++){const z=1.41+i*1.14/24,y=.39+.19*Math.sin(i*Math.PI/24);if(i===0)bridgeShape.moveTo(z,y);else bridgeShape.lineTo(z,y);}
  for(let i=24;i>=0;i--){const z=1.41+i*1.14/24,y=.29+.19*Math.sin(i*Math.PI/24);bridgeShape.lineTo(z,y);}bridgeShape.closePath();
  const bridgeMesh=mesh(new T.ExtrudeGeometry(bridgeShape,{depth:.56,bevelEnabled:false}),'paper');bridgeMesh.rotation.y=-Math.PI/2;bridgeMesh.position.x=3.03;
  for(let i=0;i<11;i++){const z=1.41+i*.114,y=.39+.19*Math.sin(i/10*Math.PI);slab(.54,.115,.07,2.75,y,z,'paper',root,.025);}
  for(const x of [2.46,3.04]){
    const points=[];for(let i=0;i<11;i++){const z=1.41+i*.114,y=.39+.19*Math.sin(i/10*Math.PI);disk(.012,.27,x,y+.16,z,'wood');points.push([x,y+.30,z]);}line(points,.017,'wood');
  }
  for(const [x,z] of [[-1.25,1.06],[-2.42,1.70],[1.30,.75]]){tree(x,.31,z,.95);slab(.65,.45,.30,x,.45,z,'paper');}
  // Courtyard benches, planted walls and people add the density of the artwork.
  for(const [x,z] of [[-2.1,2.15],[-1.4,.35]]){
    slab(.76,.27,.08,x,.57,z,'wood');box(.76,.24,.065,x,.72,z-.13,'wood');
    for(const sign of [-1,1])box(.06,.25,.22,x+sign*.28,.43,z,'wood');person(x+.10,.42,z,.90,'ink',1);
  }
  for(const [x,z] of [[-3.55,-.60],[-3.5,1.05],[3.5,.7],[-.8,-2.4],[1.4,-2.4]])plant(x,.31,z,1.1);
  slab(1.75,.30,.23,-2.65,.41,2.59,'paper');
  for(let i=0;i<12;i++){const x=-3.42+i*.14;foliage(x,.64,2.59,.10,i);}
  for(const [x,z] of [[-3.55,-1.4],[-1.30,-1.7],[3.45,-1.8],[1.3,-2.10]])palm(x,.40,z,1.4);
  for(const [x,z] of [[-3.4,.7],[3.4,.8],[-1.15,.55],[1.35,.15]]){flowers(x,.65,z,.19);plant(x,.30,z,.85);}
  for(const [x,z] of [[-3.65,1.25],[-2.6,2.5],[-.98,2.65],[1.65,1.35],[3.5,2.45],[1.30,-.65],[-1.25,-.7]])lamp(x,z);
  for(const [x,z,turn] of [[-.80,.33,.6],[-.58,.13,-.7],[-2.9,.56,.5],[-2.69,.75,-1],[1.2,.33,.7],[1.41,.45,-1]]){const visitor=person(x,.30,z,.96,turn>0?'ink':'fabric',1);visitor.rotation.y=turn;}
  // Tiered flower beds frame the venues and illuminate their stone retaining walls.
  for(const [x,z] of [[-3.65,-.7],[-3.65,.20],[3.59,-.5],[3.59,.35]]){
    slab(.33,.74,.44,x,.52,z,'paper');for(let j=0;j<5;j++){plant(x,.75,z-.29+j*.14,.42);flowers(x,.98,z-.29+j*.14,.07);}
  }

  // Reference-derived content belongs only on actual flat displays and paintings.
  // Buildings, furniture, planting and people remain full geometry at every angle.
  const inserts=g(0,0,0);inserts.userData.noAO=true;
  const referenceTexture=(!bake&&typeof document!=='undefined')?new T.TextureLoader().load(
    new URL('../assets/projects/068-buzo-21-night-v2.png',import.meta.url).href,
    ()=>root.userData.requestRender?.()
  ):null;
  if(referenceTexture){referenceTexture.colorSpace=T.SRGBColorSpace;referenceTexture.anisotropy=4;}
  const screenMaterial=new T.MeshStandardMaterial({map:referenceTexture,color:0xffffff,roughness:.34,emissive:0xffffff,emissiveMap:referenceTexture,emissiveIntensity:.18});
  function inset(w,h,x,y,z,corners,yaw=0){
    const geo=new T.PlaneGeometry(w,h);
    const uv=geo.attributes.uv;
    // Plane vertices: top-left, top-right, bottom-left, bottom-right.
    [corners[0],corners[1],corners[3],corners[2]].forEach(([u,v],i)=>uv.setXY(i,u/1536,1-v/1024));
    const panel=new T.Mesh(geo,screenMaterial);panel.position.set(x,y,z);panel.rotation.y=yaw;inserts.add(panel);
  }
  const cardCorners=[[[924,481],[1010,487],[1006,531],[920,526]],[[918,552],[1005,560],[1001,600],[915,593]],[[913,617],[999,627],[996,665],[910,656]]];
  for(let i=0;i<3;i++){
    const p=new T.Vector3(0,1.50-i*.46,.18).applyEuler(phone.rotation).add(phone.position);
    inset(.64,.29,p.x,p.y,p.z,cardCorners[i],phone.rotation.y);
  }
  for(const y of [1.12,2.32])for(const [i,x] of [-.60,.60].entries()){
    const crop=i?[[865,181],[925,181],[925,256],[865,256]]:[[715,174],[782,174],[782,250],[715,249]];
    inset(.44*1.35,.57*1.05,(gx+x)*1.35,y*1.05,gz-.54,crop);
  }
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),framingPoints=[];
  for(const o of root.children){const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x-center.x,y-bounds.min.y,z-center.z));}
  const model=finish(68,[typing,inserts]);const typingY=typing.position.y;
  const lighting=g(0,0,0);
  const lamps=[
    [sx,2.25,sz-.30,2.5,0xffac50], [sx,1.0,sz+.7,2.0,0xffb45c],
    [gx,2.5,gz+.10,3.5,0xffc77c], [gx,1.10,gz+.15,2.8,0xffbf67],
    [lx,2.10,lz,4.0,0xffb85b], [lx,1.0,lz+.9,1.8,0xffa64b],
    [-.24,1.80,1.9,3.2,0xffce89], [2.4,.8,1.9,1.1,0x7bcac3]
  ];
  for(const [x,y,z,power,color] of lamps){
    const light=new T.PointLight(color,power,3.4,2);light.position.set(x-center.x,y-bounds.min.y,z-center.z);light.userData.power=power;lighting.add(light);
  }
  model.userData={...model.userData,displayBase:false,studioProfile:'nightlife',contactFootprint:false,groundLevel:0,initialYaw:.28,initialElevation:.47,framingPoints,
    animate(seconds){typing.position.y=typingY+Math.sin(seconds*1.4)*.025;dots.forEach((dot,i)=>dot.scale.setScalar(1+.18*Math.sin(seconds*3-i)));},
    setTheme(theme){
      const dark=theme==='dark';
      // Daylight reveals stone and planting; practical lights lead the night scene.
      materials.lamp.emissiveIntensity=dark?3.0:.08;
      materials.lamp.color.setHex(dark?0xffdeb0:0xf5ead5);
      materials.warmWall.emissiveIntensity=dark?.15:0;
      materials.glass.emissiveIntensity=dark?.18:0;
      materials.route.emissiveIntensity=dark?1.6:.08;
      materials.water.color.setHex(dark?0x144954:0x287c83);
      materials.water.roughness=dark?.12:.20;
      materials.glazing.color.setHex(dark?0x78bec2:0x91c4c9);
      materials.glazing.opacity=dark?.26:.20;
      screenMaterial.emissiveIntensity=dark?.18:.03;
      lighting.children.forEach(light=>{light.intensity=light.userData.power*(dark?1.2:.09);});
      model.userData.studioLightScale=1;
    }
  };
  model.userData.setTheme('light');
  if(!bake&&typeof document!=='undefined')applyBakedAO(T,model,'../assets/buzo-21-ao-v2.bin',10000);
  return model;
}
