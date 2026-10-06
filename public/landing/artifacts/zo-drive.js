import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { root, mesh, box, disk, line, finish } = sculpture(THREE);
  box(5.1,.14,2.7,0,.07,0,'paper');
  // The cabinet is hollow around the open middle drawer.
  box(.12,2.15,1.65,-1.08,1.2,-.12);box(.12,2.15,1.65,1.08,1.2,-.12);
  box(2.28,.13,1.78,0,2.31,-.12);box(2.10,2.06,.10,0,1.2,-.94);
  for(const y of [.54,1.89]) {box(2.06,.57,.10,0,y,.77,'paper');box(.50,.08,.12,0,y,.86,'wood');}
  const drawer=new THREE.Group();root.add(drawer);drawer.position.set(0,1.03,.67);
  box(2.06,.1,1.5,0,0,0,'paper',drawer);box(2.06,.53,.09,0,.24,.77,'ivory',drawer);
  for(const x of [-.99,.99])box(.075,.43,1.5,x,.22,0,'paper',drawer);
  box(.5,.08,.12,0,.24,.86,'wood',drawer);
  for(let j=0;j<6;j++) {
    box(1.83,.55,.045,0,.34,.52-j*.22,j%2?'paper':'ivory',drawer);
    box(.30,.12,.045,(j%3-1)*.60,.66,.52-j*.22,j%3===0?'red':j%3===1?'blue':'ivory',drawer);
  }
  for(let j=0;j<4;j++)box(.014,.05,.66,1.148,1.96-j*.13,-.18,'shade');
  // Folder, loose documents and a visual preview on the top shelf.
  for(let j=0;j<4;j++)box(1.12,1.02,.025,0,2.86,-.3+j*.06,j%2?'paper':'ivory');
  box(1.36,.85,.04,0,2.80,.08,'red');box(.53,.18,.04,-.41,3.3,.08,'red');
  box(1.36,1.02,.04,0,2.89,-.4,'red');
  box(.58,.64,.035,.6,2.71,.24);box(.47,.48,.02,.6,2.74,.27,'blue');
  for(const [x,h] of [[.47,.21],[.67,.30]]) {const peak=mesh(new THREE.ConeGeometry(.15,h,3),'paper');peak.scale.z=.1;peak.position.set(x,2.67,.30);}
  for(let j=0;j<3;j++)disk(.49,.30,1.83,.43+j*.36,.15,'blue');
  box(.9,.1,1.12,1.83,.19,.15,'paper');
  // A controlled sharing gate: lock and key.
  box(.68,.53,.28,-1.85,.50,.33);
  const shackle=mesh(new THREE.TorusGeometry(.21,.055,12,28,Math.PI));shackle.position.set(-1.85,.77,.33);
  box(.085,.18,.02,-1.85,.48,.486,'shade');const hole=disk(.07,.02,-1.85,.60,.486,'shade');hole.rotation.x=Math.PI/2;
  const key=mesh(new THREE.TorusGeometry(.12,.038,10,24),'red');key.position.set(-2.24,.40,.70);
  line([[-2.24,.29,.70],[-2.40,.14,.87]],.039,'red');box(.12,.04,.04,-2.35,.19,.87,'red');
  line([[-1.85,.15,.60],[-1.85,.15,1.32],[-1.85,.04,1.67]],.10,'blue');
  return finish(73);
}
