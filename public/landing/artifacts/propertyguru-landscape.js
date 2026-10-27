// Small-scale architectural planting: explicit leaves, branches and palm fronds.
// Fixed seeds keep geometry stable for the offline contact-shadow bake.
export function propertyLandscape(T,k){
 const {m,root,mesh,box,slab,line,group}=k;
 for(const [name,color] of [['leafDeep',0x294838],['leafMid',0x4c6842],['leafSun',0x83935d],['soil',0x645647],['path',0xcec7b7]])m[name]=new T.MeshStandardMaterial({color,roughness:.85,side:T.DoubleSide});
 let seed=417;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function leaf(x,y,z,size,parent,rotation=0){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.37,.08,.40,0,.18,.52,.37,.08,.40,0,0,1],3));
  g.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);g.computeVertexNormals();
  const o=mesh(g,['leafDeep','leafMid','leafSun'][Math.floor(rnd()*3)],parent);o.position.set(x,y,z);o.scale.setScalar(size);o.rotation.set((rnd()-.5)*1.4,rotation,(rnd()-.5)*1.2);return o;
 }
 function shrub(x,y,z,r,parent=root){
  for(let i=0;i<55;i++){
   const a=i*2.399,h=rnd(),rr=r*Math.sqrt(rnd());
   leaf(x+Math.cos(a)*rr,y+r*.15+Math.sqrt(1-h*h)*r*.65,z+Math.sin(a)*rr,.075+rnd()*.065,parent,a);
  }
 }
 function tree(x,z,h,r=.29){
  const g=group(x,.28,z);line([[0,0,0],[.025,h*.55,.015],[-.025,h*.89,.04]],.022,'timber',g);
  for(let i=0;i<7;i++){
   const a=i*2.399,yy=h*(.54+(.08*(i%4))),xx=Math.cos(a)*r*.73,zz=Math.sin(a)*r*.73;
   line([[.01,yy*.77,0],[xx*.45,yy,zz*.5],[xx,yy+.11,zz]],.009,'timber',g);
   shrub(xx,yy,zz,r*.60,g);
  }
 }
 function palm(x,z,h){
  const g=group(x,.29,z);line([[0,0,0],[.04,h*.55,.015],[.09,h,.025]],.021,'timber',g);
  for(let j=0;j<12;j++){const y=j*h/12;const ring=mesh(new T.TorusGeometry(.022,.003,3,8),'clay',g);ring.rotation.x=Math.PI/2;ring.position.set(.09*y/h,y,.025*y/h);}
  for(let f=0;f<8;f++){
   const a=f*Math.PI/4,points=[];
   for(let j=0;j<6;j++){const t=j/5;points.push([.09+Math.cos(a)*t*.46,h+.18*Math.sin(t*Math.PI)-t*.14,.025+Math.sin(a)*t*.46]);}
   line(points,.004,'leafMid',g);
   for(let j=1;j<9;j++)for(const side of [-1,1]){
    const t=j/9,xx=.09+Math.cos(a)*t*.46,zz=.025+Math.sin(a)*t*.46,yy=h+.18*Math.sin(t*Math.PI)-t*.14;
    const o=leaf(xx,yy,zz,.18*(1-t*.65),g,a+side*1.0);o.scale.x*=.24;o.scale.y*=.7;
   }
  }
 }
 // Grounded beds frame buildings while leaving the two signal paths open.
 const beds=[[-3.99,-1.13,.19,1.72],[-2.82,-2.01,1.8,.18],[-1.75,-1.38,.18,1.25],[-1.46,-.57,.18,1.72],[.99,-.83,.18,1.96],[-.27,-1.88,2.35,.19],[-3.99,1.05,.16,1.12],[-2.85,1.71,2.1,.16]];
 for(const [x,z,w,d]of beds){slab(w+.045,d+.045,.07,x,.275,z,'concrete',root,.035);slab(w,d,.018,x,.318,z,'soil',root,.024);const n=Math.ceil(Math.max(w,d)/.17);for(let j=0;j<n;j++)shrub(x+(w>d?(j/(n-1)-.5)*w:0),.32,z+(d>w?(j/(n-1)-.5)*d:0),.13);}
 for(const [x,z,h,r] of [[-3.95,-1.80,.97,.34],[-1.76,-1.81,.87,.27],[-3.98,.27,.66,.23],[-3.98,1.59,.75,.24],[-1.83,1.58,.65,.23],[-.92,-1.91,.80,.28],[.95,-1.69,.89,.27]])tree(x,z,h,r);
 for(const [x,z,h]of [[-.99,.38,.93],[.99,.30,1.12],[-1.45,-.43,1.32],[.97,-1.23,1.08]])palm(x,z,h);
 // Small paving joints and terrace front courts.
 for(const [cx,cz,w,d]of [[-2.9,1.11,2.20,1.36],[-.23,-.50,2.52,2.47]]){
  for(let x=cx-w/2;x<cx+w/2;x+=.16)box(.004,.004,d,x,.285,cz,'path');
  for(let z=cz-d/2;z<cz+d/2;z+=.20)box(w,.004,.004,cx,.285,z,'path');
 }
 for(const [x,z]of [[-1.60,.95],[1.12,.74],[-3.91,-.01]]){
  box(.022,.25,.022,x,.40,z,'navy');box(.065,.026,.045,x,.53,z,'warmWindow');
 }
 return {shrub};
}

export function terraceDetail(T,k,house){
 const {mesh,box,line}=k;
 // Curved overlapping terracotta tiles, with a separate ridge and fascia.
 for(const side of [-1,1]){
  const roof=new T.Group();roof.position.set(0,.91,0);roof.rotation.z=-side*.42;house.add(roof);
  box(.46,.025,.88,side*.22,0,0,'clay',roof);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){
   const p=[],ix=[];for(let i=0;i<2;i++)for(let j=0;j<5;j++){const a=j/4*Math.PI;p.push(side*(row*.11+i*.13),.013+Math.sin(a)*.018+(3-row)*.004,-.435+col*.073+j*.018);}
   for(let j=0;j<4;j++)ix.push(j,j+5,j+1,j+1,j+5,j+6);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(side>0?ix.flatMap((_,i)=>i%3===0?[ix[i],ix[i+2],ix[i+1]]:[]):ix);g.computeVertexNormals();mesh(g,(row+col)%4===0?'brick':'clay',roof);
  }
  box(.04,.06,.92,side*.45,-.015,0,'cream',roof);
 }
 line([[0,.94,-.46],[0,.94,.46]],.025,'clay',house);
 // Shaded portico, shutters and miniature gate details.
 box(.73,.04,.28,0,.61,.46,'concrete',house);
 for(const x of [-.32,.32])box(.035,.58,.035,x,.29,.57,'concrete',house);
 for(const x of [-.33,-.03]){box(.055,.29,.03,x,.39,.39,'timber',house);for(let j=0;j<6;j++)box(.06,.012,.04,x,.27+j*.045,.41,'cream',house);}
 for(let j=0;j<8;j++)box(.012,.20,.012,-.16+j*.045,.14,.73,'navy',house);
 box(.37,.015,.02,0,.24,.73,'navy',house);
 for(const x of [-.4,.4])box(.085,.27,.085,x,.135,.73,'concrete',house);
}
