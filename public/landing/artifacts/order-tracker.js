import { sculpture } from './sculpture.js';

// zorder: a storefront, uploaded payment evidence, human review, fulfilment.
// The shop is a metaphor; the source app does not verify bank transfers itself.
export function createArtifact(T) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(T);
  const palette = { ivory:0xf2e5cc, paper:0xfff2d8, shade:0xcbb795, red:0xb94f34,
    blue:0x20433f, ink:0x292c26, wood:0x9e7043, gold:0xc39b56, sage:0x71816a,
    skin:0xdba980, hair:0x332822, pastry:0xc58331, custard:0xf5bf50, pink:0xd78a91 };
  for (const [key,color] of Object.entries(palette)) {
    materials[key] ??= new T.MeshStandardMaterial();
    materials[key].color.setHex(color);
    materials[key].roughness = key === 'gold' ? .3 : .72;
    materials[key].metalness = key === 'gold' ? .6 : 0;
  }
  materials.lamp = new T.MeshStandardMaterial({color:0xffd48c,emissive:0xffb64b,emissiveIntensity:.7});
  const labels = new T.Group(); root.add(labels);
  const moving = new T.Group(); root.add(moving);
  function group(x,y,z,parent=root) { const g=new T.Group(); g.position.set(x,y,z);parent.add(g);return g; }
  function rounded(w,h,d,x,y,z,c='ivory',p=root,r=.06) {
    r=Math.min(r,w/2-.001,h/2-.001);
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8}),c,p);m.position.set(x,y,z-d/2);return m;
  }
  function flat(w,d,h,x,y,z,c='ivory',p=root,r=.1) { const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m; }
  function ellipsoid(x,y,z,sx,sy,sz,c,p=root) {const m=ball(1,x,y,z,c,p);m.scale.set(sx,sy,sz);return m;}
  function ring(r,t,x,y,z,c,p=root) {const m=mesh(new T.TorusGeometry(r,t,8,32),c,p);m.position.set(x,y,z);return m;}
  function text(value,x,y,z,w,h,color='#f2e5cc',p=labels,font='600 48px Georgia') {
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=color;
    ctx.font=font.replace(/\d+px/, `${Math.round(canvas.height*.72)}px`);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,canvas.width/2,canvas.height/2,canvas.width-18);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
    m.position.set(x,y,z);m.userData.noShadow=true;p.add(m);return m;
  }
  // One tailored stone platform, with an inset brass route. No generic plinth.
  flat(7.65,4.05,.22,0,.12,.05,'shade',root,.35);
  flat(7.57,3.97,.045,0,.25,.05,'ivory',root,.33);
  for(let i=0;i<20;i++) { // fine, deterministic stone flecks
    const x=Math.sin(i*67.3)*3.5,z=Math.cos(i*23.8)*1.8;
    flat(.025+(i%3)*.012,.018,.003,x,.277,z,'shade',root,.004);
  }
  line([[-2.9,.283,1.15],[-2.2,.283,1.6],[-.25,.283,1.6],[.3,.283,.72],[1.2,.283,.7],[2.6,.283,1.28]],.018,'gold');
  // Shop cabinet: inset panels, skirting, corner posts and back shelving.
  rounded(3.3,1.12,1.25,-1.55,.9,-.48,'blue',root,.1);
  for(const x of [-2.56,-1.55,-.54]) {
    rounded(.94,.83,.025,x,.92,.165,'gold',root,.035);
    rounded(.89,.78,.035,x,.92,.189,'blue',root,.03);
  }
  flat(3.48,1.44,.13,-1.55,1.50,-.43,'wood');
  flat(3.48,1.44,.025,-1.55,1.576,-.43,'gold');
  line([[-3.12,.36,.22],[-3.12,.33,.35],[-.02,.33,.35],[-.02,.36,.22]],.035,'gold');
  rounded(3.24,2.24,.13,-1.55,1.72,-1.03,'blue');
  rounded(2.98,1.61,.06,-1.55,2.03,-.945,'wood');
  for(let i=0;i<15;i++)box(.012,1.62,.01,-2.98+i*.205,2.03,-.907,'shade');
  for(const x of [-3.15,.05]) {
    rounded(.15,2.62,.15,x,1.86,-.83,'blue');
    box(.025,2.38,.018,x,1.93,-.742,'gold');
  }
  for(const y of [1.79,2.34]) {
    flat(2.94,.42,.075,-1.55,y,-.75,'wood');
    box(2.82,.025,.025,-1.55,y-.055,-.54,'lamp');
    for(let i=0;i<6;i++) {
      const x=-2.73+i*.43;
      if(i<3) {disk(.11,.22,x,y+.16,-.73,i===1?'sage':'ivory');disk(.12,.025,x,y+.28,-.73,'gold');}
      else { for(let j=0;j<3;j++) {disk(.10,.07,x,y+.075+j*.075,-.73,'paper');ring(.049,.012,x+.106,y+.08+j*.075,-.73,'gold');} }
    }
  }
  // Curved striped canopy with a shaped valance and visible piping.
  for(let i=0;i<9;i++) {
    const x=-3.25+i*.385,c=i%2?'ivory':'red';
    const profile=new T.Shape();profile.moveTo(-.98,3.03);profile.bezierCurveTo(-.85,3.72,.10,3.52,.52,2.92);profile.lineTo(.52,2.86);profile.bezierCurveTo(.04,3.43,-.84,3.62,-.98,2.97);profile.closePath();
    const g=new T.ExtrudeGeometry(profile,{depth:.38,bevelEnabled:false,curveSegments:20});
    // profile x is depth, profile y is height; extrusion is shop width.
    const m=mesh(g,c);m.rotation.y=-Math.PI/2;m.position.x=x+.38;
    rounded(.38,.29,.055,x+.19,2.85,.52,c,root,.16);
    line([[x,3.03,-.98],[x,3.39,-.67],[x,3.40,-.22],[x,3.16,.28],[x,2.91,.52]],.009,c);
  }
  rounded(3.45,.38,.12,-1.52,3.13,.40,'gold');
  rounded(3.36,.31,.13,-1.52,3.13,.425,'ivory');
  text('zorder',-1.52,3.13,.56,1.8,.29,'#493d28',labels,'600 86px Georgia');
  for(const x of [-2.8,-.24]) {
    line([[x,3.23,.43],[x,3.57,.48],[x,3.61,.78],[x,3.34,.85]],.025,'gold');
    const shade=mesh(new T.CylinderGeometry(.06,.16,.12,32),'gold');shade.position.set(x,3.29,.85);
    disk(.12,.018,x,3.22,.85,'lamp');
  }
  // Two shelves of egg tarts, with fluted shells and custard centres.
  for(const y of [1.65,1.99]) {
    flat(2.10,.74,.055,-1.96,y,-.03,'gold');
    for(let row=0;row<2;row++)for(let i=0;i<5;i++) {
      const x=-2.78+i*.40,z=-.23+row*.36;
      const tart=mesh(new T.CylinderGeometry(.16,.125,.075,20),'pastry');tart.position.set(x,y+.065,z);
      disk(.125,.015,x,y+.11,z,'custard');
      for(let j=0;j<12;j++) {const a=j*Math.PI/6;ellipsoid(x+Math.cos(a)*.145,y+.085,z+Math.sin(a)*.145,.022,.035,.022,'pastry');}
    }
  }
  // Airy display-case frame keeps the pastries legible without opaque glass.
  for(const x of [-3.05,-.86]) for(const z of [-.47,.40]) line([[x,1.60,z],[x,2.22,z]],.018,'gold');
  for(const y of [1.60,2.22]) {line([[-3.05,y,-.47],[-3.05,y,.40],[-.86,y,.40],[-.86,y,-.47],[-3.05,y,-.47]],.018,'gold');}
  const glazing=new T.MeshPhysicalMaterial({color:0xdfe9dd,transparent:true,opacity:.10,roughness:.18,metalness:.1,side:T.DoubleSide,depthWrite:false});
  const glass=new T.Mesh(new T.PlaneGeometry(2.15,.60),glazing);glass.position.set(-1.955,1.91,.409);glass.userData.noShadow=true;labels.add(glass);
  for(const [x,c] of [[-.59,'pink'],[-.22,'custard']]) {
    const cup=mesh(new T.CylinderGeometry(.11,.08,.32,24),c);cup.position.set(x,1.77,.02);
    disk(.115,.02,x,1.94,.02,'paper');line([[x,1.94,.02],[x+.03,2.14,.02]],.014,'ivory');
  }
  // Order board: intentionally a visual metaphor, not claims of auto-payment.
  rounded(2.32,2.42,.13,2.15,1.99,-.65,'gold',root,.12);
  rounded(2.24,2.34,.14,2.15,1.99,-.62,'blue',root,.10);
  for(const x of [1.25,3.05]) {line([[x,.30,-.65],[x,1.10,-.65]],.045,'gold');flat(.48,.50,.05,x,.31,-.65,'blue');}
  text('ORDER BOOK',2.15,2.96,-.535,1.75,.17,'#e1bf7a',labels,'500 55px sans-serif');
  const cards=[];
  for(let col=0;col<3;col++) {
    const x=1.43+col*.72;
    text(['NEW','REVIEW','READY'][col],x,2.66,-.525,.62,.14,'#f5e7c9',labels,'600 48px sans-serif');
    for(let row=0;row<3;row++) {
      const y=2.26-row*.54;
      rounded(.60,.44,.035,x,y,-.51,'paper',root,.025);
      const pin=disk(.026,.02,x,y+.17,-.474,'gold');pin.rotation.x=Math.PI/2;
      text(`#${1001+col+row*3}`,x,y+.065,-.468,.47,.09,'#3a4234',labels,'600 50px sans-serif');
      text(row===1?'Lemonade × 2':'Egg tarts × 4',x,y-.045,-.468,.49,.08,'#6a5b46',labels,'400 42px sans-serif');
      box(.39,.008,.012,x,y-.13,-.481,'shade');
    }
    const indicator=ball(.043,x-.23,2.66,-.51,col===0?'custard':col===1?'red':'sage',moving);cards.push(indicator);
  }
  // Merchant: sculpted head, hair cap, bun, curved sleeves and a held receipt.
  const merchant=group(.58,.28,-.05);merchant.rotation.y=-.10;
  for(const x of [-.12,.12]) {ellipsoid(x,.09,.04,.12,.09,.19,'wood',merchant);rounded(.16,.39,.19,x,.29,0,'ivory',merchant);}
  const dress=mesh(new T.CylinderGeometry(.22,.31,.83,32),'red',merchant);dress.position.y=.77;
  ellipsoid(0,1.16,0,.25,.30,.18,'ivory',merchant);
  rounded(.32,.50,.05,0,1.05,.18,'red',merchant,.06);
  for(const x of [-.12,.12])box(.045,.36,.025,x,1.35,.148,'red',merchant);
  ellipsoid(0,1.64,0,.25,.29,.23,'skin',merchant);
  ellipsoid(0,1.79,-.045,.258,.19,.235,'hair',merchant);
  ellipsoid(.07,1.99,-.10,.14,.14,.13,'hair',merchant);
  for(let i=0;i<5;i++)line([[-.23+i*.10,1.84,.14],[-.20+i*.09,1.94,0],[-.15+i*.08,1.87,-.21]],.012,'hair',merchant);
  for(const x of [-.085,.085])ellipsoid(x,1.65,.213,.023,.028,.016,'ink',merchant);
  ellipsoid(0,1.59,.234,.035,.035,.036,'skin',merchant);
  line([[-.04,1.52,.214],[0,1.51,.228],[.04,1.52,.214]],.009,'red',merchant);
  line([[-.21,1.32,0],[-.34,1.11,.13],[-.20,1.04,.40]],.085,'ivory',merchant);
  line([[.21,1.32,0],[.34,1.10,.15],[.23,1.13,.40]],.085,'ivory',merchant);
  rounded(.39,.49,.025,.03,1.17,.41,'paper',merchant,.02);
  for(let i=0;i<5;i++)box(.26-(i%2)*.06,.012,.012,.03,1.31-i*.06,.431,'shade',merchant);
  ellipsoid(-.20,1.07,.42,.07,.07,.065,'skin',merchant);ellipsoid(.24,1.13,.42,.07,.07,.065,'skin',merchant);
  // Phone is large enough to communicate what is actually uploaded.
  const phone=group(-2.93,.32,1.22);phone.rotation.set(-.13,-.10,-.06);
  rounded(.95,1.77,.14,0,.89,0,'blue',phone,.12);
  rounded(.84,1.63,.02,0,.89,.083,'paper',phone,.09);
  rounded(.28,.04,.012,0,1.64,.10,'ink',phone,.015);
  text('zorder',0,1.44,.123,.67,.18,'#264139',phone,'600 75px Georgia');
  rounded(.28,.36,.015,0,1.12,.106,'shade',phone,.02);
  for(let i=0;i<3;i++)box(.17,.012,.012,0,1.22-i*.075,.12,'paper',phone);
  text('Payment proof',0,.81,.123,.76,.14,'#264139',phone,'600 48px sans-serif');
  text('Upload receipt',0,.62,.123,.70,.11,'#7d6d56',phone,'400 43px sans-serif');
  rounded(.68,.23,.015,0,.31,.11,'red',phone,.08);
  text('UPLOADED',0,.31,.138,.61,.10,'#fff2d8',phone,'600 46px sans-serif');
  flat(.94,.70,.07,-2.93,.31,1.10,'gold');
  // Packed orders on a low dispatch shelf.
  flat(2.48,1.0,.12,2.03,.49,1.02,'sage');
  for(const x of [1.0,3.05])for(const z of [.69,1.34])rounded(.13,.23,.13,x,.35,z,'sage');
  const parcels=[];
  for(let i=0;i<3;i++) {
    const p=group(1.25+i*.73,.56,1.02,moving);parcels.push(p);
    rounded(.62,.42,.59,0,.21,0,'paper',p,.05);
    flat(.65,.62,.045,0,.44,0,'ivory',p,.05);
    rounded(.17,.45,.61,0,.23,0,'red',p,.015);
    text('zorder',0,.25,.325,.15,.06,'#f2e5cc',p,'500 43px Georgia');
  }
  rounded(1.38,.19,.035,2.03,.46,1.546,'gold',root,.055);
  text('READY TO GO',2.03,.46,1.58,1.18,.13,'#263a32',labels,'600 47px sans-serif');
  // Botanical silhouettes add organic contrast without competing with the shop.
  function plant(x,y,z,s) {
    const pot=mesh(new T.CylinderGeometry(.19*s,.14*s,.31*s,32),'ivory');pot.position.set(x,y+.155*s,z);
    disk(.17*s,.02*s,x,y+.31*s,z,'wood');
    for(let i=0;i<7;i++) {
      const a=i*2.4,dx=Math.cos(a)*.25*s,dz=Math.sin(a)*.22*s,top=y+(.61+(i%3)*.19)*s;
      line([[x,y+.3*s,z],[x+dx*.4,top-.15*s,z+dz*.4],[x+dx,top,z+dz]],.012*s,'sage');
      const leaf=ellipsoid(x+dx,top,z+dz,.065*s,.19*s,.025*s,'sage');leaf.rotation.set(.5,a,-dx*2);
    }
  }
  plant(3.51,.28,-.91,1.20);plant(-3.4,.28,-.75,.85);
  // A tiny brass traveller traces the proof-to-review-to-fulfilment route.
  const traveller=ball(.048,0,.30,0,'gold',moving);
  const route=new T.CatmullRomCurve3([new T.Vector3(-2.9,.30,1.15),new T.Vector3(-2.2,.30,1.6),new T.Vector3(-.25,.30,1.6),new T.Vector3(.3,.30,.72),new T.Vector3(1.2,.30,.7),new T.Vector3(2.6,.30,1.28)]);
  // Preserve UV-bearing labels and articulated objects; batch the static model.
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),framingPoints=[];
  for(const object of root.children) {const b=new T.Box3().setFromObject(object);if(b.isEmpty())continue;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x-center.x,y-bounds.min.y,z-center.z));}
  const model=finish(69,[labels,moving,phone]);
  let selected=null;
  const phases=[
    ['Choose something good.','Browse the storefront and build an order.','flowing'],
    ['Attach the payment proof.','Pay by PayNow or bank transfer, then upload the receipt.','thinking'],
    ['A person checks the payment.','The merchant reviews the proof; verification is not automatic.','thinking'],
    ['Keep every order in view.','Prepare the order and track it through completion.','complete'],
  ];
  function animate(seconds) {
    const phase=selected??Math.floor(seconds/4.5)%4;
    const [title,detail,tone]=phases[phase];
    model.userData.story={index:phase,step:`0${phase+1} / 04`,title,detail,tone};
    traveller.position.copy(route.getPointAt(selected===null?(seconds%18)/18:(phase+.5)/4));
    cards.forEach((dot,i)=>dot.scale.setScalar(phase===i+1?1.35:1));
    parcels.forEach((p,i)=>{p.position.y=.56+(phase===3?.035*(1+Math.sin(seconds*2-i*.6)):0);});
  }
  model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.12,initialElevation:.28,framingPoints,animate,
    setStep(index){selected=index;},animationDuration:18};
  animate(0);
  return model;
}
