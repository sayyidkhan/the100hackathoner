import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { mesh, box, disk, ball, line, person, finish } = sculpture(THREE);
  disk(1.1,.12,0,.1,-.55,'red');
  const ring=mesh(new THREE.TorusGeometry(1.04,.09,12,72),'red');ring.rotation.x=Math.PI/2;ring.position.set(0,.62,-.55);
  const wall=mesh(new THREE.CylinderGeometry(1.12,1.12,.48,72,1,true),'red');wall.position.set(0,.38,-.55);
  box(1.02,1.67,.05,0,1.07,-.55,'ivory');
  for(let i=0;i<7;i++)box(.7,.017,.02,0,.6+i*.16,-.51,'shade');
  const stations=[[-2,-1.1],[-2,1.0],[2,-1.1],[2,1.0]];
  stations.forEach(([x,z])=>{disk(.61,.12,x,.1,z,'paper');disk(.61,.07,x,.2,z,'red');disk(.61,.1,x,.285,z);line([[x,.05,z],[x*.75,.05,1.35],[0,.05,1.6]],.055,'blue');});
  // Engineering: a physical chip.
  box(.63,.63,.12,-2,.71,-1.1,'blue');box(.43,.43,.06,-2,.71,-1.0,'blue');
  for(let i=0;i<4;i++)for(const side of [-1,1]) {
    box(.07,.15,.08,-2-.225+i*.15,.71+side*.36,-1.1,'blue');
    box(.15,.07,.08,-2+side*.36,.71-.225+i*.15,-1.1,'blue');
  }
  // Finance: stacked ledgers.
  for(let i=0;i<7;i++)box(.65,.045,.63,-2,.36+i*.067,1.0,i%2?'paper':'ivory');
  for(let i=0;i<4;i++)box(.47,.008,.012,-2,.81,.8+i*.12,'shade');
  // Legal: gavel and block.
  box(.64,.12,.49,2,.39,-1.1,'red');
  const head=disk(.16,.4,1.92,.67,-1.1,'paper');head.rotation.z=-.35;
  line([[1.95,.69,-1.1],[2.47,.85,-1.1]],.052,'wood');ball(.067,2.47,.85,-1.1,'wood');
  // People and operations.
  person(1.80,.34,1.0,.68);person(2.20,.34,1.0,.61);
  // One checklist is the synthesis, not four unrelated reports.
  for(let i=0;i<4;i++)box(1.25,.03,1.68,0,.07+i*.032,1.87,i%2?'paper':'ivory');
  for(let i=0;i<5;i++) {
    const z=1.32+i*.26;
    for(const s of [-1,1]) {box(.02,.012,.15,-.42+s*.075,.188,z,'shade');box(.15,.012,.02,-.42,.188,z+s*.075,'shade');}
    box(.68,.012,.016,.12,.188,z,'shade');
  }
  box(.32,.07,.18,0,.23,1.09,'red');
  line([[-.11,.27,1.09],[-.11,.45,1.04],[0,.50,1.04],[.11,.45,1.04],[.11,.27,1.09]],.018,'shade');
  return finish(74);
}
