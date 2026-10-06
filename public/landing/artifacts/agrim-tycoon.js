import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { root, mesh, box, disk, line, person, finish } = sculpture(THREE);
  for(let i=0;i<3;i++) disk(3.05-i*.025,.09,0,.045+i*.09,0,i%2?'paper':'ivory');
  function civic(x,z,scale,roofColor='paper') {
    const group=new THREE.Group(); root.add(group); group.position.set(x,.43,z); group.scale.setScalar(scale);
    box(1.25,.7,.9,0,.4,0,'ivory',group);
    for(let i=0;i<3;i++) box(1.5-i*.14,.08,.42,0,.04+i*.08,.63-i*.07,'ivory',group);
    for(const dx of [-.48,-.16,.16,.48]) disk(.055,.67,dx,.55,.49,'ivory',group);
    box(1.43,.1,1.08,0,.92,0,'ivory',group);
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute([
      -.76,.98,.56, .76,.98,.56, 0,1.43,.56,
      -.76,.98,-.56, 0,1.43,-.56, .76,.98,-.56,
      -.76,.98,.56, 0,1.43,.56, -.76,.98,-.56,
      -.76,.98,-.56, 0,1.43,.56, 0,1.43,-.56,
      .76,.98,.56, .76,.98,-.56, 0,1.43,.56,
      .76,.98,-.56, 0,1.43,-.56, 0,1.43,.56,
    ],3)); g.computeVertexNormals(); mesh(g,roofColor,group);
    for(const dx of [-.37,.37]) box(.14,.26,.025,dx,.55,-.461,'shade',group);
    return group;
  }
  disk(1.15,.14,-1.45,.34,-.05,'paper'); civic(-1.45,-.25,.9);
  for(const x of [-1.87,-1.47,-1.07]) person(x,.44,.7,.48);
  disk(1.13,.22,0,.38,-1.45,'paper'); civic(0,-1.55,1.13,'red');
  // A small open-book relief identifies the academy.
  for(const s of [-1,1]) { const leaf=box(.21,.27,.03,s*.105,1.38,-.94,'paper');leaf.rotation.y=s*.12; }
  box(1.48,.25,1.25,1.65,.4,-.1,'paper');
  for(let i=0;i<3;i++) {
    const x=1.15+i*.48;
    box(.38,1.4,.62,x,1.23,-.28,'ivory');
    box(.27,1.06,.02,x,1.25,.038,'blue');
    for(let row=0;row<8;row++) box(.19,.035,.018,x,.83+row*.12,.054,'shade');
  }
  line([[-1.5,.3,.8],[-.8,.3,.9],[0,.3,.25],[0,.3,-1.5]],.035,'blue');
  line([[0,.3,.25],[1,.3,.5],[1.65,.3,.1]],.035,'blue');
  line([[0,.3,.25],[0,.3,1.3]],.045,'blue');
  // The player controls the lever; the local chip advises alongside it.
  disk(.92,.07,0,.34,1.62,'paper');
  box(.85,.20,.7,-.2,.49,1.64,'ivory');
  for(const x of [-.51,.11]) { const housing=disk(.33,.13,x,.75,1.64);housing.rotation.z=Math.PI/2; }
  line([[-.2,.68,1.64],[-.2,1.0,1.48],[-.2,1.37,1.32]],.07,'paper');
  const handle=mesh(new THREE.CylinderGeometry(.14,.14,.46,24),'red');handle.position.set(-.2,1.4,1.3);handle.rotation.x=.42;
  box(.53,.12,.53,.76,.44,1.68,'blue'); box(.38,.035,.38,.76,.52,1.68,'blue');
  for(let i=0;i<5;i++) for(const s of [-1,1]) {
    box(.07,.06,.16,.56+i*.1,.39,1.68+s*.3,'ivory');
    box(.16,.06,.07,.76+s*.3,.39,1.48+i*.1,'ivory');
  }
  for(const [x,z] of [[-2.3,-.75],[-2,.9],[-.9,-2.1],[.9,-2],[2.35,.9],[1.65,1.3]]) {
    disk(.04,.3,x,.48,z,'wood'); const foliage=mesh(new THREE.ConeGeometry(.17,.57,5),'paper');foliage.position.set(x,.84,z);
  }
  return finish(76);
}
