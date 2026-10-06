import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 disk(2,.14,0,.07,0,'paper').scale.z=.7;box(2,.88,.08,-.55,.63,-.22,'red');
 for(const x of [-1.03,-.10]){const page=box(.95,2,.035,x,1.34,-.45);page.rotation.y=x<-.5?-.18:.18;}
 line([[-1.55,1.07,-.15],[-.55,.61,-.15],[.45,1.07,-.15]],.018,'paper');
 for(let i=0;i<3;i++){const tree=mesh(new THREE.ConeGeometry(.49-i*.12,.74,8));tree.position.set(-.56,.82+i*.43,-.13);}
 for(const [x,y] of [[-.8,.90],[-.34,1.1],[-.58,1.62]])ball(.075,x,y,.05,'blue');ball(.13,-.56,2.2,-.13,'red');
 for(let i=0;i<3;i++){const x=.57+i*.42,z=.22-i*.3;box(.62,.85,.035,x,.59,z);if(i===0){person(x-.11,.36,z+.04,.46);person(x+.12,.35,z+.04,.35);}else if(i===1){ball(.10,x-.06,.64,z+.06,'red');ball(.10,x+.06,.64,z+.06,'red');const tip=mesh(new THREE.ConeGeometry(.15,.22,3),'red');tip.position.set(x,.53,z+.06);tip.rotation.z=Math.PI;}else{box(.30,.23,.055,x,.56,z+.05);line([[x-.07,.69,z+.05],[x-.07,.76,z+.05],[x+.07,.76,z+.05],[x+.07,.69,z+.05]],.015);}}
 line([[-1.6,.2,-.3],[-1.83,.53,.18],[-1.1,.19,.77],[.25,.2,.83],[1.6,.2,.55]],.045,'blue');
 const pen=disk(.065,.71,.73,.24,.86,'red');pen.rotation.z=Math.PI/2;
 return finish(48);
}
