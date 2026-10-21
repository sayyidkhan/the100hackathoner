// Sculpted seated people, with organic garment profiles and articulated gestures.
export function buildCarePeople(T,k) {
  const {mesh,disk,ball,line,rounded,rod,ellipsoid,group}=k;
  function limb(points,radii,color,parent) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),steps=24,sides=16;
    const frames=curve.computeFrenetFrames(steps,false),p=[],n=[],uv=[],ix=[];
    for(let i=0;i<=steps;i++){
      const t=i/steps,c=curve.getPointAt(t),r=T.MathUtils.lerp(radii[0],radii[1],t)*(1+.025*Math.sin(t*21));
      for(let j=0;j<=sides;j++){
        const a=j/sides*Math.PI*2,v=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));
        const q=c.clone().addScaledVector(v,r);p.push(q.x,q.y,q.z);n.push(v.x,v.y,v.z);uv.push(j/sides,t);
        if(i<steps&&j<sides){const z=i*(sides+1)+j;ix.push(z,z+1,z+sides+1,z+1,z+sides+2,z+sides+1);}
      }
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);return mesh(geo,color,parent);
  }
  function torso(parent,doctor) {
    const profiles=[[0,.52],[.13,.53],[.205,.57],[.19,.71],[.165,.82],[.22,.99],[.20,1.04],[.09,1.09],[0,1.10]];
    const curve=new T.SplineCurve(profiles.map(p=>new T.Vector2(...p))),geo=new T.LatheGeometry(curve.getPoints(42),48);
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),f=1+.018*Math.cos(a*12+p.getY(i)*8);p.setXYZ(i,p.getX(i)*f,p.getY(i),p.getZ(i)*.67*f-.045);}
    geo.computeVertexNormals();mesh(geo,doctor?'coat':'blouse',parent);
    // Seams, jacket lapels and visible buttons create clothing rather than cylinders.
    for(const side of [-1,1]) {
      if(doctor)line([[side*.065,1.07,.06],[side*.14,.97,.105],[side*.065,.90,.13]],.012,'cream',parent);
      if(doctor){line([[side*.16,.77,.11],[side*.16,.65,.12],[side*.07,.65,.14]],.008,'sand',parent);}
    }
    if(doctor)for(let i=0;i<4;i++)ball(.008,0,.88-i*.075,.13,'brass',parent);
    else line([[-.07,1.065,.065],[0,1.015,.105],[.07,1.065,.065]],.009,'sage',parent);
  }
  function head(parent,doctor) {
    const g=group(0,1.14,-.015,parent);g.name=doctor?'clinician-head':'patient-head';
    const geo=new T.SphereGeometry(1,48,32),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),jaw=y<-.1?1-.26*Math.pow((-y-.1)/.9,.65):1;
      p.setXYZ(i,x*.132*jaw,.17+y*.185,z*.135+(z>0?.012*(1-y*y):0));
    }
    geo.computeVertexNormals();mesh(geo,'skin',g);
    // Eye sockets and eyelids stay restrained at miniature scale.
    for(const side of [-1,1]){
      ellipsoid(.025,side*.049,.205,.124,1,.48,.36,'skinShade',g);
      ellipsoid(.019,side*.049,.207,.132,1,.35,.28,'cream',g);
      ellipsoid(.007,side*.049,.208,.139,.65,1,.4,'hair',g);
      line([[side*.029,.227,.128],[side*.047,.235,.127],[side*.071,.229,.12]],.005,'hair',g);
      ellipsoid(.025,side*.13,.17,-.005,.5,1.3,.65,'skin',g);
      line([[side*.126,.195,.007],[side*.138,.17,.014],[side*.126,.147,.008]],.004,'skinShade',g);
    }
    ellipsoid(.022,0,.169,.139,.60,1.25,.85,'skin',g);
    ellipsoid(.019,0,.15,.155,1,.52,.72,'skin',g);
    line([[-.028,.105,.119],[0,.103,.128],[.028,.107,.119]],.003,'skinShade',g);
    // A continuous outer shell: the old front cap intersected the face,
    // leaving isolated strands that read as thinning hair.
    const hairGeo=new T.SphereGeometry(1,48,28),hp=hairGeo.attributes.position;
    for(let i=0;i<hp.count;i++){
      const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);
      const phi=Math.atan2(z,x),front=Math.sin(phi);
      const hairline=1.65-.46*Math.max(0,front)+.32*Math.max(0,-front);
      const theta=Math.acos(Math.max(-1,Math.min(1,y)))/Math.PI*hairline;
      hp.setXYZ(i,Math.cos(phi)*Math.sin(theta)*.150,.17+Math.cos(theta)*.207,Math.sin(phi)*Math.sin(theta)*.165-.004);
    }
    hairGeo.computeVertexNormals();mesh(hairGeo,'hair',g);
    if(!doctor){
      // Full side-swept fringe and a low ponytail give a younger silhouette.
      const fringe=ellipsoid(.10,-.035,.315,.095,1.02,.52,.62,'hair',g);fringe.rotation.z=.30;
      const sweep=ellipsoid(.073,.078,.276,.065,.62,1.03,.78,'hair',g);sweep.rotation.z=.35;
      ellipsoid(.058,0,.205,-.17,1,.85,.75,'hair',g);
      limb([[0,.20,-.18],[.025,.11,-.21],[.035,.025,-.19]],[.052,.025],'hair',g);
      ellipsoid(.055,0,.18,-.185,1,.25,.85,'jade',g);
    }
    return g;
  }
  function hand(parent,x,y,z) {
    const h=group(x,y,z,parent);ellipsoid(.047,0,0,0,.75,.42,1.05,'skin',h);
    for(let i=0;i<4;i++)limb([[-.027+i*.018,0,.025],[-.026+i*.018,-.012,.058],[-.025+i*.018,-.025,.064]],[.008,.006],'skin',h);
    limb([[-.028,0,0],[-.05,-.008,.026],[-.042,-.018,.04]],[.011,.007],'skin',h);return h;
  }
  function person(x,z,doctor,angle) {
    const p=group(x,.27,z);p.name=doctor?'clinician':'patient';p.rotation.y=angle;
    // Upholstered shell with piping, seat cushion and slender brass legs.
    for(const side of [-1,1])for(const end of [-1,1])rod([side*.23,.035,end*.21],[side*.20,.52,end*.20],.017,'brass',p);
    rounded(.62,.61,.14,0,.81,-.28,'sage',p,.18);
    rounded(.57,.13,.46,0,.51,-.22,'sage',p,.06);
    for(const side of [-1,1]){rounded(.085,.20,.44,side*.30,.71,-.21,'sage',p,.04);line([[side*.29,.80,-.18],[side*.29,.80,.20]],.008,'sageDark',p);}
    torso(p,doctor);
    for(const side of [-1,1]) {
      limb([[side*.105,.57,0],[side*.13,.55,.20],[side*.14,.47,.39],[side*.14,.25,.45],[side*.14,.10,.49]],[.092,.046],doctor?'petrol':'linen',p);
      ellipsoid(.085,side*.14,.065,.53,.73,.59,1.42,'cream',p);
      line([[side*.14-.05,.043,.47],[side*.14,.034,.64],[side*.14+.05,.043,.48]],.006,'sand',p);
    }
    rod([0,1.04,0],[0,1.19,0],.052,'skin',p);
    const headJoint=head(p,doctor),arms=[];
    for(const side of [-1,1]) {
      const arm=group(side*.19,1.01,-.02,p);arm.name=`${doctor?'doctor':'patient'}-arm-${side}`;
      limb([[0,0,0],[side*.055,-.11,.015],[side*.065,-.25,.14],[side*.015,-.25,.30]],[.076,.038],doctor?'coat':'blouse',arm);
      ellipsoid(.042,side*.015,-.25,.29,1,.9,.4,'cream',arm);
      hand(arm,side*.015,-.25,.34);arms.push(arm);
    }
    if(doctor) {
      for(const side of [-1,1])line([[side*.052,1.07,.05],[side*.11,.97,.12],[side*.083,.82,.15],[0,.79,.16]],.012,'petrol',p);
      const bell=disk(.031,.013,.045,.83,.175,'brass',p);bell.rotation.x=Math.PI/2;
      // Pen follows the clinician's right hand as it signs.
      rod([.015,-.28,.37],[.015,-.15,.32],.007,'brass',arms[1]);
    }
    return {root:p,head:headJoint,arms};
  }
  return {patient:person(-1.95,.66,false,.82),doctor:person(2.30,-.60,true,-.25)};
}
