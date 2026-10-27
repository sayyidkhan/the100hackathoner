// Architectural detail and deterministic instanced tropical planting for exhibit 3.
export function propertyArchitecture(T,k){
 const {root,m,box,slab,line,mesh,group}=k;
 let seed=307;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(const [key,color] of [['foliageDark',0x29482c],['foliageMid',0x4c6c35],['foliageSun',0x80904a],['windowDark',0x173f45],['curtain',0xd3c9a7],['roofDark',0x994a30],['roofLight',0xca8052],['grout',0xc3b7a3]])m[key]=new T.MeshStandardMaterial({color,roughness:key.startsWith('foliage')?.88:.68});
 const foliage=group();foliage.name='property-tropical-landscape';
 const clusters=[],leaves=[],trunks=[];
 const add=(list,x,y,z,sx,sy,sz,ry=0)=>list.push({x,y,z,sx,sy,sz,ry});
 // Thousands of small folded leaves create broken silhouettes and light through
 // the canopy. They share three instanced meshes rather than merged green blobs.
 function shrub(x,y,z,r=.13){
  for(let i=0;i<65;i++){
   const a=rnd()*Math.PI*2,rr=r*Math.sqrt(rnd()),v=rnd();
   add(clusters,x+Math.cos(a)*rr,y+.025+r*(.25+.8*v),z+Math.sin(a)*rr,.025+rnd()*.020,.038+rnd()*.025,.026+rnd()*.012,rnd()*6);
  }
 }
 function tree(x,z,h=.85,r=.30){
  add(trunks,x,.27+h*.38,z,.018,h*.76,.018);
  for(let b=0;b<7;b++){
   const a=b*2.4,bx=x+Math.cos(a)*r*.65,bz=z+Math.sin(a)*r*.65,by=.27+h*(.68+.05*(b%3));
   line([[x,.27+h*.40,z],[x+(bx-x)*.45,by-.12,z+(bz-z)*.45],[bx,by,bz]],.007,'timber');
   for(let i=0;i<55;i++){
    const q=rnd()*Math.PI*2,rr=r*.62*Math.sqrt(rnd()),yy=by+(rnd()-.25)*r*.7;
    add(clusters,bx+Math.cos(q)*rr,yy,bz+Math.sin(q)*rr,.026+rnd()*.025,.04+rnd()*.035,.025,rnd()*6);
   }
  }
 }
 function palm(x,z,h=.95){
  line([[x,.27,z],[x-.035,.27+h*.55,z],[x+.018,.27+h,z]],.021,'timber');
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,points=[];for(let j=0;j<=10;j++){const t=j/10;points.push(new T.Vector3(x+.018+Math.cos(a)*t*.42,.27+h+Math.sin(t*Math.PI)*.15-t*.16,z+Math.sin(a)*t*.42));}
   line(points.map(p=>p.toArray()),.006,'foliageMid');
   for(let j=2;j<10;j++){const p=points[j],width=.1*Math.sin(j/10*Math.PI);for(const side of [-1,1]){
    const g=new T.BufferGeometry(),tip=new T.Vector3(p.x+Math.cos(a+Math.PI/2)*width*side-Math.cos(a)*.045,p.y-.025,p.z+Math.sin(a+Math.PI/2)*width*side-Math.sin(a)*.045);
    g.setAttribute('position',new T.Float32BufferAttribute([...p.toArray(),...tip.toArray(),...points[j+1].toArray()],3));g.computeVertexNormals();mesh(g,'leaf');
   }}
  }
 }
 // HDB: eight recessed storeys, six bays, concrete piers and a coral service core.
 const hdb=group(-3.04,.28,-1.33);hdb.name='property-hdb';hdb.scale.set(1.10,.88,1.15);
 box(2.02,2.85,.77,0,1.88,-.10,'concrete',hdb);
 for(const x of [-.91,-.46,0,.46,.91])for(const z of [-.35,.35])box(.085,.47,.085,x,.235,z,'concrete',hdb);
 box(.28,3.40,.94,-.81,1.70,-.10,'red',hdb);
 for(let f=0;f<8;f++){
  const y=.47+f*.355;box(2.07,.045,1.00,0,y,-.01,'concrete',hdb);
  for(let c=0;c<6;c++){
   const x=-.55+c*.275,glaze=(f*7+c)%19===0?'warmWindow':(f*3+c)%5===0?'curtain':'windowDark';
   box(.239,.263,.035,x,y+.163,.30,glaze,hdb);
   box(.013,.265,.034,x,y+.163,.327,'cream',hdb);box(.25,.017,.065,x,y+.028,.335,'concrete',hdb);
   box(.018,.31,.14,x-.13,y+.16,.34,'concrete',hdb);
   box(.242,.065,.028,x,y+.075,.457,'cream',hdb);box(.242,.012,.018,x,y+.19,.457,'silver',hdb);
   for(let j=0;j<4;j++)box(.008,.10,.009,x-.09+j*.06,y+.135,.457,'silver',hdb);
   box(.22,.25,.02,x,y+.16,-.498,'glazing',hdb);
   if(c%2===0){box(.13,.095,.075,x,y+.09,-.55,'concrete',hdb);for(let j=0;j<4;j++)box(.1,.007,.008,x,y+.06+j*.019,-.592,'silver',hdb);}
  }
  for(const side of [-1,1])for(let c=0;c<2;c++){box(.024,.24,.22,side*1.024,y+.17,-.25+c*.31,'glazing',hdb);box(.028,.018,.22,side*1.04,y+.17,-.25+c*.31,'cream',hdb);}
 }
 slab(2.12,1.10,.075,0,3.36,-.02,'concrete',hdb,.018);
 for(const z of [-.53,.49])box(2.08,.12,.025,0,3.45,z,'cream',hdb);
 for(const x of [-1.02,1.02])box(.025,.12,1.02,x,3.45,-.02,'cream',hdb);
 box(.33,.33,.30,.62,3.56,-.20,'concrete',hdb);box(.39,.04,.36,.62,3.75,-.20,'cream',hdb);
 for(let j=0;j<4;j++){box(.24,.13,.20,-.67+j*.31,3.45,-.16,'silver',hdb);for(let n=0;n<4;n++)box(.20,.006,.018,-.67+j*.31,3.52,-.23+n*.04,'navy',hdb);}
 // Two staggered condominium towers: thin floor plates, glazed corners and planted terraces.
 const condo=group(-.24,.28,-.70);condo.name='property-highlighted-condo';
 slab(2.40,2.22,.12,0,.06,.04,'concrete',condo,.08);
 for(const [x,z,floors] of [[-.64,.17,7],[.59,-.37,8]]){
  const w=.96,depth=.87,step=.355,height=floors*step;
  box(w,height,depth,x,height/2+.19,z,'windowDark',condo);
  box(.16,height+.1,.86,x-.30,height/2+.2,z,'red',condo);
  for(let f=0;f<floors;f++){
   const y=.19+f*step;
   slab(w+.20,depth+.27,.037,x,y,z+.055,'concrete',condo,.16);
   for(let c=0;c<4;c++){
    const xx=x-.30+c*.20;
    box(.18,.294,.018,xx,y+.176,z+depth/2+.005,(f*4+c)%23===0?'warmWindow':(f*4+c)%7===0?'curtain':'glazing',condo);
    box(.011,.30,.027,xx-.095,y+.174,z+depth/2+.024,'cream',condo);
   }
   for(const side of [-1,1])for(let c=0;c<3;c++){box(.018,.29,.205,x+side*(w/2+.008),y+.17,z-.24+c*.23,'glazing',condo);box(.025,.30,.011,x+side*(w/2+.02),y+.17,z-.34+c*.23,'cream',condo);}
   // A curved glass balustrade follows the projecting balcony slab.
   const rail=[];for(let j=0;j<=32;j++){
    const a=Math.PI*j/32;rail.push([x+Math.cos(a)*(w/2+.08),y+.18,z+depth/2-.01+Math.sin(a)*.17]);
   }
   const pg=[],ix=[];rail.forEach(([xx,yy,zz],i)=>{pg.push(xx,yy-.145,zz,xx,yy,zz);if(i<32)ix.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);});
   const glass=new T.BufferGeometry();glass.setAttribute('position',new T.Float32BufferAttribute(pg,3));glass.setIndex(ix);glass.computeVertexNormals();mesh(glass,'balconyGlass',condo);
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rail.map(p=>new T.Vector3(...p))),32,.006,5,false),'silver',condo);
   
   for(const side of [-1,1]){box(.014,.145,depth+.13,x+side*(w/2+.07),y+.10,z+.045,'balconyGlass',condo);box(.019,.012,depth+.17,x+side*(w/2+.07),y+.18,z+.045,'silver',condo);}
   for(const xx of [-.38,-.13,.13,.38])box(.009,.17,.012,x+xx,y+.10,z+depth/2+.15,'silver',condo);
   if(f%2===0){box(.22,.07,.10,x+.28,y+.06,z+.46,'cream',condo);for(let j=0;j<5;j++)add(clusters,x+.24+j*.025-.24,.28+y+.14,z+.46-.70,.034,.044,.033,rnd()*6);}
  }
  slab(w+.20,depth+.28,.065,x,height+.20,z+.055,'cream',condo,.16);
  box(.42,.21,.34,x-.13,height+.33,z-.08,'concrete',condo);slab(.49,.39,.025,x-.13,height+.45,z-.08,'cream',condo,.02);
  for(const side of [-1,1])box(.017,.17,depth+.08,x+side*(w/2+.04),height+.31,z+.05,'balconyGlass',condo);
  box(w+.08,.17,.017,x,height+.31,z+depth/2+.13,'balconyGlass',condo);
  for(let j=0;j<6;j++)shrub(x-.24+(-.32+j*.12),height+.51,z-.70+.27,.075);
 }
 // Courtyard pool with tiled lining, coping, water caustics and furnished deck.
 slab(1.57,.85,.05,.18,.15,1.01,'stone',condo,.075);
 slab(1.41,.70,.018,.18,.182,1.01,'pool',condo,.065);
 for(let i=0;i<18;i++)line([[-.45,.197,.70+i*.034],[-.04,.199,.72+i*.034],[.31,.197,.70+i*.034],[.79,.199,.72+i*.034]],.0015,'blueLight',condo);
 for(let i=0;i<2;i++){
  const x=-.86+i*.25;slab(.19,.39,.025,x,.16,.83,'timber',condo,.02);
  const back=box(.18,.025,.13,x,.21,.69,'cream',condo);back.rotation.x=-.35;
  for(let j=0;j<5;j++)box(.16,.012,.014,x,.183,.76+j*.043,'cream',condo);
 }
 for(const x of [.49,.61])line([[x,.18,1.00],[x,.30,1.00],[x,.30,1.08],[x,.15,1.08]],.007,'silver',condo);
 for(const x of [-1.15,-.72])for(const z of [.48,1.18])box(.035,.48,.035,x,.24,z,'timber',condo);
 for(let i=0;i<11;i++)box(.57,.025,.025,-.935,.49,.43+i*.08,'timber',condo);
 // Three terrace homes, two storeys, timber shutters, tiled pitched roofs and gates.
 for(let i=0;i<3;i++){
  const house=group(-3.60+i*.72,.28,.98);box(.65,.92,.68,0,.46,0,'concrete',house);
  box(.61,.045,.80,0,.52,.04,'cream',house);box(.13,.45,.025,.15,.24,.36,'timber',house);
  for(const x of [-.19,.13]){box(.22,.28,.02,x,.73,.352,'windowDark',house);box(.012,.28,.025,x,.73,.372,'cream',house);box(.22,.015,.025,x,.73,.372,'cream',house);}
  box(.20,.30,.02,-.18,.28,.354,'glazing',house);for(let j=0;j<7;j++)box(.018,.28,.018,-.26+j*.026,.28,.378,'timber',house);
  for(const x of [-.28,.28])box(.035,.93,.045,x,.47,.385,'cream',house);
  for(const side of [-1,1]){
   const roof=box(.40,.04,.85,side*.177,1.055,0,'clay',house);roof.rotation.z=-side*.48;
   for(let j=0;j<18;j++){
    const tile=mesh(new T.CylinderGeometry(.012,.012,.39,6,1),j%3===0?'roofLight':'roofDark',house);tile.position.set(side*.177,1.08,-.41+j*.048);tile.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(side*Math.cos(.48),-Math.sin(.48),0));
   }
   box(.025,.04,.91,side*.36,.97,0,'cream',house);
  }
  const ridge=mesh(new T.CylinderGeometry(.023,.023,.91,8),'roofLight',house);ridge.rotation.x=Math.PI/2;ridge.position.y=1.17;
  for(let step=0;step<3;step++)slab(.25,.12,.018,.15,.04-step*.008,.48+step*.12,'stone',house,.01);
  for(const side of [-1,1])box(.045,.25,.045,side*.31,.125,.71,'concrete',house);
  for(let j=0;j<9;j++)box(.012,.20,.012,-.25+j*.06,.11,.71,'navy',house);
  box(.56,.015,.018,0,.22,.71,'navy',house);
 }
 // Low stone garden walls, recessed planted beds and small path lanterns.
 for(const [x,z,w,d] of [[-3.93,-1.23,.12,1.88],[-2.83,-2.05,2.2,.14],[-3.02,1.85,2.0,.16],[1.03,-.74,.14,2.3]]){
  slab(w,d,.07,x,.28,z,'stone',root,.02);
 }
 for(const [x,z] of [[-3.95,.25],[-1.55,.70],[1.08,.64],[.88,-1.65],[-2.05,1.62]]){
  box(.024,.21,.024,x,.38,z,'navy');box(.057,.027,.057,x,.50,z,'warmWindow');box(.069,.012,.069,x,.519,z,'navy');
 }
 // Water's tiled border remains visible under the fine ripples.
 for(let i=0;i<24;i++)for(const z of [.67,1.35])box(.052,.012,.035,-.48+i*.058,.20,z,'mint',condo);
 for(let i=0;i<11;i++)for(const x of [-.52,.89])box(.035,.012,.052,x,.20,.69+i*.061,'mint',condo);
 // Paving joints, stepping stones and curb edges give the sites a consistent scale.
 for(const [x,z,w,d] of [[-2.90,-1.14,2.17,1.96],[-2.88,1.10,2.32,1.47],[-.24,-.55,2.67,2.62]]){
  for(let i=0;i<=Math.floor(w/.16);i++)box(.007,.006,d,x-w/2+i*.16,.274,z,'grout');
  for(let i=0;i<=Math.floor(d/.18);i++)box(w,.006,.007,x,.275,z-d/2+i*.18,'grout');
 }
 for(const [x,z,h,r] of [[-4,-1.65,.83,.28],[-4,-.55,.72,.27],[-1.73,-1.82,.86,.27],[-1.63,-.05,.84,.25],[.95,-1.75,.8,.29],[1.03,-.43,.91,.24],[-4.05,.70,.72,.24],[-4,1.65,.82,.28],[-1.78,1.48,.81,.23],[-1.57,.79,.73,.24]])tree(x,z,h,r);
 for(const [x,z,h] of [[-.93,.40,.88],[.72,.38,1.03],[.96,-1.1,1.07],[-3.73,1.48,.65],[-2.14,1.43,.7]])palm(x,z,h);
 for(let i=0;i<23;i++){shrub(-3.92+i*.10,.29,-2.03,.10);shrub(-3.92+i*.10,.29,1.85,.11);}
 for(let i=0;i<21;i++){shrub(-1.44+i*.12,.29,.54,.095);shrub(-1.44+i*.12,.29,-1.91,.10);}
 for(let i=0;i<15;i++)shrub(1.03,.29,-1.70+i*.135,.10);
 function instances(entries,geo,material,name){const inst=new T.InstancedMesh(geo,material,entries.length),dummy=new T.Object3D();entries.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.sx,v.sy,v.sz);dummy.rotation.set(i*.37,v.ry,i*.11);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.instanceMatrix.needsUpdate=true;inst.name=name;inst.castShadow=inst.receiveShadow=true;foliage.add(inst);return inst;}
 const crown=new T.BufferGeometry();crown.setAttribute('position',new T.Float32BufferAttribute([0,-1,0,-.65,-.15,.1,0,.20,.38,.65,-.15,.1,0,1,0],3));crown.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);crown.computeVertexNormals();
 for(let i=0;i<3;i++){const material=m[['foliageDark','foliageMid','foliageSun'][i]];material.side=T.DoubleSide;instances(clusters.filter((_,j)=>j%3===i),crown,material,`canopy-${i}`);}
 instances(leaves,new T.IcosahedronGeometry(1,0),m.foliageSun,'fine-leaves');
 // Trunks must remain upright; canopy instances deliberately vary their orientation.
 const trunk=instances(trunks,new T.CylinderGeometry(1,.8,1,6),m.timber,'tree-trunks');const dummy=new T.Object3D();trunks.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.sx,v.sy,v.sz);dummy.updateMatrix();trunk.setMatrixAt(i,dummy.matrix);});trunk.instanceMatrix.needsUpdate=true;
 return {foliage};
}
