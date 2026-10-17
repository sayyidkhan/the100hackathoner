import { sculpture } from './sculpture.js';

// A private server workbench: files, native documents, databases, functions
// and controlled sharing, based on the Zo Drive repository's current features.
export function createArtifact(T) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(T);
  for(const [name,color] of Object.entries({ivory:0xe9ddc4,paper:0xf7ecd6,shade:0xb6a383,red:0xa53028,blue:0x24485f,ink:0x122837,wood:0x9b7744,gold:0xc29c55})) {
    materials[name]??=new T.MeshStandardMaterial();materials[name].color.setHex(color);
    materials[name].roughness=name==='gold'?.32:.72;materials[name].metalness=name==='gold'?.65:0;
  }
  materials.glow=new T.MeshStandardMaterial({color:0xa8dadb,emissive:0x54a7b0,emissiveIntensity:.4});
  function rounded(w,h,d,x,y,z,c='ivory',p=root,r=.055){
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:10}),c,p);m.position.set(x,y,z-d/2);return m;
  }
  function flat(w,d,h,x,y,z,c='ivory',p=root,r=.08){const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;}
  function group(x,y,z){const g=new T.Group();g.position.set(x,y,z);root.add(g);return g;}
  function card(x,y,z,w,h,type,p=root){
    rounded(w,h,.035,x,y,z,'paper',p,.03);
    if(type==='image'){
      rounded(w*.84,h*.76,.015,x,y+.025,z+.03,'blue',p,.02);
      for(const [dx,dy,size] of [[-.09,-.10,.16],[.09,-.06,.22]]){
        const s=new T.Shape();s.moveTo(-size,-size*.6);s.lineTo(size,-size*.6);s.lineTo(0,size);s.closePath();const m=mesh(new T.ShapeGeometry(s),'ivory',p);m.position.set(x+dx,y+dy,z+.055);
      }
      const sun=disk(.045,.008,x+.16,y+.17,z+.055,'gold',p);sun.rotation.x=Math.PI/2;
    }else if(type==='sheet'){
      for(let i=0;i<5;i++)box(w*.76,.009,.01,x,y+h*.26-i*h*.12,z+.025,'blue',p);
      for(let i=0;i<4;i++)box(.008,h*.55,.01,x-w*.36+i*w*.24,y-.01,z+.025,'shade',p);
    }else if(type==='slide'){
      for(let i=0;i<3;i++)rounded(w*.14,h*(.17+i*.1),.012,x-w*.22+i*w*.22,y-h*.10+i*h*.05,z+.025,i===1?'red':'blue',p,.008);
    }else{
      box(w*.6,.032,.012,x-w*.06,y+h*.26,z+.025,'blue',p);
      for(let i=0;i<5;i++)box(w*(i===4?.42:.72),.012,.01,x,y+h*.09-i*h*.105,z+.025,'shade',p);
    }
    return p;
  }
  flat(7.5,4.0,.18,0,.10,.1,'ivory',root,.30);flat(7.42,3.92,.035,0,.205,.1,'paper',root,.28);
  // Low inlaid pathways connect the functions of the personal server.
  for(const [x,z] of [[-2.65,.3],[2.50,.0],[0,1.65]]){
    box(Math.abs(x)||.04,.012,.025,x/2,.233,z,'blue');box(.025,.012,Math.abs(z+.2),x,.233,(z-.2)/2,'blue');disk(.075,.012,x,.24,z,'gold');
  }
  // Hollow enclosure, dark inner shelves, raised corner posts and top cap.
  rounded(2.45,2.35,.12,0,1.45,-1.04,'ivory');
  for(const x of [-1.18,1.18])rounded(.13,2.36,1.62,x,1.45,-.28,'ivory');
  flat(2.58,1.86,.13,0,2.69,-.28,'paper');flat(2.38,1.68,.12,0,.30,-.28,'shade');
  box(2.15,2.13,.035,0,1.45,-.955,'ink');
  const smallDrawers=[];
  for(const y of [.69,2.23]){
    const tray=group(0,0,0);smallDrawers.push(tray);
    const before=new Set(root.children);
    rounded(2.22,.56,.13,0,y,.59,'ivory');rounded(.55,.065,.10,0,y,.72,'gold',root,.02);
    for(const x of [-.94,.94]){const screw=disk(.025,.014,x,y,.67,'gold');screw.rotation.x=Math.PI/2;}
    flat(2.10,1.40,.04,0,y-.25,-.18,'shade');
    for(const x of [-1.01,1.01])box(.04,.42,1.4,x,y-.02,-.18,'ivory');
    for(const object of [...root.children])if(!before.has(object))tray.add(object);
  }
  for(const y of [.96,1.78])flat(2.23,1.55,.045,0,y,-.22,'ink');
  const drawer=group(0,1.03,.60);
  flat(2.15,1.55,.07,0,0,0,'shade',drawer);rounded(2.22,.57,.10,0,.26,.80,'paper',drawer);
  for(const x of [-1.04,1.04]){
    box(.05,.40,1.5,x,.20,0,'ivory',drawer);box(.022,.035,1.52,x,.08,0,'gold',drawer);
  }
  rounded(.55,.065,.10,0,.28,.90,'gold',drawer,.02);
  for(let j=0;j<9;j++){
    rounded(1.93,.47,.025,0,.35,.60-j*.15,j%2?'ivory':'paper',drawer,.025);
    rounded(.34,.115,.025,(j%3-1)*.64,.62,.60-j*.15,j%3===0?'red':j%3===1?'blue':'shade',drawer,.02);
    for(let i=0;i<3;i++)box(1.8,.006,.007,0,.51+i*.025,.618-j*.15,'shade',drawer);
  }
  for(let j=0;j<7;j++)box(.016,.037,.72,1.253,2.40-j*.12,-.28,'ink');
  for(const x of [-1.10,1.10])for(const z of [-.92,.50])disk(.032,.018,x,2.765,z,'gold');
  // A tabbed folder with layered paper and supported previews.
  const folder=group(-.22,2.77,-.34);
  rounded(1.35,1.10,.04,0,.57,-.19,'red',folder);
  const flyingPages=[];
  for(let j=0;j<6;j++){
    const page=new T.Group();folder.add(page);page.position.set(-.025+j*.012,.65+j*.027,-.13+j*.038);
    card(0,0,0,1.15,.99,['doc','sheet','slide'][j%3],page);flyingPages.push(page);
  }
  rounded(1.37,.79,.045,0,.40,.16,'red',folder);rounded(.51,.18,.045,-.43,.85,.16,'red',folder,.03);
  card(.82,3.10,.23,.57,.69,'sheet');flat(.70,.20,.06,.82,2.78,.25,'shade');
  card(-.92,3.15,.12,.58,.75,'image');flat(.66,.22,.06,-.92,2.78,.16,'gold');
  // Precision database appliance and a small functions terminal.
  flat(1.55,1.56,.10,2.30,.31,-.25,'ivory');
  const indicators=group(0,0,0), ledMaterials=[];
  for(let i=0;i<3;i++){
    disk(.54,.40,2.30,.63+i*.46,-.45,'blue');disk(.545,.025,2.30,.845+i*.46,-.45,'gold');
    for(let j=0;j<3;j++){
      const a=.3+j*.22;const led=ball(.036,2.30+Math.sin(a)*.54,.64+i*.46,-.45+Math.cos(a)*.54,'glow',indicators);
      led.material=materials.glow.clone();ledMaterials.push(led.material);
    }
  }
  disk(.44,.018,2.30,1.80,-.45,'ink');
  for(let i=0;i<10;i++)box(.48,.012,.016,2.30,1.815,-.64+i*.042,'blue');
  const terminal=group(2.35,.48,.77);terminal.rotation.x=-.25;
  rounded(1.02,.64,.10,0,.34,0,'ivory',terminal);rounded(.87,.49,.015,0,.35,.065,'ink',terminal);
  for(let i=0;i<4;i++){
    box(.035,.022,.015,-.32,.50-i*.09,.08,'gold',terminal);box(.35+(i%2)*.20,.018,.012,.03,.50-i*.09,.08,'glow',terminal);
  }
  flat(1.08,.46,.06,2.35,.33,.83,'shade');
  // Functions emblem: brass cog on a dark medallion, with a supported foot.
  const gear=group(2.90,.60,1.25);
  const face=disk(.25,.06,0,0,0,'ink',gear);face.rotation.x=Math.PI/2;
  const rim=mesh(new T.TorusGeometry(.27,.025,10,48),'gold',gear);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;const tooth=box(.075,.08,.06,Math.sin(a)*.20,Math.cos(a)*.20,.05,'gold',gear);tooth.rotation.z=-a;
  }
  const cog=mesh(new T.TorusGeometry(.15,.055,8,32),'gold',gear);cog.position.z=.055;
  flat(.62,.24,.06,2.90,.27,1.25,'gold');
  // Sharing portal: an actual open brass arch, lock and key at the exit.
  const portal=group(-2.65,.28,-.1);
  flat(1.30,1.10,.10,0,.06,0,'ivory',portal);
  for(const x of [-.49,.49]){disk(.065,1.55,x,.87,0,'gold',portal);disk(.095,.045,x,.14,0,'gold',portal);}
  const arch=mesh(new T.TorusGeometry(.49,.065,12,48,Math.PI),'gold',portal);arch.position.set(0,1.64,0);
  line([[0,2.13,-.15],[0,1.28,-.15]],.014,'gold',portal);
  // The left leg stays captive inside the lock while the right leg swings free.
  const shackle=new T.Group();portal.add(shackle);shackle.position.set(-.19,1.50,0);
  const bow=mesh(new T.TorusGeometry(.19,.035,12,32,Math.PI),'gold',shackle);bow.position.set(.19,.17,0);
  line([[0,-.23,0],[0,.17,0]],.035,'gold',shackle);
  line([[.38,0,0],[.38,.17,0]],.035,'gold',shackle);
  rounded(.59,.49,.20,0,1.28,0,'ivory',portal,.07);
  const hole=disk(.055,.012,0,1.31,.115,'ink',portal);hole.rotation.x=Math.PI/2;box(.045,.10,.012,0,1.24,.115,'ink',portal);
  const key=mesh(new T.TorusGeometry(.10,.026,10,28),'red',portal);key.position.set(-.32,.22,.40);key.rotation.x=-Math.PI/2;
  line([[-.24,.22,.40],[-.01,.22,.40]],.026,'red',portal);box(.035,.035,.085,-.06,.22,.44,'red',portal);
  flat(.21,1.54,.018,-2.65,.248,.85,'blue');card(-2.65,.53,1.47,.49,.57,'doc');flat(.65,.22,.055,-2.65,.26,1.52,'shade');
  // Native documents: a low gallery rather than more anonymous file blocks.
  flat(2.35,.45,.075,.05,.29,1.55,'ivory');
  for(let i=0;i<3;i++){
    const g=group(-.73+i*.76,.33,1.52);g.rotation.x=-.13;
    card(0,.36,0,.60,.66,['doc','sheet','slide'][i],g);
    flat(.65,.16,.06,0,.04,.07,'gold',g);
  }
  // Small documents communicate transfer without a permanent wire or UI overlay.
  const traffic=group(0,0,0), packets=[];
  traffic.name='document-transfer';
  for(let i=0;i<2;i++){
    const packet=new T.Group();traffic.add(packet);packet.name=`transfer-document-${i}`;
    rounded(.24,.31,.025,0,0,0,'blue',packet,.025);
    rounded(.205,.275,.012,0,0,.021,'paper',packet,.018);
    box(.12,.018,.008,-.012,.075,.032,'gold',packet);
    for(let row=0;row<3;row++)box(row===2?.08:.135,.009,.008,-.008,.025-row*.038,.032,'blue',packet);
    packet.traverse(object=>{
      if(object.isMesh){object.material=object.material.clone();object.material.transparent=true;object.material.depthWrite=false;object.castShadow=false;}
    });
    packets.push(packet);
  }
  // Keep articulated parts out of the static geometry batches.
  root.updateMatrixWorld(true);
  root.attach(shackle);
  shackle.name='sharing-lock-shackle';drawer.name='file-drawer';
  smallDrawers.forEach((tray,i)=>{tray.name=`archive-drawer-${i}`;});
  indicators.name='database-activity';
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),framingPoints=[];
  for(const o of root.children){const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x-center.x,y-bounds.min.y,z-center.z));}
  framingPoints.push(new T.Vector3(-1.5-center.x,4.9-bounds.min.y,-center.z),new T.Vector3(1.5-center.x,4.9-bounds.min.y,-center.z));
  // The open middle drawer is the maximum extension used for framing.
  const model=finish(73,[drawer,...smallDrawers,shackle,indicators,folder,gear,traffic]);
  const rest={drawer:drawer.position.z,shackleY:shackle.position.y,smallDrawers:smallDrawers.map(tray=>tray.position.z)};
  const pageRest=flyingPages.map(page=>page.position.clone());
  const smooth=(a,b,t)=>{const v=T.MathUtils.clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
  const interval=(t,a,b,c,d)=>smooth(a,b,t)*(1-smooth(c,d,t));
  function animate(seconds){
    const t=((seconds%14)+14)%14;
    // Hold open, close gently, then reopen; small drawers take turns.
    const closed=interval(t,2,4,10,12);
    drawer.position.z=rest.drawer+.15-.96*closed;
    smallDrawers[0].position.z=rest.smallDrawers[0]+.64*interval(t,4.3,5.2,6.3,7.2);
    smallDrawers[1].position.z=rest.smallDrawers[1]+.72*interval(t,7,8,9,10);
    const lifted=interval(t,.6,1.1,9.1,9.5);
    const swung=interval(t,1.1,1.9,8.3,9.1);
    shackle.position.y=rest.shackleY+.10*lifted;
    shackle.rotation.y=-1.15*swung;
    const reveal=interval(t,.5,2.5,9.5,12.5);
    flyingPages.forEach((page,i)=>{
      page.position.copy(pageRest[i]);
      page.position.x+=(i-2.5)*.29*reveal;
      page.position.y+=(.42+Math.sin(i*Math.PI/5)*.36)*reveal;
      page.position.z+=i*.065*reveal;
      page.rotation.z=-(i-2.5)*.12*reveal;
    });
    gear.rotation.z=-seconds*.65;
    packets.forEach((packet,i)=>{
      const progress=(seconds/3.6+i*.5)%1;
      // Follow the drawer at departure; settle into the database at arrival.
      const departureZ=drawer.position.z-rest.drawer+1.42;
      packet.position.set(
        1.08+1.22*progress,
        1.50+.25*Math.sin(progress*Math.PI),
        T.MathUtils.lerp(departureZ,.10,progress)
      );
      packet.rotation.set(0,-.12*Math.sin(progress*Math.PI),-.12*Math.sin(progress*Math.PI*2));
      const visibility=smooth(0,.14,progress)*(1-smooth(.80,1,progress));
      packet.scale.setScalar(.65+.35*visibility);
      packet.traverse(object=>{if(object.isMesh)object.material.opacity=visibility;});
    });

    ledMaterials.forEach((material,i)=>{
      const pulse=Math.pow(.5+.5*Math.sin(seconds*(2.4+(i%3)*.35)-i*1.4),8);
      material.emissiveIntensity=.12+2.3*pulse;
      material.color.setHex(i%3===2?0xe2ba73:0x8ad6d5).multiplyScalar(.40+.60*pulse);
    });
  }
  animate(0);
  model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.24,initialElevation:.35,framingPoints,animate,animationDuration:14};
  return model;
}
