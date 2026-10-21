import { jollySurfaces } from './jollycards-surfaces.js';

// Geometry follows 048-jollycards-atelier-v2: five paper skirts, an open envelope,
// three readable relief cards, loose satin and evergreen on brown marble.
export function createArtifact(T) {
  const root=new T.Group();
  const {materials:m,random}=jollySurfaces(T);
  const ornaments=[],recipients=[],fans=[];
  function group(x=0,y=0,z=0,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function mesh(geometry,mat,parent=root){const o=new T.Mesh(geometry,typeof mat==='string'?m[mat]:mat);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,mat,parent=root){const o=mesh(new T.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
  function ball(r,x,y,z,mat,parent=root){const o=mesh(new T.SphereGeometry(r,24,16),mat,parent);o.position.set(x,y,z);return o;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=root){const o=mesh(new T.CylinderGeometry(r1,r2,h,96),mat,parent);o.position.set(x,y,z);return o;}
  function tube(points,r,mat,parent=root,segments=32){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,6,false),mat,parent);}
  function polygon(points,depth,mat,parent=root,bevel=.004){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:16}),mat,parent);}
  function rounded(w,h,d,x,y,z,mat,parent=root,r=.025){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,curveSegments:8}),mat,parent);o.position.set(x,y,z);return o;}
  function facet(points,mat,parent=root){const p=[],uv=[];for(const tri of points)for(const v of tri){p.push(...v);uv.push(v[0],v[1]);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return mesh(g,mat,parent);}
  function star(r,parent){const edge=Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5;return [Math.cos(a)*r*(i%2?.43:1),Math.sin(a)*r*(i%2?.43:1),i%2?.015:0];});const triangles=[];for(let i=0;i<10;i++)triangles.push([[0,0,.11],edge[i],edge[(i+1)%10]]);return facet(triangles,'red',parent);}
  // Low, finely beveled marble slab. All stage materials carry real UV maps.
  cylinder(3.18,3.16,.16,0,.08,0,'edge').scale.z=.58;
  cylinder(3.16,3.18,.035,0,.172,0,'gold').scale.z=.58;
  cylinder(3.14,3.16,.035,0,.205,0,'stone').scale.z=.58;

  const card=group(-.98,.23,-.35);card.rotation.y=-.045;card.rotation.z=.025;
  const leaves=[];
  for(const side of [-1,1]){const leaf=group(0,0,0,card);leaf.rotation.y=side*.075;box(1.34,2.9,.025,side*.67,1.45,0,'paper',leaf);leaves.push({leaf,side});}
  // Pleated half-cones wrap out of the centre crease. Alternating radial ridges
  // produce a full paper fan, rather than disconnected flat triangles.
  for(let tier=0;tier<5;tier++){
    const radius=.83-tier*.145,base=.59+tier*.37,height=.65-tier*.025;
    const g=group(0,base,.04,card),triangles=[];fans.push(g);
    const count=32;
    for(let i=0;i<count;i++){
      const edge=j=>{const a=-Math.PI/2+j/count*Math.PI,fold=j%2?.80:1;return [Math.sin(a)*radius*fold,-.12*Math.cos(a)*fold,Math.cos(a)*radius*.62*fold];};
      triangles.push([[0,height,.015],edge(i),edge(i+1)]);
    }
    facet(triangles,'fold',g);
  }
  const topper=star(.23,card);topper.position.set(0,2.61,.09);
  for(const [x,y,z] of [[-.28,1.99,.28],[.31,1.56,.34],[-.43,1.05,.39],[.42,.77,.43]]){
    const pivot=group(x,y+.07,z,card);ornaments.push(pivot);
    ball(.085,0,-.07,0,'blue',pivot);
    cylinder(.026,.028,.038,0,.027,0,'gold',pivot);
    const loop=mesh(new T.TorusGeometry(.021,.004,6,20),'gold',pivot);loop.position.y=.057;
  }
  // The V opening exposes the tree all the way down to the seal.
  const env=group(-.98,.23,-.22);env.rotation.y=-.045;
  box(2.82,1.25,.025,0,.63,-.35,'burgundy',env);
  polygon([[-1.41,.015],[-1.41,1.36],[0,.33]],.022,'burgundy',env).position.z=.48;
  polygon([[1.41,.015],[0,.33],[1.41,1.36]],.022,'burgundy',env).position.z=.48;
  polygon([[-1.41,.015],[0,.49],[1.41,.015]],.025,'burgundy',env).position.z=.51;
  for(const side of [-1,1])tube([[side*1.4,1.35,.507],[side*.7,.84,.507],[0,.33,.507]],.004,'seam',env,2);
  const seal=cylinder(.13,.13,.026,0,.36,.555,'gold',env);seal.rotation.x=Math.PI/2;
  const sealRing=mesh(new T.TorusGeometry(.109,.006,8,48),'gold',env);sealRing.position.set(0,.36,.575);

  function botanical(parent,x,y,z,scale=1,mat='relief'){
    const g=group(x,y,z,parent);g.scale.setScalar(scale);
    for(const side of [-1,1]){
      tube([[0,0,0],[side*.17,.12,.003],[side*.27,.36,0]],.008,mat,g,16);
      for(let i=0;i<4;i++){
        const leaf=ball(1,side*(.065+i*.052),.06+i*.075,.012,mat,g);
        leaf.scale.set(.032,.078,.009);leaf.rotation.z=side*(i%2?-.65:.62);
      }
    }
    for(const [x,y] of [[0,.04],[-.045,.09],[.045,.095]])ball(.022,x,y,.018,mat==='gold'?'gold':'berry',g);
  }
  botanical(env,0,.30,.58,.26,'gold');
  function silhouette(parent,x,y,s,female=false){
    const g=group(x,y,.034,parent);g.scale.setScalar(s);
    const head=ball(.067,0,.68,.008,'relief',g);head.scale.set(.83,1,.23);
    if(female){const hair=ball(.072,-.018,.68,-.004,'relief',g);hair.scale.set(.94,1.12,.26);}
    const body=female
      ? [[-.035,.61],[-.12,.57],[-.18,.37],[-.14,.35],[-.085,.49],[-.065,.37],[-.14,.19],[-.066,.18],[-.055,0],[-.013,0],[0,.18],[.018,0],[.06,0],[.067,.18],[.14,.19],[.07,.38],[.09,.49],[.15,.36],[.19,.39],[.12,.57],[.035,.61]]
      : [[-.035,.61],[-.13,.56],[-.18,.34],[-.13,.33],[-.078,.49],[-.075,.31],[-.065,0],[-.012,0],[0,.27],[.015,0],[.07,0],[.078,.31],[.08,.49],[.135,.33],[.18,.35],[.13,.56],[.035,.61]];
    polygon(body,.016,'relief',g,.005);
    tube([[0,.59,.028],[0,.37,.028]],.003,'paper',g,2);
  }
  for(let i=0;i<3;i++){
    const g=group(.57+i*.73,.23,.49-i*.24);g.rotation.y=-.12;g.rotation.z=-.095-i*.016;recipients.push(g);
    box(.98,1.48,.025,0,.74,0,'paper',g);
    botanical(g,0,.2,.035,.95);
    if(i===0){silhouette(g,-.23,.51,.91,true);silhouette(g,.1,.51,1.02);silhouette(g,.32,.39,.6);}
    if(i===1){
      const s=new T.Shape();s.moveTo(0,-.31);s.bezierCurveTo(-.62,.06,-.29,.56,0,.25);s.bezierCurveTo(.29,.56,.62,.06,0,-.31);
      const edge=s.getPoints(40),triangles=[];
      for(let j=0;j<edge.length-1;j++)triangles.push([[0,.08,.16],[edge[j].x,edge[j].y,.025],[edge[j+1].x,edge[j+1].y,.025]]);
      const heart=facet(triangles,'red',g);heart.position.set(0,.88,.025);heart.scale.setScalar(.7);
    }
    if(i===2){rounded(.47,.36,.022,0,.91,.035,'relief',g,.035);rounded(.47,.13,.018,0,.99,.065,'paper',g,.025);tube([[-.10,1.1,.052],[-.09,1.19,.052],[.09,1.19,.052],[.10,1.1,.052]],.015,'relief',g,24);rounded(.065,.09,.015,0,.925,.09,'relief',g,.008);}
  }
  // A single continuous, wide silk ribbon with alternating upright and flat folds.
  const curve=new T.CatmullRomCurve3([[-2.9,.37,.38],[-2.61,.48,.69],[-2.17,.32,1.01],[-1.66,.3,1.23],[-1.28,.43,1.17],[-.84,.29,1.44],[-.28,.25,1.49],[.22,.41,1.42],[.81,.29,1.4],[1.44,.32,1.28],[2.22,.42,.95],[2.86,.46,.48],[2.7,.28,-.08]].map(p=>new T.Vector3(...p)));
  const pos=[],uv=[],indices=[],segments=256;
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPoint(t),d=curve.getTangent(t),twist=Math.sin(t*19)*.7;
    const side=new T.Vector3(-d.z*Math.cos(twist),Math.sin(twist),d.x*Math.cos(twist)).normalize().multiplyScalar(.21);
    for(const sign of [-1,1]){pos.push(p.x+side.x*sign,Math.max(.24,p.y+side.y*sign),p.z+side.z*sign);uv.push(t*3,(sign+1)/2);}
    if(i<segments){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  }
  const ribbon=new T.BufferGeometry();ribbon.setAttribute('position',new T.Float32BufferAttribute(pos,3));ribbon.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ribbon.setIndex(indices);ribbon.computeVertexNormals();mesh(ribbon,'ribbon');
  const ribbonRest=Float32Array.from(ribbon.attributes.position.array);
  // Dense evergreen needles are instanced into three draw calls.
  const needles=[[],[],[]],twigs=[];
  function sprig(origin,tip,width){
    const a=new T.Vector3(...origin),b=new T.Vector3(...tip),v=b.clone().sub(a),side=(v.y>.6?new T.Vector3(1,0,.12):new T.Vector3(v.z,0,-v.x)).normalize();
    twigs.push([a,b]);
    for(let j=1;j<12;j++)for(const sign of [-1,1]){
      const t=j/13,start=a.clone().addScaledVector(v,t),end=start.clone().addScaledVector(side,sign*width*(1-t*.7)).addScaledVector(v,.12);
      twigs.push([start,end]);const axis=end.clone().sub(start),cross=(v.y>.6?new T.Vector3(axis.y,-axis.x,.2):new T.Vector3(axis.z,.25,-axis.x)).normalize();
      for(let k=0;k<11;k++)for(const s of [-1,1]){
        const q=k/11,p=start.clone().addScaledVector(axis,q),to=p.clone().addScaledVector(cross,s*(.08+random()*.045)).addScaledVector(axis,.11);
        to.y+=.025+random()*.025;needles[(j+k)%3].push([p,to]);
      }
    }
  }
  sprig([-2.35,.27,.26],[-2.88,.47,-.95],.3);
  sprig([-2.32,.26,.43],[-1.9,.3,1.02],.28);
  sprig([.45,.26,-.65],[.79,2.15,-.72],.35);
  sprig([.5,.26,-.67],[1.45,1.91,-.75],.3);
  sprig([1.61,.25,-.51],[2.95,.48,-.54],.28);
  sprig([1.26,.26,1.1],[2.77,.33,.83],.27);
  const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
  function instances(pairs,geometry,mat){const o=new T.InstancedMesh(geometry,m[mat],pairs.length);pairs.forEach(([a,b],i)=>{const v=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(1,v.length(),1);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});o.castShadow=o.receiveShadow=true;root.add(o);return o;}
  needles.forEach((pairs,i)=>instances(pairs,new T.ConeGeometry(.009,1,5),['green','leaf','leafLight'][i]));
  instances(twigs,new T.CylinderGeometry(.008,.009,1,5),'twig');
  for(const [x,z] of [[-2.51,.22],[-2.35,.5],[1.37,-.65],[2.61,-.43],[2.3,.52],[2.54,.12]])for(let i=0;i<4;i++){
    const berry=ball(.055+random()*.024,x+(random()-.5)*.25,.31+random()*.1,z+(random()-.5)*.22,'berry');
    ball(.012,berry.position.x,berry.position.y+.058,berry.position.z,'twig');
  }
  const pen=group(.91,.31,1.03);pen.rotation.y=-.13;
  const body=cylinder(.07,.063,1.2,.12,0,0,'pen',pen);body.rotation.z=Math.PI/2;
  const cap=cylinder(.072,.069,.36,.61,0,0,'pen',pen);cap.rotation.z=Math.PI/2;
  for(const x of [-.4,.39,.45,.78]){const band=cylinder(.075,.075,.018,x,0,0,'gold',pen);band.rotation.z=Math.PI/2;}
  const grip=cylinder(.044,.058,.19,-.53,0,0,'pen',pen);grip.rotation.z=Math.PI/2;
  const nib=polygon([[-.88,0],[-.66,.062],[-.60,.045],[-.60,-.045],[-.66,-.062]],.014,'gold',pen);nib.rotation.x=-Math.PI/2;
  tube([[-.87,.016,0],[-.74,.016,0],[-.66,.016,0]],.003,'seam',pen,2);
  tube([[.73,.068,-.022],[.69,.085,-.022],[.46,.085,-.022]],.011,'gold',pen,16);

  // Tight static framing follows the artwork. Motion stays inside that silhouette.
  root.updateMatrixWorld(true);
  const framingPoints=[];
  root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3)framingPoints.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
  Object.assign(root.userData,{artifactId:48,conceptual:true,displayBase:false,studioProfile:'jollycards',contactFootprint:false,groundLevel:0,initialYaw:-.035,initialElevation:.29,autoOrbit:false,framingPoints});
  const recipientAngles=recipients.map(g=>g.rotation.y);
  root.userData.animate=time=>{
    // Paper flexes only slightly so the tree and all three reliefs remain readable.
    const breath=Math.sin(time*.55);
    leaves.forEach(({leaf,side})=>{leaf.rotation.y=side*(.075+.018*breath);});
    fans.forEach((g,i)=>{g.scale.z=1+.024*Math.sin(time*.8-i*.4);});
    topper.rotation.y=Math.sin(time*.7)*.045;
    ornaments.forEach((pivot,i)=>{pivot.rotation.z=Math.sin(time*1.45+i*.8)*.095;pivot.rotation.x=Math.sin(time*.9+i)*.03;});
    recipients.forEach((g,i)=>{g.rotation.y=recipientAngles[i]+Math.sin(time*.6-i*.6)*.015;});
    const p=ribbon.attributes.position;
    for(let i=0;i<p.count;i++){const t=Math.floor(i/2)/segments;p.setY(i,ribbonRest[i*3+1]+(1-Math.cos(time*1.2-t*10))*.011*Math.pow(Math.sin(t*Math.PI),2));}
    p.needsUpdate=true;ribbon.computeVertexNormals();
  };
  root.userData.animate(0);
  return root;
}
