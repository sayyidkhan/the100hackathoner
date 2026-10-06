import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5,.17,3,0,.085,0,'paper');disk(.46,.12,-.55,.25,.46);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,flame=mesh(new THREE.ConeGeometry(.14,.65+i%2*.15,4),'red');flame.position.set(-.55+Math.cos(a)*.20,.61,.46+Math.sin(a)*.20);flame.rotation.z=Math.cos(a)*.25;}
 for(const [x,z] of [[-1.6,.53],[-.55,-.55],[.55,.66]]){disk(.36,.18,x,.27,z,'blue');person(x,.36,z,1.0);}
 for(const x of [.66,1.56]){const page=box(.90,1.6,.05,x,1.23,-.82);page.rotation.y=x<1?.13:-.13;box(.06,.85,.06,x,.57,-.87,'blue');}
 const nodes=[[.60,1.74],[1.60,1.57],[.63,.98],[1.6,.91]];for(const [x,y] of nodes){box(.36,.33,.08,x,y,-.74);line([[x,y,-.69],[1.12,1.27,-.69]],.018,'red');ball(.025,x,y+.14,-.68,'blue');}disk(.19,.045,1.12,1.27,-.68).rotation.x=Math.PI/2;
 for(let i=0;i<3;i++)box(.35,.16+i*.18,.38,1.08+i*.44,.25+i*.09,.86);
 const pencil=mesh(new THREE.CylinderGeometry(.045,.045,1.25,6),'red');pencil.rotation.z=Math.PI/2;pencil.position.set(1.48,.22,1.21);
 return finish(41);
}
