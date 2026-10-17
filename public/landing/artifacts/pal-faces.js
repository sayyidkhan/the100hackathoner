// Continuous facial surfaces, inset almond eyes and jaw-following beards.
// All coordinates are local to the existing articulated head joint.
export function sculptFace(w, head, role) {
  const {THREE,mesh,line}=w;
  const adult=role==='sheikh';
  const variants={messenger:[1.02,1.02,.005],writer:[.96,1.04,-.002],reviewer:[1.04,.97,.001],builder:[1.05,.97,-.001],strategist:[.97,1.02,.002],guardian:[1.01,1,-.003],healer:[1,1.02,.003]};
  const [wide,long,browLift]=variants[role]??[1,1,0];
  const rx=(adult?.182:.198)*wide,ry=(adult?.234:.211)*long,rz=adult?.161:.177;
  const cy=adult?.151:.126,z0=.008,eyeY=adult?.203:.166,eyeX=adult?.067:.072;
  const noseY=adult?.126:.104,mouthY=adult?.043:.033;
  const beardLength={messenger:.168,writer:.190,reviewer:.160,builder:.150,strategist:.173,guardian:.145,healer:.165}[role]??.172;
  const hair=adult?0x382a23:role==='healer'?0xc7bda8:0xe1d7bf;
  const skin=new THREE.Color(adult?0xdba579:0xe5b187);
  const blush=new THREE.Color(adult?0xc78669:0xd59078);
  const gauss=(x,y,cx,yy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2)-(((y-yy)/sy)**2));
  function depth(x,y) {
    const ellipse=Math.max(0,1-(x/rx)**2-((y-cy)/ry)**2);
    let z=z0+rz*Math.sqrt(ellipse);
    z+=(adult?.022:.018)*gauss(x,y,0,noseY+.04,.027,.070);
    z+=(adult?.047:.059)*gauss(x,y,0,noseY,.043,.041);
    for(const side of [-1,1]){
      z+=.011*gauss(x,y,side*.105,noseY-.014,.049,.047);
      z-=.009*gauss(x,y,side*eyeX,eyeY,.040,.029);
      z+=.006*gauss(x,y,side*eyeX,eyeY+.035,.044,.020);
    }
    z+=.009*gauss(x,y,0,mouthY,.069,.040);
    return z;
  }
  function finish(geometry,color,kind='skin') {
    const m=mesh(geometry,color,head,kind);m.userData.faceSurface=true;return m;
  }
  // One watertight head: cheeks, sockets and nose are sculpted into the skin.
  const skull=new THREE.SphereGeometry(1,64,48),p=skull.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    const nx=p.getX(i),ny=p.getY(i),nz=p.getZ(i),x=nx*rx,y=cy+ny*ry;
    let z=z0+nz*rz;
    if(nz>0)z=depth(x,y);
    p.setXYZ(i,x,y,z);
    const warm=nz>0?Math.min(.32,.28*(gauss(x,y,-.107,noseY-.016,.047,.045)+gauss(x,y,.107,noseY-.016,.047,.045))+.14*gauss(x,y,0,noseY,.035,.03)):0;
    const c=skin.clone().lerp(blush,warm);colors.push(c.r,c.g,c.b);
  }
  skull.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));skull.computeVertexNormals();
  // Analytic surface normals keep the small nose/cheek transitions smooth even
  // where the spherical tessellation has uneven vertex spacing.
  const normals=skull.attributes.normal,e=.0002;
  for(let i=0;i<p.count;i++)if(p.getZ(i)>z0+.025){
    const x=p.getX(i),y=p.getY(i),dx=(depth(x+e,y)-depth(x-e,y))/(2*e),dy=(depth(x,y+e)-depth(x,y-e))/(2*e);
    const n=new THREE.Vector3(-dx,-dy,1).normalize();normals.setXYZ(i,n.x,n.y,n.z);
  }
  finish(skull,0xffffff);
  function ellipsoid(x,y,z,sx,sy,sz,color,kind='skin'){
    const g=new THREE.SphereGeometry(1,20,14);g.scale(sx,sy,sz);g.translate(x,y,z);return finish(g,color,kind);
  }
  for(const side of [-1,1]){
    ellipsoid(side*(rx-.003),cy-.01,-.002,.029,.046,.024,skin.getHex());
    ellipsoid(side*(rx+.008),cy-.008,.015,.012,.026,.006,blush.clone().lerp(skin,.35).getHex());
  }
  // Curved facial patches sit on the skin instead of floating in front of it.
  function patch(cx,cy,width,height,color,kind='skin',lift=.003,shape=1){
    const positions=[cx,cy,depth(cx,cy)+lift+.003],uv=[.5,.5],idx=[],n=32;
    for(let i=0;i<=n;i++){
      const a=i/n*Math.PI*2,x=cx+Math.cos(a)*width,y=cy+Math.sin(a)*height*(shape===1?Math.pow(Math.abs(Math.sin(a)),.25):1);
      positions.push(x,y,depth(x,y)+lift);uv.push(.5+Math.cos(a)*.5,.5+Math.sin(a)*.5);
      if(i<n)idx.push(0,i+1,i+2);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return finish(g,color,kind);
  }
  for(const side of [-1,1]){
    const x=side*eyeX,y=eyeY,ew=adult?.026:.028,eh=role==='writer'?.013:.016;
    patch(x,y,ew,eh,0xd5bda0,'eye',.002);
    const irisX=x-side*.001;
    patch(irisX,y-.001,.014,.014,adult?0x38271d:0x44352a,'eye',.007,0);
    patch(irisX,y-.001,.009,.011,0x1c1917,'eye',.010,0);
    ellipsoid(irisX-.003,y+.004,depth(irisX-.003,y+.004)+.014,.0027,.0027,.0015,0xfff5df,'eye');
    const lid=(top)=>Array.from({length:9},(_,i)=>{
      const t=i/8,xx=x-ew+2*ew*t,yy=y+(top?1:-1)*eh*Math.sin(t*Math.PI);
      return [xx,yy,depth(xx,yy)+.004];
    });
    const upper=line(lid(true),adult?.0038:.0045,skin.clone().multiplyScalar(.78).getHex(),head,'skin');upper.userData.faceSurface=true;
    const lower=line(lid(false),.0023,skin.clone().multiplyScalar(1.03).getHex(),head,'skin');lower.userData.faceSurface=true;
    // Tapered brows follow the brow bone; separate roots don't form a monobrow.
    const browY=y+.035+browLift;
    const points=Array.from({length:9},(_,i)=>{
      const t=i/8,xx=side*(eyeX-.026+t*.056),yy=browY+Math.sin(t*Math.PI)*.009-t*.004;
      return new THREE.Vector3(xx,yy,depth(xx,yy)+.006);
    });
    const curve=new THREE.CatmullRomCurve3(points),geo=new THREE.TubeGeometry(curve,16,adult?.007:.009,8,false),bp=geo.attributes.position;
    for(let i=0;i<bp.count;i++){
      const t=Math.floor(i/9)/16,c=curve.getPointAt(t),v=new THREE.Vector3(bp.getX(i),bp.getY(i),bp.getZ(i));v.sub(c).multiplyScalar(.45+.55*Math.sin(Math.PI*t)).add(c);bp.setXYZ(i,v.x,v.y,v.z);
    }geo.computeVertexNormals();finish(geo,hair,'hair');
    // Short, subtle nostril creases under the integrated nose tip.
    const xx=side*(adult?.018:.024),yy=noseY-.014;
    line([[xx-side*.004,yy+.002,depth(xx-side*.004,yy+.002)+.001],[xx,yy,depth(xx,yy)+.002],[xx+side*.004,yy+.002,depth(xx+side*.004,yy+.002)+.001]],.0017,0x9a654b,head,'skin').userData.faceSurface=true;
  }
  // An actual smile opening, with a restrained upper tooth strip.
  const mw=adult?.044:.038;
  function smile(strip=false){
    const positions=[],uv=[],idx=[],n=24;
    for(let i=0;i<=n;i++){
      const t=-1+i/n*2,x=t*mw*(strip?.78:1),raise=.014*t*t,top=mouthY+raise;
      const bottom=top-(strip?.006:.019)*(1-t*t);
      for(const y of [bottom,top]){positions.push(x,y,depth(x,y)+(strip?.008:.005));uv.push(i/n,y===top?1:0);}
      if(i<n){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();finish(g,strip?0xf1ddbe:0x713f31,'skin');
  }
  smile();smile(true);
  // A single beard shell hugs both cheeks and tapers below the chin.
  const positions=[],uv=[],idx=[],beardColors=[],nu=48,nv=20;
  function beardPoint(u,t){
    const a=(u-.5)*Math.PI*.93,s=Math.sin(a),x=s*(adult?.174:.187)*(1-.14*t);
    const top=.008+(adult?.085:.092)*s*s;
    const bottom=(adult?-.082:-beardLength)+(adult?.072:.12)*s*s;
    const y=top+(bottom-top)*t+(adult?.0005:.003)*Math.sin(u*71)*t*t;
    const z=Math.max(depth(x,y),z0+(adult?.10:.13)*Math.cos(a))+.006+(adult?.006:.025)*Math.sin(t*Math.PI)+(adult?.0004:.0012)*Math.sin(u*113+t*4);
    return [x,y,z];
  }
  for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++){
    const s=u/nu,t=v/nv;positions.push(...beardPoint(s,t));uv.push(s,t);
    const shade=.96+.025*Math.cos(s*113+t*4)-t*.05,c=new THREE.Color(hair).multiplyScalar(shade);beardColors.push(c.r,c.g,c.b);
    if(v<nv&&u<nu){const i=v*(nu+1)+u;idx.push(i,i+nu+1,i+1,i+1,i+nu+1,i+nu+2);}
  }
  const beard=new THREE.BufferGeometry();beard.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));beard.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));beard.setAttribute('color',new THREE.Float32BufferAttribute(beardColors,3));beard.setIndex(idx);beard.computeVertexNormals();finish(beard,0xffffff,'hair');
  // Swept moustache lobes taper into the beard instead of sitting like beads.
  for(const side of [-1,1]){
    const points=adult?[[.008,.073],[.033,.068],[.060,.069],[.078,.075]]:[[.010,.065],[.046,.056],[.084,.030],[.112,.011]];
    const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(side*x,y,depth(side*x,y)+.011)));
    const geo=new THREE.TubeGeometry(curve,20,adult?.009:.019,10,false),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const t=Math.floor(i/11)/20,c=curve.getPointAt(t),v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i));v.sub(c).multiplyScalar(.25+.75*Math.sin(Math.PI*(t*.85+.07))).add(c);p.setXYZ(i,v.x,v.y,v.z);
    }geo.computeVertexNormals();finish(geo,hair,'hair');
  }
  head.userData.faceVersion=2;
}
