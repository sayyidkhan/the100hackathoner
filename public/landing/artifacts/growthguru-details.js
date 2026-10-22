// Raised ivory reliefs, readable as objects from every orbit angle.
export function skillRelief(T, { mesh, box, disk, ring, tube, ball }, parent, branch, level) {
  const g=new T.Group();parent.add(g);g.position.set(0,.065,.12);
  const stroke=(p,r=.018)=>tube(p.map(([x,y])=>[x,y,.055]),r,'cream',g);
  if(branch===0&&level===0){
    stroke([[-.10,.13],[-.23,0],[-.10,-.13]]);stroke([[.10,.13],[.23,0],[.10,-.13]]);stroke([[.055,.17],[-.055,-.17]],.014);
  }else if(branch===0&&level===1){
    box(.44,.31,.035,0,0,0,'cream',g);box(.38,.24,.022,0,-.012,.025,'coral',g);
    stroke([[-.20,.073],[.20,.073]],.012);for(const x of [-.15,-.10,-.05])ball(.012,x,.111,.027,'coral',g);
    box(.095,.13,.027,-.115,-.035,.043,'cream',g);for(let i=0;i<3;i++)box(.17,.012,.027,.055,.015-i*.045,.043,'cream',g,.003);
  }else if(branch===1&&level===0){
    ring(.18,.015,0,0,0,'cream',g);const meridian=ring(.18,.012,0,0,0,'cream',g);meridian.scale.x=.45;
    for(const y of [-.08,.08]){const r=ring(.16,.011,0,y,0,'cream',g);r.scale.y=.3;}
  }else if(branch===1&&level===1){
    for(let i=0;i<3;i++){box(.40,.09,.055,0,.12-i*.12,0,'cream',g);ball(.016,-.145,.12-i*.12,.04,'amber',g);box(.18,.012,.015,.045,.12-i*.12,.04,'amber',g,.003);}
  }else if(branch===1&&level===2){
    for(const side of [-1,1])stroke([[side*.14,.18],[side*.075,.17],[side*.075,.06],[side*.04,0],[side*.075,-.06],[side*.075,-.17],[side*.14,-.18]],.020);
  }else if(branch===2&&level===1){
    box(.36,.35,.04,0,0,0,'cream',g);box(.31,.29,.02,0,-.01,.029,'teal',g);
    for(const x of [-.053,.053])stroke([[x,-.15],[x,.09]],.009);
    for(const y of [-.07,.015,.095])stroke([[-.16,y],[.16,y]],.009);
  }else if(branch===2){
    for(let i=0;i<3;i++){
      const d=disk(.155,.065,0,.12-i*.10,.005,'cream',g);d.scale.z=.48;
      const seam=ring(.155,.009,0,.154-i*.10,.005,'gold',g);seam.rotation.x=-Math.PI/2;seam.scale.y=.48;
    }
    if(level===2){const gear=ring(.066,.019,.135,-.12,.085,'cream',g);for(let i=0;i<8;i++){const a=i*Math.PI/4;const b=box(.035,.045,.025,.135+Math.sin(a)*.073,-.12+Math.cos(a)*.073,.085,'cream',g,.003);b.rotation.z=-a;}}
  }
  return g;
}

export function gardenMaterials(T,m) {
  // Periodic low-frequency mineral/wood fields avoid noisy stippling.
  const size=256;
  function map(kind){const data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,tau=Math.PI*2;
    const a=Math.sin(tau*(u*3+Math.sin(v*tau)*.2)),b=Math.cos(tau*(v*5+Math.sin(u*tau*2)*.2));
    const wood=Math.sin(tau*u*32+Math.sin(v*tau)*1.4)+Math.sin(tau*u*71)*.2;
    const n=kind==='wood'?wood: a*.5+b*.3+Math.sin(tau*(u*23+v*17))*.1;
    const value=kind==='wood'?218+n*15:239+n*7;const i=(y*size+x)*4;
    data.set([value,value,value,255],i);
  }const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
  const mineral=map('stone'),wood=map('wood');mineral.repeat.set(1.6,1.6);
  m.stone.map=mineral;m.stone.bumpMap=mineral;m.stone.bumpScale=.009;m.stone.roughness=.87;
  m.wood.map=wood;m.wood.bumpMap=wood;m.wood.bumpScale=.006;m.wood.roughness=.38;
  for(const key of ['coral','amber','teal'])m[key]=new T.MeshPhysicalMaterial({color:m[key].color,roughness:.3,metalness:.06,clearcoat:.8,clearcoatRoughness:.2});
  m.gold.roughness=.26;m.gold.metalness=.82;
  m.water=new T.MeshPhysicalMaterial({color:0x124c49,roughness:.2,metalness:.2,clearcoat:1,clearcoatRoughness:.08});
  m.page=new T.MeshStandardMaterial({color:0xf6e7cb,roughness:.9,side:T.DoubleSide});
  m.pageEdge=new T.MeshStandardMaterial({color:0xd4c3a5,roughness:.9});
  m.leather=new T.MeshStandardMaterial({color:0x35524c,roughness:.66});
}
