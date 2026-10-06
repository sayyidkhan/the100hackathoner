import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,finish}=sculpture(THREE);
 box(5,.17,2.7,0,.085,0,'paper');disk(.73,.9,-1.3,.62,-.35);const dome=mesh(new THREE.SphereGeometry(.74,28,18,0,Math.PI*2,0,Math.PI/2));dome.position.set(-1.3,1.07,-.35);
 disk(.75,.08,-1.3,1.08,-.35,'red');box(.27,.62,.04,-1.3,.51,.37,'red');
 const scope=disk(.18,.97,-1.05,1.77,-.21,'red');scope.rotation.z=-1.1;disk(.22,.07,-.62,1.99,-.21).rotation.z=-1.1;
 for(let i=0;i<4;i++){const x=-1.9+i*.81,y=2.13+Math.sin(i*.7)*.62;disk(.24,.035,x,y,-.77).rotation.x=Math.PI/2;const phase=mesh(new THREE.CircleGeometry(.245,32,Math.PI/2,Math.PI),'blue');phase.position.set(x,y,-.744);box(.012,y-.2,.012,x,y/2,-.77,'wood');}
 ball(.40,1.71,2.36,-.48);box(.018,2,.018,1.71,1.17,-.48,'wood');line([[-1.9,2.13,-.8],[0,2.8,-.8],[1.71,2.36,-.8],[2.14,1.85,-.6],[.7,.88,.12]],.02,'blue');
 box(1.94,.08,.65,1.06,.75,.34);for(const x of [.15,1.97])box(.10,.54,.6,x,.45,.34,'red');box(.81,.53,.045,.68,1.04,.11);
 const p=[[.31,.94,.145],[.48,1.14,.145],[.62,.93,.145],[.8,1.10,.145],[1,1.02,.145]];for(let i=0;i<p.length-1;i++)line([p[i],p[i+1]],.015,'blue');
 for(let i=0;i<3;i++)disk(.075,.025,1.26+i*.17,.815,.48,i===0?'red':i===1?'blue':'ivory');box(.26,.36,.04,1.76,.97,.2);
 return finish(42);
}
