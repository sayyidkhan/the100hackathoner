import { sculpture } from './sculpture.js';
import { animateCouncil } from './pal-council.js';
import { addKingdomLanterns } from './pal-lanterns.js';

// A public-facing metaphor for one founder and seven helpful specialists.
export function createArtifact(THREE) {
  const { root, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  const flags=[];
  disk(3.15,.16,0,.08,0,'paper');
  disk(2.96,.08,0,.20,0);
  // The community paths lead to an open council, not a sealed fortress.
  for (const side of [-1,1]) {
    line([[0,.249,1.35],[side*.5,.249,2.1],[side*2,.249,2.25]],.065,'blue');
  }
  for(let i=0;i<3;i++) box(1.05,.08,.32,0,.05+i*.065,2.88-i*.24,'paper');

  // Low castle backdrop with an open arch and two crenellated towers.
  for(const x of [-2.12,2.12]) {
    disk(.42,.16,x,.32,-1.53,'shade');
    disk(.34,1.58,x,1.15,-1.53);
    disk(.40,.16,x,1.98,-1.53,'paper');
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      box(.15,.23,.15,x+Math.cos(a)*.31,2.15,-1.53+Math.sin(a)*.31);
    }
    box(.09,.30,.025,x,1.32,-1.18,'shade');
    line([[x,2.04,-1.53],[x,2.70,-1.53]],.025,'wood');
    const flagRoot=new THREE.Group();root.add(flagRoot);flagRoot.position.set(x,2.55,-1.53);
    const flag=box(.40,.21,.035,.18,0,0,'blue',flagRoot);flag.rotation.z=-.1;flags.push(flagRoot);
  }
  for(const x of [-1.52,1.52]) {
    box(.66,1.36,.20,x,.92,-1.72,'paper');
    for(let i=0;i<3;i++) box(.13,.17,.23,x-.24+i*.24,1.68,-1.72);
    box(.23,.63,.035,x,1.13,-1.60,'blue');
    ball(.045,x,1.25,-1.57,'wood');
  }
  line([[-1.10,.25,-1.92],[-1.10,1.76,-1.92],[-.72,2.20,-1.92],[0,2.40,-1.92],[.72,2.20,-1.92],[1.10,1.76,-1.92],[1.10,.25,-1.92]],.13,'ivory');

  // Round planning table and a tiny community at its heart.
  for(const x of [-.65,.65])for(const z of [-.5,.5])box(.13,.53,.13,x,.53,z,'wood');
  disk(1.14,.14,0,.86,0,'wood');
  disk(1.04,.025,0,.946,0,'paper');
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    const card=box(.23,.012,.18,Math.sin(a)*.85,.97,Math.cos(a)*.85);
    card.rotation.y=a;
  }
  disk(.47,.025,0,.975,0,'shade');
  for(const [x,z,h,c] of [[-.24,.12,.22,'red'],[.25,.1,.28,'red'],[0,-.16,.44,'blue']]) {
    box(.19,h,.18,x,1+h/2,z);
    const roof=mesh(new THREE.ConeGeometry(.17,.17,4),c);roof.position.set(x,1+h+.085,z);roof.rotation.y=Math.PI/4;
    box(.045,.09,.012,x,1.06,z+.095,'wood');
  }

  const cast = [];
  function figure(x,z,color,sheikh=false) {
    const g=new THREE.Group();root.add(g);g.position.set(x,.25,z);
    g.rotation.y=sheikh?0:Math.atan2(-x,-z);
    if(sheikh)g.scale.setScalar(1.4);
    for(const s of [-1,1]) {
      const shoe=ball(.105,s*.13,.095,.04,'shade',g);shoe.scale.set(1,.65,1.45);shoe.name=s===1?'right-foot':'left-foot';
      const shoulder=new THREE.Group();shoulder.name=s===1?'right-arm':'left-arm';shoulder.position.set(s*.26,.58,.06);g.add(shoulder);
      const arm=ball(.10,0,-.12,0,'ivory',shoulder);arm.scale.y=1.55;
    }
    const body=mesh(new THREE.CylinderGeometry(.18,.26,.46,24),color,g);body.position.y=.36;
    ball(.205,0,.76,0,'paper',g);
    ball(.058,0,.74,.196,'paper',g);
    for(const s of [-1,1])ball(.025,s*.074,.79,.182,'ink',g);
    if(sheikh) {
      const bisht=mesh(new THREE.CylinderGeometry(.20,.34,.65,24,1,true,Math.PI/2,Math.PI),'wood',g);bisht.position.set(0,.48,-.02);
      const beard=ball(.13,0,.65,.15,'ink',g);beard.scale.set(1,.85,.50);
      // White ghutra drapes down both sides, secured by the black agal.
      const cloth=ball(.23,0,.94,-.01,'ivory',g);cloth.scale.set(1,.42,1);
      for(const side of [-1,1]) {
        const fold=ball(.13,side*.205,.75,-.035,'ivory',g);fold.scale.set(.55,2.1,1.3);fold.rotation.z=side*.12;
      }
      for(const y of [.96,1.005]) {
        const agal=mesh(new THREE.TorusGeometry(.205,.027,8,40),'ink',g);agal.rotation.x=Math.PI/2;agal.position.set(0,y,0);
      }
      for(const side of [-1,1])line([[side*.14,.62,.15],[side*.23,.12,.20]],.012,'paper',g);
    } else {
      const beard=ball(.15,0,.64,.14,'ivory',g);beard.scale.set(1,1.30,.60);
      disk(.24,.05,0,.92,0,color,g);
      const cap=mesh(new THREE.ConeGeometry(.215,.32,24),color,g);cap.position.set(.025,1.075,0);cap.rotation.z=-.13;
    }
    const headParts=g.children.filter(part=>part.isMesh&&part.position.y>=.60);
    const head=new THREE.Group();head.name='head';head.position.y=.66;g.add(head);root.updateMatrixWorld(true);headParts.forEach(part=>head.attach(part));
    cast.push(g);
    return g;
  }
  const sheikh=figure(0,-1.43,'ivory',true);sheikh.name='sheikh';
  const roles=['messenger','writer','reviewer','builder','strategist','guardian','healer'];
  const colors=['red','blue','wood','shade','blue','blue','ivory'];
  const angles=[-2.20,-1.42,-.72,0,.72,1.42,2.20];
  roles.forEach((role,i)=>{
    const a=angles[i],x=Math.sin(a)*1.62,z=Math.cos(a)*1.48;
    const g=figure(x,z,colors[i]);g.name=role;
    const propStart=g.children.length;
    disk(.29,.06,x,.31,z,'wood');
    if(role==='messenger') {
      line([[.27,.47,.11],[.30,1.03,.11]],.024,'wood',g);
      const bubble=ball(.16,.30,1.09,.11,'ivory',g);bubble.scale.z=.28;
      const tail=mesh(new THREE.ConeGeometry(.055,.12,3),'ivory',g);tail.position.set(.25,.98,.11);tail.rotation.z=Math.PI;
    } else if(role==='writer') {
      for(const side of [-1,1]) {const page=box(.17,.035,.24,side*.087,.54,.31,'ivory',g);page.rotation.z=side*.15;}
      line([[.25,.45,.30],[.31,.88,.27]],.018,'wood',g);
      const quill=ball(.08,.31,.83,.27,'ivory',g);quill.scale.set(.6,2.2,.25);quill.rotation.z=-.3;
    } else if(role==='reviewer') {
      line([[.24,.38,.27],[.28,.69,.28]],.026,'wood',g);
      const lens=mesh(new THREE.TorusGeometry(.115,.022,8,32),'wood',g);lens.position.set(.28,.79,.28);
    } else if(role==='builder') {
      box(.045,.39,.045,.25,.63,.24,'wood',g);
      box(.27,.13,.13,.25,.84,.24,'shade',g);
    } else if(role==='strategist') {
      box(.39,.30,.025,0,.53,.33,'paper',g);
      line([[-.15,.46,.35],[-.04,.58,.35],[.07,.51,.35],[.15,.62,.35]],.012,'blue',g);
    } else if(role==='guardian') {
      const shape=new THREE.Shape();shape.moveTo(-.18,.18);shape.lineTo(.18,.18);shape.lineTo(.16,-.08);shape.lineTo(0,-.23);shape.lineTo(-.16,-.08);shape.closePath();
      const shield=mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),'blue',g);shield.position.set(.10,.51,.30);
      box(.035,.21,.018,.10,.51,.345,'ivory',g);
    } else {
      box(.31,.22,.17,.15,.42,.29,'wood',g);
      line([[.05,.53,.29],[.05,.62,.29],[.25,.62,.29],[.25,.53,.29]],.02,'wood',g);
      box(.04,.12,.01,.15,.43,.38,'ivory',g);box(.12,.04,.01,.15,.43,.38,'ivory',g);
    }
    const props=g.children.slice(propStart);
    const tool=new THREE.Group();tool.name='working-tool';tool.position.set(0,.5,.25);g.add(tool);
    root.updateMatrixWorld(true);
    props.forEach(prop=>tool.attach(prop));
  });

  // Small market stall: the kingdom exists to serve its community.
  box(.82,.45,.48,-1.88,.49,1.77,'wood');
  for(const x of [-2.26,-1.5])line([[x,.27,1.57],[x,1.38,1.57]],.035,'wood');
  for(let i=0;i<6;i++) {const strip=box(.15,.055,.64,-2.26+i*.15,1.36,1.77,i%2?'ivory':'red');strip.rotation.x=.12;}
  for(let i=0;i<3;i++)ball(.08,-2.10+i*.20,.78,1.77,i===1?'red':'paper');
  // Noticeboard with blank cards, never private implementation details.
  for(const x of [1.82,2.46])box(.045,.80,.045,x,.65,1.58,'wood');
  box(.82,.54,.08,2.14,1.06,1.58,'wood');
  for(const x of [1.94,2.30])box(.25,.34,.018,x,1.08,1.63,'ivory');
  for(const x of [-2.65,2.65]) {
    const tree=ball(.22,x,.75,-.65,'shade');tree.scale.set(.8,2.25,.8);
    disk(.045,.40,x,.44,-.65,'wood');
  }
  const model=finish(71,[...cast,...flags]);
  animateCouncil(THREE,model,cast,flags);
  addKingdomLanterns(THREE,model);
  return model;
}
