// Articulated ivory sculptures with adult proportions and tailored clothing.
export function lrnmatePeople(T, kit) {
  const {root,materials:m,mesh,ball,line,box,disk}=kit;
  m.skin=new T.MeshStandardMaterial({color:0xe8d7b8,roughness:.72});
  m.suit=new T.MeshStandardMaterial({color:0xc5b69b,roughness:.96,bumpMap:m.ivory.bumpMap,bumpScale:.008});
  m.shirt=new T.MeshStandardMaterial({color:0xf1e4cb,roughness:.9,bumpMap:m.ivory.bumpMap,bumpScale:.006});
  m.hair=new T.MeshStandardMaterial({color:0xc2af8e,roughness:.94});
  m.feature=new T.MeshStandardMaterial({color:0x897d68,roughness:1});
  const group=(p,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
  const oval=(p,x,y,z,sx,sy,sz,mat)=>{const o=ball(1,x,y,z,mat,p);o.scale.set(sx,sy,sz);return o;};
  // A continuous cross-section surface gives the chest, waist and shoulders a human silhouette.
  function form(p,rings,mat){const pos=[],ix=[],uv=[],N=48;
    const spline=new T.CatmullRomCurve3(rings.map(([y,w,d,z=0])=>new T.Vector3(w,y,d)));const offsets=new T.CatmullRomCurve3(rings.map(([y,w,d,z=0])=>new T.Vector3(z,y,0)));rings=Array.from({length:48},(_,i)=>{const v=spline.getPoint(i/47);return [v.y,v.x,v.z,offsets.getPoint(i/47).x];});
    rings.forEach(([y,w,d,z=0],j)=>{for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;pos.push(Math.sin(a)*w,y,Math.cos(a)*d+z);uv.push(i/N,j/(rings.length-1));}});
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,a+1,b,b,a+1,b+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(g,mat,p);
  }
  function limb(p,a,b,r1,r2,mat){const va=new T.Vector3(...a),vb=new T.Vector3(...b),length=va.distanceTo(vb);const g=new T.Group();g.position.copy(va);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());p.add(g);return form(g,[[0,r1*.80,r1*.80],[length*.08,r1,r1],[length*.35,r1*.99,r1*.94],[length*.7,r2*1.08,r2],[length*.94,r2,r2],[length,r2*.86,r2*.86]],mat);}
  function fold(p,points){const shape=new T.Shape();points.forEach(([x,y,z],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const o=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2}),'shirt',p);o.position.z=.115;return o;}
  function hand(p,x,y,z,open=false){const h=group(p,x,y,z);oval(h,0,0,0,.043,.025,.073,'skin');for(let i=0;i<4;i++){const x=(i-1.5)*.020,len=.075-Math.abs(i-1.4)*.012;line([[x,0,.045],[x*(open?1.35:1),-.006,.08],[x*(open?1.7:1),-.014,.045+len]],.009,'skin',h);}line([[-.035,0,-.015],[-.063,-.005,.015],[-.065,-.009,.045]],.013,'skin',h);return h;}
  function head(p,y,female){const g=group(p,0,y,.035);g.rotation.x=.12;
    const geo=new T.SphereGeometry(1,48,40),a=geo.attributes.position;
    for(let i=0;i<a.count;i++){let x=a.getX(i),v=a.getY(i),z=a.getZ(i);const jaw=v<-.1?1+(v+.1)*.35:1;x*=.117*jaw;z*=.112;if(z>0){z+=.008*Math.exp(-(((v+.15)/.3)**2));z+=.037*Math.exp(-((x/.027)**2)-(((v+.05)/.26)**2));z-=.016*Math.exp(-(((v-.12)/.14)**2));}a.setXYZ(i,x,v*.162,z);}geo.computeVertexNormals();mesh(geo,'skin',g);
    oval(g,0,-.16,-.012,.052,.09,.05,'skin');
    for(const side of [-1,1]){oval(g,side*.115,-.005,0,.022,.041,.019,'skin');line([[side*.026,.022,.106],[side*.05,.027,.108],[side*.075,.018,.098]],.004,'feature',g);line([[side*.024,.055,.105],[side*.05,.060,.105],[side*.079,.050,.092]],.006,'hair',g);}
    
    line([[-.032,-.071,.104],[0,-.076,.115],[.031,-.071,.104]],.0035,'feature',g);
    // A continuous swept cap, with shallow asymmetric strand relief.
    const cap=new T.SphereGeometry(1,48,24,0,Math.PI*2,0,Math.PI*.57),hp=cap.attributes.position;
    for(let i=0;i<hp.count;i++){const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);hp.setXYZ(i,x*.122,y*.155+.015,z*.116-.012);}cap.computeVertexNormals();mesh(cap,'hair',g);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2;line([[Math.sin(a)*.12,.018,Math.cos(a)*.108-.012],[Math.sin(a+.35)*.107,.11,Math.cos(a+.35)*.086-.015],[.035,.17,-.025]],.0038,'hair',g);}
    if(female){oval(g,0,.01,-.137,.072,.067,.052,'hair');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;line([[Math.sin(a)*.055,.01+Math.cos(a)*.05,-.17],[Math.sin(a+.7)*.065,.01+Math.cos(a+.7)*.06,-.18],[0,.01,-.195]],.005,'hair',g);}}
    else {for(const side of [-1,1]){const o=mesh(new T.TorusGeometry(.037,.0038,8,40),'gold',g);o.scale.y=.73;o.position.set(side*.049,.022,.122);}line([[-.012,.027,.125],[0,.032,.13],[.012,.027,.125]],.003,'gold',g);}
    return g;
  }
  const existing=new Set(root.children);
  const actors=[];
  function person(x,z,seated){const p=group(root,x,.31,z);p.rotation.y=seated?.66:-.38;
    const hip=seated?.66:1.02,shoulder=seated?1.24:1.65;
    const body=group(p);form(body,[[hip-.07,.12,.09],[hip,.18,.11],[hip+.16,.14,.10],[shoulder-.19,.20,.105],[shoulder-.05,.225,.10],[shoulder,.18,.09],[shoulder+.025,.065,.06]],seated?'shirt':'suit');
    // Shirt opening, collars and lapels are thin fabric folds.
    line([[0,hip+.04,.115],[.008,shoulder-.05,.108]],.006,'shade',body);
    for(const side of [-1,1]){fold(body,[[side*.04,shoulder+.01],[side*.10,shoulder-.07],[side*.055,shoulder-.15],[side*.014,shoulder-.06]]);if(!seated)fold(body,[[side*.09,shoulder-.08],[side*.17,shoulder-.22],[side*.045,shoulder-.43],[side*.065,shoulder-.20]]);
      for(let j=0;j<3;j++)line([[side*.04,hip+.12+j*.045,.108],[side*.11,hip+.10+j*.045,.11],[side*.15,hip+.11+j*.045,.08]],.004,'paper',body);
      const knee=seated?[side*.12,.43,.37]:[side*.105,.55,.025];
      limb(p,[side*.11,hip-.04,0],knee,.097,.072,'suit');limb(p,knee,[side*.12,.09,seated?.40:.07],.070,.045,'suit');
      oval(p,side*.12,.055,seated?.46:.11,.065,.045,.14,'wood');
      const arm=group(body,side*.19,shoulder-.075,0);oval(arm,0,-.015,0,.083,.09,.09,seated?'shirt':'suit');
      const elbow=seated?[side*.06,-.25,.13]:[side*.09,-.27,.07];const wrist=seated?[side*.09,-.14,.40]:[side*.16,-.15,.30];
      limb(arm,[0,0,0],elbow,.075,.057,seated?'shirt':'suit');oval(arm,...elbow,.060,.061,.060,seated?'shirt':'suit');limb(arm,elbow,wrist,.057,.036,seated?'shirt':'suit');
      const palm=hand(arm,...wrist,!seated);if(seated&&side===1){line([[.015,-.02,.09],[.01,-.10,.18]],.006,'gold',palm);}
      actors.push({arm,seated,side});
    }
    const face=head(body,shoulder+.24,seated);face.rotation.y=seated?.2:-.38;actors.push({body,face,seated});
    if(seated){disk(.29,.08,x,.93,z,'paper');box(.50,.46,.09,x,1.18,z-.24,'paper');for(const dx of [-.20,.20])for(const dz of [-.17,.17])line([[x+dx,.91,z+dz],[x+dx*1.15,.31,z+dz*1.25]],.023,'wood');}
  }
  person(1.72,.30,true);person(2.90,-.39,false);
  const ensemble=new T.Group();ensemble.position.set(2.4,.31,.3);root.add(ensemble);for(const child of [...root.children])if(child!==ensemble&&!existing.has(child)){child.position.sub(ensemble.position);ensemble.add(child);}ensemble.scale.setScalar(1.12);
  return t=>{for(const a of actors){if(a.arm){a.arm.rotation.x=a.seated?.025*Math.sin(t*3.3+a.side):.10*Math.sin(t*.9+a.side);a.arm.rotation.z=a.seated?.018*Math.sin(t*4):a.side*.045*Math.sin(t*.9);}else{a.body.rotation.x=.012*Math.sin(t*.8);a.face.rotation.y=(a.seated?.2:-.38)+.07*Math.sin(t*.65);a.face.rotation.x=.12+.035*Math.sin(t*.9);}}};
}
