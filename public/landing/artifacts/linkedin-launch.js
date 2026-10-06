import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,finish}=sculpture(THREE);
 box(5.5,.18,3.1,0,.09,0,'paper');box(3.05,.17,1.0,.8,2.15,-.48);
 for(const x of [-.72,.23,1.25,2.27])box(.12,1.95,.85,x,1.12,-.48);
 box(2,.10,.67,-1.85,.68,.04,'blue');for(let i=0;i<5;i++)disk(.13,.7,-2.7+i*.4,.52,.04).rotation.x=Math.PI/2;
 box(.80,1.1,.06,-2,1.27,.04,'red');ball(.18,-2,1.41,.10);box(.16,.13,.06,-2,1.17,.10);
 box(.68,1.2,.06,-.24,.93,.08);for(let i=0;i<5;i++)box(.48,.025,.02,-.24,.54+i*.16,.12,'shade');
 box(.79,1.10,.07,.72,.92,.06,'red');box(.64,.94,.03,.72,.92,.11,'blue');disk(.10,.025,.86,1.22,.14).rotation.x=Math.PI/2;
 for(let i=0;i<3;i++){const y=1.63-i*.42,z=.03+i*.24;const frame=box(.71,.43,.045,1.76,y,z);frame.rotation.x=-.5;const pic=box(.51,.30,.04,1.76,y,z+.04,'blue');pic.rotation.x=-.5;}
 disk(.20,.06,.9,2.27,-.5);line([[.9,2.3,-.5],[1,2.68,-.5],[.65,2.91,-.5]],.04);const shade=mesh(new THREE.ConeGeometry(.23,.30,24));shade.position.set(.57,2.8,-.5);shade.rotation.z=-.8;
 box(.65,.39,.05,.84,.40,1.04,'red');const clap=box(.65,.10,.06,.84,.66,1.04,'red');clap.rotation.z=.19;for(let i=0;i<4;i++)box(.055,.08,.02,.6+i*.15,.60,1.08);
 return finish(52);
}
