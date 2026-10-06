import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,line,person,finish}=sculpture(THREE);
 box(5.8,.18,3.4,0,.09,0,'paper');
 for(const x of [-1.97,-1.23]){box(.72,.16,1.1,x,.31,-.3).rotation.z=x<-1.6?.10:-.10;for(let j=0;j<5;j++)box(.56,.015,.024,x,.41,-.68+j*.17,'shade');}
 for(let i=0;i<3;i++)box(.19,.5+i*.3,.18,-2.1+i*.3,.44+(.5+i*.3)/2,-1.1,'blue');
 const lens=mesh(new THREE.TorusGeometry(.34,.055,8,48),'red');lens.position.set(-2.1,1.3,-.5);line([[-2.36,1.05,-.5],[-2.69,.75,-.5]],.055,'red');
 for(let i=0;i<3;i++){box(.79,.19+i*.23,.86,-.95+i*.83,.18+(.19+i*.23)/2,.52);box(.49,.48,.045,-.95+i*.83,.68+i*.23,.36);}
 line([[-2,.25,.92],[-.95,.4,.83],[-.12,.63,.83],[.71,.86,.83],[1.46,.98,.14]],.09,'blue');
 box(1.25,1.4,1.05,1.75,.88,-.54);box(.84,1.05,.03,1.75,.72,.005,'shade');
 for(let i=0;i<7;i++)box(.19,.13,.64,1.18+i*.19,1.5,.13,i%2?'ivory':'red').rotation.x=.22;
 person(-.88,.18,1.4,.7);person(.07,.18,1.4,.7);return finish(37);
}
