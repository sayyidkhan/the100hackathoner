import { sculpture } from './sculpture.js';
import { createCrystalQuest } from './alien-quest.js';
export function createArtifact(THREE) {
  const { root, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  const islands=[[-1.95,-1.0,1.05],[1.6,-1.1,1.2],[0,1.65,1.2]];
  for(const [x,z,r] of islands) {
    for(let j=0;j<4;j++) {const layer=disk(r*(.78+j*.07),.17,x,.1+j*.16,z,j%2?'paper':'ivory');layer.geometry.dispose();layer.geometry=new THREE.CylinderGeometry(r*(.8+j*.065),r*(.77+j*.065),.17,12);}
  }
  line([[0,.61,1.65],[.15,.61,.6],[-.9,.61,-.05],[-1.95,.61,-1]],.19,'paper');
  line([[.1,.61,.65],[1.05,.61,.1],[1.6,.61,-1.1]],.19,'paper');
  line([[0,.82,2.35],[.25,.82,1.7],[0,.82,.55],[-1.1,.82,-.10],[-1.95,.82,-1]],.085,'blue');
  line([[0,.82,.55],[.9,.82,.12],[1.6,.82,-.85]],.085,'blue');
  // The gate is a route to another realm, with a small home symbol beyond it.
  const arch=new THREE.Shape();arch.moveTo(-.64,0);arch.lineTo(-.64,1.63);arch.quadraticCurveTo(-.64,2.18,0,2.50);arch.quadraticCurveTo(.64,2.18,.64,1.63);arch.lineTo(.64,0);arch.lineTo(.43,0);arch.lineTo(.43,1.63);arch.quadraticCurveTo(.43,2.03,0,2.26);arch.quadraticCurveTo(-.43,2.03,-.43,1.63);arch.lineTo(-.43,0);arch.closePath();
  const gate=mesh(new THREE.ExtrudeGeometry(arch,{depth:.20,bevelEnabled:false,curveSegments:20}),'red');gate.position.set(1.6,.81,-1.40);
  for(let i=0;i<5;i++)box(.91,.09,.3,1.6,.72+i*.09,-.38-i*.19);
  box(.30,.31,.10,1.6,1.03,-1.72);const roof=mesh(new THREE.ConeGeometry(.24,.21,4));roof.position.set(1.6,1.29,-1.72);roof.rotation.y=Math.PI/4;
  // Observatory and star tree are realm families found in the game's source.
  for(const [x,z] of [[-2.5,-.85],[-2.12,-.86],[-2.30,-1.22]])line([[x,.75,z],[-2.30,1.30,-1.0]],.025,'wood');
  line([[-2.56,1.49,-1.0],[-2.10,1.25,-1.0]],.12,'paper');
  line([[-1.52,.73,-1.42],[-1.55,1.5,-1.42],[-1.46,2.15,-1.42]],.062,'paper');
  for(let i=0;i<6;i++){const x=-1.5+(i%2?1:-1)*(.25+(i%3)*.12),y=1.48+i*.13,z=-1.42+(i%3-1)*.18;line([[-1.5,y-.2,-1.42],[x,y,z],[x,y+.14,z]],.025);ball(.072,x,y+.14,z);}
  for(const [x,z] of [[2.39,-.90],[.95,-1.55],[-2.68,-1.05]]) {const c=mesh(new THREE.ConeGeometry(.13,.56,5),'paper');c.position.set(x,1.02,z);}
  // Static geometry stays batched; the character and collectibles stay movable.
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const model = finish(72);
  const quest = createCrystalQuest(THREE);
  quest.position.set(-center.x, -bounds.min.y, -center.z);
  model.add(quest);
  model.userData.animate = quest.userData.animate;
  return model;
}
