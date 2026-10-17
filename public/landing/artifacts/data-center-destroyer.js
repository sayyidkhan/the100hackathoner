import { sculpture } from './sculpture.js';

// A seekable miniature battle: the shared gallery clock owns pause and reset.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.metal = new THREE.MeshStandardMaterial({color:0x687786,roughness:.38,metalness:.65});
  materials.screen = new THREE.MeshStandardMaterial({color:0x16344d,roughness:.4,emissive:0x123a5b,emissiveIntensity:.3});
  materials.energy = new THREE.MeshStandardMaterial({color:0x70d9ff,emissive:0x249bff,emissiveIntensity:1.1,roughness:.35});
  materials.warning = new THREE.MeshStandardMaterial({color:0xffb86b,emissive:0xff6e21,emissiveIntensity:1,roughness:.45});
  materials.stone = new THREE.MeshStandardMaterial({color:0xcdbb9b,roughness:.91});
  materials.road = new THREE.MeshStandardMaterial({color:0x164b91,roughness:.43,metalness:.22});
  materials.crystal = new THREE.MeshStandardMaterial({color:0x6dc9f3,roughness:.24,metalness:.28,emissive:0x176196,emissiveIntensity:.25,flatShading:true});
  materials.copper = new THREE.MeshStandardMaterial({color:0xc19a61,roughness:.3,metalness:.7});
  materials.redlight = new THREE.MeshStandardMaterial({color:0xff7763,emissive:0xf82c15,emissiveIntensity:1.5});
  materials.grille = new THREE.MeshStandardMaterial({color:0x532525,roughness:.5,metalness:.5});
  materials.limestone = new THREE.MeshStandardMaterial({color:0xdac9ad,roughness:.88});
  materials.limestoneLight = new THREE.MeshStandardMaterial({color:0xe9dcc4,roughness:.84});
  materials.limestoneShade = new THREE.MeshStandardMaterial({color:0xb8a388,roughness:.94});
  materials.rack = new THREE.MeshStandardMaterial({color:0x121c29,roughness:.48,metalness:.55});
  materials.rackEdge = new THREE.MeshStandardMaterial({color:0x344657,roughness:.32,metalness:.7});
  materials.blueLED = new THREE.MeshStandardMaterial({color:0x168dff,emissive:0x006aff,emissiveIntensity:1.2,roughness:.28});
  materials.redLED = new THREE.MeshStandardMaterial({color:0xf52a15,emissive:0xff1205,emissiveIntensity:.95,roughness:.28});
  // Fine procedural stone grain uses positions, so it survives static batching
  // and needs no downloaded textures or per-frame work.
  for(const name of ['limestone','limestoneLight','limestoneShade']) {
    const material=materials[name];
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStonePosition;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStonePosition = position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 vStonePosition;
        float stoneHash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float stoneNoise(vec3 p) {
          vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          float lower=mix(mix(stoneHash(i),stoneHash(i+vec3(1,0,0)),f.x),mix(stoneHash(i+vec3(0,1,0)),stoneHash(i+vec3(1,1,0)),f.x),f.y);
          float upper=mix(mix(stoneHash(i+vec3(0,0,1)),stoneHash(i+vec3(1,0,1)),f.x),mix(stoneHash(i+vec3(0,1,1)),stoneHash(i+vec3(1,1,1)),f.x),f.y);
          return mix(lower,upper,f.z);
        }`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float grain=stoneNoise(vStonePosition*110.0);
        float mottling=stoneNoise(vStonePosition*12.0);
        diffuseColor.rgb *= .88 + grain*.10 + mottling*.10;`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (grain-.5)*.12,0.0,1.0);');
    };
    material.customProgramCacheKey=()=> 'destroyer-stone-v1';
  }
  const moving=[];
  function group(name,x=0,y=0,z=0) {
    const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);moving.push(g);return g;
  }
  function ring(r,t,x,y,z,color='metal',parent=root) {
    const m=mesh(new THREE.TorusGeometry(r,t,8,32),color,parent);m.position.set(x,y,z);return m;
  }
  function between(object,a,b,radius=1) {
    object.position.copy(a).lerp(b,.5);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());
    object.scale.set(radius,a.distanceTo(b),radius);
  }
  // Small bevels catch the studio light on the sandstone and machined hardware.
  function bevel(w,h,d,x,y,z,color='ivory',parent=root,r=.035) {
    const shape=new THREE.Shape();
    shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);
    shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r});
    geometry.translate(0,0,-d/2+r);
    const m=mesh(geometry,color,parent);m.position.set(x,y,z);return m;
  }
  bevel(8.1,.30,3.8,0,.15,0,'stone',root,.06);
  bevel(8.05,.06,3.75,0,.31,0,'paper',root,.02);
  const path=new THREE.CatmullRomCurve3([[-3.1,.356,-.15],[-2.65,.356,.62],[-1.65,.356,.91],[-.7,.356,.58],[.35,.356,.92],[1.4,.356,.53],[2.4,.356,.86],[3.1,.356,-.15]].map(p=>new THREE.Vector3(...p)));
  // A flat ribbon road with inset pavers, brass edging and shallow curbs.
  function ribbon(width,y,color) {
    const vertices=[],indices=[];
    for(let i=0;i<=160;i++) {
      const p=path.getPointAt(i/160),t=path.getTangentAt(i/160);
      for(const side of [-1,1])vertices.push(p.x-t.z*width*.5*side,y,p.z+t.x*width*.5*side);
      if(i<160){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    mesh(g,color);
  }
  ribbon(.66,.347,'copper');ribbon(.60,.356,'road');
  for(let i=1;i<48;i++) {
    const p=path.getPointAt(i/48),t=path.getTangentAt(i/48);
    const joint=box(.585,.003,.008,p.x,.36,p.z,'ink');joint.rotation.y=Math.atan2(t.x,t.z);
  }
  // Low desert outcrops leave the road and all five defenses unobstructed.
  for(let i=0;i<34;i++) {
    const x=-3.8+(i%17)*.47,z=i<17?-1.56:1.57;
    if(i>=17&&x<-.8)continue;
    const h=.16+(.5+.5*Math.sin(i*7.13))*.36;
    const rock=mesh(new THREE.ConeGeometry(.12+h*.12,h,4),'ivory');rock.position.set(x,.34+h/2,z+Math.sin(i*3.7)*.13);rock.rotation.y=i*1.79;
    const shard=mesh(new THREE.ConeGeometry(.09,h*.6,4),'stone');shard.position.set(x+.14,.34+h*.3,z+.10);shard.rotation.y=i;
  }
  for(let i=0;i<20;i++) {
    const x=-3.7+i*.38;
    line([[x,.344,-1.2],[x+.12,.344,-1.12],[x+.09,.344,-.98]],.003,'shade');
  }
  const fans=[];
  for(const [x,color] of [[-3.1,'blue'],[3.1,'red']]) {
    const glow=x<0?'blueLED':'redLED';
    const stone=['limestone','limestoneLight','limestoneShade'];
    // A layered, load-bearing foundation with a real opening onto the road.
    bevel(1.68,.13,1.57,x,.40,-.70,'limestoneShade',root,.035);
    for(const dx of [-.48,.48]) {
      bevel(.62,.18,1.48,x+dx,.54,-.70,'limestone',root,.025);
      bevel(.56,.16,1.40,x+dx,.71,-.70,'limestoneLight',root,.025);
    }
    bevel(.50,.11,.90,x,.51,-.96,'rack');
    box(.42,.025,.22,x,.36,-.08,'rack');
    // The black core sits behind the rails; the facades are open assemblies,
    // rather than windows stuck onto a solid cube.
    bevel(1.02,1.06,1.02,x,1.29,-.70,'rack',root,.02);
    for(const dx of [-.67,.67])for(const dz of [-.64,.64]) {
      for(let course=0;course<5;course++) {
        const y=.88+course*.215;
        bevel(.24,.207,.24,x+dx,y,-.70+dz,stone[(course+(dx>0?1:0)+(dz>0?1:0))%3],root,.018);
      }
      // Tapered buttress stones articulate the transition to the ground.
      for(let j=0;j<3;j++)bevel(.35-j*.04,.14,.35-j*.04,x+dx,.48+j*.145,-.70+dz,stone[j],root,.018);
      bevel(.29,.10,.29,x+dx,1.91,-.70+dz,'limestoneLight',root,.018);
    }
    // Recessed hot-swap server bays on three sides, with handles, louvres,
    // drive caddies, status lenses, cage nuts and vertical cooling ducts.
    for(const side of [0,-1,1]) {
      const face=new THREE.Group();face.position.set(x,0,-.70);face.rotation.y=side*Math.PI/2;root.add(face);
      bevel(1.12,.96,.055,0,1.28,.545,'rackEdge',face,.014);
      box(1.02,.88,.045,0,1.28,.581,'rack',face);
      for(const dx of [-.49,.49]) {
        bevel(.035,.87,.065,dx,1.28,.615,'metal',face,.008);
        for(let row=0;row<11;row++)box(.014,.016,.008,dx,.89+row*.078,.652,'ink',face);
      }
      for(let row=0;row<5;row++) {
        const y=.93+row*.173;
        bevel(.91,.145,.12,0,y,.61,'rackEdge',face,.012);
        bevel(.82,.112,.025,0,y,.678,'rack',face,.006);
        for(let drive=0;drive<4;drive++) {
          const dx=-.29+drive*.19;
          bevel(.17,.078,.018,dx,y,.70,'rackEdge',face,.004);
          box(.125,.052,.012,dx-.009,y,.713,'rack',face);
          // Dense vertical cooling slots and a thin latch across each sled.
          for(let vent=0;vent<5;vent++)box(.008,.034,.004,dx-.053+vent*.022,y,.722,'metal',face);
          box(.022,.052,.012,dx+.067,y,.72,color,face);
          box(.013,.012,.010,dx+.068,y+.017,.731,glow,face);
        }
        for(const dx of [-.429,.429]) {
          bevel(.025,.082,.04,dx,y,.712,'metal',face,.005);
          for(const dy of [-.045,.045])ball(.008,dx,y+dy,.717,'copper',face);
        }
        box(.78,.016,.012,0,y-.063,.685,glow,face);
      }
      for(const dx of [-.59,.59]) {
        bevel(.11,1.09,.15,dx,1.28,.65,'limestoneLight',face,.017);
        bevel(.039,.88,.025,dx,1.30,.737,color,face,.006);
        box(.009,.77,.012,dx,1.30,.753,glow,face);
      }
      bevel(1.18,.11,.20,0,1.81,.65,'limestoneLight',face,.018);
      bevel(1.12,.08,.16,0,.77,.64,'limestoneShade',face,.015);
      // Perforated return-air grille below the server cage.
      bevel(.72,.105,.04,0,.68,.687,'rackEdge',face,.008);
      for(let vent=0;vent<13;vent++)box(.025,.064,.012,-.30+vent*.05,.68,.715,'rack',face);
      if(side===0) {
        bevel(.34,.12,.04,0,1.82,.77,color,face,.012);
        // A tiny row of identifying tally marks, without illegible text.
        for(let j=0;j<(x<0?2:3);j++)box(.025,.040,.008,-.05+j*.05,1.82,.795,'copper',face);
      }
    }
    // Recessed service door and armored lintel; the opening stays visibly deep.
    box(.36,.30,.018,x,.52,-.40,'rack');
    for(const dx of [-.23,.23])bevel(.09,.36,.21,x+dx,.53,-.03,'limestoneLight',root,.012);
    bevel(.57,.10,.25,x,.72,-.04,'limestone',root,.018);
    for(const dx of [-.18,.18])box(.012,.22,.02,x+dx,.51,-.09,glow);
    // Overhanging cornice, dark reveal and a tiled maintenance roof.
    bevel(1.57,.07,1.47,x,1.88,-.70,'limestoneShade',root,.018);
    bevel(1.65,.13,1.55,x,1.97,-.70,'limestoneLight',root,.025);
    bevel(1.43,.045,1.33,x,2.05,-.70,'rackEdge',root,.012);
    for(let a=0;a<4;a++)for(let b=0;b<4;b++)bevel(.29,.025,.27,x-.45+a*.30,2.082,-1.12+b*.28,'limestone',root,.008);
    // Broad, chamfered battlements sit on a continuous parapet.
    for(const dz of [-.70,.70]) {
      bevel(1.60,.10,.18,x,2.10,-.70+dz,'limestone',root,.018);
      for(let j=0;j<4;j++) {
        bevel(.27,.24,.23,x-.59+j*.393,2.245,-.70+dz,stone[j%2],root,.028);
        bevel(.29,.035,.25,x-.59+j*.393,2.38,-.70+dz,'limestoneLight',root,.009);
      }
    }
    for(const dx of [-.71,.71])for(const dz of [-.27,.27])bevel(.23,.24,.28,x+dx,2.245,-.70+dz,'limestone',root,.025);
    // Two ducted extractors with curved-looking blade arrays, guard rings and
    // raised housings instead of flat discs with crosses painted on them.
    for(const dx of [-.29,.29]) {
      bevel(.48,.10,.48,x+dx,2.14,-.70,'rackEdge',root,.025);
      disk(.206,.06,x+dx,2.205,-.70,'rack');
      const rim=ring(.205,.025,x+dx,2.242,-.70,'metal');rim.rotation.x=Math.PI/2;
      const rotor=group('cooling-fan',x+dx,2.235,-.70);fans.push(rotor);
      for(let j=0;j<8;j++) {
        const a=j*Math.PI/4;
        const blade=bevel(.13,.018,.052,Math.cos(a)*.10,0,Math.sin(a)*.10,'metal',rotor,.006);blade.rotation.y=-a+.48;
      }
      ball(.033,0,.018,0,'copper',rotor);
      for(const radius of [.09,.145,.19]){const guard=ring(radius,.006,x+dx,2.28,-.70,'metal');guard.rotation.x=Math.PI/2;}
      for(const angle of [0,Math.PI/2]){const brace=box(.41,.009,.012,x+dx,2.29,-.70,'metal');brace.rotation.y=angle;}
      for(const sx of [-.185,.185])for(const sz of [-.185,.185])disk(.012,.009,x+dx+sx,2.198,-.70+sz,'copper');
    }
    disk(.07,.055,x-.41,2.14,-1.16,'copper');disk(.022,.72,x-.41,2.51,-1.16,'copper');ball(.032,x-.41,2.88,-1.16,'copper');
    const flagGeometry=new THREE.PlaneGeometry(.43,.25,14,5);
    const flagPositions=flagGeometry.attributes.position;
    for(let j=0;j<flagPositions.count;j++) {
      const u=(flagPositions.getX(j)+.215)/.43;
      flagPositions.setZ(j,Math.sin(u*7+flagPositions.getY(j)*5)*.038*u);
      flagPositions.setY(j,flagPositions.getY(j)-u*.045);
    }
    flagGeometry.computeVertexNormals();
    const flag=mesh(flagGeometry,color);flag.position.set(x-.18,2.72,-1.16);
    // External coolant pipes, shut-off valves and cable cleats on the rear.
    for(let j=0;j<3;j++) {
      const px=x-.30+j*.30;
      line([[px,1.88,-1.43],[px,1.63,-1.48],[px,.64,-1.48],[px+.12,.43,-1.55]],.021,j===0?color:'metal');
      for(const y of [.91,1.46])bevel(.075,.04,.055,px,y,-1.49,'copper',root,.008);
      if(j===1){const valve=ring(.065,.012,px,1.08,-1.52,color);box(.12,.012,.015,px,1.08,-1.52,'metal');valve.rotation.z=.3;}
    }
  }

  const weapons=[];
  for(let i=0;i<5;i++) {
    const x=-1.88+i*.94,z=-.51+(i%2?-.12:0);
    const footing=mesh(new THREE.CylinderGeometry(.37,.41,.13,12),'stone');footing.position.set(x,.40,z);
    disk(.34,.06,x,.485,z,'metal');disk(.30,.085,x,.553,z,'ivory');
    const trim=ring(.305,.018,x,.59,z,'copper');trim.rotation.x=Math.PI/2;
    for(let j=0;j<8;j++) {
      const a=j*Math.PI/4;
      const clamp=bevel(.09,.11,.075,x+Math.cos(a)*.34,.50,z+Math.sin(a)*.34,i===4?'red':'blue',root,.012);clamp.rotation.y=-a;
      disk(.016,.013,x+Math.cos(a)*.25,.60,z+Math.sin(a)*.25,'metal');
    }
    const aim=group('defense-'+i,x,.61,z);weapons.push(aim);
    if(i===0) {
      disk(.19,.10,0,.05,0,'blue',aim);
      for(const dx of [-.14,.14])bevel(.09,.25,.18,dx,.20,0,'copper',aim,.015);
      const barrel=disk(.095,.57,0,.34,.23,'metal',aim);barrel.rotation.x=Math.PI/2-.18;
      for(const z of [.02,.12,.48]){const collar=ring(.10,.025,0,.34+z*.18,z,'ink',aim);collar.rotation.x=-.18;}
      const bore=disk(.070,.012,0,.43,.52,'ink',aim);bore.rotation.x=Math.PI/2-.18;
      bevel(.22,.19,.19,0,.32,-.13,'blue',aim,.025);
    } else if(i===1||i===2) {
      const count=i===1?1:7;
      for(let j=0;j<count;j++) {
        const a=j*Math.PI/3,r=j===0?0:.17;
        const crystal=mesh(new THREE.OctahedronGeometry(i===1?.20:.105,0),i===1?'blue':'crystal',aim);
        crystal.position.set(Math.sin(a)*r,.34+(j===0?.09:0),Math.cos(a)*r);crystal.scale.y=j===0?2.2:1.65;
        if(j>0)crystal.rotation.z=Math.sin(a)*.35;
      }
      disk(.16,.09,0,.06,0,'copper',aim);
      ball(.055,0,.42,.16,'energy',aim);
      if(i===1)for(const dx of [-.16,.16])bevel(.055,.24,.07,dx,.16,.02,'copper',aim,.012);
    } else if(i===3) {
      disk(.065,.62,0,.34,0,'metal',aim);
      for(let j=0;j<5;j++){
        disk(.17,.043,0,.13+j*.115,0,'blue',aim);
        const winding=ring(.14,.013,0,.15+j*.115,0,'copper',aim);winding.rotation.x=Math.PI/2;
      }
      ball(.15,0,.77,0,'copper',aim);ball(.035,0,.90,0,'energy',aim);
    } else {
      disk(.16,.15,0,.09,0,'metal',aim);
      bevel(.22,.22,.22,0,.25,0,'red',aim,.02);
      const rack=new THREE.Group();rack.position.set(0,.40,.04);rack.rotation.x=.9;aim.add(rack);
      disk(.08,.39,0,0,0,'ivory',rack);
      const tip=mesh(new THREE.ConeGeometry(.08,.19,16),'red',rack);tip.position.y=.29;
      for(let j=0;j<4;j++){const fin=box(.16,.13,.025,0,-.16,0,'red',rack);fin.rotation.y=j*Math.PI/2;}
      disk(.045,.025,0,-.21,0,'ink',rack);
    }
  }

  // Porcelain intruders echo the small characters in the concept artwork.
  const enemies=[], healthBars=[], wrecks=[];
  for(let i=0;i<8;i++) {
    const g=group('intruder-'+i);enemies.push(g);
    const torso=ball(.105,0,.16,0,'ivory',g);torso.scale.set(.85,1.2,.8);
    ball(.11,0,.34,0,'ivory',g);
    bevel(.13,.045,.025,0,.35,.094,'screen',g,.008);
    for(const side of [-1,1]){ball(.047,side*.053,.045,.018,'stone',g);ball(.045,side*.108,.18,0,'ivory',g);}
    bevel(.105,.13,.045,0,.18,-.085,'red',g,.01);
    box(.22,.025,.018,0,.51,0,'ink',g);
    const health=box(.20,.013,.022,0,.51,.003,'energy',g);healthBars.push(health);
    const wreck=group('truck-destruction-'+i);wrecks.push(wreck);
    for(let j=0;j<7;j++) {
      const piece=box(j<3?.10:.055,.06,.08,0,.15,0,j<3?'red':'metal',wreck);
      piece.userData.direction=new THREE.Vector3(Math.cos(j*2.4)*.45,.35+(j%3)*.16,Math.sin(j*2.4)*.45);
    }
    const blast=ball(.12,0,.15,0,'warning',wreck);blast.name='blast';
    const smoke=ball(.13,0,.22,0,'shade',wreck);smoke.name='smoke';
  }

  // Voice controller with a real grille, yoke and pulsing sound-wave rings.
  const mx=-2.5,mz=2.15;
  disk(.47,.09,mx,.045,mz,'red');disk(.40,.035,mx,.105,mz,'copper');disk(.36,.025,mx,.134,mz,'red');
  disk(.055,.57,mx,.43,mz,'red');disk(.09,.06,mx,.16,mz,'metal');
  const microphone=group('voice-command',mx,1.18,mz);
  const capsule=ball(.29,0,.15,0,'grille',microphone);capsule.scale.y=1.45;
  bevel(.55,.38,.46,0,-.19,0,'red',microphone,.08);
  const belt=ring(.287,.018,0,-.08,0,'copper',microphone);belt.rotation.x=Math.PI/2;
  // Batched perforations follow the rounded microphone head; one draw call.
  const perforations=[];
  for(let row=0;row<16;row++) {
    const theta=.13+(row/16)*2.05;
    for(let j=0;j<40;j++) {
      const phi=j/40*Math.PI*2+(row%2)*.0785;
      perforations.push(new THREE.Vector3(.293*Math.sin(theta)*Math.cos(phi),.15+.425*Math.cos(theta),.293*Math.sin(theta)*Math.sin(phi)));
    }
  }
  const grille=new THREE.InstancedMesh(new THREE.SphereGeometry(.011,6,4),materials.red,perforations.length);
  const matrix=new THREE.Matrix4();perforations.forEach((p,i)=>{matrix.makeTranslation(p.x,p.y,p.z);grille.setMatrixAt(i,matrix);});
  grille.castShadow=false;grille.receiveShadow=true;microphone.add(grille);
  line([[-.37,.08,0],[-.37,-.32,0],[-.27,-.44,0],[.27,-.44,0],[.37,-.32,0],[.37,.08,0]],.043,'red',microphone);
  for(const side of [-1,1]){const hinge=disk(.07,.065,side*.365,.035,0,'copper',microphone);hinge.rotation.z=Math.PI/2;}
  disk(.034,.018,0,-.18,.24,'energy',microphone).rotation.x=Math.PI/2;
  const waves=[];
  for(let i=0;i<3;i++) {
    const wave=group('voice-wave-'+i,mx+.66+i*.24,1.27,mz);
    const arc=mesh(new THREE.TorusGeometry(.26+i*.10,.035,8,32,1.8),'crystal',wave);arc.rotation.z=-.9;waves.push(wave);
  }

  // Effects have fixed geometry; frame updates only transform their groups.
  const effects=group('battle-effects');
  const beams=weapons.map((_,i)=>{
    const b=mesh(new THREE.CylinderGeometry(.014,.014,1,6),i===4?'warning':'energy',effects);b.castShadow=false;return b;
  });
  const shots=weapons.map((_,i)=>ball(i===4?.063:.037,0,0,0,i===4?'red':'warning',effects));
  const impacts=weapons.map(()=>{
    const g=new THREE.Group();effects.add(g);
    const halo=ring(.10,.012,0,.015,0,'warning',g);halo.rotation.x=Math.PI/2;
    for(let j=0;j<5;j++){const a=j*2*Math.PI/5;ball(.024,Math.cos(a)*.12,.07+j*.023,Math.sin(a)*.12,'warning',g);}
    return g;
  });
  const lights=group('data-hall-lighting');
  for(const x of [-3.1,3.1]){const light=new THREE.PointLight(x<0?0x278aff:0xff3820,0,2.0,2);light.position.set(x,1.3,.25);lights.add(light);}
  effects.children.forEach(effect=>{effect.position.y=.8;});
  // Each eight-blade rotor becomes one metallic mesh plus its hub. More detail
  // does not add eight animated draw calls per fan.
  for(const fan of fans) {
    const blades=fan.children.filter(child=>child.material===materials.metal);
    const positions=[],normals=[];
    for(const blade of blades) {
      blade.updateMatrix();
      const geometry=blade.geometry.index?blade.geometry.toNonIndexed():blade.geometry.clone();
      geometry.applyMatrix4(blade.matrix);
      for(const value of geometry.attributes.position.array)positions.push(value);
      for(const value of geometry.attributes.normal.array)normals.push(value);
      geometry.dispose();blade.geometry.dispose();fan.remove(blade);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    mesh(geometry,'metal',fan);
  }
  // Make helper centering irrelevant to all animation-local coordinates.
  const model=finish(64,moving);
  model.userData.displayBase=false;
  model.userData.groundLevel=0;
  model.userData.initialYaw=.32;
  model.userData.initialElevation=.62;
  model.userData.autoOrbit=false;
  const origin=effects.position.clone();
  // Fit the occupied silhouette instead of the empty upper corners of a box.
  const framingPoints=[];
  for(const [min,max] of [
    [[-4.05,0,-1.9],[4.05,.35,1.9]],
    [[-3.94,.35,-1.55],[-2.26,2.93,.15]],
    [[2.26,.35,-1.55],[3.94,2.93,.15]],
    [[-3,0,1.65],[-2,1.8,2.65]],
    [[-2.3,.35,-1.1],[2.3,1.65,.15]],
    [[-1.9,.8,1.95],[-.7,1.8,2.35]],
  ])for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])framingPoints.push(new THREE.Vector3(x,y,z).add(origin));
  model.userData.framingPoints=framingPoints;
  const starts=weapons.map((w,i)=>new THREE.Vector3(w.position.x-origin.x,w.position.y-origin.y+(i===3?.87:.42),w.position.z-origin.z));
  const waveHome=waves.map(w=>w.position.clone());
  // Precompute real hit/death events, then sample them by time. No frame-count
  // damage: pause, skipped frames and resetting all produce the same battle.
  const waveDuration=24, travelTime=15;
  const trucks=enemies.map((_,i)=>({spawn:i*1.65,hits:[3.5+i*.25,6.1+i*.2,8.2+i*.3]}));
  const events=trucks.flatMap((truck,truckIndex)=>truck.hits.map((age,hit)=>({
    truckIndex,hit,time:truck.spawn+age,point:path.getPointAt(age/travelTime)
  }))).sort((a,b)=>a.time-b.time);
  const available=weapons.map(()=>-Infinity);
  for(const event of events) {
    event.point.y=.70;
    const candidates=starts.map((start,index)=>({index,distance:start.distanceTo(event.point)}))
      .filter(({index})=>available[index]<=event.time-.68).sort((a,b)=>a.distance-b.distance);
    if(!candidates.length)throw new Error('Overlapping defense shots in battle timeline');
    event.weapon=candidates[0].index;available[event.weapon]=event.time+.42;
  }
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed)+5.5,wave=t%waveDuration;
    enemies.forEach((g,i)=>{
      const truck=trucks[i],age=wave-truck.spawn,death=truck.hits[2];
      const alive=age>=0&&age<death,damage=truck.hits.filter(hit=>age>=hit).length;
      const u=THREE.MathUtils.clamp(age/travelTime,0,1),p=path.getPointAt(u),tangent=path.getTangentAt(u);
      g.visible=alive;g.userData.health=alive?3-damage:0;
      g.position.copy(p).add(origin);g.position.y+=.018+Math.sin(t*10+i)*.008;
      const recent=truck.hits.filter(hit=>hit<=age).at(-1);
      const recoil=recent===undefined?0:Math.max(0,1-(age-recent)/.25);
      g.rotation.set(0,Math.atan2(tangent.x,tangent.z),Math.sin((age-(recent??age))*35)*recoil*.18);
      g.scale.setScalar(Math.min(1,Math.max(0,age)*3));
      healthBars[i].scale.x=(3-damage)/3;healthBars[i].position.x=-.10*(damage/3);
      const wreck=wrecks[i],dt=age-death;
      wreck.visible=dt>=0&&dt<1.35;
      wreck.position.copy(path.getPointAt(death/travelTime)).add(origin);wreck.position.y+=.19;
      const progress=THREE.MathUtils.clamp(dt,0,1.35);
      wreck.children.forEach((piece,j)=>{
        if(j<7) {
          const d=piece.userData.direction;
          piece.position.set(d.x*progress,.15+d.y*progress*2-progress*progress*.65,d.z*progress);
          piece.position.y=Math.max(.015,piece.position.y);
          piece.rotation.set(progress*(j+1),progress*2,progress*j);
          piece.scale.setScalar(Math.max(0,1-Math.max(0,progress-.55)/.8));
        } else if(piece.name==='blast') {
          piece.visible=dt>=0&&dt<.35;piece.scale.setScalar(.5+Math.sin(Math.min(progress/.35,1)*Math.PI)*2);
        } else {
          piece.position.y=.22+progress*.48;piece.scale.setScalar(Math.max(0,Math.sin(progress/1.35*Math.PI))*1.8);
        }
      });
    });
    weapons.forEach((w,i)=>{
      const event=events.find(e=>e.weapon===i&&wave>=e.time-.68&&wave<e.time+.42);
      const next=event??events.find(e=>e.weapon===i&&e.time>wave);
      beams[i].visible=false;shots[i].visible=false;impacts[i].visible=false;
      w.position.y=origin.y+.61+(i===1||i===2?Math.sin(t*2+i)*.025:0);
      const start=starts[i];
      for(const effect of [beams[i],shots[i],impacts[i]]) {
        effect.position.copy(start);effect.rotation.set(0,0,0);effect.scale.setScalar(1);
      }
      if(next)w.rotation.y=Math.atan2(next.point.x-start.x,next.point.z-start.z);
      else w.rotation.y=0;
      if(!event)return;
      const dt=wave-event.time,flight=THREE.MathUtils.clamp((dt+.68)/.68,0,1);
      // Lock each projectile's destination to the hit location, so explosions
      // stay at the wreck rather than following a truck after it disappears.
      if(dt<0) {
        const age=wave-trucks[event.truckIndex].spawn;
        const target=path.getPointAt(THREE.MathUtils.clamp(age/travelTime,0,1));target.y=.70;
        w.rotation.y=Math.atan2(target.x-start.x,target.z-start.z);
        beams[i].visible=i===1||i===2||i===3;
        between(beams[i],start,target,i===3?1.3:1);
        shots[i].visible=i===0||i===4;
        shots[i].position.copy(start).lerp(event.point,flight);
        if(i===4)shots[i].position.y+=Math.sin(flight*Math.PI)*.6;
      } else {
        impacts[i].visible=true;impacts[i].position.copy(event.point);
        impacts[i].scale.setScalar((.4+dt*3)*(1-dt/.42));impacts[i].rotation.y=t+i;
      }
    });
    fans.forEach((f,i)=>{f.rotation.y=t*(i%2?-5:5);});
    microphone.rotation.z=Math.sin(t*1.2)*.025;
    waves.forEach((w,i)=>{const p=(t*.65+i/3)%1;w.position.copy(waveHome[i]);w.position.x+=p*.07;w.scale.setScalar(.75+Math.sin(Math.PI*p)*.3);});
  };
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.9:1;
    materials.energy.emissiveIntensity=night?1.8:.65;
    materials.warning.emissiveIntensity=night?1.5:.65;
    materials.screen.emissiveIntensity=night?.85:.15;
    materials.blueLED.emissiveIntensity=night?2.2:1.1;
    materials.redLED.emissiveIntensity=night?1.8:.9;
    lights.children.forEach(l=>{l.intensity=night?.6:0;});
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
