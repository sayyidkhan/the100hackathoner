import { sculptFace } from './pal-faces.js';
// The host has adult proportions. He intentionally does not share the compact
// companion body: long thawb, narrow shoulders, oval face and tailored bisht.
export function buildHost(w) {
  const {THREE,root,mesh,ball,line,ring}=w;
  const host=new THREE.Group();host.name='sheikh';host.position.set(0,.28,-1.47);root.add(host);
  const joint=(name,x,y,z)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);host.add(g);return g;};
  function oval(rx,ry,rz,x,y,z,color,parent=host,kind='clay') {
    const m=mesh(new THREE.SphereGeometry(1,Math.max(rx,ry,rz)>.15?28:16,Math.max(rx,ry,rz)>.15?20:12),color,parent,kind);m.scale.set(rx,ry,rz);m.position.set(x,y,z);return m;
  }
  // A sampled fabric surface lets the cut, waist and folds determine the shape.
  function cloth(rows,start,end,color,parent=host,folds=.01) {
    const curve=new THREE.CatmullRomCurve3(rows.map(([y,r,depth])=>new THREE.Vector3(r,y,depth)));
    const p=[],uv=[],ix=[],nu=48,nv=24;
    for(let v=0;v<=nv;v++){
      const t=v/nv,c=curve.getPoint(t);
      for(let u=0;u<=nu;u++){
        const a=start+(end-start)*u/nu,f=Math.sin(a*15+t*.8)*folds*(1-t*.55);
        p.push(Math.sin(a)*(c.x+f),c.y,Math.cos(a)*(c.z+f));uv.push(u/nu*2,t*3);
        if(v<nv&&u<nu){const i=v*(nu+1)+u;ix.push(i,i+1,i+nu+1,i+1,i+nu+2,i+nu+1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
    return mesh(g,color,parent,'cloth');
  }
  for(const side of [-1,1]){
    const foot=joint(side===1?'right-foot':'left-foot',side*.12,.095,.04);
    oval(.085,.055,.15,0,0,.035,'darkwood',foot);
  }
  cloth([[.10,.30,.23],[.40,.27,.21],[.92,.20,.17],[1.35,.20,.17],[1.65,.24,.16],[1.75,.12,.11]],0,Math.PI*2,'cream');
  oval(.09,.12,.085,0,1.78,0,'skin');
  const robeRows=[[.09,.37,.28],[.38,.34,.25],[.90,.25,.20],[1.38,.25,.19],[1.65,.29,.19],[1.74,.16,.13]];
  cloth(robeRows,.48,Math.PI*2-.48,0xa77b4e,host,.016);
  for(const side of [-1,1]){
    const edging=robeRows.map(([y,r,d])=>[side*Math.sin(.48)*r,y,Math.cos(.48)*d+.012]);
    line(edging,.012,'gold',host,'cloth');
    line(edging.map(([x,y,z])=>[x+side*.022,y,z-.003]),.004,'cream',host,'cloth');
  }
  line([[0,1.71,.12],[0,1.55,.175],[0,1.17,.18]],.004,'pale',host,'cloth');
  for(let i=0;i<5;i++)ball(.009,0,1.58-i*.085,.185,'honey',host,'clay',8);
  // Bent sleeves are modeled in the welcoming pose, not inflated shoulder balls.
  for(const side of [-1,1]) {
    const arm=joint(side===1?'right-arm':'left-arm',side*.235,1.60,.015);
    const path=side===1?[[0,0,0],[.12,-.17,.015],[.23,-.27,.08],[.39,-.15,.16]]:[[0,0,0],[-.09,-.22,.015],[-.08,-.34,.13],[.075,-.28,.25]];
    const curve=new THREE.CatmullRomCurve3(path.map(p=>new THREE.Vector3(...p)));
    const geo=new THREE.TubeGeometry(curve,32,.095,20,false),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const t=Math.floor(i/21)/32,center=curve.getPointAt(t),a=i%21/20*Math.PI*2;
      const r=1+.12*Math.sin(a*7)+.35*Math.sin(t*Math.PI);
      const p=new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).sub(center).multiplyScalar(r).add(center);pos.setXYZ(i,p.x,p.y,p.z);
    }geo.computeVertexNormals();mesh(geo,0xad8254,arm,'cloth');
    const end=new THREE.Vector3(...path[3]),direction=end.clone().sub(new THREE.Vector3(...path[2])).normalize();
    const cuff=ring(.098,.014,end.x,end.y,end.z,'gold',arm,'cloth');cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);
    const inner=ring(.085,.013,end.x+direction.x*.015,end.y+direction.y*.015,end.z+direction.z*.015,'cream',arm,'cloth');inner.quaternion.copy(cuff.quaternion);
    const hand=new THREE.Group();arm.add(hand);hand.position.copy(end).addScaledVector(direction,.075);
    if(side===1){
      oval(.085,.030,.055,.035,.01,.015,'skin',hand);
      for(let i=0;i<4;i++)line([[.06,.015,-.025+i*.024],[.115,.025,-.025+i*.024],[.14,.05,-.023+i*.024]],.014,'skin',hand);
      line([[.012,.025,.045],[.045,.065,.073],[.074,.075,.066]],.018,'skin',hand);
    }else{
      oval(.065,.080,.030,.025,0,.01,'skin',hand);
      for(let i=0;i<4;i++)line([[.02,-.05+i*.025,.035],[.085,-.04+i*.025,.045],[.10,-.025+i*.025,.035]],.012,'skin',hand);
      line([[.0,.025,.025],[.04,.072,.043],[.064,.075,.035]],.017,'skin',hand);
    }
  }
  const head=joint('head',0,1.82,0);head.scale.setScalar(1.12);
  sculptFace(w,head,'sheikh');
  // The ghutra follows the skull then opens over the shoulders as two sheets.
  oval(.207,.09,.19,0,.355,-.012,'cream',head,'cloth');
  for(const side of [-1,1]){
    const p=[],uv=[],ix=[],nu=12,nv=24;
    for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++){
      const t=v/nv,s=u/nu;
      const x=side*(.15+t*t*.11+Math.sin(s*Math.PI*.5)*.065+Math.sin(t*Math.PI)*.008);
      const y=.34-t*.69;
      const z=.13-s*.30+t*.13+Math.sin(s*Math.PI*4+t)*.01;
      p.push(x,y,z);uv.push(s,t);
      if(v<nv&&u<nu){const i=v*(nu+1)+u;ix.push(i,i+1,i+nu+1,i+1,i+nu+2,i+nu+1);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh(g,'cream',head,'cloth');
  }
  for(const y of [.367,.395]){const agal=ring(.204,.015,0,y,-.008,'ink',head,'cloth');agal.scale.z=.91;}
  host.userData.adultProportions=true;
  return host;
}
