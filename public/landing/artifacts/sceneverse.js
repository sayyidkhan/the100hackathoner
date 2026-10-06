import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { mesh, box, disk, ball, line, person, finish } = sculpture(THREE);
  box(5.5,.27,3.1,0,.135,0,'paper');
  for(const x of [-2.28,2.28])box(.25,3,.25,x,1.77,-.85,'red');
  for(const y of [.39,3.15])box(4.8,.25,.25,0,y,-.85,'red');
  for(const x of [1.55,1.9])box(.20,.7,.15,x,3.13,-.68,'blue');
  for(const [x,h,z] of [[-1.9,1.2,-.68],[-1.1,2,-1],[-.25,1.3,-1],[.9,1.7,-1],[1.72,1,-.7]]){
    const peak=mesh(new THREE.ConeGeometry(h*.39,h,4),'ivory');peak.position.set(x,.27+h/2,z);peak.rotation.y=.7;
  }
  line([[.72,.295,-1.35],[.16,.295,-.38],[.39,.295,.38],[-.30,.295,1.3]],.15,'blue');
  disk(.35,.12,-1.12,.33,.28);disk(.35,.12,1.20,.33,.30);
  person(-1.12,.39,.28,1.3);person(1.20,.39,.30,1.3);
  person(-1.56,0,2.19,1.45);
  disk(.28,.07,-.10,.305,1.1,'red');box(.055,.42,.055,-.1,.54,1.1,'red');
  const mic=ball(.16,-.1,.94,1.1,'red');mic.scale.y=1.7;
  for(let i=0;i<3;i++)box(.16,.022,.02,-.1,.82+i*.1,1.252,'ink');
  line([[-1.40,.75,1.98],[-.9,.87,1.57],[-.24,.76,1.10]],.027,'blue');
  for(const x of [-1.12,1.2])line([[.02,.9,1.1],[x*.65,1.05,.8],[x,1.01,.33]],.027,'blue');
  box(.46,.065,.4,2,.76,.60);box(.46,.35,.055,2,1.13,.40);
  for(const z of [.42,.77]) {line([[1.8,.29,z],[2.2,.75,z]],.025,'wood');line([[2.2,.29,z],[1.8,.75,z]],.025,'wood');}
  for(const x of [-2.25,1.95]){box(.07,.63,.07,x,.6,.1,'wood');for(let i=0;i<3;i++){const foliage=mesh(new THREE.ConeGeometry(.35-i*.07,.5,5));foliage.position.set(x,.7+i*.23,.1);}}
  return finish(67);
}
