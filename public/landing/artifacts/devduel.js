import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 disk(2.25,.24,0,.12,0,'paper');disk(1.6,.07,0,.275,0);
 for(const [x,c] of [[-1.17,'red'],[1.17,'blue']]){
  box(.92,1.70,.08,x,1.25,-1.10);person(x,1.36,-1.04,.6,c);for(let i=0;i<3;i++)box(.6,.035,.025,x,.70+i*.14,-1.04,c);
  disk(.44,.10,x,.36,.12);person(x,.41,.12,1.48);
  const cloth=box(.80,.77,.055,x,.99,-.06,c);cloth.rotation.z=x<0?-.28:.28;
  for(const dx of [-.18,.18]){const hair=mesh(new THREE.ConeGeometry(.14,.32,3));hair.position.set(x+dx,1.85,.12);}
 }
 disk(.64,.08,0,1.42,-.77).rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[0,1.42,-.71],[Math.cos(a)*.60,1.42+Math.sin(a)*.60,-.71]],.017,'blue');ball(.06,Math.cos(a+.5)*.39,1.42+Math.sin(a+.5)*.39,-.69,'blue');}
 for(const x of [-.92,.92])box(.045,.80,.045,x,2.09,-1.2,'wood');box(1.8,.38,.05,0,2.38,-1.2);
 const horn=mesh(new THREE.ConeGeometry(.24,.47,16),'red');horn.position.set(-1.74,.4,1.58);horn.rotation.z=-1;box(.07,.25,.07,-1.80,.23,1.58,'red');
 return finish(53);
}
