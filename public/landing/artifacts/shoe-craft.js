// A sewn, multi-panel sneaker shell. All overlays follow the same last, avoiding
// floating decorative primitives. The high-top has a separately open ankle collar.
export function craftedShoe(T,kit,parent,color,high=false){
 const {materials:m,mesh}=kit,g=new T.Group();parent.add(g);
 const suffix=high?'basket':color.toString(16),body='upper'+suffix,overlay='overlay'+suffix;
 m[body]=new T.MeshStandardMaterial({color,roughness:.92,map:m.meshFabric.map,bumpMap:m.meshFabric.map,bumpScale:.014,side:T.DoubleSide});
 m[overlay]=new T.MeshStandardMaterial({color,roughness:.72,map:m.leather.map,bumpMap:m.leather.map,bumpScale:.008,side:T.DoubleSide});
 const tube=(pts,r,key,segments=32)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),segments,r,6,false),key,g);
 const v=(x,y,z)=>new T.Vector3(x,y,z);
 function section(x,a,offset=0){const u=(x+1.42)/2.72;
 const toeRound=Math.sqrt(Math.min(1,Math.max(.01,(x+1.42)/.30))),heelRound=Math.sqrt(Math.min(1,Math.max(.05,(1.37-x)/.23)));
 const w=(.345+.085*Math.sin(u*Math.PI*1.7)+.055*u)*toeRound*heelRound;
 const h=.28+.46/(1+Math.exp(-(u-.47)*12))+(high?.38/(1+Math.exp(-(u-.71)*24)):0);
 const y=.23+h*(.55+.45*toeRound)*Math.pow(Math.max(0,Math.sin(a)),.78);
 return v(x,y+offset,Math.cos(a)*(w+offset));}
 function patch(x0,x1,a0,a1,key,offset=.008,nx=26,na=12,cut=false){const p=[],uv=[],ix=[];
 for(let j=0;j<=nx;j++)for(let k=0;k<=na;k++){const x=x0+(x1-x0)*j/nx,a=a0+(a1-a0)*k/na,q=section(x,a,offset);p.push(...q.toArray());uv.push(j/nx*3,k/na);}
 for(let j=0;j<nx;j++)for(let k=0;k<na;k++){const x=x0+(x1-x0)*(j+.5)/nx,a=a0+(a1-a0)*(k+.5)/na;if(cut&&x>.56&&x<1.18&&a>.68&&a<2.46)continue;const b=j*(na+1)+k,c=b+na+1;ix.push(b,b+1,c,c,b+1,c+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,key,g);}
 const outline=[];for(let i=0;i<100;i++){const a=i/100*Math.PI*2;const x=-.06+1.38*Math.cos(a),w=.36+.055*Math.sin((x+1.42)/2.72*Math.PI*1.7);outline.push([x,Math.sin(a)*w]);}
 function sole(y,height,key,shrink=1){const shape=new T.Shape();outline.forEach(([x,z],i)=>i?shape.lineTo(x*shrink,z*shrink):shape.moveTo(x*shrink,z*shrink));shape.closePath();const o=mesh(new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:16}),key,g);o.rotation.x=-Math.PI/2;o.position.y=y;return o;}
 sole(.02,.055,'tread');sole(.085,.13,'rubber');sole(.205,.025,'ivory');
 patch(-1.40,1.29,0,Math.PI,body,0,70,36,true);
 // Closed heel and smoothly rounded toe, instead of a sliced-off tube.
 for(const [x,key]of [[-1.40,overlay],[1.29,overlay]]){const shape=new T.Shape();for(let k=0;k<=36;k++){const p=section(x,k/36*Math.PI);k?shape.lineTo(p.z,p.y):shape.moveTo(p.z,p.y);}shape.closePath();const o=mesh(new T.ShapeGeometry(shape),key,g);o.rotation.y=Math.PI/2;o.position.x=x;}
 patch(-1.41,-.93,.03,Math.PI-.03,overlay,.018,18,18);
 patch(1.12,1.30,.03,Math.PI-.03,overlay,.018,8,18,true);
 // Quarter, eyestay and mudguard panels, leather edges and double stitching.
 for(const side of [0,1]){
 const mirror=a=>side?Math.PI-a:a;
 patch(-1.28,1.27,mirror(.04),mirror(.32),overlay,.017,54,5);
 patch(-.62,.53,mirror(.71),mirror(1.03),'ivory',.023,30,5);
 patch(.39,.64,mirror(.28),mirror(1.10),overlay,.024,6,12);
 patch(.86,1.18,mirror(.24),mirror(.67),'ivory',.027,8,8);
 // Flowing cream inset stripe; both outlines stitched into the upper.
 const stripe=[];for(let i=0;i<=20;i++){const x=-.7+i*.086,a=mirror(.42+.10*Math.sin(i/20*Math.PI));stripe.push(section(x,a,.028));}tube(stripe,.025,'ivory',40);
 for(const a of [.17,.35,.75]){const pts=[];for(let j=0;j<=30;j++)pts.push(section(-1.27+j*2.54/30,mirror(a),.028));tube(pts,.0048,'stitch',40);}
 for(let j=0;j<46;j++){const x=-1.24+j*.054;const p=section(x,mirror(.37),.031),q=section(x+.022,mirror(.39),.031);tube([p,q],.0028,'stitch',1);}
 // Recessed heel cushioning window and sculpted segmented outsole.
 for(let j=0;j<26;j++){const x=-1.24+j*.098;const w=.32+.045*Math.sin((x+1.42)/2.72*Math.PI);const o=mesh(new T.BoxGeometry(.056,.043,.043),'tread',g);o.position.set(x,.065,side?-w:w);o.rotation.z=.08*Math.sin(j);}
 const air=mesh(new T.CapsuleGeometry(.035,.33,4,12),'dark',g);air.rotation.z=Math.PI/2;air.position.set(.75,.145,side?-.385:.385);
 }
 // Deep collar cavity, padded elliptical lip, and an internal fabric tongue.
 const cy=high?1.30:.94,cx=.88;
 const well=mesh(new T.CylinderGeometry(.24,.22,.24,40,1,true),'dark',g);well.position.set(cx,cy-.12,0);well.scale.x=1.35;
 const lip=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;lip.push(v(cx+Math.cos(a)*.34,cy+.035*Math.cos(a),Math.sin(a)*.25));}tube(lip,.047,overlay,64);tube(lip.map(p=>p.clone().add(v(0,.024,0))),.007,'stitch',64);
 // Broad padded tongue, with a rolled upper edge and a woven label.
 const tongueP=[],tongueUV=[],tongueIX=[];
 for(let j=0;j<=32;j++)for(let k=0;k<=10;k++){
   const x=-.68+j/32*1.25,z=(k/10-.5)*.35,q=section(x,Math.PI/2,.045);
   tongueP.push(x,q.y+.035*Math.cos((k/10-.5)*Math.PI),z);tongueUV.push(j/32,k/10);
 }
 for(let j=0;j<32;j++)for(let k=0;k<10;k++){const a=j*11+k,b=a+11;tongueIX.push(a,b,a+1,a+1,b,b+1);}
 const tongueGeo=new T.BufferGeometry();tongueGeo.setAttribute('position',new T.Float32BufferAttribute(tongueP,3));tongueGeo.setAttribute('uv',new T.Float32BufferAttribute(tongueUV,2));tongueGeo.setIndex(tongueIX);tongueGeo.computeVertexNormals();mesh(tongueGeo,high?'ivory':body,g);
 const top=section(.57,Math.PI/2,.065);tube([v(.57,top.y,-.17),v(.61,top.y+.035,0),v(.57,top.y,.17)],.025,overlay,24);
 for(let j=0;j<7;j++){const x=-.63+j*.17,y=section(x,Math.PI/2).y+.04;
 for(const side of [-1,1]){const eye=mesh(new T.TorusGeometry(.031,.008,6,16),'brass',g);eye.rotation.x=-Math.PI/2;eye.position.set(x,y,side*.19);}
 tube([v(x,y,-.19),v(x+.065,y+.055,0),v(x+.13,y+.025,.19)],.015,'lace',14);tube([v(x,y,.19),v(x+.07,y+.065,0),v(x+.13,y+.025,-.19)],.015,'lace',14);}
 const by=section(.43,Math.PI/2).y+.09;
 for(const side of [-1,1])tube([v(.43,by,0),v(.70,by+.1,side*.16),v(.86,by,side*.22),v(.62,by-.015,side*.04),v(.43,by,0),v(.1,by-.24,side*.3)],.014,'lace',36);
 if(high){for(const side of [-1,1]){const points=[];for(let i=0;i<=20;i++)points.push(section(.51+i*.039,side?.64:Math.PI-.64,.027));tube(points,.025,'ivory',24);}}
 // Authentic wear: subtle creases crossing the vamp, small perforations, scuffed toe.
 for(let j=0;j<7;j++){const pts=[];for(let k=0;k<=14;k++)pts.push(section(-.83+j*.045+.012*Math.sin(k),.5+k/14*2.14,.02));tube(pts,.003,'wear',18);}
 for(let j=0;j<5;j++)for(let k=0;k<7;k++){const x=-1.25+j*.055,a=.55+k*.29,p=section(x,a,.022);const o=mesh(new T.SphereGeometry(.009,6,4),'dark',g);o.position.copy(p);o.scale.y=.35;}
 g.name='detailed-sneaker';return g;
}
