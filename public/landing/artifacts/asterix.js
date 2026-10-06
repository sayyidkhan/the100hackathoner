import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5.7,.16,3,0,.08,0,'paper');for(const x of [-2.4,-1.25])box(.12,1.4,.9,x,.87,-.60);
 for(const x of [-2.1,-1.55]){const roof=box(.76,.08,1.12,x,1.81,-.6,'red');roof.rotation.z=x<-1.8?.5:-.5;}
 const bubble=ball(.30,-2.55,.71,.17,'red');bubble.scale.set(1,.75,.18);
 line([[-1.8,.20,-.26],[0,.20,-.08],[1.1,.20,-.10]],.12,'blue');
 for(let i=0;i<5;i++){const x=-1.05+i*.43;box(.30,.81,.045,x,.62,-.08);for(let j=0;j<3;j++)disk(.04,.02,x,.40+j*.19,-.045,j===0?'red':j===1?'blue':'shade').rotation.x=Math.PI/2;}
 for(let i=0;i<3;i++){const z=-.95+i*.95;line([[1.1,.20,-.1],[1.55,.20,z],[2.1,.20,z]],.055,'blue');disk(.34,.16,2.20,.24,z);disk(.23,.05,2.20,.58,z,i===0?'red':i===1?'blue':'ivory').rotation.x=Math.PI/2;person(2.20,.42,z+.04,.31);}
 box(.83,.31,.58,-1.24,.32,.91);for(let i=0;i<6;i++)box(.65,.37,.025,-1.24,.45,.70+i*.075,'paper');const lens=mesh(new THREE.TorusGeometry(.23,.04,8,40));lens.position.set(-1.43,.89,.97);line([[-1.3,.7,.97],[-1.08,.47,.97]],.04);
 return finish(45);
}
