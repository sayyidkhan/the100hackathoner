import { medivoiceStudio } from './medivoice-studio.js';
import { applyInvitationAO } from './invitation-surface.js';

// The Invitation Studio: campaign creative → event invitation → community.
// Based on prompt-alchemist-beta/index.html and the #41 Instagram reflection.
export function createArtifact(T, options = {}) {
  const { root, materials: m, mesh, box, disk, ball, line, finish, texture } = medivoiceStudio(T);
  const mat = (color, roughness = .65, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  Object.assign(m, {
    porcelain: mat(0xe5d9c1, .6), paper: mat(0xf4ebd9, .83), trim: mat(0xb8a686, .6),
    petrol: mat(0x163c3c, .35), petrolEdge: mat(0x305352, .44),
    brass: mat(0xb79151, .3, .73), gold: mat(0xe0b15c, .4, .38),
    ochre: mat(0xe8ae43, .57), clay: mat(0xb65e43, .8), clayLight: mat(0xcd7a57, .74),
    velvet: mat(0xac503c, .94), dark: mat(0x3a3930, .6), sand: mat(0xd9be8b, .85),
    light: new T.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffbd49, emissiveIntensity: .6, roughness: .35 }),
  });
  const stone = texture('stone'), cloth = texture('cloth');
  for (const name of ['porcelain', 'paper', 'sand']) { m[name].bumpMap = stone; m[name].bumpScale = .008; }
  m.velvet.bumpMap = cloth; m.velvet.bumpScale = .006;
  const preserved = [];
  function group(x = 0, y = 0, z = 0, parent = root) {
    const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function roundedShape(w, h, r) {
    const s = new T.Shape(); r = Math.min(r, w / 2, h / 2);
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    s.closePath(); return s;
  }
  function rounded(w, h, d, x, y, z, color, parent = root, r = .06) {
    const b = Math.min(d * .25, .025);
    const o = mesh(new T.ExtrudeGeometry(roundedShape(w, h, r), { depth: d, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 4, curveSegments: 16 }), color, parent);
    o.position.set(x, y, z); return o;
  }
  function slab(w, d, h, x, y, z, color, parent = root, r = .1) {
    const o = rounded(w, d, h, x, y, z, color, parent, r); o.rotation.x = -Math.PI / 2; return o;
  }
  function rod(a, b, radius, color, parent = root) {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), direction = end.clone().sub(start);
    const o = mesh(new T.CylinderGeometry(radius, radius, direction.length(), 12), color, parent);
    o.position.copy(start.add(end).multiplyScalar(.5)); o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), direction.normalize()); return o;
  }
  function coin(r, d, x, y, z, color, parent) {
    const o = disk(r,d,x,y,z,color,parent); o.rotation.x = Math.PI / 2; return o;
  }
  function text(value, w, x, y, z, color, parent = root, h = w / 7) {
    const g = group(x,y,z,parent); g.userData.noAO = true;
    let map = null;
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
      const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.font = '600 100px Arial, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(value,512,82,990);
      map = new T.CanvasTexture(c); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
    }
    const o = new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({ map, transparent:true, depthWrite:false, toneMapped:false }));
    o.userData.noShadow = true; g.add(o); preserved.push(g); return g;
  }
  // A finely edged ceramic floor, with a dense top surface for contact shading.
  slab(7.65,4.12,.18,0,.035,0,'porcelain',root,1.10);
  slab(7.46,3.93,.027,0,.215,0,'paper',root,1.01);
  const floorGeo = new T.PlaneGeometry(7.36,3.83,80,44);
  const fp = floorGeo.attributes.position;
  for (let i=0;i<fp.count;i++) {
    const x=fp.getX(i), y=fp.getY(i), ax=Math.abs(x), ay=Math.abs(y), cx=3.68-.96, cy=1.915-.96;
    if(ax>cx && ay>cy) { const dx=ax-cx,dy=ay-cy,len=Math.hypot(dx,dy); if(len>.96)fp.setXY(i,Math.sign(x)*(cx+dx/len*.96),Math.sign(y)*(cy+dy/len*.96)); }
  }
  floorGeo.computeVertexNormals(); const floorTop=mesh(floorGeo,'paper'); floorTop.rotation.x=-Math.PI/2; floorTop.position.y=.249;
  const rimPoints=roundedShape(7.64,4.11,1.10).getPoints(160).map(p=>[p.x,.045,-p.y]);
  line(rimPoints,.018,'brass');
  // Warm inset seam, tiny corner fasteners and an engraved front title plate.
  for (const x of [-3.04,3.04]) for(const z of [-1.49,1.49]) {
    disk(.035,.008,x,.259,z,'brass'); box(.04,.002,.006,x,.264,z,'dark');
  }
  rounded(1.7,.115,.018,-.3,.118,2.074,'brass',root,.025);
  text('THE INVITATION STUDIO',1.50,-.3,.12,2.097,'#303d36',root,.078);

  // The landing-page hero is a real thick shell with fluted edge details.
  const page=group(-.65,.27,-.70); page.rotation.x=-.045;
  slab(2.48,.86,.10,0,.025,.05,'brass',page,.16);
  rounded(2.30,3.24,.31,0,1.75,-.13,'petrol',page,.22);
  rounded(2.14,3.08,.035,0,1.75,.19,'brass',page,.16);
  rounded(2.04,2.98,.025,0,1.75,.235,'paper',page,.14);
  for(const side of [-1,1])for(let i=0;i<3;i++)rounded(.018,1.95-i*.18,.025,side*(1.066+i*.035),1.66,.228,'brass',page,.009);
  for(let i=0;i<38;i++)box(.012,2.70,.025,-.94+i*.05,1.78,-.16,'petrolEdge',page);
  for(const x of [-1.16,1.16]) for(let i=0;i<18;i++)box(.018,.022,.20,x,.60+i*.135,.025,'petrolEdge',page);
  for(let i=0;i<3;i++)coin(.025,.012,-.83+i*.10,3.08,.277,i===0?'clay':'sand',page);
  box(.65,.013,.008,.43,3.08,.275,'trim',page);
  // A relief event image — sun and layered dunes instead of a blank rectangle.
  rounded(1.78,1.04,.025,0,2.39,.274,'sand',page,.065);
  coin(.235,.018,.40,2.60,.32,'ochre',page);
  function dune(points,color,z) {
    const s=new T.Shape(); s.moveTo(-.86,1.90);s.lineTo(-.86,points[0]);
    s.bezierCurveTo(-.35,points[1],.30,points[2],.86,points[3]);s.lineTo(.86,1.90);s.closePath();
    const o=mesh(new T.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:28}),color,page);o.position.z=z;
  }
  dune([2.31,2.57,2.12,2.40],'clayLight',.34);dune([2.14,2.42,2.10,2.28],'clay',.365);
  text('AI WITHOUT AI',1.67,0,1.66,.28,'#284443',page,.23);
  text('A COMMUNITY CONVERSATION',1.55,0,1.39,.28,'#887250',page,.10);
  for(let i=0;i<3;i++)box(1.57-i*.16,.018,.008,-i*.08,1.18-i*.085,.276,'trim',page);
  rounded(1.68,.34,.048,0,.67,.28,'ochre',page,.08);
  text('JOIN THE CONVERSATION',1.30,0,.67,.346,'#243b36',page,.105);
  // A legible arrow alongside the button label.
  line([[.72,.70,.349],[.76,.67,.349],[.72,.64,.349]],.008,'petrol',page);
  for(const x of [-.78,.78])coin(.027,.015,x,.39,.283,'brass',page);

  // Campaign creatives, with layered paper edges and distinct compositions.
  const ads=group(-2.66,.30,.60); ads.rotation.y=.12;
  slab(1.55,.77,.08,0,.02,.03,'brass',ads,.10);
  for(let i=0;i<3;i++) {
    const card=group((i-1)*.17,.10,-.16+i*.13,ads); card.rotation.z=.14-i*.13;
    rounded(1.05,1.54,.04,0,.78,0,'paper',card,.065);
    rounded(.86,.57,.013,0,1.06,.048,i===1?'petrol':'clay',card,.025);
    coin(.14,.009,.17,1.14,.07,'ochre',card);
    slab(.78,.14,.012,0,.38,.10,'brass',card,.015);
    for(let j=0;j<3;j++)box(.77-j*.12,.027,.008,-j*.06,.67-j*.09,.055,'trim',card);
    rounded(.55,.12,.012,-.10,.25,.052,'ochre',card,.025);
  }
  rounded(1.55,.16,.05,0,.13,.40,'petrol',ads,.04);
  text('01 / ATTRACT',.98,0,.13,.457,'#f0d6a5',ads,.08);

  // A semicircular venue. Each chair has a curved shell, padded seat and arms.
  const theatre=group(2.00,.26,.38);
  function terrace(inner,outer,height) {
    const shape=new T.Shape(),begin=-.13,end=Math.PI+.13;
    shape.absarc(0,0,outer,begin,end,false);shape.absarc(0,0,inner,end,begin,true);shape.closePath();
    const o=mesh(new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:64}),'porcelain',theatre);
    o.rotation.x=-Math.PI/2; return o;
  }
  for(let row=0;row<3;row++) {
    const r=.70+row*.43, h=.12+row*.16;
    terrace(r-.21,r+.23,h);
    const count=3+row;
    for(let i=0;i<count;i++) {
      const a=.18+(Math.PI-.36)*i/(count-1), c=group(Math.cos(a)*r,h,-Math.sin(a)*r,theatre);
      c.rotation.y=a-Math.PI/2;
      for(const x of [-.11,.11])rod([x,.015,-.07],[x,.15,.03],.013,'brass',c);
      slab(.29,.26,.053,0,.13,.015,'velvet',c,.09);
      // Thick, sculpted tub upholstery: closed inner/outer surfaces and rounded rim.
      const shellShape=new T.Shape();shellShape.absarc(0,0,.19,0,Math.PI,false);shellShape.absarc(0,0,.135,Math.PI,0,true);shellShape.closePath();
      const shellGeo=new T.ExtrudeGeometry(shellShape,{depth:.28,bevelEnabled:true,bevelThickness:.018,bevelSize:.016,bevelSegments:4,curveSegments:28});
      const sp=shellGeo.attributes.position;
      for(let k=0;k<sp.count;k++){
        const x=sp.getX(k),y=sp.getY(k),depth=sp.getZ(k),angle=Math.atan2(y,x);
        sp.setZ(k,depth*(.68+.32*Math.sin(angle)));
      }
      shellGeo.computeVertexNormals();
      const shell=mesh(shellGeo,'velvet',c);shell.rotation.x=-Math.PI/2;shell.position.y=.14;
      const piping=[];for(let j=0;j<=40;j++){const a=j/40*Math.PI;piping.push([Math.cos(a)*.168,.14+.28*(.68+.32*Math.sin(a))+.012,-Math.sin(a)*.168]);}
      line(piping,.006,'clayLight',c);
      c.scale.setScalar(1.22);

    }
    const trimPts=Array.from({length:70},(_,i)=>{const a=-.13+i/69*(Math.PI+.26);return[Math.cos(a)*(r+.23),h+.018,-Math.sin(a)*(r+.23)];});
    line(trimPts,.008,'brass',theatre);
  }
  // Fine brass balustrade along the outer arc.
  const railRadius=1.80, railPoints=[];
  for(let i=0;i<=80;i++){const a=-.10+i/80*(Math.PI+.20);railPoints.push([Math.cos(a)*railRadius,.98,-Math.sin(a)*railRadius]);}
  line(railPoints,.014,'brass',theatre);
  for(let i=0;i<10;i++){const a=-.10+i/9*(Math.PI+.20),x=Math.cos(a)*railRadius,z=-Math.sin(a)*railRadius;rod([x,.48,z],[x,.98,z],.013,'brass',theatre);ball(.021,x,.98,z,'gold',theatre);}
  disk(.53,.12,0,.07,.23,'brass',theatre);disk(.49,.025,0,.145,.23,'ochre',theatre);
  disk(.095,.025,0,.18,.27,'dark',theatre);rod([0,.18,.27],[0,.64,.27],.012,'brass',theatre);
  rod([0,.64,.27],[.12,.73,.27],.013,'brass',theatre);
  const microphone=ball(.034,.13,.74,.27,'dark',theatre);microphone.scale.set(1.4,.8,.8);
  const lectern=group(.25,.17,.02,theatre);rod([0,0,0],[0,.32,0],.016,'brass',lectern);const top=slab(.22,.17,.018,0,.32,0,'petrol',lectern,.025);top.rotation.x-=.2;
  text('03 / GATHER',.93,2.02,.33,1.72,'#6e5d3d',root,.08);

  // Broad physical ribbon: a clear route from the CTA to the event stage.
  const route=new T.CatmullRomCurve3([new T.Vector3(-.65,.90,-.30),new T.Vector3(-.65,.50,.15),new T.Vector3(-.43,.30,.90),new T.Vector3(.35,.29,1.22),new T.Vector3(1.20,.30,1.17),new T.Vector3(1.83,.35,.94),new T.Vector3(2.0,.40,.68)]);
  const vertices=[],ix=[],edgeA=[],edgeB=[];
  for(let i=0;i<=100;i++) {
    const t=i/100,p=route.getPoint(t),tangent=route.getTangent(t),side=new T.Vector3(tangent.z,0,-tangent.x).normalize().multiplyScalar(.115);
    const a=p.clone().add(side),b=p.clone().sub(side);vertices.push(...a.toArray(),...b.toArray());edgeA.push(a.toArray());edgeB.push(b.toArray());
    if(i<100){const k=i*2;ix.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(vertices,3));rg.setIndex(ix);rg.computeVertexNormals();m.gold.side=T.DoubleSide;mesh(rg,'gold');
  line(edgeA,.011,'brass');line(edgeB,.011,'brass');
  line([[-2.12,.30,.77],[-1.66,.30,.95],[-1.25,.30,.80],[-1.05,.48,-.1]],.026,'brass');
  text('02 / INVITE',.95,-.65,.36,.28,'#79623e',root,.08);

  // A soft floor footprint belongs to the sculpture, not a second display disk.
  const n=128,pixels=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=Math.max(0,Math.abs((x/(n-1)-.5)*9)-3.45),dz=Math.max(0,Math.abs((y/(n-1)-.5)*5.5)-1.7);
    pixels[(y*n+x)*4+3]=Math.round(60*Math.exp(-(dx*dx+dz*dz)/.12));
  }
  const shadowMap=new T.DataTexture(pixels,n,n);shadowMap.minFilter=shadowMap.magFilter=T.LinearFilter;shadowMap.needsUpdate=true;
  const footprint=new T.Mesh(new T.PlaneGeometry(9,5.5),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,toneMapped:false}));
  footprint.rotation.x=-Math.PI/2;footprint.position.y=.002;footprint.userData.noAO=true;footprint.userData.noShadow=true;footprint.userData.noFrame=true;root.add(footprint);preserved.push(footprint);
  // Keep text transforms and the contact sheet intact through material batching.
  root.updateMatrixWorld(true);for(const g of preserved)root.attach(g);
  const allBounds=new T.Box3().setFromObject(root),center=allBounds.getCenter(new T.Vector3()),offset=new T.Vector3(-center.x,-allBounds.min.y,-center.z);
  const frame=[];
  for(const child of root.children){if(child.userData.noFrame)continue;const b=new T.Box3().setFromObject(child);if(b.isEmpty())continue;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])frame.push(new T.Vector3(x,y,z).add(offset));}
  const model=finish(41,preserved);
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'invitation',initialYaw:-.13,initialElevation:.40,autoOrbit:true,framingPoints:frame});
  if(!options.bake)applyInvitationAO(T,model);
  return model;
}
